import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
  server: {
    proxy: {
      '/api-upload': {
        target: 'https://4ohsm3skkl.execute-api.ap-southeast-2.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-upload/, '/default'),
      },
      '/api-progress': {
        target: 'https://oiev2k1y60.execute-api.ap-southeast-2.amazonaws.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-progress/, '/default'),
      },
    },
  },
});
