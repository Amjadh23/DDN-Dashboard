import 'server-only';
import { z } from 'zod';
import { withScope, audit } from './db';
import { requirePermission } from './auth';
import { allowed, type Session } from '../domain/policy';
import { demoIdentities } from '../domain/demo-identities';
import { nextActionState } from '../domain/actions';
const contextSchema = z
  .object({
    geography: z.string().regex(/^(MY|MY-(0[1-9]|1[0-6]))$/),
    teras: z.number().int().min(1).max(5),
    period: z.enum(['2026-08-09', '2026-08-02']),
    publication: z.string().max(100).optional(),
    layer: z.enum(['burden', 'supply', 'harm', 'gap', 'confidence']).optional(),
  })
  .strict();
export type DecisionContext = z.infer<typeof contextSchema>;
export interface NoteDTO {
  id: string;
  kind: string;
  body: string;
  author: string;
  createdAt: string;
  context: DecisionContext;
}
function scope(session: Session, context: DecisionContext) {
  return {
    organisation: session.organisation === '*' ? 'demo-a' : session.organisation,
    geography: context.geography,
    teras: context.teras,
    sensitivity: 'demo' as const,
    state: 'published' as const,
  };
}
export function parseDecisionContext(value: unknown): DecisionContext {
  return contextSchema.parse(value);
}
export async function addDecision(session: Session, input: unknown) {
  const data = z
    .object({
      kind: z.enum(['note', 'decision', 'action']),
      body: z.string().trim().min(3).max(2000),
      context: contextSchema,
      owner: z.string().max(100).optional(),
      dueDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      priority: z.enum(['normal', 'high', 'urgent']).optional(),
    })
    .strict()
    .parse(input);
  const resource = scope(session, data.context);
  requirePermission(session, data.kind === 'action' ? 'action' : 'comment', resource);
  return withScope(session, async (c) => {
    if (data.context.publication) {
      const p = await c.query(
        'SELECT organisation,geography,teras FROM core.publication WHERE id=$1',
        [data.context.publication],
      );
      const pub = p.rows[0];
      if (!pub || !allowed(session, 'view', { ...pub, sensitivity: 'demo', state: 'published' }))
        throw new Error('Akses penerbitan konteks tidak dibenarkan.');
    }
    const id = crypto.randomUUID(),
      context = {
        ...data.context,
        definition: 'v1',
        classification: 'demo',
        synthetic: true,
        capturedAt: new Date().toISOString(),
      };
    if (data.kind === 'action') {
      const owner = Object.values(demoIdentities).find((a) => a.id === data.owner);
      if (
        !owner ||
        (owner.organisation !== '*' && owner.organisation !== resource.organisation) ||
        !data.dueDate ||
        data.body.length > 180 ||
        !Number.isFinite(Date.parse(data.dueDate)) ||
        new Date(data.dueDate).toISOString().slice(0, 10) !== data.dueDate
      )
        throw new Error('Pemilik, tajuk atau tarikh tindakan tidak sah.');
      await c.query(
        "INSERT INTO core.action(id,organisation,geography,teras,title,owner,due_date,priority,status,context,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'open',$9,$10)",
        [
          id,
          resource.organisation,
          resource.geography,
          resource.teras,
          data.body,
          data.owner,
          data.dueDate,
          data.priority ?? 'normal',
          JSON.stringify(context),
          session.id,
        ],
      );
    } else
      await c.query(
        'INSERT INTO core.note(id,organisation,geography,teras,context,kind,body,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',
        [
          id,
          resource.organisation,
          resource.geography,
          resource.teras,
          JSON.stringify(context),
          data.kind,
          data.body,
          session.id,
        ],
      );
    await audit(
      c,
      session,
      `collaboration-${data.kind}`,
      id,
      'Rekod demo dicipta dengan konteks; kandungan tidak dicatat dalam log audit.',
    );
    return { id };
  });
}
export async function updateAction(session: Session, id: string, input: unknown) {
  const data = z
    .object({
      status: z.enum(['in-progress', 'review', 'closed']),
      revision: z.number().int().positive(),
      evidence: z.string().trim().min(3).max(2000).optional(),
    })
    .strict()
    .parse(input);
  return withScope(session, async (c) => {
    const r = await c.query(
      'SELECT organisation,geography,teras,owner,status,revision,evidence,evidence_by FROM core.action WHERE id=$1 FOR UPDATE',
      [id],
    );
    const row = r.rows[0];
    if (!row) throw new Error('Objek tidak tersedia.');
    requirePermission(session, 'action', { ...row, sensitivity: 'demo', state: 'published' });
    const evidence = data.evidence ?? row.evidence,
      evidenceBy = data.evidence ? session.id : row.evidence_by;
    nextActionState({ ...row, evidence, evidenceBy }, data.status, data.revision, session.id);
    await c.query(
      'UPDATE core.action SET status=$2,evidence=$3,evidence_by=$4,verified_by=$5,revision=revision+1 WHERE id=$1',
      [id, data.status, evidence, evidenceBy, data.status === 'closed' ? session.id : null],
    );
    await audit(
      c,
      session,
      'action-transition',
      id,
      `${row.status} → ${data.status}; versi ${row.revision + 1}.`,
    );
    return { id, status: data.status };
  });
}
export async function getNotes(session: Session, context: DecisionContext): Promise<NoteDTO[]> {
  return withScope(session, async (c) => {
    const rows = await c.query(
      "SELECT id,kind,body,created_by,created_at,context,organisation,geography,teras FROM core.note WHERE ($1='MY' OR geography=$1) AND teras=$2 AND context->>'period'=$3 ORDER BY created_at DESC LIMIT 50",
      [context.geography, context.teras, context.period],
    );
    return rows.rows
      .filter((r) =>
        allowed(session, 'view', {
          organisation: r.organisation,
          geography: r.geography,
          teras: r.teras,
          sensitivity: 'demo',
          state: 'published',
        }),
      )
      .map((r) => ({
        id: r.id,
        kind: r.kind,
        body: r.body,
        author: r.created_by,
        createdAt: r.created_at.toISOString(),
        context: r.context,
      }));
  });
}
