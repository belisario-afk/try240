import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run unit tests with Vitest
    include: ['tests/unit/**/*.spec.ts'],
    // Exclude Playwright e2e and other non-test paths
    exclude: [
      'tests/e2e/**',
      'node_modules',
      'dist',
      'build',
      '.git',
      '.github',
      'playwright-report',
      'test-results'
    ],
    environment: 'node',
    reporters: 'default'
  }
});