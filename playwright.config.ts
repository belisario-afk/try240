import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

// In preview (serving built dist), the app is hosted under /try240/ due to Vite base.
// Make baseURL point there so page.goto('/') resolves correctly.
const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:5173/try240/';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  retries: isCI ? 1 : 0,
  use: {
    baseURL,
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  // Serve the built app with Vite preview for reliability in CI
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