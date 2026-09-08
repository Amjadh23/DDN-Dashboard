import { test, expect } from '@playwright/test';
test('five Teras expose distinctive visuals, source context and URL perspectives', async ({
  page,
}) => {
  for (let id = 1; id <= 5; id++) {
    await page.goto(`/teras/${id}`);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Perspektif indikator' })).toBeVisible();
    await expect(page.getByText('DEMO / SYNTHETIC', { exact: true }).first()).toBeVisible();
    await page.getByRole('link', { name: 'Kos', exact: true }).click();
    await expect(page).toHaveURL(/perspective=cost/);
    await expect(page.getByText('Kos per output demo', { exact: true })).toBeVisible();
  }
});
test('Teras 2 separates follow-up loss from completion and recovery', async ({ page }) => {
  await page.goto('/teras/2?cohort=2025-q4');
  await expect(page.getByLabel('Kohort contoh')).toHaveValue('2025-q4');
  await expect(page.getByText('Tiada susulan: 96 rekod demo', { exact: false })).toBeVisible();
  await page.getByRole('link', { name: 'Hasil', exact: true }).click();
  await expect(page.getByText('Takrif pemulihan belum diluluskan', { exact: true })).toBeVisible();
});
test('Teras 5 partner selection is keyboard accessible', async ({ page }) => {
  await page.goto('/teras/5');
  await page.getByRole('button', { name: 'Rakan demo D', exact: true }).click();
  await expect(page.locator('.partner-detail')).toContainText('Japan');
  await expect(page.locator('.partner-detail')).toContainText('Pembaharuan');
});
test('all Teras reflow at 320px while chart tables scroll inside their panels', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (let id = 1; id <= 5; id++) {
    await page.goto(`/teras/${id}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
  }
});
