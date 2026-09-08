import { test, expect } from '@playwright/test';
const headers = { origin: 'http://127.0.0.1:3000' };
test('action evidence requires an independent verifier and preserves revision checks', async ({
  request,
  page,
}) => {
  const profile = async (role: string) =>
    expect((await request.post('/api/v1/session', { headers, data: { role } })).ok()).toBeTruthy();
  await profile('programme-manager');
  const created = await request.post('/api/v1/actions', {
    headers,
    data: {
      kind: 'action',
      body: 'Semakan ujian tindakan demo',
      owner: 'demo-programme-manager',
      dueDate: '2026-09-30',
      priority: 'normal',
      context: { geography: 'MY', teras: 1, period: '2026-08-09' },
    },
  });
  expect(created.ok(), await created.text()).toBeTruthy();
  const { id } = await created.json();
  const update = (data: unknown) => request.post(`/api/v1/actions/${id}`, { headers, data });
  expect((await update({ status: 'in-progress', revision: 1 })).ok()).toBeTruthy();
  expect(
    (await update({ status: 'review', revision: 1, evidence: 'Bukti demo' })).ok(),
  ).toBeFalsy();
  expect(
    (await update({ status: 'review', revision: 2, evidence: 'Bukti semakan demo' })).ok(),
  ).toBeTruthy();
  expect((await update({ status: 'closed', revision: 3 })).ok()).toBeFalsy();
  await profile('executive');
  expect((await update({ status: 'closed', revision: 3 })).ok()).toBeTruthy();
  await page.goto('/actions');
  await expect(page.getByRole('heading', { name: 'Tindakan bersama', exact: true })).toBeVisible();
});
test('governance denies business roles and records effective-dated demo references', async ({
  page,
}) => {
  const request = page.request;
  const data = {
    operation: 'reference',
    kind: 'programme',
    code: `demo-test-${Date.now()}`,
    name: 'Program ujian demonstrasi',
    effective: '2026-09-07',
    reason: 'Pengesahan ujian',
  };
  await request.post('/api/v1/session', { headers, data: { role: 'executive' } });
  expect((await request.post('/api/v1/governance', { headers, data })).ok()).toBeFalsy();
  await request.post('/api/v1/session', { headers, data: { role: 'organisation-admin' } });
  const response = await request.post('/api/v1/governance', { headers, data });
  expect(response.ok(), await response.text()).toBeTruthy();
  await page.goto('/admin/governance');
  await expect(page.getByRole('heading', { name: 'Skop profil demonstrasi' })).toBeVisible();
});
