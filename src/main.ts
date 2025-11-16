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

  // --- START: TRAY ICON PATH FIX ---
  // Create a path to the icon that works in both development and production.
  // Your `extraResource` config copies the 'assets' folder to the 'resources'
  // directory in the packaged app. This code correctly finds it.
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'assets/icon.png')
    : path.join(__dirname, '../../assets/icon.png');
  // --- END: TRAY ICON PATH FIX ---

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