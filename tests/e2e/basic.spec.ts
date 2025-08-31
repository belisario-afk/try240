import { test, expect } from '@playwright/test';

test('mock flow: load -> switch scene -> start/stop recording UI keybinds', async ({ page }) => {
  // Use "./" so it resolves relative to baseURL (which includes /try240/ in CI)
  await page.goto('./');

  // Wait for the visualizer container to be present
  await page.waitForSelector('#vis-container', { state: 'visible', timeout: 30000 });

  // Open scene picker
  const scenesButton = page.getByRole('button', { name: /scenes/i });
  await scenesButton.waitFor({ timeout: 30000 });
  await scenesButton.click();

  // Click a scene (try a few common names, fall back to first scene button)
  const candidateScene = page.getByRole('button', {
    name: /particles|terrain|fluid|raymarch|typography/i,
  });
  if (await candidateScene.count()) {
    await candidateScene.first().click();
  } else {
    const anyScene = page.getByRole('button').filter({ hasText: /scene|particles|terrain|fluid|raymarch|typography/i });
    if (await anyScene.count()) {
      await anyScene.first().click();
    }
  }

  // Toggle recording via keyboard shortcuts if applicable
  await page.keyboard.press('r');
  await page.keyboard.press('r');

  // Assert at least one canvas is present
  const canvas = page.locator('canvas');
  const count = await canvas.count();
  expect(count).toBeGreaterThan(0);
});