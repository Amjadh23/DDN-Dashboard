import { test, expect } from '@playwright/test';
test('map hydrates without a client rendering error', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/map', { waitUntil: 'networkidle' });
  expect(errors).toEqual([]);
});
test('overview separates supplied snapshot and demo map, with keyboard/table alternative', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Gambaran nasional', exact: true })).toBeVisible();
  await expect(page.locator('.metric-number').first()).toContainText('47,084');
  await expect(
    page.locator('.threat-panel').getByText('DEMO / SYNTHETIC', { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Paparan jadual' }).click();
  await expect(page.locator('.map-table-wrap')).toBeVisible();
  await page.getByRole('button', { name: 'Johor', exact: true }).click();
  await expect(page.locator('.zone-detail h3')).toHaveText('Johor');
  await expect(page).toHaveURL(/state=MY-01/);
});
test('layer and unit state survives reload and official source never gets invented rates', async ({
  page,
}) => {
  await page.goto('/map?layer=harm&mode=count');
  await expect(page.getByLabel('Lapisan peta')).toHaveValue('harm');
  await expect(page.locator('.workload-circle').first()).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Lapisan peta')).toHaveValue('harm');
  await page.goto('/map?source=supplied');
  await expect(page.locator('.zone-value')).toContainText('—');
  await page.getByRole('button', { name: 'Paparan jadual' }).click();
  await expect(page.getByText('Tiada kadar rasmi:', { exact: false })).toBeVisible();
});
test('zero and suppressed values remain distinct and inaccessible values stay absent', async ({
  page,
}) => {
  await page.goto('/map?layer=burden&state=MY-15');
  await expect(page.locator('.zone-detail')).toContainText('Disekat');
  await expect(page.locator('.zone-value')).toContainText('—');
  await page.goto('/map?layer=burden&state=MY-09');
  await expect(page.locator('.zone-value')).toContainText('0');
  await expect(page.locator('.zone-detail')).toContainText('Nilai tersedia');
});
test('essential overview and map reflow to 320 CSS pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  for (const route of ['/', '/map']) {
    await page.goto(route);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.getByRole('button', { name: 'Buka navigasi' }).click();
  await expect(page.getByRole('link', { name: 'Rawatan & pemulihan' })).toBeVisible();
});
