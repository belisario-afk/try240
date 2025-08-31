import { test, expect } from '@playwright/test';

test('mock flow: load -> switch scene -> start/stop recording UI keybinds', async ({ page }) => {
  // Helpful logging for blank-page issues
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('[pageerror]', err));

  // Navigate relative to baseURL (http://127.0.0.1:5173/try240/)
  await page.goto('./', { waitUntil: 'domcontentloaded' });

  // App root exists in index.html
  await page.waitForSelector('#root', { state: 'attached', timeout: 30000 });

  // #vis-container is rendered by App (JS must be running)
  await page.waitForSelector('#vis-container', { state: 'attached', timeout: 30000 });

  // Visual engine should mount a canvas soon after boot
  await page.locator('#vis-container canvas').first().waitFor({ timeout: 30000 });

  // Open scene picker and choose a scene
  const scenesButton = page.getByRole('button', { name: /scenes/i });
  await scenesButton.waitFor({ timeout: 30000 });
  await scenesButton.click();

  const sceneChoice = page.getByRole('button', { name: /particles|terrain|fluid|raymarch|typography/i });
  if (await sceneChoice.count()) {
    await sceneChoice.first().click();
  }

  // Toggle recording via keyboard shortcuts (mock)
  await page.keyboard.press('r');
  await page.keyboard.press('r');

  // Sanity: at least one canvas is present
  expect(await page.locator('#vis-container canvas').count()).toBeGreaterThan(0);
});