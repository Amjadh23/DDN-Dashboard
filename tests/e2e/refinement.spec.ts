import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const headers = { origin: process.env.E2E_BASE_URL! };

test('registry is compact, paginated and preserves direct definition links', async ({ page }) => {
  await page.goto('/indicators');
  await expect(page.locator('.registry-list > details')).toHaveCount(8);
  await expect(page.locator('.registry-list > details[open]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('9–16');
  await page.goto('/indicators#D-POPULATION');
  await expect(page.locator('#D-POPULATION')).toHaveAttribute('open', '');
  await expect(page.locator('#D-POPULATION')).toContainText('Versi definisi');
  await page.setViewportSize({ width: 320, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations,
  ).toEqual([]);
});

test('Teras keeps source and responsibility detail available through keyboard disclosure', async ({
  page,
}) => {
  await page.goto('/teras/1');
  const responsibility = page
    .locator('details')
    .filter({ has: page.getByText('AADK · JPPP', { exact: true }) });
  await responsibility.locator('summary').first().focus();
  await page.keyboard.press('Enter');
  await expect(responsibility.getByText('JKMD', { exact: true })).toBeVisible();
  await expect(responsibility.getByText('MTMD', { exact: true })).toBeVisible();
  await page.getByText('Dapatan sumber dibekalkan', { exact: true }).click();
  await expect(page.getByRole('navigation', { name: 'Tetapan sumber rawatan' })).toBeVisible();
  await page.getByText('Indikator keperluan & liputan', { exact: true }).click();
  await expect(page.getByText('Program dalam senario', { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations,
  ).toEqual([]);
});

test('current actions stay bounded and completed evidence remains accessible', async ({ page }) => {
  const api = page.request;
  await api.post('/api/v1/session', { headers, data: { role: 'executive' } });
  for (let i = 0; i < 6; i++) {
    const result = await api.post('/api/v1/actions', {
      headers,
      data: {
        kind: 'action',
        body: `Semakan paparan tindakan ${i}`,
        owner: 'demo-programme-manager',
        dueDate: '2026-09-30',
        context: { geography: 'MY', teras: 5, period: '2026-08-09' },
      },
    });
    expect(result.ok()).toBeTruthy();
  }
  await page.goto('/actions?teras=5');
  await expect(page.locator('.action-list > article')).toHaveCount(4);
  await page.getByRole('button', { name: 'Seterusnya', exact: true }).click();
  await expect(page.locator('.action-list > article')).toHaveCount(2);
  await page.getByLabel('Paparan tindakan').selectOption('closed');
  await expect(page.getByText('Belum ada tindakan selesai', { exact: true })).toBeVisible();
  await page.getByText('Catat nota, keputusan atau tindakan', { exact: true }).click();
  await page.getByLabel('Jenis rekod').selectOption('decision');
  await page.getByLabel('Catatan konteks').fill('Keputusan demonstrasi melalui borang ringkas.');
  await page.getByRole('button', { name: 'Simpan keputusan', exact: true }).click();
  await expect(page.getByRole('status').first()).toContainText('Rekod disimpan');
  await page.getByText('Nota & keputusan dalam konteks', { exact: true }).first().click();
  await expect(
    page.getByText('Keputusan demonstrasi melalui borang ringkas.', { exact: true }),
  ).toBeVisible();
});
