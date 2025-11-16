import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/main.ts'),
            formats: ['es'], // ← crucial: output ESM format
            fileName: () => '[name].js',
        },
        outDir: '.vite/build',
        emptyOutDir: false,
        rollupOptions: {
            external: ['electron'], // ← externalize electron
        },
    },
});