import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import ExcelJS from 'exceljs';

const run = promisify(execFile);

async function uploads() {
  try {
    return await import('../../src/lib/domain/uploads.ts');
  } catch {
    assert.fail('upload contract module is not implemented');
  }
}

async function parser() {
  try {
    return await import('../../src/worker/parse-upload.ts');
  } catch {
    assert.fail('isolated upload parser is not implemented');
  }
}

const scope = {
  template: 'aggregate',
  teras: 2,
  geography: 'MY-01',
  period: '2026-08-09',
  organisation: 'demo-a',
};

const validRow = {
  schema_version: '1.0',
  classification: 'DEMO / SYNTHETIC',
  source_key: 'demo-source-001',
  organisation: 'demo-a',
  geography: 'MY-01',
  period: '2026-08-09',
  indicator_code: 'D-BURDEN',
  unit: 'rekod',
  value: '12',
  state: 'value',
  denominator: '100000',
};

function storedZip(name: string, content: Buffer, advertisedSize = content.length) {
  const encodedName = Buffer.from(name);
  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt32LE(content.length, 18);
  local.writeUInt32LE(advertisedSize, 22);
  local.writeUInt16LE(encodedName.length, 26);
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt32LE(content.length, 20);
  central.writeUInt32LE(advertisedSize, 24);
  central.writeUInt16LE(encodedName.length, 28);
  const centralOffset = local.length + encodedName.length + content.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(central.length + encodedName.length, 12);
  end.writeUInt32LE(centralOffset, 16);
  return Buffer.concat([local, encodedName, content, central, encodedName, end]);
}

test('versioned templates publish the eight approved contracts and safe examples', async () => {
  const { templates, uploadColumns, uploadDictionary, exampleRows, templateCSV } = await uploads();
  assert.deepEqual(
    templates.map((template) => template.id),
    [
      'aggregate',
      'prevention',
      'treatment',
      'enforcement',
      'harm',
      'international',
      'capacity',
      'population',
    ],
  );
  assert.equal(
    templates.every((template) => template.version === '1.0'),
    true,
  );
  assert.deepEqual(uploadColumns, [
    'schema_version',
    'classification',
    'source_key',
    'organisation',
    'geography',
    'period',
    'indicator_code',
    'unit',
    'value',
    'state',
    'denominator',
  ]);
  assert.deepEqual(
    uploadDictionary.map((column) => column.column),
    uploadColumns,
  );
  const exampleScope = {
    teras: scope.teras,
    geography: scope.geography,
    period: scope.period,
    organisation: scope.organisation,
  };
  const rows = exampleRows('capacity', exampleScope);
  assert.equal(rows[0].indicatorCode, 'D-CAPACITY');
  assert.equal(rows[0].classification, 'DEMO / SYNTHETIC');
  assert.match(templateCSV('capacity', exampleScope), /^schema_version,/);
});

test('validator returns a typed row for an exact synthetic aggregate contract', async () => {
  const { validateRows } = await uploads();
  const result = validateRows([validRow], scope);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
  assert.deepEqual(result.rows, [
    {
      schemaVersion: '1.0',
      classification: 'DEMO / SYNTHETIC',
      sourceKey: 'demo-source-001',
      organisation: 'demo-a',
      geography: 'MY-01',
      period: '2026-08-09',
      indicatorCode: 'D-BURDEN',
      unit: 'rekod',
      value: 12,
      state: 'value',
      denominator: 100000,
    },
  ]);
});

test('validator rejects an empty file before workflow validation', async () => {
  const { validateRows } = await uploads();
  const result = validateRows([], scope);
  assert.equal(result.rows.length, 0);
  assert.equal(
    result.errors.some((issue) => issue.code === 'empty_file'),
    true,
  );
});

test('validator rejects unsafe schema, official source data, scope, values and unknown columns without echoing values', async () => {
  const { validateRows } = await uploads();
  const result = validateRows(
    [
      {
        ...validRow,
        schema_version: '2.0',
        classification: 'OFFICIAL',
        source_key: '=PRIVATE-CONTENT',
        organisation: 'other-org',
        geography: 'MY-99',
        period: '2026-02-30',
        indicator_code: 'T2-CLIENTS',
        unit: 'people',
        value: -1,
        state: 'unknown',
        denominator: 0,
        'PRIVATE-HEADER': 'PRIVATE-CONTENT',
      },
    ],
    scope,
  );
  const codes = new Set(result.errors.map((issue) => issue.code));
  for (const code of [
    'unknown_column',
    'schema_version',
    'classification',
    'formula_payload',
    'organisation_scope',
    'geography_scope',
    'period',
    'indicator_code',
    'unit',
    'value_range',
    'state_value',
    'denominator_range',
  ])
    assert.equal(codes.has(code), true, `missing ${code}`);
  assert.equal(result.rows.length, 0);
  assert.equal(JSON.stringify(result).includes('PRIVATE-CONTENT'), false);
  assert.equal(JSON.stringify(result).includes('PRIVATE-HEADER'), false);
});

