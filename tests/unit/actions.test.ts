import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextActionState } from '../../src/lib/domain/actions';
test('closure requires review, evidence and a verifier independent of owner and evidence author', () => {
  const row = {
    status: 'review',
    revision: 3,
    owner: 'owner',
    evidence: 'Documented demonstration evidence',
    evidenceBy: 'author',
  };
  assert.throws(() => nextActionState(row, 'closed', 3, 'owner'), /berasingan/);
  assert.throws(() => nextActionState(row, 'closed', 3, 'author'), /berasingan/);
  assert.throws(
    () => nextActionState({ ...row, evidence: null }, 'closed', 3, 'reviewer'),
    /Bukti/,
  );
  assert.throws(
    () => nextActionState({ ...row, status: 'open' }, 'closed', 3, 'reviewer'),
    /Peralihan/,
  );
  assert.equal(nextActionState(row, 'closed', 3, 'reviewer'), 'closed');
});
test('stale action edits and evidence-free review are rejected', () => {
  const row = {
    status: 'in-progress',
    revision: 2,
    owner: 'owner',
    evidence: null,
    evidenceBy: null,
  };
  assert.throws(() => nextActionState(row, 'review', 1, 'author'), /Versi/);
  assert.throws(() => nextActionState(row, 'review', 2, 'author'), /Bukti/);
  assert.equal(
    nextActionState({ ...row, evidence: 'Recorded proof' }, 'review', 2, 'author'),
    'review',
  );
});
