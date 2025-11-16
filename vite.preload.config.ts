// vite.preload.config.ts

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/preload.ts'),
            formats: ['cjs'],
            fileName: () => 'preload.js',
        },
        outDir: '.vite/build',
        emptyOutDir: false, // ← Ensure this is false
        rollupOptions: {
            external: ['electron'],
        },
    },
});