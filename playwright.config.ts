import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

// If PW_BASE_URL is provided (e.g. https://belisario-afk.github.io/try240/),
// tests will run against it and we won't start a local server.
// Otherwise, default to local preview at 127.0.0.1 and start it.
const PROD_BASE = process.env.PW_BASE_URL?.replace(/\/+$/, '') || '';
const LOCAL_BASE = 'http://127.0.0.1:5173/try240';
const useRemote = Boolean(PROD_BASE);
const baseURL = (useRemote ? PROD_BASE : LOCAL_BASE) + '/';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  expect: { timeout: 30_000 },
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: useRemote
    ? undefined
    : {
        command: 'pnpm preview --host 127.0.0.1 --port 5173',
        url: LOCAL_BASE + '/',
        timeout: 120_000,
        reuseExistingServer: false
      },
  projects: [
    { name: 'Chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'WebKit', use: { ...devices['Desktop Safari'] } }
  ]
});