import Link from 'next/link';
import {
  pillars,
  isPillar,
  resolveDomain,
  domainNames,
  POLICY_MAPPING_VERSION,
} from '@/lib/domain/pillars';
import { allowed } from '@/lib/domain/policy';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { getSession } from '@/lib/server/auth';
import { getMetrics, getMapZones, getActions } from '@/lib/server/dal';
import { getStateShapes } from '@/lib/server/geometry';
import { getWorldShapes } from '@/lib/server/world-geometry';
import { getScenario } from '@/lib/server/teras-scenario';
import { getDashboardSource, getPreventionTrend } from '@/lib/server/dashboard-source';
import { terasInfo } from '@/lib/domain/teras';
import { parseFilters, filterQuery, isAnnualPeriod } from '@/lib/domain/filters';
import { PageHeading, Panel, MetricCard, SourceNote, Badge, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/filters';
import { ThreatMap } from '@/components/threat-map';
import { PartnerMap } from '@/components/partner-map';
import { Funnel } from '@/components/charts';
import { TerasContent, perspectives } from '@/components/teras-content';
import { SourceEvidence } from '@/components/source-evidence';
import { CohortPicker } from '@/components/cohort-picker';
import { Disclosure } from '@/components/disclosure';
import { TerasCharacter } from '@/components/illustrations';
import { Responsibility } from '@/components/responsibility';
import { actionLabels } from '@/lib/domain/actions';
import { dateBM } from '@/lib/domain/types';
import { actorName } from '@/lib/domain/display';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: pillars[Number(id) as keyof typeof pillars]?.title ?? 'Teras' };
}
export default async function TerasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const pillar = Number(id);
  if (!isPillar(pillar) || String(pillar) !== id) notFound();
  const p = await searchParams,
    originalSession = await getSession();
  // Page availability is independent of the default national filter. Every actual
  // data read still checks the requested resource geography through the DAL/RLS.
  const permittedGeographies = originalSession.geographies.includes('*')
    ? ['MY']
    : originalSession.geographies;
  const grants = originalSession.teras.filter((domain) =>
    permittedGeographies.some(
      (geography) =>
        allowed(originalSession, 'view', {
          organisation: 'demo-a',
          geography,
          teras: domain,
          sensitivity: 'demo',
          state: 'published',
        }) ||
        allowed(originalSession, 'view', {
          organisation: 'shared',
          geography,
          teras: domain,
          sensitivity: 'public-aggregate',
          state: 'published',
        }),
    ),
  );
  const teras = resolveDomain(pillar, p.domain, grants);
  if (!teras)
    return (
      <div className="page-content">
        <PageHeading
          eyebrow={`TERAS 0${pillar} / DDN 2.0`}
          title={pillars[pillar].title}
          description="Skop data mengikut kebenaran anda."
        />
        <EmptyState
          title="Tiada domain dibenarkan"
          description="Domain yang dipilih tidak tersedia dalam skop akses anda."
        />
      </div>
    );
  const info = terasInfo[teras];
  const session = { ...originalSession, teras: [teras] };
  const pagePath = `/ddn-2/teras/${pillar}`;
  const filters = parseFilters({
    ...p,
    geography: teras === 5 ? 'MY' : p.geography,
    layer: p.layer ?? (teras === 3 ? 'supply' : teras === 4 ? 'harm' : 'burden'),
  });
  const perspective = perspectives.some(([key]) => key === p.perspective)
    ? String(p.perspective)
    : 'needs';
  const scenario = getScenario(session, teras, filters),
    cohort = p.cohort === '2025-q4' ? '2025-q4' : '2026-q1';
  const [metrics, zones, shapes, actions, sourceViews, preventionTrend] = await Promise.all([
    getMetrics(session, filters),
    // Map layers keep their own resource domains; the original session permits
    // contextual layers only where the viewer already has the matching grant.
    teras === 5 ? Promise.resolve([]) : getMapZones(originalSession, filters),
    teras === 5 ? Promise.resolve([]) : getStateShapes(),
    getActions(originalSession),
    teras === 1 || teras === 3 ? getDashboardSource(session, filters, teras) : Promise.resolve([]),
    teras === 1 ? getPreventionTrend(session, filters) : Promise.resolve([]),
  ]);
  const preferred = ['T2-CLIENTS', 'T2-INSTITUTION', 'T2-COMMUNITY', 'T2-DISTRICTS'];
  const priority = (code: string) =>
    preferred.includes(code) ? preferred.indexOf(code) : preferred.length;
  const cards = metrics
    .filter((m) => m.definition.teras === teras)
    .sort((a, b) => priority(a.definition.code) - priority(b.definition.code))
    .slice(0, 4);
  const scale = scenario?.value ?? ((n: number) => n),
    eligible = cohort === '2025-q4' ? 640 : 800,
    loss = cohort === '2025-q4' ? 96 : 120;
  const query =
    filterQuery(filters) + (pillar === 2 ? `&domain=${teras === 4 ? 'harm' : 'treatment'}` : '');
  return (
    <div className={`page-content teras-page accent-${info.accent}`}>
      <PageHeading
        eyebrow={`TERAS 0${pillar} / DDN 2.0`}
        title={pillars[pillar].title}
        description={info.question}
        art={<TerasCharacter n={teras} size={168} />}
      >
        <Link
          href={`/actions?mapping=${POLICY_MAPPING_VERSION}&teras=${teras}&geography=${filters.geography}&period=${filters.period}`}
          className="button button-secondary"
        >
          Cipta tindakan
          <ArrowUpRight size={15} />
        </Link>
      </PageHeading>
      <Responsibility teras={teras} />
      {pillar === 2 && (
        <nav className="perspective-tabs domain-tabs" aria-label="Domain Teras 2">
          {([2, 4] as const)
            .filter((domain) => grants.includes(domain))
            .map((domain) => (
              <Link
                key={domain}
                href={`${pagePath}?${filterQuery({ ...filters, layer: domain === 4 ? 'harm' : 'burden' })}&domain=${domain === 4 ? 'harm' : 'treatment'}&perspective=${perspective}&cohort=${cohort}`}
                aria-current={domain === teras ? 'page' : undefined}
              >
                {domainNames[domain]}
              </Link>
            ))}
        </nav>
      )}
      <p className="body-copy">
        {domainNames[teras]} · Domain sumber DDN 2017 {teras}. Pemetaan DDN 2.0 tidak mengubah
        takrif atau hak akses.
      </p>
      <FilterBar
        filters={filters}
        geographyReason={
          teras === 5 ? 'Kerjasama antarabangsa dipaparkan pada skop kebangsaan.' : undefined
        }
      />
      <nav className="perspective-tabs" aria-label="Perspektif indikator">
        {perspectives.map(([key, label]) => (
          <Link
            key={key}
            href={`${pagePath}?${query}&perspective=${key}&cohort=${cohort}`}
            aria-current={key === perspective ? 'page' : undefined}
            scroll={false}
          >
            {label}
          </Link>
        ))}
      </nav>
      {cards.length > 0 && perspective === 'needs' && (
        <>
          <div className="section-label">
            <span>PETIKAN DIBEKALKAN</span>
            <Badge tone="source">Available</Badge>
          </div>
          <div className="metrics-grid">
            {cards.map((m) => (
              <MetricCard key={m.definition.code} metric={m} />
            ))}
          </div>
          <SourceNote>
            {isAnnualPeriod(filters.period)
              ? `Buku Maklumat Dadah 2025 · ${filters.period} · ${cards.map((m) => `hlm. ${m.definition.sourcePage}`).join(', ')}. Petikan tahunan; bukan stok mingguan.`
              : undefined}
          </SourceNote>
        </>
      )}
      {perspective === 'needs' &&
        (teras === 5 ? (
          <Panel title="Jaringan kerjasama dalam senario" kicker="RAKAN · TEMA · KOMITMEN" demo>
            {scenario ? (
              <PartnerMap shapes={await getWorldShapes()} />
            ) : (
              <EmptyState
                title="Tiada senario dibenarkan"
                description="Sumber atau skop semasa tidak mengandungi rakan demo."
              />
            )}
          </Panel>
        ) : teras === 2 ? (
          <Panel
            title="Kesinambungan jagaan"
            kicker="KOHORT YANG SAMA · HORIZON YANG JELAS"
            demo
            action={<CohortPicker value={cohort} />}
          >
            {scenario ? (
              <div className="care-layout">
                <Funnel
                  data={[
                    'Layak untuk rawatan',
                    'Memulakan jagaan',
                    'Selesai rawatan',
                    'Menyertai jagaan susulan',
                    'Dinilai pada horizon 3 bulan',
                  ].map((label, i) => ({
                    label,
                    value: scale(
                      [
                        eligible,
                        eligible * 0.9,
                        eligible * 0.8,
                        eligible * 0.7,
                        eligible * 0.7 - loss,
                      ][i],
                    ),
                  }))}
                  caption="Laluan jagaan kohort rekaan"
                  note="Kohort 2026 Q1 atau 2025 Q4 dalam senario. Tahap merujuk rekod kohort layak yang sama; bukan statistik AADK."
                />
                <aside className="care-detail">
                  <Badge tone="demo">senario rekaan</Badge>
                  <h3>Setiap tahap, makna berbeza</h3>
                  <p>
                    Kohort layak: {scale(eligible)} rekod demo. Horizon susulan: 3 bulan selepas
                    tamat rawatan.
                  </p>
                  <div className="followup-loss">
                    <strong>{scale(loss)}</strong>
                    <span>Tiada susulan: {scale(loss)} rekod demo</span>
                  </div>
                  <p>
                    Kehilangan susulan kekal dalam denominator yang layak; ia bukan hasil negatif
                    yang disahkan.
                  </p>
                  <p className="chart-caveat">
                    Penyelesaian rawatan tidak bermaksud pemulihan berkekalan. Status berulang tidak
                    bermaksud relaps.
                  </p>
                </aside>
              </div>
            ) : (
              <EmptyState
                title="Kohort tidak tersedia"
                description="Kohort demo tidak termasuk dalam penapis atau kebenaran semasa."
              />
            )}
          </Panel>
        ) : (
          <ThreatMap zones={zones} shapes={shapes} filters={filters} variant="overview" />
        ))}
      <div className="policy-caveat">{info.caveat}</div>

      {perspective === 'needs' ? (
        <Disclosure
          title="Indikator keperluan & liputan"
          meta={
            sourceViews.length
              ? 'Sumber dibekalkan · senario sokongan dilabel senario rekaan'
              : 'senario rekaan · ukuran sokongan'
          }
        >
          <TerasContent
            teras={teras}
            perspective={perspective}
            scenario={scenario}
            sourceViews={sourceViews}
            sourcePeriod={filters.period}
            geography={filters.geography}
            preventionTrend={preventionTrend}
          />
        </Disclosure>
      ) : (
        <TerasContent
          teras={teras}
          perspective={perspective}
          scenario={scenario}
          sourceViews={sourceViews}
          sourcePeriod={filters.period}
          geography={filters.geography}
          preventionTrend={preventionTrend}
        />
      )}
      {teras <= 3 &&
        filters.source !== 'synthetic' &&
        (filters.period === '2026-08-09' || isAnnualPeriod(filters.period)) &&
        filters.organisation === 'all' && (
          <Disclosure
            title="Dapatan sumber dibekalkan"
            meta="Jadual, demografi & laluan"
            open={Boolean(p.setting)}
          >
            <div className="stack">
              {teras !== 3 && (
                <nav className="button-row" aria-label="Tetapan sumber rawatan">
                  {[
                    ['RPDI', 'Institusi / PUSPEN'],
                    ['RPDK', 'Komuniti'],
                    ['PPP', 'Pemulihan persendirian'],
                  ].map(([setting, label]) => (
                    <Link
                      key={setting}
                      className={`button ${(p.setting ?? 'RPDK') === setting ? 'button-primary' : 'button-secondary'}`}
                      href={`${pagePath}?${query}&perspective=${perspective}&setting=${setting}`}
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              )}
              <SourceEvidence
                filters={filters}
                session={session}
                purpose={teras as 1 | 2 | 3}
                geography={filters.geography}
                setting={p.setting === 'RPDI' ? 'RPDI' : p.setting === 'PPP' ? 'PPP' : 'RPDK'}
              />
            </div>
          </Disclosure>
        )}
      <Disclosure title="Kualiti, liputan & tafsiran" meta="Sumber, kemas kini & pemilik">
        <div className="panel-body">
          <div className="quality-line">
            <span>
              {teras <= 3 ? 'Petikan dibekalkan' : 'Tiada ukuran hasil dalam sumber dibekalkan'}
            </span>
            <Badge tone={teras <= 3 ? 'source' : 'demo'}>
              {teras <= 3 ? dateBM(filters.period) : 'senario rekaan'}
            </Badge>
          </div>
          <p className="body-copy">
            Segar semula 7 September 2026. Tiada suapan langsung; liputan di luar petikan tidak
            diketahui. Formula keyakinan nasional, sasaran dan ambang belum diluluskan.
          </p>
          <p className="body-copy">
            Senario v1 · {filters.period} · {scenario?.scope ?? 'Skop tidak tersedia'}. Perbandingan
            contoh tidak membuktikan impak. Definisi dan pemilik operasional masih memerlukan
            pengesahan.
          </p>
          <Link className="text-link" href={`/indicators?pillar=${pillar}`}>
            Semak definisi & formula
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </Disclosure>
      <Panel
        className="teras-actions"
        title="Nota & tindakan berakauntabiliti"
        action={
          <Link
            className="text-link"
            href={`/actions?mapping=${POLICY_MAPPING_VERSION}&teras=${teras}&geography=${filters.geography}&period=${filters.period}`}
          >
            Buka ruang kerja
            <ArrowUpRight size={14} />
          </Link>
        }
      >
        {actions.filter(
          (a) =>
            pillars[pillar].domains.some((domain: number) => domain === a.teras) &&
            a.status !== 'closed',
        ).length ? (
          <div className="panel-body">
            {actions
              .filter(
                (a) =>
                  pillars[pillar].domains.some((domain: number) => domain === a.teras) &&
                  a.status !== 'closed',
              )
              .slice(0, 2)
              .map((a) => (
                <div className="compact-action" key={a.id}>
                  <Badge tone="demo">senario rekaan</Badge>
                  <h3>{a.title}</h3>
                  <p>
                    {actorName(a.owner)} · {dateBM(a.dueDate)} · {actionLabels[a.status]}
                  </p>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            title="Sedia untuk keputusan seterusnya"
            description="Cipta nota, keputusan atau tindakan dengan konteks Teras, tempoh dan geografi ini."
          />
        )}
      </Panel>
    </div>
  );
}
