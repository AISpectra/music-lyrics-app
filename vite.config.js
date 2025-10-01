// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    proxy: {
      '/api/tadb': {
        target: 'https://theaudiodb.com',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/tadb/, ''),
      },
      '/api/lyrics': {
        target: 'https://api.lyrics.ovh',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/lyrics/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:     resolve(__dirname, 'index.html'),
        results:  resolve(__dirname, 'results.html'),
        artist:   resolve(__dirname, 'artist.html'),
        lyrics:   resolve(__dirname, 'lyrics.html'),
        // añade otras páginas si las tienes:
        // favorites: resolve(__dirname, 'favorites.html'),
      },
    },
  },
});

