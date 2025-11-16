// vite.renderer.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    // --- SOLUTION: Set the base path to be relative ---
    base: './',
    plugins: [react({
        babel: {
            plugins: ["module:@preact/signals-react-transform"],
        },
    })],
})