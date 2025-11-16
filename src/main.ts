// src/main.ts

import { app, BrowserWindow, ipcMain, screen } from 'electron';
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

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'My Awesome Todo App',
    // This path is now correct because `extraResource` will copy the assets folder
    icon: path.join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // --- HIDE THE DEFAULT MENU BAR ---
  mainWindow.setMenuBarVisibility(false);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Optional: You probably want to remove this for production
  // mainWindow.webContents.openDevTools(); 
};

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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});