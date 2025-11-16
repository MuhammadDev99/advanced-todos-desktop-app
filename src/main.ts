// src/main.ts

import { app, BrowserWindow, ipcMain, Menu, Tray } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import started from 'electron-squirrel-startup';
import Store from 'electron-store';

const store = new Store();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (started) {
  app.quit();
}

const openWindows = new Map<string, BrowserWindow>();

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// --- SINGLE INSTANCE ---: Request a lock to ensure only one instance of the app is running.
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // If we don't get the lock, another instance is already running, so we quit.
  app.quit();
} else {
  // --- SINGLE INSTANCE ---: This is the primary instance.
  // Set up a listener for when a second instance is started.
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance. We should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      title: 'My Awesome Todo App',
      icon: path.join(__dirname, '../../assets/icon.png'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    mainWindow.setMenuBarVisibility(false);

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
      );
    }

    mainWindow.on('close', (event) => {
      if (!app.isQuitting) {
        event.preventDefault();
        mainWindow?.hide();
      }
    });

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  };

  app.on('before-quit', () => {
    app.isQuitting = true;
  });

  app.on('ready', () => {
    ipcMain.handle('get-tasks', () => store.get('tasks', []));
    ipcMain.on('set-tasks', (event, tasks) => store.set('tasks', tasks));

    ipcMain.handle('create-window', (event, { route, options, queryParams = {}, expectsCallback }) => {
      const windowId = crypto.randomUUID();
      let callbackId = null;

      if (expectsCallback) {
        callbackId = crypto.randomUUID();
      }

      queryParams.windowId = windowId;

      const window = new BrowserWindow({
        ...options,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js'),
        }
      });

      if (route === 'overlay') {
        window.setIgnoreMouseEvents(true);
      }

      const searchParams = new URLSearchParams(queryParams).toString();
      const routeWithParams = `${route}?${searchParams}`;

      if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        const devUrl = new URL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
        devUrl.hash = routeWithParams;
        window.loadURL(devUrl.toString());
      } else {
        const indexPath = path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`);
        window.loadFile(indexPath, { hash: routeWithParams });
      }

      openWindows.set(windowId, window);

      const onResult = (result: any) => {
        if (callbackId) {
          event.sender.send('window-result-callback', { callbackId, result });
        }
        if (!window.isDestroyed()) {
          window.close();
        }
      };

      ipcMain.once(`window-result-${windowId}`, (e, result) => {
        onResult(result);
      });

      window.on('closed', () => {
        openWindows.delete(windowId);
        onResult('closed');
      });

      return { windowId, callbackId };
    });

    ipcMain.on('close-window', (event, windowId: string) => {
      const windowToClose = openWindows.get(windowId);
      if (windowToClose) {
        windowToClose.close();
        openWindows.delete(windowId);
      }
    });

    ipcMain.on('send-window-result', (event, { windowId, result }) => {
      ipcMain.emit(`window-result-${windowId}`, event, result);
    });

    createWindow();

    const iconPath = app.isPackaged
      ? path.join(process.resourcesPath, 'assets/icon.png')
      : path.join(__dirname, '../../assets/icon.png');

    tray = new Tray(iconPath);

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show App',
        click: () => {
          mainWindow?.show();
        },
      },
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setToolTip('SparkyTodos');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
      mainWindow?.show();
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
} // --- SINGLE INSTANCE ---: End of the primary instance logic block.