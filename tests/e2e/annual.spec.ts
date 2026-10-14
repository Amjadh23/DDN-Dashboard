import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import ExcelJS from 'exceljs';
test('annual figures use the existing overview and keep state clicks on that page', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Tempoh', exact: true }).selectOption('2025');
  const snapshot = page.getByRole('region', { name: 'Data dibekalkan' });
  for (const n of ['76,769', '67,408', '9,361']) await expect(snapshot).toContainText(n);
  await expect(snapshot).toContainText('2025 · Tahunan');
  await expect(page.locator('.overview-teras a')).toHaveCount(5);
  await expect(page.getByRole('link', { name: /Buka data tahunan|BMD Tahunan/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Paparan jadual' }).click();
  await page.getByRole('button', { name: 'Johor', exact: true }).click();
  await expect(page.locator('.zone-detail h3')).toHaveText('Johor');
  await expect(page.locator('.overview-snapshot')).toBeVisible();
  await page.screenshot({ path: 'artifacts/bmd-2025-overview.png', fullPage: true });
  await page.getByRole('combobox', { name: 'Tempoh', exact: true }).selectOption('2026-08-09');
  await expect(snapshot).toContainText('47,084');
});
test('annual treatment keeps existing source setting links and scoped profiles', async ({
  page,
}) => {
  await page.goto('/teras/2?period=2025&setting=RPDK');
  await expect(page.locator('.perspective-tabs a')).toHaveCount(5);
  await expect(page.locator('.source-evidence')).toContainText('67,408');
  await page.getByRole('link', { name: 'Institusi / PUSPEN', exact: true }).click();
  await expect(page.locator('.source-evidence')).toContainText('9,361');
  await expect(page.locator('.source-evidence')).not.toContainText('67,408');
  await page.getByRole('combobox', { name: 'Geografi', exact: true }).selectOption('MY-01');
  await expect(page.locator('.source-evidence')).not.toContainText('61,945');
});
test('annual seizure quantities retain units, precision and actual source labels', async ({
  page,
}) => {
  await page.goto('/teras/3?period=2025');
  await page.getByText('Indikator keperluan & liputan', { exact: true }).click();
  const panel = page.locator('.panel').filter({
    has: page.getByRole('heading', { name: 'Peristiwa dan kuantiti rampasan', exact: true }),
  });
  await expect(panel).toContainText('44,421.96');
  await page.getByRole('combobox', { name: 'Tempoh', exact: true }).selectOption('2021');
  await expect(panel).toContainText('0.08');
  await expect(panel).not.toContainText('DEMO / SYNTHETIC');
  await expect(page.locator('.source-evidence')).not.toContainText(
    'Bukti aduan dan tangkapan OYDS dibekalkan',
  );
});

test('annual source reports preserve provenance and separate export permission', async ({
  page,
}) => {
  const headers = { origin: process.env.E2E_BASE_URL! };
  const api = page.request;
  await api.post('/api/v1/session', { headers, data: { role: 'analyst' } });
  const response = await api.post('/api/v1/reports', {
    headers,
    data: {
      title: 'Annual source validation',
      filters: { period: '2025', geography: 'MY', source: 'supplied' },
    },
  });
  expect(response.ok(), await response.text()).toBeTruthy();
  const saved = (await response.json()).savedView;
  expect(saved.syntheticRows).toBe(0);
  expect(saved.suppliedRows).toBeGreaterThan(16);
  const exported = await api.post(`/api/v1/reports/${saved.id}/exports`, {
    headers,
    data: { format: 'csv' },
  });
  expect(exported.ok(), await exported.text()).toBeTruthy();
  const url = (await exported.json()).export.downloadUrl;
  const csv = await (await api.get(url)).text();
  expect(csv).toContain('76769');
  expect(csv).toContain('Buku Maklumat Dadah 2025');
  expect(csv).toContain('2025');
  expect(csv).not.toContain('DEMO / SYNTHETIC');
  expect(csv).toContain('Kaedah kiraan rawatan berubah pada 2025');
  expect(csv).toContain('DOSM');
  const xlsxExport = await api.post(`/api/v1/reports/${saved.id}/exports`, {
    headers,
    data: { format: 'xlsx' },
  });
  expect(xlsxExport.ok()).toBeTruthy();
  const workbook = new ExcelJS.Workbook();
  const xlsxDownload = await api.get((await xlsxExport.json()).export.downloadUrl);
  await workbook.xlsx.load(Uint8Array.from(await xlsxDownload.body()).buffer);
  expect(workbook.getWorksheet('Supplied geography')).toBeDefined();
  expect(workbook.getWorksheet('DEMO SYNTHETIC')).toBeUndefined();
  expect(JSON.stringify(workbook.getWorksheet('Metadata')!.getSheetValues())).toContain('DOSM');
  await api.post('/api/v1/session', { headers, data: { role: 'executive' } });
  expect((await api.get(url)).status()).toBe(403);
  await api.post('/api/v1/session', { headers, data: { role: 'platform-admin' } });
  await page.goto('/?period=2025');
  await expect(page.locator('.overview-snapshot')).not.toContainText('76,769');
  await expect(page.locator('.threat-panel')).not.toContainText('21,083');
});

test('supplied-only prevention keeps sourced cards and the sourced annual trend', async ({
  page,
}) => {
  await page.goto('/teras/1?period=2025&source=supplied');
  await page.getByText('Indikator keperluan & liputan', { exact: true }).click();
  const panel = page
    .locator('details.disclosure')
    .filter({ hasText: 'Indikator keperluan & liputan' });
  await expect(panel).toContainText('787');
  await expect(panel).toContainText('39,081');
  await expect(panel.locator('svg.line-chart')).toBeVisible();
  await expect(panel).not.toContainText('versi demo v1');
  await expect(panel).not.toContainText('Tiada senario dalam skop ini');
  await page.screenshot({ path: 'artifacts/bmd-2025-prevention.png', fullPage: true });
});

test('annual existing pages remain accessible and fit mobile widths', async ({ page }) => {
  for (const route of ['/?period=2025', '/teras/1?period=2025', '/teras/3?period=2025']) {
    await page.goto(route);
    await page.setViewportSize({ width: 390, height: 844 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBeTruthy();
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(scan.violations).toEqual([]);
  }
});
