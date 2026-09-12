import { defineConfig } from '@playwright/test';
if (
  process.env.DASHBOARD_E2E !== '1' ||
  process.env.E2E_BASE_URL !== 'http://127.0.0.1:3100' ||
  !new URL(process.env.DATABASE_URL!).pathname.startsWith('/dashboard_e2e_')
) {
  throw new Error('Use npm run test:e2e: browser tests require an isolated database and server.');
}
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'artifacts/test-results/playwright', open: 'never' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL,
    browserName: 'chromium',
    channel: 'msedge',
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  outputDir: 'artifacts/test-results/e2e',
});
