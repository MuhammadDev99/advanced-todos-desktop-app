// src/electron-app.d.ts

// This allows us to add a custom 'isQuitting' property to the Electron App instance
declare namespace Electron {
    interface App {
        isQuitting?: boolean;
    }
}