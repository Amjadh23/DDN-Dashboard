import { expect, test } from '@playwright/test';

test('indicator registry filters on the server and keeps versioned caveats visible', async ({
  page,
}) => {
  await page.goto('/indicators');

  await expect(page.getByRole('heading', { name: 'Daftar indikator', exact: true })).toBeVisible();
  const suppliedIndicator = page.locator('#T2-CLIENTS');
  await expect(suppliedIndicator).toContainText('Jumlah klien AADK');
  await expect(suppliedIndicator).toContainText('Available');
  await expect(suppliedIndicator).toContainText('Versi definisi');
  await expect(suppliedIndicator).toContainText('v1');
  await expect(suppliedIndicator).toContainText('Kiraan klien bukan ukuran pemulihan berkekalan');
  await expect(page.getByText('Formula dan wajaran keyakinan belum diluluskan')).toBeVisible();

  await page.getByLabel('Cari indikator').fill('komitmen');
  await page.getByLabel('Teras').selectOption('5');
  await page.getByRole('button', { name: 'Tapis', exact: true }).click();

  await expect(page).toHaveURL(/\/indicators\?q=komitmen&teras=5/);
  await expect(page.locator('#D-T5-COMMITMENTS')).toContainText('Komitmen demo');
  await expect(page.locator('#D-T5-COMMITMENTS')).toContainText('DEMO / SYNTHETIC');
  await expect(page.locator('#T2-CLIENTS')).toHaveCount(0);
});

test('data catalogue separates supplied and synthetic lineage without exposing rows', async ({
  page,
}) => {
  await page.goto('/data/catalog');

  await expect(page.getByRole('heading', { name: 'Katalog data', exact: true })).toBeVisible();
  const supplied = page
    .getByRole('heading', { name: 'Petikan Statistik Mingguan AADK', exact: true })
    .locator('xpath=ancestor::section');
  await expect(supplied).toContainText('Available');
  await expect(supplied).toContainText('Pemilik');
  await expect(supplied).toContainText('Kesegaran');
  await expect(supplied).toContainText('Medan metadata');
  await expect(supplied).toContainText('Jejak data');

  const synthetic = page
    .getByRole('heading', { name: 'Senario analisis demonstrasi', exact: true })
    .locator('xpath=ancestor::section');
  await expect(synthetic).toContainText('DEMO / SYNTHETIC');
  await expect(synthetic).toContainText('tidak boleh diterbitkan sebagai data rasmi');
  await expect(page.getByText('Tiada baris operasi atau nilai terhad dipaparkan')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Buka daftar indikator' }).first()).toHaveAttribute(
    'href',
    '/indicators',
  );
});
