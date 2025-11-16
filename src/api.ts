import { effect } from "@preact/signals-react";
import { tasks } from "./signals";
import type { Task } from "./types";

/**
 * @file Handles data persistence by communicating with the Electron main process.
 */

// --- TypeScript Declaration for Electron API ---
declare global {
    interface Window {
        electronAPI: {
            getTasks: () => Promise<Task[]>;
            setTasks: (tasks: Task[]) => void;
            // UPDATED: The function now accepts an optional callback and returns a promise with just the windowId.
            createWindow: (
                args: {
                    route: string;
                    options?: any;
                    queryParams?: Record<string, any>;
                },
                callback?: (result: any) => void
            ) => Promise<{ windowId: string }>;
            closeWindow: (windowId: string) => void;
            sendWindowResult: (args: { windowId: string, result: any }) => void;
        };
    }
}


// --- Data Persistence Logic ---
export function loadTasks() {
    window.electronAPI.getTasks().then(savedTasks => {
        if (Array.isArray(savedTasks)) {
            tasks.value = savedTasks;
        }
    }).catch(console.error);
}

export function autoSaveChanges() {
    effect(() => {
        window.electronAPI.setTasks(tasks.value);
    });
}