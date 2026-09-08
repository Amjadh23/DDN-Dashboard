import 'server-only';
import { z } from 'zod';
import { withScope, audit } from './db';
import { requirePermission } from './auth';
import { demoIdentities } from '../domain/demo-identities';
import type { Session } from '../domain/policy';
function adminScope(session: Session) {
  return {
    organisation: session.organisation === '*' ? 'demo-a' : session.organisation,
    geography: 'MY',
    teras: 1,
    sensitivity: 'demo' as const,
    state: 'published' as const,
  };
}
export async function getGovernance(session: Session) {
  return withScope(session, async (c) => {
    const administrator = ['organisation-admin', 'platform-admin', 'indicator-admin'].includes(
      session.role,
    );
    const auditRows =
      session.role === 'auditor'
        ? (
            await c.query(
              "SELECT id,actor,action,object_id,created_at,result,reason,correlation_id FROM core.audit WHERE ($1='*' OR organisation=$1 OR organisation='shared') ORDER BY created_at DESC LIMIT 100",
              [session.organisation],
            )
          ).rows
        : [];
    const references = administrator
      ? (
          await c.query(
            "SELECT id,kind,code,name_bm,effective_from::text,created_by,responsibility_status FROM core.reference_revision WHERE ($1='*' OR organisation=$1) ORDER BY created_at DESC LIMIT 50",
            [session.organisation],
          )
        ).rows
      : [];
    const access = ['organisation-admin', 'platform-admin'].includes(session.role)
      ? (
          await c.query(
            "SELECT DISTINCT ON(actor) actor,geographies,teras,effective_from FROM core.access_revision WHERE ($1='*' OR organisation=$1) ORDER BY actor,effective_from DESC",
            [session.organisation],
          )
        ).rows
      : [];
    const queue =
      session.role === 'platform-admin'
        ? (
            await c.query(
              'SELECT state,count(*)::int AS jobs FROM core.job GROUP BY state ORDER BY state',
            )
          ).rows
        : [];
    return {
      audit: auditRows.map((r) => ({
        id: String(r.id),
        actor: String(r.actor),
        action: String(r.action),
        object: String(r.object_id),
        time: r.created_at.toISOString() as string,
        result: String(r.result),
        reason: String(r.reason),
        correlation: String(r.correlation_id),
      })),
      references: references.map((r) => ({
        id: String(r.id),
        kind: String(r.kind),
        code: String(r.code),
        name: String(r.name_bm),
        effective: String(r.effective_from),
        by: String(r.created_by),
        status: String(r.responsibility_status),
      })),
      access: access.map((r) => ({
        actor: String(r.actor),
        geographies: r.geographies as string[],
        teras: r.teras as number[],
        effective: r.effective_from.toISOString() as string,
      })),
      queue: queue.map((r) => ({ state: String(r.state), jobs: Number(r.jobs) })),
    };
  });
}
export async function changeGovernance(session: Session, input: unknown) {
  requirePermission(session, 'administer', adminScope(session));
  const data = z
    .discriminatedUnion('operation', [
      z
        .object({
          operation: z.literal('scope'),
          actor: z.string(),
          geographies: z
            .array(z.string().regex(/^(\*|MY|MY-(0[1-9]|1[0-6]))$/))
            .min(1)
            .max(17),
          teras: z.array(z.number().int().min(1).max(5)).min(1).max(5),
          reason: z.string().trim().min(3).max(500),
        })
        .strict(),
      z
        .object({
          operation: z.literal('revoke'),
          actor: z.string(),
          reason: z.string().trim().min(3).max(500),
        })
        .strict(),
      z
        .object({
          operation: z.literal('reference'),
          kind: z.enum(['organisation', 'programme', 'facility', 'partner', 'forum']),
          code: z.string().regex(/^demo-[a-z0-9-]{1,60}$/),
          name: z.string().trim().min(3).max(120),
          effective: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          reason: z.string().trim().min(3).max(500),
        })
        .strict(),
    ])
    .parse(input);
  return withScope(session, async (c) => {
    const id = crypto.randomUUID();
    if (data.operation === 'reference') {
      if (
        !Number.isFinite(Date.parse(data.effective)) ||
        new Date(data.effective).toISOString().slice(0, 10) !== data.effective
      )
        throw new Error('Tarikh tidak sah.');
      await c.query(
        'INSERT INTO core.reference_revision(id,kind,code,organisation,name_bm,effective_from,created_by,reason) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
        [
          id,
          data.kind,
          data.code,
          adminScope(session).organisation,
          data.name,
          data.effective,
          session.id,
          data.reason,
        ],
      );
    } else {
      if (!['organisation-admin', 'platform-admin'].includes(session.role))
        throw new Error('Akses pentadbiran profil ditolak.');
      const target = Object.values(demoIdentities).find((a) => a.id === data.actor);
      if (
        !target ||
        target.id === session.id ||
        (session.organisation !== '*' && target.organisation !== session.organisation)
      )
        throw new Error('Akses profil di luar skop pentadbir.');
      if (data.operation === 'scope') {
        if (
          !data.geographies.every(
            (g) => session.geographies.includes('*') || session.geographies.includes(g),
          ) ||
          !data.teras.every((t) => session.teras.includes(t))
        )
          throw new Error('Akses baharu melebihi skop pentadbir.');
        await c.query(
          'INSERT INTO core.access_revision(id,actor,organisation,geographies,teras,created_by,reason) VALUES($1,$2,$3,$4,$5,$6,$7)',
          [
            id,
            target.id,
            target.organisation,
            data.geographies,
            data.teras,
            session.id,
            data.reason,
          ],
        );
      } else
        await c.query('UPDATE core.session SET revoked=true WHERE actor=$1 AND NOT revoked', [
          target.id,
        ]);
    }
    await audit(
      c,
      session,
      `admin-${data.operation}`,
      id,
      'Perubahan demo dengan sebab tersimpan; tiada kandungan sensitif dalam audit.',
    );
    return { id };
  });
}
