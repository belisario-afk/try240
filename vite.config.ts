import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.spec.ts'],
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
    environment: 'node',
    setupFiles: ['tests/setup/vitest.polyfills.ts'],
    reporters: 'default'
  }
});