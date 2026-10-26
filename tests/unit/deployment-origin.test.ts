import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedHost, isAllowedSameOrigin } from '../../src/lib/domain/request-origin';

test('cloud demo access is explicitly configured and does not allow arbitrary Vercel hosts', () => {
  const old = {
    host: process.env.PUBLIC_DEMO_HOST,
    vercel: process.env.VERCEL,
    url: process.env.VERCEL_URL,
  };
  try {
    delete process.env.PUBLIC_DEMO_HOST;
    process.env.VERCEL = '1';
    process.env.VERCEL_URL = 'own-deployment.vercel.app';
    assert.equal(isAllowedHost('own-deployment.vercel.app'), false);
    assert.equal(isAllowedHost('localhost:3000'), true);
    process.env.PUBLIC_DEMO_HOST = 'dashboard.example';
    assert.equal(isAllowedHost('dashboard.example'), true);
    assert.equal(isAllowedHost('own-deployment.vercel.app'), true);
    assert.equal(isAllowedHost('attacker.vercel.app'), false);
    assert.equal(isAllowedHost('dashboard.example.attacker.invalid'), false);
    assert.equal(isAllowedHost(null), false);
  } finally {
    for (const [key, value] of Object.entries({
      PUBLIC_DEMO_HOST: old.host,
      VERCEL: old.vercel,
      VERCEL_URL: old.url,
    }))
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
  }
});

test('configured cloud host accepts HTTPS through TLS termination and rejects foreign or malformed origins', () => {
  const previous = process.env.PUBLIC_DEMO_HOST;
  try {
    process.env.PUBLIC_DEMO_HOST = 'dashboard.example';
    for (const [origin, want] of [
      ['https://dashboard.example', true],
      ['http://dashboard.example', false],
      ['https://attacker.invalid', false],
      ['null', false],
      ['https://dashboard.example/path', false],
    ] as const) {
      assert.equal(
        isAllowedSameOrigin(
          new Request('http://internal/api', { headers: { host: 'dashboard.example', origin } }),
        ),
        want,
      );
    }
    assert.equal(
      isAllowedSameOrigin(
        new Request('http://localhost:3000/api', {
          headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000' },
        }),
      ),
      true,
    );
  } finally {
    if (previous === undefined) delete process.env.PUBLIC_DEMO_HOST;
    else process.env.PUBLIC_DEMO_HOST = previous;
  }
});
