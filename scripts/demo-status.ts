import pg from 'pg';
import { databaseEnvironment } from './environment';
const env = databaseEnvironment('dashboard_demo_refined_20260909');
const db = new pg.Pool({ connectionString: env.DATABASE_ADMIN_URL });
try {
  const counts: Record<string, number> = {};
  for (const table of [
    'action',
    'note',
    'submission',
    'saved_view',
    'export',
    'audit',
    'publication',
  ]) {
    const r = await db.query(`SELECT count(*)::int AS count FROM core.${table}`);
    counts[table] = r.rows[0].count;
  }
  const pollution = await db.query(
    "SELECT count(*)::int AS count FROM core.action WHERE title LIKE 'Semakan ujian%' OR title LIKE 'Semakan paparan tindakan%'",
  );
  console.log(
    JSON.stringify({
      database: 'dashboard_demo_refined_20260909',
      counts,
      testActions: pollution.rows[0].count,
    }),
  );
} finally {
  await db.end();
}