test('validator keeps zero distinct, enforces null-state relationships and blocks duplicates', async () => {
  const { validateRows } = await uploads();
  const zero = { ...validRow, value: 0, source_key: 'zero-row' };
  const duplicate = { ...validRow, source_key: 'zero-row' };
  const missingValue = {
    ...validRow,
    source_key: 'missing-value',
    value: null,
    state: 'value',
  };
  const unknownWithDenominator = {
    ...validRow,
    source_key: 'unknown-row',
    value: null,
    state: 'unknown',
    denominator: 100,
  };
  const result = validateRows([zero, duplicate, missingValue, unknownWithDenominator], scope);
  assert.equal(result.rows[0].value, 0);
  const codes = new Set(result.errors.map((issue) => issue.code));
  assert.equal(codes.has('duplicate_source_key'), true);
  assert.equal(codes.has('duplicate_observation'), true);
  assert.equal(codes.has('state_value'), true);
  assert.equal(codes.has('state_denominator'), true);
});

test('CSV parser accepts the exact header and rejects formula payloads and excess rows', async () => {
  const { parseUpload } = await parser();
  const header = Object.keys(validRow).join(',');
  const values = Object.values(validRow).join(',');
  const parsed = await parseUpload(Buffer.from(`${header}\n${values}\n`), 'csv');
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].indicator_code, 'D-BURDEN');
  await assert.rejects(
    parseUpload(Buffer.from(`${header}\n${values.replace('demo-source-001', '=2+2')}\n`), 'csv'),
    /formula/i,
  );
  const tooMany = `${header}\n${Array.from({ length: 1001 }, () => values).join('\n')}`;
  await assert.rejects(parseUpload(Buffer.from(tooMany), 'csv'), /1,000 rows/i);
});

test('XLSX parser reads plain cells and rejects formulas before returning rows', async () => {
  const { parseUpload } = await parser();
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Data');
  sheet.addRow(Object.keys(validRow));
  sheet.addRow(Object.values(validRow));
  const safe = Buffer.from(await workbook.xlsx.writeBuffer());
  const parsed = await parseUpload(safe, 'xlsx');
  assert.equal(parsed[0].source_key, 'demo-source-001');

  sheet.getCell('C2').value = { formula: '2+2', result: 4 };
  const formula = Buffer.from(await workbook.xlsx.writeBuffer());
  await assert.rejects(parseUpload(formula, 'xlsx'), /formula/i);
});

test('XLSX preflight rejects macros, external relationships and ZIP bombs before ExcelJS', async () => {
  const { parseUpload } = await parser();
  await assert.rejects(
    parseUpload(storedZip('xl/vbaProject.bin', Buffer.alloc(0)), 'xlsx'),
    /macro/i,
  );
  await assert.rejects(
    parseUpload(
      storedZip(
        '_rels/.rels',
        Buffer.from('<Relationship TargetMode="External" Target="https://example.invalid"/>'),
      ),
      'xlsx',
    ),
    /external relationship/i,
  );
  await assert.rejects(
    parseUpload(storedZip('xl/worksheets/sheet1.xml', Buffer.from('x'), 20_000_000), 'xlsx'),
    /ZIP expansion/i,
  );
  await assert.rejects(parseUpload(Buffer.alloc(2 * 1024 * 1024 + 1), 'xlsx'), /2 MiB/i);
});

test('Defender scanning fails closed when configured scanner is unavailable', async () => {
  const { scanFile } = await parser();
  const directory = await mkdtemp(path.join(tmpdir(), 'dashboard-scan-'));
  const file = path.join(directory, 'safe.csv');
  await writeFile(file, 'safe');
  const previous = process.env.SCANNER_PATH;
  process.env.SCANNER_PATH = path.join(directory, 'missing-scanner.exe');
  try {
    await assert.rejects(scanFile(file), /scanner is unavailable/i);
  } finally {
    if (previous === undefined) delete process.env.SCANNER_PATH;
    else process.env.SCANNER_PATH = previous;
    await rm(directory, { recursive: true, force: true });
  }
});

test('isolated CLI scans a benign quarantined file and emits only JSON rows', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'dashboard-upload-'));
  const file = path.join(directory, 'safe.csv');
  const header = Object.keys(validRow).join(',');
  const values = Object.values(validRow).join(',');
  await writeFile(file, `${header}\n${values}\n`);
  try {
    const result = await run(
      process.execPath,
      ['--max-old-space-size=128', '--import', 'tsx', 'src/worker/parse-upload.ts', file, 'csv'],
      { cwd: process.cwd(), timeout: 60_000, maxBuffer: 4 * 1024 * 1024 },
    );
    assert.equal(result.stderr, '');
    const rows = JSON.parse(result.stdout) as Record<string, unknown>[];
    assert.equal(rows.length, 1);
    assert.equal(rows[0].source_key, 'demo-source-001');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
