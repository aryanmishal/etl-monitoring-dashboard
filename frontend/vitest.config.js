// vitest.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setupTests.js',
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    // Exclude Playwright E2E tests from Vitest
    exclude: [
      'tests/e2e/**',
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache',
    ],
  },
}); 