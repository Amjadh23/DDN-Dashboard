import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('artifacts/print', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' }),
  context = await browser.newContext({ viewport: { width: 1440, height: 1050 } }),
  page = await context.newPage();
await page.goto('http://127.0.0.1:3000/map', { waitUntil: 'domcontentloaded' });
await page.getByRole('heading', { level: 1 }).waitFor();
await page.emulateMedia({ media: 'print' });
await page.pdf({
  path: 'artifacts/print/map-demo.pdf',
  format: 'A4',
  landscape: true,
  printBackground: true,
  margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
});
await page.screenshot({ path: 'artifacts/print/map-print.png', fullPage: true });
await browser.close();
console.log('Printed disclosed map: artifacts/print/map-demo.pdf and map-print.png');
