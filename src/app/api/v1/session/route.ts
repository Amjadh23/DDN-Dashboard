import { NextResponse } from 'next/server';
import { getSession, requireSameOrigin, signSession } from '@/lib/server/auth';
import { demoIdentities } from '@/lib/domain/demo-identities';
import { audit, withScope } from '@/lib/server/db';
export async function POST(request: Request) {
  try {
    await requireSameOrigin(request);
    const previous = await getSession();
    const { role } = await request.json();
    if (typeof role !== 'string' || !demoIdentities[role])
      return NextResponse.json({ error: 'Profil tidak sah.' }, { status: 400 });
    const id = crypto.randomUUID(),
      expires = Date.now() + 8 * 60 * 60 * 1000,
      session = { ...demoIdentities[role], expires };
    await withScope(previous, async (c) => {
      await c.query('INSERT INTO core.session(id,actor,expires_at) VALUES($1,$2,$3)', [
        id,
        session.id,
        new Date(expires),
      ]);
      await audit(
        c,
        previous,
        'demo-profile',
        session.id,
        'Penukaran profil demonstrasi setempat.',
      );
    });
    const r = NextResponse.json({ ok: true });
    r.cookies.set('dashboard-session', signSession(id, role, expires), {
      httpOnly: true,
      sameSite: 'strict',
      secure: false,
      path: '/',
      maxAge: 28800,
    });
    r.headers.set('Cache-Control', 'no-store');
    return r;
  } catch {
    return NextResponse.json({ error: 'Sesi atau permintaan ditolak.' }, { status: 403 });
  }
}
