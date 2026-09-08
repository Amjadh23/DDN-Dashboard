import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transitionSubmission } from '../../src/lib/domain/workflow';
import { demoIdentities } from '../../src/lib/domain/demo-identities';
import type { Session } from '../../src/lib/domain/policy';
const actor = (role: string): Session => ({
  ...demoIdentities[role],
  expires: Date.now() + 100000,
});
const submission = {
  organisation: 'demo-a',
  geography: 'MY-10',
  teras: 2,
  sensitivity: 'demo' as const,
  state: 'validated' as const,
  submitter: 'demo-contributor',
  revision: 2,
  scanStatus: 'clean',
  errors: 0,
  warnings: 0,
};
test('steward attestation is required and stale revisions fail', () => {
  assert.throws(
    () =>
      transitionSubmission(actor('steward'), submission, {
        operation: 'submit',
        revision: 1,
        reason: 'source checked',
        attestation: true,
      }),
    /Versi/,
  );
  assert.throws(
    () =>
      transitionSubmission(actor('steward'), submission, {
        operation: 'submit',
        revision: 2,
        reason: 'source checked',
        attestation: false,
      }),
    /Pengesahan/,
  );
  assert.equal(
    transitionSubmission(actor('steward'), submission, {
      operation: 'submit',
      revision: 2,
      reason: 'source checked',
      attestation: true,
    }),
    'submitted',
  );
});
test('unscanned or invalid uploads cannot proceed even for a steward', () => {
  for (const patch of [{ scanStatus: 'unavailable' }, { errors: 1 }])
    assert.throws(
      () =>
        transitionSubmission(
          actor('steward'),
          { ...submission, ...patch },
          { operation: 'submit', revision: 2, reason: 'checked', attestation: true },
        ),
      /Imbasan|ralat/,
    );
});
test('self review and foreign scope fail; independent review requires a reason', () => {
  const row = { ...submission, state: 'submitted' as const };
  assert.throws(
    () =>
      transitionSubmission({ ...actor('reviewer'), id: row.submitter }, row, {
        operation: 'approve',
        revision: 2,
        reason: 'checked',
      }),
    /Akses/,
  );
  assert.throws(
    () =>
      transitionSubmission({ ...actor('reviewer'), organisation: 'demo-b' }, row, {
        operation: 'approve',
        revision: 2,
        reason: 'checked',
      }),
    /Akses/,
  );
  assert.throws(
    () =>
      transitionSubmission(actor('reviewer'), row, {
        operation: 'approve',
        revision: 2,
        reason: '',
      }),
    /Sebab/,
  );
  assert.equal(
    transitionSubmission(actor('reviewer'), row, {
      operation: 'approve',
      revision: 2,
      reason: 'Independent source check',
    }),
    'approved',
  );
});
test('approval does not grant publication and published versions cannot be edited', () => {
  const row = { ...submission, state: 'approved' as const };
  assert.throws(
    () =>
      transitionSubmission(actor('reviewer'), row, {
        operation: 'publish',
        revision: 2,
        reason: 'Publish demo',
      }),
    /Akses/,
  );
  assert.equal(
    transitionSubmission(actor('secretariat'), row, {
      operation: 'publish',
      revision: 2,
      reason: 'Publish demo',
    }),
    'published',
  );
  assert.throws(
    () =>
      transitionSubmission(
        actor('secretariat'),
        { ...row, state: 'published' },
        { operation: 'publish', revision: 2, reason: 'Overwrite' },
      ),
    /Akses/,
  );
});
