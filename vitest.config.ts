import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    // Only run unit tests with Vitest; Playwright e2e has its own runner
    include: ['tests/unit/**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules', 'dist'],
    setupFiles: ['tests/setup.ts']
  }
});