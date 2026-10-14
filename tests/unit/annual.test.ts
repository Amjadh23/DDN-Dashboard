import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { validateAnnual, annualCatalog, annualChange } from '../../src/lib/domain/annual';
import { parseFilters, databasePeriod } from '../../src/lib/domain/filters';
const bytes = readFileSync('data/supplied/annual-bmd-2025.json');
const manifest = JSON.parse(bytes.toString());
test('annual source is pinned, selected and reconciled', () => {
  const validated = validateAnnual(manifest);
  assert.equal(validated.tables.length, 25);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), annualCatalog.manifestHash);
  assert.equal(
    createHash('sha256').update(readFileSync('data/Laporan-Buku-Dadah-2025.pdf')).digest('hex'),
    annualCatalog.sourceHash,
  );
  const total = validated.tables
    .find((t) => t.id === '2.1')!
    .rows.find((r) => r.year === 2025 && r.geography === 'MY')!;
  assert.deepEqual(total.values, { total: 76769, community: 67408, institution: 9361 });
  assert.ok(
    !validated.tables.some((t) => ['5.1', '6.1', '6.6', '6.7', '4.1-community'].includes(t.id)),
  );
});
test('annual validation rejects changed totals, duplicates and small person cells', () => {
  const changed = structuredClone(manifest);
  changed.tables.find((t: { id: string }) => t.id === '1.1').rows[0].values.count++;
  assert.throws(() => validateAnnual(changed), /reconciliation/);
  const duplicate = structuredClone(manifest);
  duplicate.tables.push(duplicate.tables[0]);
  assert.throws(() => validateAnnual(duplicate), /duplicate/);
  const small = structuredClone(manifest);
  small.tables.find((t: { id: string }) => t.id === '2.1').rows[0].values.total = 2;
  assert.throws(() => validateAnnual(small), /small-person/);
});
test('annual periods and treatment comparison break retain their meaning', () => {
  assert.equal(parseFilters({ period: '2025' }).period, '2025');
  assert.equal(parseFilters({ period: '2025', compare: '2026-08-02' }).compare, 'none');
  assert.equal(databasePeriod('2025'), '2025-12-31');
  assert.equal(parseFilters({}).period, '2026-08-09');
  assert.equal(annualChange(76769, 68000, 2025, 2024, 2025), null);
});
