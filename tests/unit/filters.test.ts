import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFilters, filterQuery, navigationHref } from '../../src/lib/domain/filters';
test('filters reject arbitrary periods, scope identifiers and unit modes', () => {
  const result = parseFilters({
    period: 'tomorrow',
    geography: 'MY-999',
    layer: 'predictive-risk',
    mode: 'score',
    organisation: 'secret-agency',
  });
  assert.equal(result.period, '2026-08-09');
  assert.equal(result.geography, 'MY');
  assert.equal(result.layer, 'burden');
  assert.equal(result.mode, 'rate');
  assert.equal(result.organisation, 'all');
});

test('merged navigation lets the server choose the permitted domain layer', () => {
  const href = navigationHref(
    '/ddn-2/teras/2',
    parseFilters({ layer: 'burden', geography: 'MY-03' }),
  );
  const url = new URL(href, 'http://localhost');
  assert.equal(url.searchParams.has('layer'), false);
  assert.equal(url.searchParams.get('geography'), 'MY-03');
});
test('valid shared map state round-trips without sensitive identifiers', () => {
  const f = parseFilters({
    period: '2026-08-02',
    geography: 'MY-10',
    layer: 'harm',
    mode: 'count',
    source: 'synthetic',
  });
  const p = Object.fromEntries(new URLSearchParams(filterQuery(f)));
  assert.deepEqual(parseFilters(p), f);
  assert.equal(filterQuery(f).includes('actor'), false);
});
