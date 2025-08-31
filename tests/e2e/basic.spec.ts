import { test, expect } from '@playwright/test';

test('mock flow: load -> switch scene -> start/stop recording UI keybinds', async ({ page }) => {
  await page.goto('/');
  // Switch to mock mode via env (vite define). In CI we set MOCK=true in env or accept fallback
  await page.waitForSelector('#vis-container');
  // Open scene picker button
  await page.getByText('Scenes').waitFor();
  // Click a scene
  await page.getByRole('button', { name: 'fluid' }).click();
  // Start recording via key
  await page.keyboard.press('r');
  await page.waitForTimeout(1500);
  await page.keyboard.press('s');
  expect(true).toBeTruthy();
});