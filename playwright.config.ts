import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  use: {
    // Hit the app at its production base path
    baseURL: 'http://127.0.0.1:5173/try240/',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    // Serve dist/ with matching base so index and assets resolve
    command: 'pnpm preview --host 127.0.0.1 --port 5173 --base /try240/',
    url: 'http://127.0.0.1:5173/try240/',
    timeout: 120_000,
    reuseExistingServer: false,
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'WebKit', use: { ...devices['Desktop Safari'] } },
  ],
});