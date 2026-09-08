import pg from 'pg';
import { readFile, appendFile, readdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_ADMIN_URL });
try {
  await pool.query(
    'CREATE TABLE IF NOT EXISTS public.dashboard_migration(name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())',
  );
  const role = await pool.query("SELECT 1 FROM pg_roles WHERE rolname='dashboard_app'");
  if (!role.rowCount) {
    const password = randomBytes(24).toString('hex');
    await pool.query(
      `CREATE ROLE dashboard_app LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE`,
    );
    const url = new URL(process.env.DATABASE_ADMIN_URL!);
    url.username = 'dashboard_app';
    url.password = password;
    await appendFile('.env.local', `\nDATABASE_URL=${url.toString()}\n`);
  }
  for (const name of (await readdir('database/migrations'))
    .filter((n) => /^\d+_.+\.sql$/.test(n))
    .sort()) {
    const exists = await pool.query('SELECT 1 FROM public.dashboard_migration WHERE name=$1', [
      name,
    ]);
    if (!exists.rowCount) {
      await pool.query(await readFile(`database/migrations/${name}`, 'utf8'));
      await pool.query('INSERT INTO public.dashboard_migration(name) VALUES($1)', [name]);
    }
  }
  const result = await pool.query('SELECT PostGIS_Version() AS version');
  console.log('Migration ready; PostGIS', result.rows[0].version);
} finally {
  await pool.end();
}
