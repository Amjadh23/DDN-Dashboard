import 'server-only';
import pg, { type PoolClient } from 'pg';
import type { Session } from '../domain/policy';

const globalDB = globalThis as unknown as { dashboardPool?: pg.Pool };
function pool(): pg.Pool {
  if (!process.env.DATABASE_URL) throw new Error('Pangkalan data belum dikonfigurasi.');
  return (globalDB.dashboardPool ??= new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 8,
    statement_timeout: 5000,
    connectionTimeoutMillis: 3000,
  }));
}
export async function withScope<T>(
  session: Session,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query('BEGIN');
    await client.query(
      "SELECT set_config('app.organisation',$1,true),set_config('app.geographies',$2,true),set_config('app.teras',$3,true),set_config('app.sensitivity',$4,true)",
      [
        session.organisation,
        session.geographies.join(','),
        session.teras.join(','),
        session.sensitivity.join(','),
      ],
    );
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
export async function audit(
  client: PoolClient,
  session: Session,
  action: string,
  object: string,
  reason: string,
  result = 'allowed',
) {
  const id = crypto.randomUUID();
  await client.query(
    'INSERT INTO core.audit(id,actor,action,object_id,result,reason,correlation_id,organisation) VALUES($1,$2,$3,$4,$5,$6,$1,$7)',
    [id, session.id, action, object, result, reason, session.organisation],
  );
}
