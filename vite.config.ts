import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Upper Room',
        short_name: 'Upper Room',
        description: 'A shared Scripture room that keeps each reader sovereign.',
        display: 'standalone',
        start_url: '/',
        theme_color: '#f3efe5',
        background_color: '#f3efe5',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
