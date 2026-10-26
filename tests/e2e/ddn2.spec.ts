import { test, expect } from '@playwright/test';

test('prevention retains authorized burden context without granting other domains', async ({
  page,
}) => {
  await page.goto('/ddn-2/teras/1?source=synthetic&mode=count');
  await expect(page.locator('.workload-circle').first()).toBeVisible();
  await page.getByRole('button', { name: 'Paparan jadual', exact: true }).click();
  await expect(page.locator('.map-table-wrap')).toContainText('Johor');
});

test('merged action filter retains current mapping instead of reverting to one historical domain', async ({
  page,
}) => {
  await page.goto('/actions?mapping=ddn2-client-2026-10-26&teras=2');
  await page.getByRole('button', { name: 'Gunakan penapis', exact: true }).click();
  await expect(page).toHaveURL(/mapping=ddn2-client-2026-10-26/);
});

test('state-scoped domain grants keep geography controls available on a national default route', async ({
  page,
  playwright,
}) => {
  const headers = { origin: process.env.E2E_BASE_URL! };
  const admin = await playwright.request.newContext({ baseURL: process.env.E2E_BASE_URL });
  await admin.post('/api/v1/session', { headers, data: { role: 'platform-admin' } });
  await page.request.post('/api/v1/session', { headers, data: { role: 'analyst' } });
  const setScope = async (geographies: string[]) => {
    const r = await admin.post('/api/v1/governance', {
      headers,
      data: {
        operation: 'scope',
        actor: 'demo-analyst',
        geographies,
        teras: geographies[0] === '*' ? [1, 2, 3, 4, 5] : [4],
        reason: 'State domain regression',
      },
    });
    expect(r.ok()).toBeTruthy();
  };
  try {
    await setScope(['MY-03']);
    await page.goto('/ddn-2/teras/2');
    await expect(page.getByRole('combobox', { name: 'Geografi', exact: true })).toBeVisible();
    await page.getByRole('combobox', { name: 'Geografi', exact: true }).selectOption('MY-03');
    await expect(page.getByLabel('Lapisan peta')).toHaveValue('harm');
  } finally {
    await setScope(['*']);
    await admin.dispose();
  }
});

test('four current pillars preserve both merged domains and legacy bookmark meaning', async ({
  page,
}) => {
  await page.goto('/ddn-2/teras/2');
  await expect(page.locator('h1')).toHaveText('Pemulihan Tingkah Laku & Kesihatan Awam');
  await expect(page.getByRole('navigation', { name: 'Domain Teras 2' })).toBeVisible();
  await page.getByRole('link', { name: 'Pengurangan kemudaratan', exact: true }).click();
  await expect(page).toHaveURL(/domain=harm/);
  await page.getByRole('link', { name: 'Proses', exact: true }).click();
  await expect(page).toHaveURL(/domain=harm/);
  await expect(page.locator('main')).toContainText('Saringan');
  await page.goto('/teras/4?geography=MY-03&period=2026-08-02&perspective=cost');
  await expect(page).toHaveURL(/\/ddn-2\/teras\/2\?/);
  await expect(page).toHaveURL(/domain=harm/);
  await expect(page.getByRole('combobox', { name: 'Geografi', exact: true })).toHaveValue('MY-03');
  await expect(page.locator('main')).toContainText('Kos per output');
  await page.goto('/teras/5');
  await expect(page).toHaveURL(/\/ddn-2\/teras\/4/);
  await expect(page.locator('h1')).toHaveText('Kerjasama Antarabangsa & Tadbir Urus Inklusif');
  await expect(page.locator('.sidebar nav a[href*="/ddn-2/teras/"]')).toHaveCount(4);
});

test('current registry groups treatment and harm while historical queries remain domain-specific', async ({
  page,
}) => {
  await page.goto('/indicators?pillar=2&q=D-T4-SCREENING');
  await expect(page.locator('.registry-list')).toContainText('Teras 2');
  await expect(page.locator('.registry-list')).toContainText('Pengurangan kemudaratan');
  await page.goto('/indicators?teras=2&q=D-T4-SCREENING');
  await expect(page.locator('.registry-list')).toHaveCount(0);
  await page.goto('/indicators?pillar=4&q=D-T5-COMMITMENTS');
  await expect(page.locator('.registry-list')).toContainText('Teras 4');
});

test('merged pages retain separate domain permissions and historical report resources', async ({
  page,
  playwright,
}) => {
  const headers = { origin: process.env.E2E_BASE_URL! };
  const admin = await playwright.request.newContext({ baseURL: process.env.E2E_BASE_URL });
  await admin.post('/api/v1/session', { headers, data: { role: 'platform-admin' } });
  await page.request.post('/api/v1/session', { headers, data: { role: 'analyst' } });
  const scope = async (teras: number[], geographies = ['*']) => {
    const r = await admin.post('/api/v1/governance', {
      headers,
      data: {
        operation: 'scope',
        actor: 'demo-analyst',
        geographies,
        teras,
        reason: 'DDN2 domain isolation regression',
      },
    });
    expect(r.ok(), await r.text()).toBeTruthy();
  };
  try {
    await scope([4]);
    await page.goto('/');
    await page.locator('.sidebar a[href^="/ddn-2/teras/2?"]').click();
    await expect(page.getByLabel('Lapisan peta')).toHaveValue('harm');
    await expect(page.locator('main')).toContainText('Pengurangan kemudaratan');
    await expect(page.locator('main')).not.toContainText('47,084');
    await expect(
      page.getByRole('link', { name: 'Rawatan dan pemulihan', exact: true }),
    ).toHaveCount(0);
    await page.goto('/ddn-2/teras/2?domain=treatment');
    await expect(page.locator('main')).toContainText('Tiada domain dibenarkan');
    await page.goto('/ddn-2/teras/4');
    await expect(page.locator('main')).toContainText('Tiada domain dibenarkan');
    await scope([2]);
    await page.goto('/ddn-2/teras/2?domain=harm');
    await expect(page.locator('main')).toContainText('Tiada domain dibenarkan');
    await scope([5]);
    await page.goto('/ddn-2/teras/4');
    await expect(page.locator('.partner-map-canvas')).toBeVisible();
    await scope([4], ['MY-03']);
    await page.goto('/ddn-2/teras/2');
    await expect(page.getByRole('combobox', { name: 'Geografi', exact: true })).toBeVisible();
    await page.getByRole('combobox', { name: 'Geografi', exact: true }).selectOption('MY-03');
    await expect(page.getByLabel('Lapisan peta')).toHaveValue('harm');
    await page.goto('/ddn-2/teras/2?domain=harm&layer=burden&mode=count');
    await expect(page.locator('.workload-circle')).toHaveCount(0);
  } finally {
    await scope([1, 2, 3, 4, 5]);
    await admin.dispose();
  }
});
