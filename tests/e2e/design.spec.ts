import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Ember light and dark modes switch, persist by cookie and keep AIDA', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Scenario Semasa', exact: true })).toBeVisible();
  const canvas = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await canvas()).toBe('rgb(250, 249, 247)');
  await page.getByRole('button', { name: 'Tukar ke mod gelap' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await canvas()).toBe('rgb(17, 14, 12)');
  expect((await context.cookies()).find((c) => c.name === 'ddn-theme')?.value).toBe('dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(await canvas()).toBe('rgb(17, 14, 12)');
  await page.getByRole('button', { name: 'Tukar ke mod cerah' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await canvas()).toBe('rgb(250, 249, 247)');
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  await expect(page.locator('.brand-emblem')).toHaveAttribute('src', /aadk-logo/);
  await expect(page.locator('.brand-mission')).toContainText('Lima teras.');
  await page
    .getByRole('button', { name: 'Buka AIDA, pembantu digital Dasar Dadah Negara' })
    .click();
  const dialog = page.getByRole('dialog', { name: 'AIDA', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img', { name: 'Watak AIDA' })).toHaveAttribute(
    'src',
    '/aida-avatar.svg',
  );
  await expect(dialog).toContainText('Asisten Inteligen Dasar Antidadah');
  await expect(dialog.getByRole('button', { name: 'Mulakan lawatan' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Terangkan peta' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Sumber data' })).toBeVisible();
});

test('mock AIDA supports local conversation, safe navigation, reset and keyboard focus', async ({
  page,
}) => {
  await page.goto('/?period=2025&geography=MY-01');
  const launcher = page.getByRole('button', {
    name: 'Buka AIDA, pembantu digital Dasar Dadah Negara',
  });
  await launcher.click();
  const dialog = page.getByRole('dialog', { name: 'AIDA', exact: true });
  await expect(dialog.getByRole('button', { name: 'Tutup pembantu' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Mulakan lawatan' }).click();
  await expect(dialog.getByRole('log')).toContainText('Scenario Semasa');
  await expect(dialog.getByRole('link', { name: 'Lihat Scenario Semasa' })).toHaveAttribute(
    'href',
    /period=2025/,
  );
  await dialog.getByRole('button', { name: 'Mulakan perbualan semula' }).click();
  await expect(dialog.locator('.assistant-message')).toHaveCount(1);
  const outgoing: string[] = [];
  page.on('request', (request) => {
    if (request.method() !== 'GET') outgoing.push(request.url());
  });
  await dialog.getByRole('textbox', { name: 'Soalan anda' }).fill('<script>alert(1)</script>');
  await dialog.getByRole('button', { name: 'Hantar soalan' }).click();
  await expect(dialog.getByRole('log')).toContainText('<script>alert(1)</script>');
  await expect(dialog.getByRole('log')).toContainText('panduan');
  expect(outgoing).toEqual([]);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
  await dialog.getByRole('button', { name: 'Mulakan perbualan semula' }).click();
  const first = dialog.getByRole('button', { name: 'Mulakan perbualan semula' });
  await first.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(dialog.getByRole('textbox', { name: 'Soalan anda' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(launcher).toBeFocused();
});

test('reference demo map colours and approved annual relative rates are explicit', async ({
  page,
}) => {
  await page.goto('/?source=synthetic');
  await expect(page.getByRole('button', { name: /Johor: Nilai tersedia/ })).toHaveAttribute(
    'fill',
    '#268963',
  );
  await expect(page.getByRole('button', { name: /Pahang: Nilai tersedia/ })).toHaveAttribute(
    'fill',
    '#e4bd43',
  );
  await expect(page.getByRole('button', { name: /Kelantan: Nilai tersedia/ })).toHaveAttribute(
    'fill',
    '#d24b5c',
  );
  await page.getByText('Bagaimana warna ditentukan?', { exact: true }).click();
  await expect(page.locator('.demo-band-legend')).toContainText('demo-relative-range-v1');
  await expect(page.locator('.demo-band-legend')).toContainText('bukan ambang ancaman rasmi');
  await page.goto('/?period=2025&source=supplied');
  await expect(page.locator('.demo-band-legend')).toContainText('Kadar relatif · kaedah DEMO');
  await page.getByText('Bagaimana warna ditentukan?', { exact: true }).click();
  await expect(page.locator('.demo-band-legend')).toContainText('supplied-relative-range-v1');
  const fills = await page
    .locator('[role="button"][fill]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('fill')));
  expect(fills).toContain('#268963');
  expect(fills).toContain('#e4bd43');
  expect(fills).toContain('#d24b5c');
  await page.screenshot({ path: 'artifacts/screenshots/relative-rates-2025.png', fullPage: true });
  await page.goto('/?period=2024&source=supplied');
  await expect(page.locator('.demo-band-legend')).toContainText('Kadar relatif');
  await page.screenshot({ path: 'artifacts/screenshots/relative-rates-2024.png', fullPage: true });
  await page.goto('/?period=2023&source=supplied');
  await expect(page.locator('.demo-band-legend')).toHaveCount(0);
});

test('AIDA and matched colours remain accessible at desktop and mobile widths', async ({
  page,
}) => {
  for (const [width, colorScheme] of [
    [1440, 'light'],
    [390, 'light'],
    [320, 'light'],
    [1440, 'dark'],
    [390, 'dark'],
    [320, 'dark'],
  ] as const) {
    await page
      .context()
      .addCookies([
        { name: 'ddn-theme', value: colorScheme, url: test.info().project.use.baseURL! },
      ]);
    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme });
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.screenshot({
      path: `artifacts/screenshots/ember-${colorScheme}-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole('button', { name: 'Buka AIDA, pembantu digital Dasar Dadah Negara' })
      .click();
    await expect(page.getByRole('dialog', { name: 'AIDA', exact: true })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
    await page.screenshot({ path: `artifacts/screenshots/aida-${colorScheme}-${width}.png` });
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(scan.violations.map((violation) => violation.id)).toEqual([]);
  }
});
