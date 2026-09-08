import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('overview explains the supplied snapshot and focuses the live map', async ({ page }) => {
  await page.goto('/');
  const snapshot = page.getByRole('region', { name: 'Data dibekalkan' });
  await expect(snapshot).toBeVisible();
  for (const value of ['47,084', '5,260', '41,824', '5,208'])
    await expect(snapshot).toContainText(value);
  await expect(snapshot).toContainText('Daripada jumlah ini');
  await expect(snapshot).toContainText('bukan kesalahan yang disahkan');
  await page.getByText('Tentang angka ini', { exact: true }).click();
  await expect(snapshot).toContainText('halaman 2');
  await expect(snapshot).not.toContainText('supplied-t2-v1');
  await expect(page.getByLabel('Bandingkan', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Lagi', exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Cari negeri', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Zum masuk' })).toHaveCount(0);
  await page.getByLabel('Lapisan peta').selectOption('harm');
  await page.getByRole('button', { name: 'Bilangan', exact: true }).click();
  await expect(page.locator('.workload-circle').first()).toBeVisible();
  await expect(page.getByLabel('Lapisan peta')).toHaveValue('harm');
  await expect(page).toHaveURL(/layer=harm/);
  await page.getByRole('button', { name: 'Paparan jadual' }).click();
  await page.getByRole('button', { name: 'Johor', exact: true }).click();
  await expect(page.locator('.zone-detail h3')).toHaveText('Johor');
  await expect(page.getByRole('link', { name: 'Buka Peta Strategik' })).toHaveAttribute(
    'href',
    /state=MY-01/,
  );
  await expect(page.locator('.overview-teras a')).toHaveCount(5);
  await expect(page.getByRole('heading', { name: 'Kualiti bukti' })).toHaveCount(0);
});

test('overview explains suppression and unavailable filtered source values', async ({ page }) => {
  await page.goto('/?state=MY-04');
  await expect(page.locator('.zone-value')).toContainText('Disekat');
  await expect(page.locator('.zone-detail')).toContainText('melindungi kiraan kecil');
  await page.getByRole('combobox', { name: 'Geografi', exact: true }).selectOption('MY-01');
  await expect(page.getByRole('region', { name: 'Data dibekalkan' })).toContainText(
    'Tiada petikan',
  );
  await expect(page.getByRole('region', { name: 'Data dibekalkan' })).not.toContainText('47,084');
  await expect(page.locator('.zone-detail h3')).toHaveText('Johor');
  await expect(page.locator('.overview-teras a').first()).toHaveAttribute(
    'href',
    /geography=MY-01/,
  );
  await page.goto('/map');
  await expect(page.getByLabel('Cari negeri', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Zum masuk' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kaedah & batasan' })).toBeVisible();
});

test('overview supports keyboard states, period changes and narrow source details', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Perlis: Nilai tersedia. DEMO / SYNTHETIC', exact: true })
    .press('Enter');
  await expect(page.locator('.zone-value')).toContainText('0');
  await page.reload();
  await expect(page.locator('.zone-detail h3')).toHaveText('Perlis');
  await page
    .getByRole('button', { name: 'W.P. Putrajaya: Tidak diketahui. DEMO / SYNTHETIC', exact: true })
    .press('Enter');
  await expect(page.locator('.zone-value')).toHaveText('Tidak diketahui');
  await page.getByRole('combobox', { name: 'Tempoh', exact: true }).selectOption('2026-08-02');
  await expect(page.getByRole('region', { name: 'Data dibekalkan' })).toContainText(
    'Tiada petikan',
  );
  await expect(page.getByRole('region', { name: 'Data dibekalkan' })).not.toContainText('47,084');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/?state=MY-04');
    await page.getByText('Tentang angka ini', { exact: true }).click();
    await expect(page.locator('.overview-source-body')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: 'artifacts/screenshots/overview-details-melaka-' + width + '.png',
      fullPage: true,
    });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  }
});
