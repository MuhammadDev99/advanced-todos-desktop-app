import { contextBridge, ipcRenderer } from 'electron';

// A map to hold callbacks that are waiting for a result from a new window.
const windowCallbackMap = new Map<string, (result: any) => void>();

// Listen for events from the main process intended to trigger a callback.
ipcRenderer.on('window-result-callback', (event, { callbackId, result }) => {
    const callback = windowCallbackMap.get(callbackId);
    if (callback) {
        callback(result);
        windowCallbackMap.delete(callbackId); // Clean up the callback after it's been called.
    }
});

contextBridge.exposeInMainWorld('electronAPI', {
    // Data functions
    getTasks: (): Promise<any[]> => ipcRenderer.invoke('get-tasks'),
    setTasks: (tasks: any[]) => ipcRenderer.send('set-tasks', tasks),

    // Window management functions
    createWindow: async (
        args: { route: string, options?: any, queryParams?: Record<string, string> },
        callback?: (result: any) => void
    ): Promise<{ windowId: string }> => {
        // The main process will generate the callbackId if we pass a callback.
        const expectsCallback = !!callback;

        const { windowId, callbackId } = await ipcRenderer.invoke('create-window', { ...args, expectsCallback });

        // If the main process sent back a callbackId, register our callback with it.
        if (expectsCallback && callbackId && callback) {
            windowCallbackMap.set(callbackId, callback);
        }

        return { windowId };
    },

    closeWindow: (windowId: string) => ipcRenderer.send('close-window', windowId),

    sendWindowResult: (args: { windowId: string, result: any }) =>
        ipcRenderer.send('send-window-result', args),
});