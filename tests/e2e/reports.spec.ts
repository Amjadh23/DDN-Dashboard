import { expect, test, type APIRequestContext } from '@playwright/test';

const origin = 'http://127.0.0.1:3000';
const headers = { origin };

async function profile(api: APIRequestContext, role: string) {
  expect((await api.post('/api/v1/session', { headers, data: { role } })).ok()).toBeTruthy();
}

const filters = {
  period: '2026-08-09',
  compare: 'none',
  geography: 'MY',
  layer: 'burden',
  mode: 'rate',
  source: 'all',
  confidence: 'all',
  organisation: 'all',
};

test('analyst saves a frozen disclosed report and downloads actor-bound CSV', async ({ page }) => {
  const api = page.request;
  await profile(api, 'analyst');
  const savedResponse = await api.post('/api/v1/reports', {
    headers,
    data: { title: 'Paparan ujian reproduksibel', filters },
  });
  expect(savedResponse.ok(), await savedResponse.text()).toBeTruthy();
  const saved = (await savedResponse.json()).savedView as {
    id: string;
    title: string;
    generatedAt: string;
    suppliedRows: number;
    syntheticRows: number;
  };
  expect(saved.title).toBe('Paparan ujian reproduksibel');
  expect(saved.suppliedRows).toBeLessThanOrEqual(14);
  expect(saved.syntheticRows).toBeLessThanOrEqual(16);

  const listed = await api.get('/api/v1/reports');
  expect(listed.ok()).toBeTruthy();
  const listing = await listed.json();
  expect(listing.savedViews.find((view: { id: string }) => view.id === saved.id).generatedAt).toBe(
    saved.generatedAt,
  );

  const exportResponse = await api.post(`/api/v1/reports/${saved.id}/exports`, {
    headers,
    data: { format: 'csv' },
  });
  expect(exportResponse.ok(), await exportResponse.text()).toBeTruthy();
  const generated = (await exportResponse.json()).export as { id: string; downloadUrl: string };
  expect(generated.downloadUrl).toBe(`/api/v1/reports/exports/${generated.id}`);
  const download = await api.get(generated.downloadUrl);
  expect(download.ok(), await download.text()).toBeTruthy();
  expect(download.headers()['cache-control']).toContain('no-store');
  expect(download.headers()['content-type']).toContain('text/csv');
  const csv = await download.text();
  expect(csv).toContain('DEMO / SYNTHETIC');
  expect(csv).toContain('Petikan sumber dibekalkan');
  expect(csv).toContain('publication_version');
  expect(csv).toContain('definition_version');

  await page.goto('/reports');
  await expect(page.getByRole('heading', { name: 'Laporan & paparan tersimpan' })).toBeVisible();
  await expect(
    page.getByText('Paparan ujian reproduksibel', { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByText('Eksport besar tidak tersedia', { exact: false })).toBeVisible();
});

test('report and export records remain actor-bound and export requires permission', async ({
  page,
}) => {
  const api = page.request;
  await profile(api, 'analyst');
  const created = await api.post('/api/v1/reports', {
    headers,
    data: { title: 'Paparan sulit aktor', filters },
  });
  expect(created.ok()).toBeTruthy();
  const savedId = (await created.json()).savedView.id as string;
  const generated = await api.post(`/api/v1/reports/${savedId}/exports`, {
    headers,
    data: { format: 'xlsx' },
  });
  expect(generated.ok()).toBeTruthy();
  const downloadUrl = (await generated.json()).export.downloadUrl as string;

  await profile(api, 'executive');
  const listing = await api.get('/api/v1/reports');
  expect(listing.ok()).toBeTruthy();
  expect(
    (await listing.json()).savedViews.some((view: { id: string }) => view.id === savedId),
  ).toBe(false);
  expect((await api.get(downloadUrl)).status()).toBe(403);
  expect(
    (
      await api.post(`/api/v1/reports/${savedId}/exports`, {
        headers,
        data: { format: 'csv' },
      })
    ).ok(),
  ).toBeFalsy();
});

test('report mutations reject foreign origins', async ({ request }) => {
  await profile(request, 'analyst');
  const response = await request.post('/api/v1/reports', {
    headers: { origin: 'https://foreign.invalid' },
    data: { title: 'Tidak boleh disimpan', filters },
  });
  expect(response.ok()).toBeFalsy();
});

test('scope changes and revocation invalidate existing export downloads', async ({
  playwright,
}) => {
  const analyst = await playwright.request.newContext({ baseURL: origin });
  const admin = await playwright.request.newContext({ baseURL: origin });
  await profile(analyst, 'analyst');
  await profile(admin, 'platform-admin');
  const saved = await analyst.post('/api/v1/reports', {
    headers,
    data: { title: 'Semakan perubahan akses', filters },
  });
  expect(saved.ok()).toBeTruthy();
  const id = (await saved.json()).savedView.id;
  const generated = await analyst.post(`/api/v1/reports/${id}/exports`, {
    headers,
    data: { format: 'csv' },
  });
  expect(generated.ok()).toBeTruthy();
  const url = (await generated.json()).export.downloadUrl;
  const scope = (geographies: string[]) =>
    admin.post('/api/v1/governance', {
      headers,
      data: {
        operation: 'scope',
        actor: 'demo-analyst',
        geographies,
        teras: [1, 2, 3, 4, 5],
        reason: 'Ujian akses eksport',
      },
    });
  try {
    expect((await scope(['MY-01'])).ok()).toBeTruthy();
    expect((await analyst.get(url)).status()).toBe(403);
  } finally {
    expect((await scope(['*'])).ok()).toBeTruthy();
  }
  expect((await analyst.get(url)).ok()).toBeTruthy();
  expect(
    (
      await admin.post('/api/v1/governance', {
        headers,
        data: { operation: 'revoke', actor: 'demo-analyst', reason: 'Ujian pembatalan sesi' },
      })
    ).ok(),
  ).toBeTruthy();
  expect((await analyst.get(url)).status()).toBe(403);
  await analyst.dispose();
  await admin.dispose();
});
