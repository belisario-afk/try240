import { test, expect } from '@playwright/test';

test('mock flow: load -> switch scene -> start/stop recording UI keybinds', async ({ page }) => {
  page.on('console', (msg) => console.log('[console]', msg.type(), msg.text()));
  page.on('pageerror', (err) => console.log('[pageerror]', err));

  // Hit the Home route explicitly so the visual engine mounts
  await page.goto('./#/', { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('#root', { state: 'attached', timeout: 30000 });
  await page.waitForSelector('#vis-container', { state: 'attached', timeout: 30000 });

  // The engine appends a canvas to #vis-container (see src/visuals/engine.ts)
  const canvasLocator = page.locator('#vis-container canvas').first();
  await canvasLocator.waitFor({ state: 'attached', timeout: 30000 });
  await expect(canvasLocator).toBeVisible({ timeout: 30000 });

  const scenesButton = page.getByRole('button', { name: /scenes/i });
  await scenesButton.waitFor({ timeout: 30000 });
  await scenesButton.click();

  const sceneChoice = page.getByRole('button', { name: /particles|terrain|fluid|raymarch|typography/i });
  if (await sceneChoice.count()) {
    await sceneChoice.first().click();
  }

  await page.keyboard.press('r'); // start
  await page.keyboard.press('r'); // stop

  expect(await page.locator('#vis-container canvas').count()).toBeGreaterThan(0);
});