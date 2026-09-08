import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { demoIdentities } from '../domain/demo-identities';
import type { Session, Permission, Resource } from '../domain/policy';
import { allowed } from '../domain/policy';
import { withScope } from './db';
import { isLocalSameOrigin } from '../domain/request-origin';

function signature(value: string) {
  if (!process.env.SESSION_SECRET) throw new Error('Sesi belum dikonfigurasi.');
  return createHmac('sha256', process.env.SESSION_SECRET).update(value).digest('hex');
}
async function effectiveScope(session: Session): Promise<Session> {
  const row = await withScope(
    session,
    async (c) =>
      (
        await c.query(
          'SELECT geographies,teras FROM core.access_revision WHERE actor=$1 AND effective_from<=now() ORDER BY effective_from DESC LIMIT 1',
          [session.id],
        )
      ).rows[0],
  );
  if (!row) return session;
  return {
    ...session,
    geographies: row.geographies.filter(
      (g: string) => session.geographies.includes('*') || session.geographies.includes(g),
    ),
    teras: row.teras.filter((t: number) => session.teras.includes(t)),
  };
}
export function signSession(id: string, actor: string, expires: number) {
  const value = Buffer.from(JSON.stringify({ id, actor, expires })).toString('base64url');
  return `${value}.${signature(value)}`;
}
export async function getSession(): Promise<Session> {
  if (process.env.DASHBOARD_MODE !== 'demo')
    throw new Error('Identiti pengeluaran belum diluluskan. Akses ditutup.');
  const h = await headers();
  const host = h.get('host')?.split(':')[0];
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(host ?? ''))
    throw new Error('Demonstrasi hanya tersedia secara setempat.');
  const token = (await cookies()).get('dashboard-session')?.value;
  if (!token) return effectiveScope({ ...demoIdentities.executive, expires: Date.now() + 3600000 });
  try {
    const [value, mac] = token.split('.');
    const expected = signature(value);
    if (
      !mac ||
      mac.length !== expected.length ||
      !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
    )
      throw new Error('invalid');
    const data = JSON.parse(Buffer.from(value, 'base64url').toString()) as {
      id: string;
      actor: string;
      expires: number;
    };
    const identity = demoIdentities[data.actor];
    if (!identity || data.expires <= Date.now()) throw new Error('expired');
    const session = { ...identity, expires: data.expires };
    const valid = await withScope(
      session,
      async (c) =>
        (
          await c.query(
            'SELECT id FROM core.session WHERE id=$1 AND actor=$2 AND NOT revoked AND expires_at>now()',
            [data.id, session.id],
          )
        ).rowCount,
    );
    if (!valid) throw new Error('revoked');
    return effectiveScope(session);
  } catch {
    throw new Error('Sesi tidak sah atau tamat. Muat semula profil demo.');
  }
}
export function requirePermission(session: Session, permission: Permission, resource: Resource) {
  if (!allowed(session, permission, resource))
    throw new Error('Akses ditolak untuk peranan atau skop ini.');
}
export async function requireSameOrigin(request: Request) {
  if (!isLocalSameOrigin(request)) throw new Error('Asal permintaan tidak sah.');
}
