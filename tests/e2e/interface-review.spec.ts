import { test, expect } from '@playwright/test';

test('selected map state carries through to the related Teras', async ({ page }) => {
  await page.goto('/?state=MY-08&source=synthetic&compare=2026-08-02');
  await page.getByRole('link', { name: 'Teroka Teras berkaitan' }).click();
  await expect(page.getByRole('combobox', { name: 'Geografi', exact: true })).toHaveValue('MY-08');
  await expect(page.getByRole('combobox', { name: 'Bandingkan', exact: true })).toHaveValue(
    '2026-08-02',
  );
  await expect(page).toHaveURL(/source=synthetic/);
});

test('sidebar preserves analysis context and selects the destination layer', async ({ page }) => {
  await page.goto('/teras/2?period=2024&geography=MY-08&source=supplied');
  await page
    .locator('.sidebar')
    .getByRole('link', { name: 'Penguatkuasaan Proaktif dan Ramalan Risiko 03' })
    .click();
  await expect(page.getByRole('combobox', { name: 'Tempoh', exact: true })).toHaveValue('2024');
  await expect(page.getByRole('combobox', { name: 'Geografi', exact: true })).toHaveValue('MY-08');
  await expect(page.getByLabel('Lapisan peta')).toHaveValue('supply');
  await expect(page).toHaveURL(/source=supplied/);
});

test('overview Teras cards select the appropriate analytical layer', async ({ page }) => {
  await page.goto('/?period=2024&geography=MY-08');
  await page
    .locator('.overview-teras')
    .getByRole('link', { name: /03 Penguatkuasaan/ })
    .click();
  await expect(page.getByLabel('Lapisan peta')).toHaveValue('supply');
  await expect(page.getByRole('combobox', { name: 'Geografi', exact: true })).toHaveValue('MY-08');
  await page.goto('/?period=2024&geography=MY-08');
  await page
    .locator('.overview-teras')
    .getByRole('link', { name: /02 Pemulihan/ })
    .click();
  await page.getByRole('link', { name: 'Pengurangan kemudaratan', exact: true }).click();
  await expect(page.getByLabel('Lapisan peta')).toHaveValue('harm');
});

test('international geography is explicitly national and unavailable as a filter', async ({
  page,
}) => {
  await page.goto('/teras/5?geography=MY-08');
  await expect(page.getByRole('combobox', { name: 'Geografi', exact: true })).toBeDisabled();
  await expect(page.getByRole('combobox', { name: 'Geografi', exact: true })).toHaveValue('MY');
  await expect(
    page.getByText('Kerjasama antarabangsa dipaparkan pada skop kebangsaan.'),
  ).toBeVisible();
});

test('map hover exposes interpretation metadata and AIDA stays in the header', async ({ page }) => {
  await page.goto('/map?source=synthetic');
  await expect(page.locator('.topbar .assistant-launcher')).toBeVisible();
  await page.getByRole('button', { name: /Johor: Nilai tersedia/ }).hover();
  const tip = page.locator('.map-tooltip');
  for (const label of ['Penyebut', 'Tempoh', 'Perbandingan', 'Sumber', 'Segar semula']) {
    await expect(tip).toContainText(label);
  }
});

test('map canvas does not stretch to match the details and labels follow one rule', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1265, height: 900 });
  await page.goto('/map');
  const canvas = await page.locator('.map-canvas').boundingBox();
  const svg = await page.locator('.malaysia-map').boundingBox();
  expect(canvas!.height).toBeLessThan(svg!.height + 100);
  await expect(page.locator('.state-map-label')).toHaveCount(0);
});

test('country names are localized and filter selections have room to read', async ({ page }) => {
  await page.setViewportSize({ width: 1265, height: 900 });
  await page.goto('/teras/5');
  await page.getByRole('button', { name: 'Rakan demo D · Jepun', exact: true }).click();
  await expect(page.locator('.partner-detail')).toContainText('Lokasi ilustrasi: Jepun');
  await page.getByRole('button', { name: 'Rakan demo E · Jerman', exact: true }).click();
  await expect(page.locator('.partner-detail')).toContainText('Lokasi ilustrasi: Jerman');
  await page.screenshot({ path: 'artifacts/screenshots/interface-partners.png', fullPage: true });
  await page.goto('/teras/2?period=2026-08-02');
  const clipped = await page.locator('.filter-bar select').evaluateAll((nodes) =>
    nodes
      .filter((node) => {
        const select = node as HTMLSelectElement;
        const style = getComputedStyle(select);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        return (
          context.measureText(select.selectedOptions[0].text).width >
          select.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
        );
      })
      .map((node) => (node as HTMLSelectElement).value),
  );
  expect(clipped).toEqual([]);
  await page.goto('/');
  await page.screenshot({ path: 'artifacts/screenshots/interface-overview.png', fullPage: true });
});

test('compact Teras map keeps a readable desktop sidebar and stacks at narrow widths', async ({
  page,
}) => {
  for (const width of [1265, 900, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/teras/1');
    const map = await page.locator('.map-main').boundingBox();
    const detail = await page.locator('.zone-detail').boundingBox();
    if (width > 900) {
      expect(detail!.x).toBeGreaterThanOrEqual(map!.x + map!.width - 1);
      expect(detail!.width).toBe(300);
    } else {
      expect(detail!.y).toBeGreaterThanOrEqual(map!.y + map!.height - 1);
      expect(detail!.width).toBeGreaterThan(map!.width - 2);
    }
    const summary = await page.locator('.zone-summary').boundingBox();
    expect(summary!.width).toBeGreaterThan(230);
    await page
      .locator('.threat-panel')
      .screenshot({ path: `artifacts/screenshots/map-reflow-${width}.png` });
  }
});

test('dashboard removes classification badges and exact labels across routes', async ({ page }) => {
  for (const route of [
    '/',
    '/teras/1',
    '/teras/2',
    '/teras/3',
    '/teras/4',
    '/teras/5',
    '/data/catalog',
    '/data/uploads',
    '/indicators',
    '/actions',
    '/reports',
    '/admin/governance',
  ]) {
    await page.goto(route);
    await expect(page.locator('body')).not.toContainText('DEMO / SYNTHETIC');
    await expect(page.locator('.badge-demo')).toHaveCount(0);
  }
  await page.goto('/teras/1');
  await page
    .locator('.threat-panel')
    .screenshot({ path: 'artifacts/screenshots/map-without-classification-labels.png' });
});
