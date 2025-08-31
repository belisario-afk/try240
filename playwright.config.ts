import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

// Built app is served by Vite preview at /try240/ (vite base).
const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173/try240/';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000, // per-test timeout
  expect: { timeout: 30_000 },
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Serve dist/ via preview for reliability in CI
  webServer: {
    command: 'pnpm preview --host 127.0.0.1 --port 5173',
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