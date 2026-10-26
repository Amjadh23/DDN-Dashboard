import test from 'node:test';
import assert from 'node:assert/strict';
import {
  domainHref,
  pillarForDomain,
  resolveDomain,
  legacyTerasHref,
  domainLabel,
} from '../../src/lib/domain/pillars';

test('historical harm and international resolve to distinct current pillars without renumbering domains', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(pillarForDomain), [1, 2, 3, 2, 4]);
  assert.equal(pillarForDomain(6), null);
  assert.equal(domainHref(4), '/ddn-2/teras/2?domain=harm');
  assert.equal(domainHref(5), '/ddn-2/teras/4');
  assert.match(domainLabel(4), /Teras 2.*Pengurangan kemudaratan/);
  assert.match(domainLabel(5), /Teras 4.*Kerjasama antarabangsa/);
});
test('merged default selects only a granted domain and explicit denied selection never falls through', () => {
  assert.equal(resolveDomain(2, undefined, [4]), 4);
  assert.equal(resolveDomain(2, undefined, [2, 4]), 2);
  assert.equal(resolveDomain(2, 'harm', [2]), null);
  assert.equal(resolveDomain(2, 'treatment', [4]), null);
  assert.equal(resolveDomain(2, undefined, [5]), null);
  assert.equal(resolveDomain(4, undefined, [4]), null);
  assert.equal(resolveDomain(4, undefined, [5]), 5);
  assert.equal(resolveDomain(2, 'invalid', [2, 4]), null);
});
test('legacy bookmarks retain validated analytical context and cannot be redirected to another domain', () => {
  const href = legacyTerasHref(4, {
    domain: 'treatment',
    geography: 'MY-03',
    period: '2026-08-02',
    perspective: 'outcomes',
    cohort: '2025-q4',
    secret: 'discard',
  });
  const url = new URL(href, 'http://localhost');
  assert.equal(url.pathname, '/ddn-2/teras/2');
  assert.equal(url.searchParams.get('domain'), 'harm');
  assert.equal(url.searchParams.get('layer'), 'harm');
  assert.equal(url.searchParams.get('geography'), 'MY-03');
  assert.equal(url.searchParams.get('perspective'), 'outcomes');
  assert.equal(url.searchParams.get('secret'), null);
  assert.equal(
    new URL(legacyTerasHref(5, { geography: 'MY-03' }), 'http://localhost').searchParams.get(
      'geography',
    ),
    'MY',
  );
  assert.throws(() => legacyTerasHref(8, {}));
});
