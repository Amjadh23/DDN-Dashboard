import { getSession } from '@/lib/server/auth';
import { getActions } from '@/lib/server/dal';
import { getNotes, parseDecisionContext } from '@/lib/server/collaboration';
import { allowed } from '@/lib/domain/policy';
import { stateNames } from '@/lib/domain/demo-identities';
import { PageHeading, DemoBadge } from '@/components/ui';
import { ActionWorkspace } from '@/components/action-workspace';
export const metadata = { title: 'Tindakan bersama' };
export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams,
    session = await getSession();
  const context = parseDecisionContext({
    geography:
      typeof p.geography === 'string' && /^(MY|MY-(0[1-9]|1[0-6]))$/.test(p.geography)
        ? p.geography
        : 'MY',
    teras: typeof p.teras === 'string' && /^[1-5]$/.test(p.teras) ? Number(p.teras) : 1,
    period: p.period === '2026-08-02' ? '2026-08-02' : '2026-08-09',
    ...(typeof p.publication === 'string' ? { publication: p.publication.slice(0, 100) } : {}),
    ...(typeof p.layer === 'string' &&
    ['burden', 'supply', 'harm', 'gap', 'confidence'].includes(p.layer)
      ? { layer: p.layer }
      : {}),
  });
  const [all, notes] = await Promise.all([getActions(session), getNotes(session, context)]),
    actions = all.filter(
      (a) =>
        a.teras === context.teras &&
        a.context.period === context.period &&
        (context.geography === 'MY' || a.geography === context.geography),
    );
  const resource = {
    organisation: 'demo-a',
    geography: context.geography,
    teras: context.teras,
    sensitivity: 'demo' as const,
    state: 'published' as const,
  };
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="RUANG KOLABORASI / AKAUNTABILITI"
        title="Tindakan bersama"
        description="Tukar pemerhatian kepada tindakan yang dimiliki, disusuli dan disahkan."
      >
        <DemoBadge />
      </PageHeading>
      <form action="/actions" className="search-form">
        <label>
          Teras
          <select name="teras" defaultValue={context.teras}>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                Teras {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          Geografi
          <select name="geography" defaultValue={context.geography}>
            <option value="MY">Seluruh Malaysia</option>
            {Object.entries(stateNames).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Tempoh
          <select name="period" defaultValue={context.period}>
            <option value="2026-08-09">9 Ogos 2026</option>
            <option value="2026-08-02">2 Ogos 2026</option>
          </select>
        </label>
        <button className="button button-secondary">Gunakan penapis</button>
      </form>
      <ActionWorkspace
        actions={actions}
        notes={notes}
        context={context}
        canAct={allowed(session, 'action', resource)}
        canComment={allowed(session, 'comment', resource)}
        actor={session.id}
      />
    </div>
  );
}
