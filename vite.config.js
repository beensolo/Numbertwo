import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        truck: resolve(__dirname, 'truck.html'),
        box: resolve(__dirname, 'box.html'),
      }
    }
  }
});
