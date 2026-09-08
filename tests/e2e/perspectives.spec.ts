import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const teras of [1, 2, 3, 4, 5])
  test(`Teras ${teras} secondary perspectives preserve accessible, responsive labelled content`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    for (const perspective of ['process', 'outcomes', 'cost', 'satisfaction']) {
      await page.goto(`/teras/${teras}?perspective=${perspective}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator(`.perspective-tabs a[aria-current="page"]`)).toHaveAttribute(
        'href',
        new RegExp(`perspective=${perspective}`),
      );
      await page.setViewportSize({ width: 320, height: 800 });
      const audit = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        audit.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
      await page.setViewportSize({ width: 320, height: 800 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        320,
      );
      await page.screenshot({
        path: `artifacts/screenshots/reflow-teras-${teras}-${perspective}.png`,
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });
