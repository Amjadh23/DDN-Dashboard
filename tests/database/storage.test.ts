import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
if (
  process.env.DASHBOARD_E2E !== '1' ||
  !new URL(process.env.DATABASE_ADMIN_URL!).pathname.startsWith('/dashboard_e2e_')
) {
  throw new Error('Run npm run test:db to keep database tests isolated from the demonstration.');
}
const pool = new pg.Pool({ connectionString: process.env.DATABASE_ADMIN_URL });
after(async () => {
  await pool.end();
});
test('PostGIS is available for aggregate spatial joins', async () => {
  const r = await pool.query(
    "SELECT ST_Contains(ST_GeomFromText('POLYGON((0 0,0 2,2 2,2 0,0 0))',4326), ST_SetSRID(ST_Point(1,1),4326)) AS inside",
  );
  assert.equal(r.rows[0].inside, true);
});
test('synthetic publication cannot claim official origin', async () => {
  await assert.rejects(
    pool.query(
      "INSERT INTO core.publication(id,organisation,geography,teras,origin,official,version,definition_version,period,reason,created_by) VALUES('test-false-official','demo-a','MY-10',2,'synthetic',true,1,'v1','2026-08-09','test','a')",
    ),
    /check constraint/,
  );
});
test('audit history is immutable', async () => {
  const id = `test-${Date.now()}`;
  await pool.query(
    "INSERT INTO core.audit(id,actor,action,object_id,result,reason,correlation_id) VALUES($1,'test','test',$1,'allowed','validation',$1)",
    [id],
  );
  await assert.rejects(
    pool.query('UPDATE core.audit SET result=$1 WHERE id=$2', ['changed', id]),
    /immutable/,
  );
  await assert.rejects(pool.query('DELETE FROM core.audit WHERE id=$1', [id]), /immutable/);
});
test('publication revisions cannot overwrite history', async () => {
  const id = `test-pub-${Date.now()}`;
  await pool.query(
    "INSERT INTO core.publication(id,organisation,geography,teras,origin,official,version,definition_version,period,reason,created_by) VALUES($1,'demo-a','MY-10',2,'synthetic',false,1,'v1','2026-08-09','test','a')",
    [id],
  );
  await assert.rejects(
    pool.query('UPDATE core.publication SET version=2 WHERE id=$1', [id]),
    /immutable/,
  );
});
test('row security hides foreign organisation and geography from application role', async () => {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query('SET LOCAL ROLE dashboard_app');
    await c.query(
      "SELECT set_config('app.organisation','demo-a',true),set_config('app.geographies','MY-10',true),set_config('app.teras','2',true),set_config('app.sensitivity','demo',true)",
    );
    const r = await c.query(
      "SELECT count(*)::int AS count FROM demo.observation WHERE organisation <> 'demo-a' OR geography <> 'MY-10' OR teras <> 2",
    );
    assert.equal(r.rows[0].count, 0);
    await c.query('ROLLBACK');
  } finally {
    c.release();
  }
});
