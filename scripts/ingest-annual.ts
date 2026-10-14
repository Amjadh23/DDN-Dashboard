import pg from 'pg';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { databaseEnvironment } from './environment';
import { ingestAnnual } from './annual-ingestion';
const isolated = process.argv.includes('--isolated');
if (!process.argv.includes('--demo') && !isolated)
  throw new Error('Explicit --demo or --isolated required; local database only.');
if (isolated && !/^\/dashboard_e2e_\d+$/.test(new URL(process.env.DATABASE_ADMIN_URL!).pathname))
  throw new Error('Isolated import requires a disposable test database.');
const env = isolated ? process.env : databaseEnvironment('dashboard_demo_refined_20260909');
if (!['127.0.0.1', 'localhost'].includes(new URL(env.DATABASE_ADMIN_URL!).hostname))
  throw new Error('Local import only.');
const pool = new pg.Pool({ connectionString: env.DATABASE_ADMIN_URL });
const c = await pool.connect();
try {
  await c.query('BEGIN');
  const counts = () =>
    c.query(
      'SELECT (SELECT count(*) FROM core.action)::int AS actions,(SELECT count(*) FROM core.note)::int AS notes,(SELECT count(*) FROM core.submission)::int AS submissions,(SELECT count(*) FROM core.saved_view)::int AS saved_views,(SELECT count(*) FROM demo.observation)::int AS demo_observations',
    );
  const before = (await counts()).rows[0];
  const result = await ingestAnnual(
    c,
    JSON.parse(await readFile('data/supplied/annual-bmd-2025.json', 'utf8')),
  );
  const after = (await counts()).rows[0];
  if (JSON.stringify(before) !== JSON.stringify(after))
    throw new Error('Business record counts changed.');
  if (result.inserted) {
    const id = randomUUID();
    await c.query(
      "INSERT INTO core.audit(id,actor,action,object_id,result,reason,correlation_id,organisation) VALUES($1,'local-source-import','source-ingest','annual-bmd-2025','allowed',$2,$1,'shared')",
      [id, `${result.observations} aggregate observations; source hash ${result.sourceHash}`],
    );
  }
  await c.query(process.argv.includes('--dry-run') ? 'ROLLBACK' : 'COMMIT');
  console.log(
    JSON.stringify({
      database: new URL(env.DATABASE_ADMIN_URL!).pathname,
      dryRun: process.argv.includes('--dry-run'),
      ...result,
      before,
      after,
    }),
  );
} catch (error) {
  await c.query('ROLLBACK');
  throw error;
} finally {
  c.release();
  await pool.end();
}
