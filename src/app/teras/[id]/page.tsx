import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { getSession } from '@/lib/server/auth';
import { getMetrics, getMapZones, getActions } from '@/lib/server/dal';
import { getStateShapes } from '@/lib/server/geometry';
import { getWorldShapes } from '@/lib/server/world-geometry';
import { getScenario } from '@/lib/server/teras-scenario';
import { terasInfo } from '@/lib/domain/teras';
import { parseFilters, filterQuery } from '@/lib/domain/filters';
import { PageHeading, Panel, MetricCard, SourceNote, Badge, EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/filters';
import { ThreatMap } from '@/components/threat-map';
import { PartnerMap } from '@/components/partner-map';
import { Funnel } from '@/components/charts';
import { TerasContent, perspectives } from '@/components/teras-content';
import { SourceEvidence } from '@/components/source-evidence';
import { CohortPicker } from '@/components/cohort-picker';
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: terasInfo[Number(id)]?.title ?? 'Teras' };
}
export default async function TerasPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params,
    teras = Number(id);
  if (!Number.isInteger(teras) || teras < 1 || teras > 5) notFound();
  const p = await searchParams,
    info = terasInfo[teras],
    session = await getSession();
  const filters = parseFilters({
    ...p,
    layer: p.layer ?? (teras === 3 ? 'supply' : teras === 4 ? 'harm' : 'burden'),
  });
  const perspective = perspectives.some(([key]) => key === p.perspective)
    ? String(p.perspective)
    : 'needs';
  const scenario = getScenario(session, teras, filters),
    cohort = p.cohort === '2025-q4' ? '2025-q4' : '2026-q1';
  const [metrics, zones, shapes, actions] = await Promise.all([
    getMetrics(session, filters),
    teras === 5 ? Promise.resolve([]) : getMapZones(session, filters),
    teras === 5 ? Promise.resolve([]) : getStateShapes(),
    getActions(session),
  ]);
  const cards = metrics.filter((m) => m.definition.teras === teras).slice(0, 4);
  const scale = scenario?.value ?? ((n: number) => n),
    eligible = cohort === '2025-q4' ? 640 : 800,
    loss = cohort === '2025-q4' ? 96 : 120;
  const query = filterQuery(filters);
  return (
    <div className={`page-content teras-page accent-${info.accent}`}>
      <PageHeading
        eyebrow={`TERAS 0${teras} / DASAR DADAH NEGARA`}
        title={info.title}
        description={info.subtitle}
      >
        <Link
          href={`/actions?teras=${teras}&geography=${filters.geography}&period=${filters.period}`}
          className="button button-secondary"
        >
          Cipta tindakan
          <ArrowUpRight size={15} />
        </Link>
      </PageHeading>
      <div className="responsibility-strip">
        <ShieldCheck size={17} />
        <div>
          <strong>{info.committee}</strong>
          <span>
            {info.responsibility} · {info.source}
          </span>
        </div>
        <p>
          AADK: peneraju dan penyelaras kelima-lima Teras — <b>explicitly assigned</b>, DDN 2017.
          Struktur semasa memerlukan pengesahan.
        </p>
      </div>
      <FilterBar filters={filters} />
      {cards.length > 0 && (
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
          <SourceNote />
        </>
      )}
      <div className="strategic-question">
        <span>SOALAN STRATEGIK</span>
        <h2>{info.question}</h2>
      </div>
      {teras === 5 ? (
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
                <Badge tone="demo">DEMO / SYNTHETIC</Badge>
                <h3>Setiap tahap, makna berbeza</h3>
                <p>
                  Kohort layak: {scale(eligible)} rekod demo. Horizon susulan: 3 bulan selepas tamat
                  rawatan.
                </p>
                <div className="followup-loss">
                  <strong>{scale(loss)}</strong>
                  <span>Tiada susulan: {scale(loss)} rekod demo</span>
                </div>
                <p>
                  Kehilangan susulan kekal dalam denominator yang layak; ia bukan hasil negatif yang
                  disahkan.
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
        <ThreatMap zones={zones} shapes={shapes} filters={filters} />
      )}
      <div className="policy-caveat">{info.caveat}</div>
      <nav className="perspective-tabs" aria-label="Perspektif indikator">
        {perspectives.map(([key, label]) => (
          <Link
            key={key}
            href={`/teras/${teras}?${query}&perspective=${key}&cohort=${cohort}`}
            aria-current={key === perspective ? 'page' : undefined}
            scroll={false}
          >
            {label}
          </Link>
        ))}
      </nav>
      <TerasContent teras={teras} perspective={perspective} scenario={scenario} />
      {teras <= 3 &&
        filters.source !== 'synthetic' &&
        filters.period === '2026-08-09' &&
        filters.organisation === 'all' && (
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
                    href={`/teras/${teras}?${filterQuery(filters)}&perspective=${perspective}&setting=${setting}`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            )}
            <SourceEvidence
              session={session}
              purpose={teras as 1 | 2 | 3}
              geography={filters.geography}
              setting={p.setting === 'RPDI' ? 'RPDI' : p.setting === 'PPP' ? 'PPP' : 'RPDK'}
            />
          </div>
        )}
      <div className="grid-2">
        <Panel title="Kualiti, liputan & tafsiran">
          <div className="panel-body">
            <div className="quality-line">
              <span>
                {teras <= 3 ? 'Petikan dibekalkan' : 'Tiada ukuran hasil dalam sumber dibekalkan'}
              </span>
              <Badge tone={teras <= 3 ? 'source' : 'demo'}>
                {teras <= 3 ? '9 Ogos 2026' : 'DEMO / SYNTHETIC'}
              </Badge>
            </div>
            <p className="body-copy">
              Segar semula 7 September 2026. Tiada suapan langsung; liputan di luar petikan tidak
              diketahui. Formula keyakinan nasional, sasaran dan ambang belum diluluskan.
            </p>
            <p className="body-copy">
              Senario v1 · {filters.period} · {scenario?.scope ?? 'Skop tidak tersedia'}.
              Perbandingan contoh tidak membuktikan impak. Definisi dan pemilik operasional masih
              memerlukan pengesahan.
            </p>
            <Link className="text-link" href={`/indicators?teras=${teras}`}>
              Semak definisi & formula
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </Panel>
        <Panel
          title="Nota & tindakan berakauntabiliti"
          action={
            <Link
              className="text-link"
              href={`/actions?teras=${teras}&geography=${filters.geography}&period=${filters.period}`}
            >
              Buka ruang kerja
              <ArrowUpRight size={14} />
            </Link>
          }
        >
          {actions.filter((a) => a.teras === teras).length ? (
            <div className="panel-body">
              {actions
                .filter((a) => a.teras === teras)
                .map((a) => (
                  <div className="compact-action" key={a.id}>
                    <Badge tone="demo">DEMO / SYNTHETIC</Badge>
                    <h3>{a.title}</h3>
                    <p>
                      {a.owner} · {a.dueDate} · {a.status}
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
    </div>
  );
}
