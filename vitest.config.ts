import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    // Only collect unit tests
    include: ['tests/unit/**/*.spec.ts'],
    // Explicitly exclude e2e and other defaults
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    environment: 'node',
    // Load Node Web Crypto + btoa polyfills for unit tests
    setupFiles: ['tests/setup/vitest.polyfills.ts'],
    reporters: 'default'
  }
});