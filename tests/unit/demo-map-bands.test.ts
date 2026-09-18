import { test } from 'node:test';
import assert from 'node:assert/strict';
import { demoRange, demoBand } from '../../src/lib/domain/demo-map-bands';
test('relative bands preserve boundaries and exclude zero and missing data', () => {
  const range = demoRange([0, null, 30, 60, 90, 120, NaN]);
  assert.deepEqual(range, { min: 30, max: 120, lowMax: 60, mediumMax: 90 });
  assert.equal(demoBand(60, range), 'low');
  assert.equal(demoBand(60.01, range), 'medium');
  assert.equal(demoBand(90, range), 'medium');
  assert.equal(demoBand(90.01, range), 'high');
  for (const value of [0, null, -1, NaN, Infinity]) assert.equal(demoBand(value, range), null);
});
test('empty, single and equal rates do not fabricate severity', () => {
  for (const values of [[], [0, null], [50], [50, 50]]) assert.equal(demoRange(values), null);
  assert.equal(demoBand(50, null), null);
});
