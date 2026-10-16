import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('all pages reflow in both themes with role-appropriate content', async ({ page, context }) => {
  test.setTimeout(180000);
  const baseURL = test.info().project.use.baseURL!;
  for (const theme of ['light', 'dark']) {
    await context.addCookies([{ name: 'ddn-theme', value: theme, url: baseURL }]);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 950 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      for (const route of [
        '/',
        '/teras/1',
        '/teras/2',
        '/teras/3',
        '/teras/4',
        '/teras/5',
        '/data/uploads',
        '/data/catalog',
        '/indicators',
        '/actions',
        '/reports',
        '/admin/governance',
      ]) {
        const role =
          route === '/data/uploads'
            ? 'contributor'
            : route === '/admin/governance'
              ? 'organisation-admin'
              : route === '/reports'
                ? 'analyst'
                : 'executive';
        await context.request.post(`${baseURL}/api/v1/session`, {
          headers: { origin: baseURL },
          data: { role },
        });
        const response = await page.goto(route);
        expect(response?.status(), route).toBe(200);
        await page.getByRole('heading', { level: 1 }).waitFor();
        await page.screenshot({
          path: `artifacts/screenshots/readability-${theme}-${width}-${route === '/' ? 'overview' : route.slice(1).replaceAll('/', '-')}.png`,
          fullPage: true,
        });
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${theme} ${width} ${route}`,
        ).toBeTruthy();
        if (width === 1440) {
          const scan = await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
            .analyze();
          expect(
            scan.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
            `${theme} ${route}`,
          ).toEqual([]);
        }
      }
    }
  }
});

test('first visit stays light on a dark device and explicit choice survives navigation', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: 'Tukar ke mod gelap' }).click();
  await page.goto('/teras/2');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Tukar ke mod cerah' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await context.addCookies([{ name: 'ddn-theme', value: 'invalid', url: page.url() }]);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('reading text and controls remain legible across key pages', async ({ page }) => {
  for (const route of ['/', '/teras/1', '/indicators', '/data/uploads', '/actions', '/reports']) {
    await page.goto(route);
    const undersized = await page.locator('body *').evaluateAll((nodes) =>
      nodes
        .filter((node) => {
          if (!(node instanceof HTMLElement)) return false;
          const style = getComputedStyle(node);
          return (
            node.getClientRects().length > 0 &&
            style.visibility !== 'hidden' &&
            [...node.childNodes].some(
              (child) => child.nodeType === Node.TEXT_NODE && child.textContent?.trim(),
            ) &&
            parseFloat(style.fontSize) < 14
          );
        })
        .map((node) => ({ text: node.textContent?.trim().slice(0, 65), class: node.className })),
    );
    expect(undersized, route).toEqual([]);
    for (const selector of ['.page-heading p', '.filter-bar select']) {
      const sizes = await page
        .locator(selector)
        .evaluateAll((nodes) => nodes.map((node) => parseFloat(getComputedStyle(node).fontSize)));
      expect(
        sizes.every((size) => size >= 16),
        `${route}: ${selector}`,
      ).toBeTruthy();
    }
  }
});

test('light and dark remain readable at narrow widths and 200 percent enlargement', async ({
  page,
  context,
  browser,
}) => {
  test.setTimeout(90000);
  for (const mode of ['light', 'dark']) {
    await context.addCookies([
      { name: 'ddn-theme', value: mode, url: test.info().project.use.baseURL! },
    ]);
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await expect(page.locator('html')).toHaveAttribute('data-theme', mode);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBeTruthy();
      const scan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(scan.violations.map((violation) => violation.id)).toEqual([]);
    }
    // A 1440x1000 display at 200% has a 720x500 CSS viewport and 2x density.
    // CSS zoom is unsuitable: it does not update viewport media queries.
    const enlarged = await browser.newContext({
      viewport: { width: 720, height: 500 },
      deviceScaleFactor: 2,
      baseURL: test.info().project.use.baseURL,
    });
    await enlarged.addCookies([
      { name: 'ddn-theme', value: mode, url: test.info().project.use.baseURL! },
    ]);
    const zoomPage = await enlarged.newPage();
    await zoomPage.goto('/');
    await expect(
      zoomPage.getByRole('heading', { name: 'Scenario Semasa', exact: true }),
    ).toBeVisible();
    await expect(zoomPage.getByRole('combobox', { name: /^Tempoh/ })).toBeVisible();
    await zoomPage.screenshot({
      path: `artifacts/screenshots/readability-${mode}-200-percent.png`,
      fullPage: true,
    });
    expect(
      await zoomPage.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBeTruthy();
    await enlarged.close();
  }
});
