import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
    // The mock API normally waits ~900ms so the skeletons are visible; tests skip the wait.
    env: { VITE_MOCK_DELAY_MS: '0' },
  },
});
