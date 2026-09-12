import { test, expect, type APIRequestContext } from '@playwright/test';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile),
  origin = process.env.E2E_BASE_URL!;
const headers = { origin };
async function profile(api: APIRequestContext, role: string) {
  expect((await api.post('/api/v1/session', { headers, data: { role } })).ok()).toBeTruthy();
}
const csv = (value: number) =>
  `schema_version,classification,source_key,organisation,geography,period,indicator_code,unit,value,state,denominator\n1.0,DEMO / SYNTHETIC,test-${crypto.randomUUID()},demo-a,MY-01,2026-08-02,D-BURDEN,rekod,${value},value,100000\n`;
test('controlled upload validates, attests, independently approves, publishes and revises', async ({
  page,
}) => {
  test.setTimeout(150000);
  const api = page.request;
  let prior: string | undefined;
  for (const value of [12000, 14500]) {
    await profile(api, 'contributor');
    const targetResponse = await api.post('/api/v1/uploads', {
      headers,
      data: {
        template: 'aggregate',
        teras: 2,
        geography: 'MY-01',
        period: '2026-08-02',
        format: 'csv',
        synthetic: true,
        ...(prior
          ? { predecessor: prior, revisionReason: 'Corrected demonstration aggregate' }
          : {}),
      },
    });
    expect(targetResponse.ok(), await targetResponse.text()).toBeTruthy();
    const target = await targetResponse.json();
    const upload = await api.put(target.url, {
      headers: { ...headers, 'x-upload-token': target.token },
      data: csv(value),
    });
    expect(upload.ok(), await upload.text()).toBeTruthy();
    const reuse = await api.put(target.url, {
      headers: { ...headers, 'x-upload-token': target.token },
      data: csv(value),
    });
    expect(reuse.ok()).toBeFalsy();
    await run(
      process.execPath,
      [
        'node_modules/tsx/dist/cli.mjs',
        '--conditions=react-server',
        '--env-file=.env.local',
        'src/worker/run.ts',
        '--once',
      ],
      { cwd: process.cwd(), timeout: 85000, windowsHide: true },
    );
    const row = async () =>
      (
        (await (await api.get('/api/v1/uploads')).json()).submissions as {
          id: string;
          state: string;
          revision: number;
          publication: string;
          preview: { value: number }[];
        }[]
      ).find((s) => s.id === target.id)!;
    // The continuously running worker may already own this job when --once exits.
    // Wait for this submission, not the lifetime of the competing worker process.
    await expect.poll(async () => (await row()).state, { timeout: 70000 }).toBe('validated');
    await profile(api, 'executive');
    expect(await row()).toBeUndefined();
    await profile(api, 'steward');
    let r = await row();
    expect(
      (
        await api.post(`/api/v1/uploads/${r.id}`, {
          headers,
          data: {
            operation: 'submit',
            revision: r.revision,
            reason: 'Synthetic source, coverage and quality verified',
            attestation: true,
          },
        })
      ).ok(),
    ).toBeTruthy();
    await profile(api, 'reviewer');
    r = await row();
    expect(r.state).toBe('submitted');
    expect(
      (
        await api.post(`/api/v1/uploads/${r.id}`, {
          headers,
          data: {
            operation: 'approve',
            revision: r.revision,
            reason: 'Independent validation of demo version',
          },
        })
      ).ok(),
    ).toBeTruthy();
    await profile(api, 'secretariat');
    r = await row();
    expect(
      (
        await api.post(`/api/v1/uploads/${r.id}`, {
          headers,
          data: {
            operation: 'publish',
            revision: r.revision,
            reason: 'Approved aggregate demonstration',
          },
        })
      ).ok(),
    ).toBeTruthy();
    r = await row();
    expect(r.state).toBe('published');
    expect(r.preview[0].value).toBe(value);
    prior = r.publication;
    await page.goto('/map?geography=MY-01&period=2026-08-02&mode=count');
    await expect(page.locator('.zone-detail')).toContainText(
      new Intl.NumberFormat('ms-MY').format(value),
    );
  }
  await profile(api, 'analyst');
  await page.goto('/data/uploads');
  await expect(
    page.getByRole('heading', { name: 'Daripada sumber kepada penerbitan' }),
  ).toBeVisible();
  await page.getByLabel('Paparan penyerahan').selectOption('history');
  await expect(page.getByText('Diterbitkan', { exact: true }).first()).toBeVisible();
});
test('upload boundary rejects viewer and cross-origin mutations', async ({ request }) => {
  await profile(request, 'executive');
  const data = {
    template: 'aggregate',
    teras: 2,
    geography: 'MY-01',
    period: '2026-08-09',
    format: 'csv',
    synthetic: true,
  };
  expect((await request.post('/api/v1/uploads', { headers, data })).ok()).toBeFalsy();
  expect(
    (
      await request.post('/api/v1/uploads', {
        headers: { origin: 'https://foreign.invalid' },
        data,
      })
    ).ok(),
  ).toBeFalsy();
});
test('contributor can download XLSX instructions and upload through the browser controls', async ({
  page,
}) => {
  await profile(page.request, 'contributor');
  await page.goto('/data/uploads');
  await page.getByText('Sediakan penyerahan baharu', { exact: true }).click();
  const template = await page.request.get(
    '/api/v1/templates?template=aggregate&teras=2&geography=MY-01&period=2026-08-09&format=xlsx',
  );
  expect(template.ok()).toBeTruthy();
  expect(template.headers()['content-type']).toContain('spreadsheetml');
  await page.locator('input[type=file]').setInputFiles({
    name: 'demo-upload.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv(18000)),
  });
  await page.getByRole('combobox', { name: 'Tempoh', exact: true }).selectOption('2026-08-02');
  await page.getByRole('checkbox').first().check();
  await page.getByRole('button', { name: 'Muat naik & kuarantin', exact: true }).click();
  await expect(page.getByRole('status').first()).toContainText('Fail dalam kuarantin');
  await run(
    process.execPath,
    [
      'node_modules/tsx/dist/cli.mjs',
      '--conditions=react-server',
      '--env-file=.env.local',
      'src/worker/run.ts',
      '--once',
    ],
    { cwd: process.cwd(), timeout: 85000, windowsHide: true },
  );
  await page.getByRole('button', { name: 'Segar semula', exact: true }).click();
  await expect(page.getByText('Sedia untuk pengesahan', { exact: true }).first()).toBeVisible();
});
