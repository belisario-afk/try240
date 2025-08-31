import { test, expect } from '@playwright/test';

test('mock flow: load -> switch scene -> start/stop recording UI keybinds', async ({ page }) => {
  // Navigate relative to baseURL (/try240/)
  await page.goto('./', { waitUntil: 'domcontentloaded' });

  // Ensure the app bootstraps
  await page.waitForSelector('#root', { state: 'attached', timeout: 30000 });

  // App renders the visual container outside the router
  await page.waitForSelector('#vis-container', { state: 'attached', timeout: 30000 });

  // Engine mounts a canvas shortly after boot
  await page.locator('#vis-container canvas').first().waitFor({ timeout: 30000 });

  // Open scene picker
  const scenesButton = page.getByRole('button', { name: /scenes/i });
  await scenesButton.waitFor({ timeout: 30000 });
  await scenesButton.click();

  // Select a scene (tolerant to naming)
  const sceneChoice = page.getByRole('button', { name: /particles|terrain|fluid|raymarch|typography/i });
  if (await sceneChoice.count()) {
    await sceneChoice.first().click();
  }

  // Toggle recording via keyboard shortcuts (mock)
  await page.keyboard.press('r');
  await page.keyboard.press('r');

  // Sanity: canvas present
  expect(await page.locator('#vis-container canvas').count()).toBeGreaterThan(0);
});