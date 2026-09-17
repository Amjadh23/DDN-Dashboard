import { NextResponse } from 'next/server';
import pg from 'pg';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Temporary deployment check. Reports whether configuration is present and whether
// the database answers. It never returns a configuration value.
export async function GET() {
  const configured = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    SESSION_SECRET: Boolean(process.env.SESSION_SECRET),
    DASHBOARD_MODE: process.env.DASHBOARD_MODE ?? null,
    DATABASE_CONNECT_TIMEOUT_MS: process.env.DATABASE_CONNECT_TIMEOUT_MS ?? null,
  };
  if (!process.env.DATABASE_URL) return NextResponse.json({ configured, database: 'not attempted' });
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });
  const started = Date.now();
  try {
    await client.connect();
    const who = await client.query('SELECT current_user AS role');
    const count = await client.query('SELECT count(*)::int AS c FROM core.geography');
    return NextResponse.json({
      configured,
      database: 'ok',
      role: who.rows[0].role,
      geographies: count.rows[0].c,
      ms: Date.now() - started,
    });
  } catch (error) {
    return NextResponse.json(
      {
        configured,
        database: 'failed',
        error: error instanceof Error ? error.message : String(error),
        ms: Date.now() - started,
      },
      { status: 500 },
    );
  } finally {
    await client.end().catch(() => {});
  }
}
