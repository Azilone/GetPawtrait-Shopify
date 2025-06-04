import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  plugins: [react()],
  build: {
    outDir: 'assets',
    emptyOutDir: true,
    assetsDir: '.',
    cssCodeSplit: false,
    rollupOptions: {
      input: './src/index.jsx',
      output: {
        entryFileNames: 'app.js',
        assetFileNames: 'style.css',
      },
    },
  },
});
