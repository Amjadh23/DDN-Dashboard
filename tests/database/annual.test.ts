import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import pg from 'pg';
import { ingestAnnual } from '../../scripts/annual-ingestion';
if (
  process.env.DASHBOARD_E2E !== '1' ||
  !new URL(process.env.DATABASE_ADMIN_URL!).pathname.startsWith('/dashboard_e2e_')
)
  throw new Error('Disposable test database required.');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_ADMIN_URL });
after(() => pool.end());
test('annual import is repeatable and preserves weekly observations', async () => {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    const before = await c.query(
      "SELECT count(*)::int AS n FROM supplied.observation WHERE definition_version='v1'",
    );
    const result = await ingestAnnual(
      c,
      JSON.parse(readFileSync('data/supplied/annual-bmd-2025.json', 'utf8')),
    );
    assert.equal(result.inserted, 0);
    assert.ok(result.observations > 1000);
    const after = await c.query(
      "SELECT count(*)::int AS n FROM supplied.observation WHERE definition_version='v1'",
    );
    assert.deepEqual(after.rows, before.rows);
    assert.equal(after.rows[0].n, 14);
    await c.query('ROLLBACK');
  } finally {
    c.release();
  }
});
test('annual totals reconcile in storage and official publication stays false', async () => {
  const r = await pool.query(
    "SELECT metadata->>'column' AS measure,value::float AS value FROM supplied.observation WHERE metadata->>'table'='2.1' AND geography='MY' AND period='2025-12-31'",
  );
  assert.deepEqual(Object.fromEntries(r.rows.map((r) => [r.measure, r.value])), {
    total: 76769,
    community: 67408,
    institution: 9361,
  });
  const official = await pool.query(
    "SELECT count(*)::int AS n FROM core.publication WHERE definition_version='bmd-v1' AND official",
  );
  assert.equal(official.rows[0].n, 0);
});
