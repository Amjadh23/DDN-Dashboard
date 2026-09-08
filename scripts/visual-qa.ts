import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const foundation = process.argv.includes('--foundation');
const teras = process.argv.includes('--teras');
const routes = foundation
  ? ['/', '/map']
  : teras
    ? ['/teras/1', '/teras/2', '/teras/3', '/teras/4', '/teras/5', '/indicators', '/data/catalog']
    : [
        '/',
        '/map',
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
      ];
await mkdir('artifacts/screenshots', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const results: unknown[] = [];
const baseURL = process.env.QA_BASE_URL ?? 'http://127.0.0.1:3000';
for (const viewport of [
  { name: 'desktop', width: 1440, height: 1050 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'reflow', width: 320, height: 800 },
]) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  for (const route of routes) {
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
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const r = await page.goto(`${baseURL}${route}`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await page.screenshot({
      path: `artifacts/screenshots/${viewport.name}-${route === '/' ? 'overview' : route.slice(1).replaceAll('/', '-')}.png`,
      fullPage: true,
    });
    const overflow = await page.evaluate(() => ({
      viewport: innerWidth,
      width: document.documentElement.scrollWidth,
    }));
    results.push({ route, viewport: viewport.name, status: r?.status(), overflow, errors });
    console.log(
      `${viewport.name} ${route}: ${r?.status()}, width ${overflow.width}/${overflow.viewport}, errors ${errors.length}`,
    );
    page.removeAllListeners('pageerror');
  }
  await context.close();
}
await browser.close();
await writeFile('artifacts/screenshots/inspection.json', JSON.stringify(results, null, 2));
