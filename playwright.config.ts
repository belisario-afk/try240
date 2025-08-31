import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  use: {
    // IMPORTANT: preview serves index at '/', not '/try240/'
    baseURL: 'http://127.0.0.1:5173/',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'pnpm preview --host 127.0.0.1 --port 5173',
    // Wait for root. Assets referenced with /try240/... will still resolve.
    url: 'http://127.0.0.1:5173/',
    timeout: 120_000,
    reuseExistingServer: false,
  },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'WebKit', use: { ...devices['Desktop Safari'] } },
  ],
});