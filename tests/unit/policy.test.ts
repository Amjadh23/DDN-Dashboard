import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allowed, type Session, type Resource } from '../../src/lib/domain/policy.ts';

const user: Session = {
  id: 'steward-a',
  name: 'Demonstration steward',
  role: 'steward',
  organisation: 'demo-a',
  geographies: ['MY-10'],
  teras: [2],
  sensitivity: ['demo'],
  expires: Date.now() + 60000,
};
const resource: Resource = {
  organisation: 'demo-a',
  geography: 'MY-10',
  teras: 2,
  sensitivity: 'demo',
  state: 'validated',
  submitter: 'steward-a',
};
test('default deny and all scope dimensions are enforced', () => {
  assert.equal(allowed(null, 'view', resource), false);
  assert.equal(allowed(user, 'view', resource), true);
  assert.equal(allowed(user, 'view', { ...resource, organisation: 'demo-b' }), false);
  assert.equal(allowed(user, 'view', { ...resource, geography: 'MY-01' }), false);
  assert.equal(allowed(user, 'view', { ...resource, teras: 3 }), false);
  assert.equal(allowed(user, 'view', { ...resource, sensitivity: 'restricted' }), false);
  assert.equal(allowed({ ...user, expires: 0 }, 'view', resource), false);
});
test('submitter cannot approve even with reviewer role', () => {
  const reviewer = { ...user, role: 'reviewer' as const };
  assert.equal(allowed(reviewer, 'approve', { ...resource, state: 'submitted' }), false);
  assert.equal(
    allowed({ ...reviewer, id: 'reviewer-a' }, 'approve', { ...resource, state: 'submitted' }),
    true,
  );
  assert.equal(allowed({ ...reviewer, id: 'reviewer-a' }, 'approve', resource), false);
});
test('platform administrator has no implicit business access or publication authority', () => {
  const admin = { ...user, role: 'platform-admin' as const };
  assert.equal(allowed(admin, 'view', resource), false);
  assert.equal(allowed(admin, 'publish', { ...resource, state: 'approved' }), false);
});
test('viewer cannot export, submit, approve or alter actions', () => {
  const viewer = { ...user, role: 'executive' as const };
  assert.equal(allowed(viewer, 'view', { ...resource, state: 'published' }), true);
  for (const permission of ['export', 'submit', 'approve', 'administer'] as const)
    assert.equal(allowed(viewer, permission, resource), false);
});
