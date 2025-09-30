import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        results: resolve(__dirname, 'results.html'),
        artist: resolve(__dirname, 'artist.html'),
        lyrics: resolve(__dirname, 'lyrics.html'),
      }
    }
  }
});
