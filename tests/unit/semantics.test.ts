import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  rate,
  periodChange,
  compareObservations,
  disclose,
  classify,
  confidence,
  csvCell,
} from '../../src/lib/domain/semantics.ts';

test('population rate requires a valid denominator and keeps zero distinct from missing', () => {
  assert.equal(rate(25, 50000), 50);
  assert.equal(rate(0, 50000), 0);
  assert.equal(rate(null, 50000), null);
  assert.equal(rate(25, 0), null);
  assert.equal(rate(25, null), null);
});
test('previous zero cannot produce a percentage change', () => {
  assert.equal(periodChange(10, 0), null);
  assert.equal(periodChange(110, 100), 10);
  assert.equal(periodChange(0, 100), -100);
  assert.equal(periodChange(10, null), null);
});
test('definition or boundary mismatches block comparisons', () => {
  const a = { value: 120, definition: 'v1', boundary: 'b1', coverage: 'all', cohort: '2026-Q1' };
  assert.equal(compareObservations(a, { ...a, value: 100 }), 20);
  assert.equal(compareObservations(a, { ...a, definition: 'v2' }), null);
  assert.equal(compareObservations(a, { ...a, boundary: 'b2' }), null);
  assert.equal(compareObservations(a, { ...a, cohort: '2026-Q2' }), null);
});
test('primary and secondary suppression prevent recovering a lone small cell', () => {
  assert.deepEqual(disclose([2, 12, 30], 5), [null, null, 30]);
  assert.deepEqual(disclose([0, 12, 30], 5), [0, 12, 30]);
  assert.deepEqual(disclose([null, 4, 20, 30], 5), [null, null, null, 30]);
  assert.deepEqual(disclose([1], 5), [null]);
});
test('unapproved official rules never create a threat status', () => {
  assert.equal(
    classify(120, { status: 'unapproved', synthetic: false, bands: [50, 100, 150] }),
    'unclassified',
  );
  assert.equal(
    classify(120, { status: 'demo', synthetic: true, bands: [50, 100, 150] }),
    'elevated',
  );
  assert.equal(
    classify(null, { status: 'demo', synthetic: true, bands: [50, 100, 150] }),
    'no-data',
  );
});
test('confidence exposes missing inputs without substituting zero', () => {
  assert.equal(confidence([100, 80, 90, 70, 60, 80]), 80);
  assert.equal(confidence([100, 80, null, 70, 60, 80]), null);
});
test('export text neutralises formula injection including whitespace prefixes', () => {
  assert.equal(csvCell('=SUM(A1)'), '"\'=SUM(A1)"');
  assert.equal(csvCell(' \t+cmd'), '"\' \t+cmd"');
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
});
