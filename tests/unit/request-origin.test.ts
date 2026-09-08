import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isLocalSameOrigin } from '../../src/lib/domain/request-origin';
test('loopback browser origin uses the validated Host even when Next normalises its internal URL', () => {
  assert.equal(
    isLocalSameOrigin(
      new Request('http://localhost:3000/api', {
        headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' },
      }),
    ),
    true,
  );
  const invalid: Record<string, string>[] = [
    { host: '127.0.0.1:3000', origin: 'https://foreign.invalid' },
    { host: 'foreign.invalid', origin: 'http://foreign.invalid' },
    { host: '127.0.0.1:3000' },
  ];
  for (const headers of invalid)
    assert.equal(isLocalSameOrigin(new Request('http://localhost:3000/api', { headers })), false);
});
