import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedHost, isAllowedSameOrigin } from '../../src/lib/domain/request-origin';
test('loopback browser origin uses the validated Host even when Next normalises its internal URL', () => {
  assert.equal(
    isAllowedSameOrigin(
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
    assert.equal(isAllowedSameOrigin(new Request('http://localhost:3000/api', { headers })), false);
});
test('a deployed host is refused unless PUBLIC_DEMO_HOST names it', () => {
  const previous = process.env.PUBLIC_DEMO_HOST;
  try {
    delete process.env.PUBLIC_DEMO_HOST;
    assert.equal(isAllowedHost('demo.example'), false);
    assert.equal(isAllowedHost('localhost:3000'), true);

    process.env.PUBLIC_DEMO_HOST = 'demo.example, other.example';
    assert.equal(isAllowedHost('demo.example'), true);
    assert.equal(isAllowedHost('DEMO.EXAMPLE'), true);
    assert.equal(isAllowedHost('other.example'), true);
    assert.equal(isAllowedHost('elsewhere.example'), false);
    assert.equal(isAllowedHost(null), false);
  } finally {
    if (previous === undefined) delete process.env.PUBLIC_DEMO_HOST;
    else process.env.PUBLIC_DEMO_HOST = previous;
  }
});
test('a published deployment still requires the Origin header to match its own host', () => {
  const previous = process.env.PUBLIC_DEMO_HOST;
  try {
    process.env.PUBLIC_DEMO_HOST = 'demo.example';
    assert.equal(
      isAllowedSameOrigin(
        new Request('http://demo.example/api', {
          headers: { host: 'demo.example', origin: 'https://demo.example' },
        }),
      ),
      true,
    );
    assert.equal(
      isAllowedSameOrigin(
        new Request('http://demo.example/api', {
          headers: { host: 'demo.example', origin: 'https://attacker.invalid' },
        }),
      ),
      false,
    );
  } finally {
    if (previous === undefined) delete process.env.PUBLIC_DEMO_HOST;
    else process.env.PUBLIC_DEMO_HOST = previous;
  }
});
