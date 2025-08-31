import { test, expect } from '@playwright/test';

test('mock flow: load -> switch scene -> start/stop recording UI keybinds', async ({ page }) => {
  // Preview serves index at '/', so go there.
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // App renders #vis-container outside the router; wait for it to be in the DOM.
  await page.waitForSelector('#vis-container', { state: 'attached', timeout: 30000 });

  // Visual engine should mount a canvas inside the container shortly after boot.
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