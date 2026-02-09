import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/workout-tracker/',
  root: path.resolve(__dirname),
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: path.resolve(__dirname, '../dist'),
  },
});
