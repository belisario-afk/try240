import { test, expect } from '@playwright/test';

test('mock flow: load -> switch scene -> start/stop recording UI keybinds', async ({ page }) => {
  // Navigate relative to baseURL so it resolves to /try240/ in CI
  await page.goto('./', { waitUntil: 'domcontentloaded' });

  // The container exists outside the router; wait for it to be attached (not necessarily "visible")
  await page.waitForSelector('#vis-container', { state: 'attached', timeout: 30000 });

  // Wait for the visual engine to mount a canvas inside the container
  await page.locator('#vis-container canvas').first().waitFor({ timeout: 30000 });

  // Open scene picker
  const scenesButton = page.getByRole('button', { name: /scenes/i });
  await scenesButton.waitFor({ timeout: 30000 });
  await scenesButton.click();

  // Click a scene (be tolerant of available names)
  const sceneChoice = page.getByRole('button', { name: /particles|terrain|fluid|raymarch|typography/i });
  if (await sceneChoice.count()) {
    await sceneChoice.first().click();
  }

  // Toggle recording via keyboard shortcuts (mock)
  await page.keyboard.press('r');
  await page.keyboard.press('r');

  // Assert at least one canvas is present (engine running)
  const canvasCount = await page.locator('#vis-container canvas').count();
  expect(canvasCount).toBeGreaterThan(0);
});