import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // The API runs on :3001 (npm run api). Same origin for the browser, so cookies just work.
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
});
