import { test, expect } from '@playwright/test';
import { roleLabels } from '../../src/lib/domain/demo-identities';
test('all demo roles render scoped routes without browser errors', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const role of Object.keys(roleLabels)) {
    expect(
      (
        await page.request.post('/api/v1/session', {
          headers: { origin: process.env.E2E_BASE_URL! },
          data: { role },
        })
      ).ok(),
    ).toBeTruthy();
    for (const route of ['/', '/data/uploads', '/admin/governance']) {
      expect((await page.goto(route))?.status()).toBe(200);
      if (role === 'platform-admin' && route === '/')
        await expect(page.getByText('47,084', { exact: true })).toHaveCount(0);
    }
  }
  expect(errors).toEqual([]);
});
test('keyboard skip link and map table provide a non-pointer path', async ({ page }) => {
  await page.goto('/map');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Langkau ke kandungan utama' })).toBeFocused();
  await page.keyboard.press('Enter');
  const table = page.getByRole('button', { name: 'Paparan jadual', exact: true });
  await table.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('table').first()).toBeVisible();
});
