import 'server-only';
import { NextResponse } from 'next/server';
import { getSession, requireSameOrigin } from './auth';
import { withScope, audit } from './db';
import type { Session } from '../domain/policy';
export function privateJSON(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function mutation(request: Request, work: (session: Session) => Promise<unknown>) {
  let session: Session | undefined;
  try {
    await requireSameOrigin(request);
    session = await getSession();
    return privateJSON(await work(session));
  } catch (error) {
    if (session)
      await withScope(session, (c) =>
        audit(
          c,
          session!,
          'request-denied',
          'api',
          'Permintaan gagal validasi, skop atau peralihan; tiada kandungan direkodkan.',
          'denied',
        ),
      ).catch(() => {});
    const message =
      error instanceof Error &&
      /^(Akses|Versi|Sebab|Imbasan|Pengesahan|Fail|Had fail|Sasaran|Templat|Objek|Penyerahan|Penilaian|Asal|Sesi)/.test(
        error.message,
      )
        ? error.message
        : 'Permintaan ditolak. Semak medan, skop, versi dan keadaan penyerahan.';
    return privateJSON({ error: message }, 400);
  }
}
