// vite.config.js
import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: '.',
  server: {
    proxy: {
      // Proxy para TheAudioDB
      '/api/tadb': {
        target: 'https://theaudiodb.com',
        changeOrigin: true,
        rewrite: p => p.replace(/^\/api\/tadb/, ''),
      },
      // Proxy para Lyrics.ovh
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
        main:    resolve(__dirname, 'index.html'),
        results: resolve(__dirname, 'results.html'),
        artist:  resolve(__dirname, 'artist.html'),
        lyrics:  resolve(__dirname, 'lyrics.html'),
        favorites: resolve(__dirname, 'favorites.html'),
      },
    },
  },
});
