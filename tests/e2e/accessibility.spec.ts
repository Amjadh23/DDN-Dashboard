import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const route of [
  '/',
  '/map',
  '/ddn-2/teras/1',
  '/ddn-2/teras/2',
  '/ddn-2/teras/3',
  '/ddn-2/teras/2?domain=harm',
  '/ddn-2/teras/4',
  '/data/uploads',
  '/data/catalog',
  '/indicators',
  '/actions',
  '/reports',
  '/admin/governance',
]) {
  test(`accessible and responsive ${route}`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    await page.setViewportSize({ width: 320, height: 800 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
  });
}
