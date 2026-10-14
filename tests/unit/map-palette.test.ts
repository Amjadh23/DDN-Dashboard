import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relativeDemoBand, relativeDemoRange } from '../../src/lib/domain/map-palette';
import type { MapZoneDTO } from '../../src/lib/domain/types';

function zone(rate: number | null, overrides: Partial<MapZoneDTO> = {}): MapZoneDTO {
  return {
    id: 'MY-01',
    name: 'Demo',
    layer: 'burden',
    count: 100,
    denominator: 100000,
    rate,
    previous: null,
    change: null,
    state: 'value',
    confidence: null,
    coverage: null,
    period: '2026-08-09',
    source: 'DEMO / SYNTHETIC',
    denominatorSource: 'Demo',
    boundary: 'demo',
    definition: 'v1',
    publication: 'demo-v1',
    synthetic: true,
    drivers: [],
    ...overrides,
  };
}

test('reference demo palette exposes equal intervals using full precision', () => {
  const range = relativeDemoRange([zone(70), zone(260)]);
  assert.ok(range);
  assert.equal(range.low, 70 + 190 / 3);
  assert.equal(relativeDemoBand(zone(range.low), range), 'low');
  assert.equal(relativeDemoBand(zone(range.low + 0.00001), range), 'medium');
  assert.equal(relativeDemoBand(zone(range.medium), range), 'medium');
  assert.equal(relativeDemoBand(zone(range.medium + 0.00001), range), 'high');
});

test('supplied, missing, suppressed, zero and nonfinite rates never receive demo levels', () => {
  const excluded = [
    zone(0),
    zone(null),
    zone(Infinity),
    zone(NaN),
    zone(900, { synthetic: false }),
    zone(800, { state: 'suppressed' }),
    zone(700, { state: 'unknown' }),
  ];
  const range = relativeDemoRange([...excluded, zone(70), zone(260)]);
  assert.equal(range?.min, 70);
  assert.equal(range?.max, 260);
  for (const value of excluded) assert.equal(relativeDemoBand(value, range), null);
  assert.equal(relativeDemoRange([zone(70), zone(70)]), null);
  assert.equal(relativeDemoRange(excluded), null);
});

test('approved annual relative rates require 2024–2025 supplied burden values', () => {
  const values = [
    zone(70, { synthetic: false, period: '2024' }),
    zone(260, { synthetic: false, period: '2024' }),
  ];
  const range = relativeDemoRange(values, true);
  assert.equal(relativeDemoBand(values[0], range, true), 'low');
  assert.equal(relativeDemoBand(values[1], range, true), 'high');
  for (const overrides of [
    { period: '2023' },
    { layer: 'harm' as const },
    { synthetic: true },
    { state: 'suppressed' as const },
  ]) {
    assert.equal(
      relativeDemoBand(zone(100, { synthetic: false, period: '2025', ...overrides }), range, true),
      null,
    );
  }
});
