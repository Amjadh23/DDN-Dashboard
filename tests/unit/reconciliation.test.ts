import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import snapshot from '../../data/supplied/weekly-2026-08-09.json';

type NumberRow = Record<string, number | string | undefined>;

function sum(rows: NumberRow[], field: string) {
  return rows.reduce((total, row) => total + Number(row[field] ?? 0), 0);
}

function runServerModule(expression: string) {
  const script = `
    const source = await import('./src/lib/server/source-snapshot.ts');
    const session = {
      id: 'test-executive',
      name: 'Test executive',
      role: 'executive',
      organisation: '*',
      geographies: ['*'],
      teras: [1, 2, 3],
      sensitivity: ['public-aggregate'],
      expires: Date.now() + 60_000,
    };
    const result = ${expression};
    process.stdout.write(JSON.stringify(result));
  `;
  const result = spawnSync(
    process.execPath,
    ['--conditions=react-server', '--import', 'tsx', '--input-type=module', '--eval', script],
    { cwd: process.cwd(), encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

test('supplied snapshot keeps the visually verified source hash and headline totals', () => {
  assert.equal(
    snapshot.source.sha256,
    '5c7d9dbc0ed71bc666d03b4a3749367d8c90683d8f51761a24e90c98f78844d3',
  );
  assert.deepEqual(
    snapshot.headline.slice(0, 3).map(({ code, value, sourcePage }) => ({
      code,
      value,
      sourcePage,
    })),
    [
      { code: 'aadk_clients_total', value: 47084, sourcePage: 2 },
      { code: 'aadk_clients_mandatory', value: 44906, sourcePage: 2 },
      { code: 'aadk_clients_voluntary', value: 2178, sourcePage: 2 },
    ],
  );
});

test('every encoded demographic profile reconciles to its hand-checked source total', () => {
  const profiles = [
    {
      profile: snapshot.demographics.aadkOverall,
      total: 47084,
      dimensions: ['sex', 'age', 'ethnicity', 'education', 'occupationAtRegistration'],
    },
    {
      profile: snapshot.demographics.rpdi,
      total: 5260,
      dimensions: ['sex', 'age', 'sourceStatus', 'ethnicity', 'education'],
    },
    {
      profile: snapshot.demographics.rpdk,
      total: 41824,
      dimensions: [
        'sex',
        'age',
        'sourceStatus',
        'ethnicity',
        'education',
        'occupationAtRegistration',
      ],
    },
    {
      profile: snapshot.demographics.ppp,
      total: 1391,
      dimensions: ['sex', 'age', 'ethnicity', 'education', 'occupationAtRegistration'],
    },
  ] as const;

  for (const { profile, total, dimensions } of profiles) {
    for (const dimension of dimensions) {
      const rows = profile[dimension as keyof typeof profile];
      assert.ok(Array.isArray(rows), `${profile.label}: ${dimension} is not an array`);
      assert.equal(sum(rows as NumberRow[], 'value'), total, `${profile.label}: ${dimension}`);
    }
  }
});

test('state, pathway, complaint and arrest rows reconcile independently to report totals', () => {
  assert.equal(sum(snapshot.rpdkStateCounts.rows, 'mandatory'), 40388);
  assert.equal(sum(snapshot.rpdkStateCounts.rows, 'voluntary'), 1436);
  assert.equal(sum(snapshot.rpdkStateCounts.rows, 'total'), 41824);
  assert.equal(sum(snapshot.rpdkLegalBasisCounts.mandatory, 'value'), 40388);
  assert.equal(sum(snapshot.rpdkLegalBasisCounts.voluntary, 'value'), 1436);
  assert.equal(sum(snapshot.complaintsByState.rows, 'cumulative'), 5208);
  assert.equal(sum(snapshot.complaintsByState.rows, 'weekly'), 172);
  assert.equal(sum(snapshot.suspectedPersonArrestsByState.rows, 'value'), 24947);
});

test('source ambiguities remain data states rather than invented zeroes or state allocations', () => {
  assert.deepEqual(snapshot.complaintsByState.unresolvedPrintedLabel, {
    label: 'Ibu Pejabat',
    sourcePage: 11,
    status: 'no_displayed_value',
    note: 'No number is visibly printed beside this label; it is not treated as zero. The 14 numbered geography rows already reconcile to both displayed totals.',
  });
  assert.equal(snapshot.rpdkStateCounts.rows[9].label, 'W. Persekutuan');
  assert.equal(snapshot.suspectedPersonArrestsByState.rows[6].label, 'Wilayah Persekutuan');
});

test('server helper returns only the selected state row and no national profile', () => {
  const result = runServerModule(
    `source.getSourceSnapshot(session, { purpose: 2, setting: 'RPDK', geography: 'MY-10' })`,
  );
  assert.equal(result.geography, 'MY-10');
  assert.deepEqual(result.summary, []);
  assert.deepEqual(result.dimensions, []);
  const tables = result.tables as { rows: { label: string }[] }[];
  assert.deepEqual(
    tables.map((table) => table.rows.map((row) => row.label)),
    [['Selangor']],
  );
});

test('server helper enforces published MY public-aggregate view permission', () => {
  const result = runServerModule(`(() => {
    try {
      return source.getSourceSnapshot(
        { ...session, sensitivity: ['demo'] },
        { purpose: 3, geography: 'MY' },
      );
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  })()`);
  assert.equal(result.error, 'Akses ditolak untuk petikan sumber diterbitkan.');
});
