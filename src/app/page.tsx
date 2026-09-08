import Link from 'next/link';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { getSession } from '@/lib/server/auth';
import { getMapZones, getMetrics } from '@/lib/server/dal';
import { getStateShapes } from '@/lib/server/geometry';
import { parseFilters, filterQuery } from '@/lib/domain/filters';
import { dateBM, formatNumber } from '@/lib/domain/types';
import { PageHeading, Badge } from '@/components/ui';
import { FilterBar } from '@/components/filters';
import { ThreatMap } from '@/components/threat-map';

const teras = [
  { n: 1, title: 'Pendidikan pencegahan', status: 'Konteks sumber & demo', accent: 'teal' },
  { n: 2, title: 'Rawatan & pemulihan', status: 'Petikan sumber tersedia', accent: 'blue' },
  { n: 3, title: 'Penguatkuasaan', status: 'Petikan sumber & demo', accent: 'amber' },
  { n: 4, title: 'Pengurangan kemudaratan', status: 'Senario demo', accent: 'rose' },
  { n: 5, title: 'Kerjasama antarabangsa', status: 'Senario demo', accent: 'violet' },
];

export default async function Overview({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams),
    session = await getSession();
  const [metrics, zones, shapes] = await Promise.all([
    getMetrics(session, filters),
    getMapZones(session, filters),
    getStateShapes(),
  ]);
  const metric = (code: string) => metrics.find((m) => m.definition.code === code);
  const total = metric('T2-CLIENTS'),
    institution = metric('T2-INSTITUTION'),
    community = metric('T2-COMMUNITY'),
    complaints = metric('T3-COMPLAINTS');
  const value = (m: typeof total) =>
    m?.state === 'value' && m.value !== null ? formatNumber(m.value) : 'Tidak tersedia';
  const snapshot = total ?? institution ?? community ?? complaints;
  const query = filterQuery(filters);
  const otherFilters =
    filters.source !== 'all' ||
    filters.organisation !== 'all' ||
    filters.confidence !== 'all' ||
    filters.compare !== 'none';

  return (
    <div className="page-content overview-page">
      <PageHeading
        eyebrow="PUSAT STRATEGIK KEBANGSAAN"
        title="Gambaran nasional"
        description="Ringkasan klien AADK dan aduan, diikuti senario peta negeri."
      />
      <FilterBar filters={filters} variant="overview" />
      {otherFilters && (
        <p className="overview-filter-note">
          Penapis tambahan daripada pautan masih digunakan.{' '}
          <Link
            href={
              '/?' +
              filterQuery({
                ...filters,
                source: 'all',
                organisation: 'all',
                confidence: 'all',
                compare: 'none',
              })
            }
          >
            Kosongkan penapis tambahan
          </Link>
        </p>
      )}
      <section className="overview-snapshot" aria-label="Data dibekalkan">
        <div className="overview-section-heading">
          <div>
            <span className="eyebrow small">DATA DIBEKALKAN</span>
            <h2>Klien AADK & aduan</h2>
          </div>
          <div className="overview-source-links">
            {snapshot && <span>{dateBM(snapshot.period)} · Malaysia</span>}
            <Link href={'/reports?' + query}>
              Lihat laporan <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        {snapshot ? (
          <div className="overview-figures">
            <div className="overview-treatment">
              <div className="overview-total">
                <h3>Jumlah klien AADK</h3>
                <div className="metric-number">{value(total)}</div>
                <p>Klien dalam rawatan institusi dan komuniti.</p>
              </div>
              <div className="overview-breakdown">
                <p className="overview-part-label">Daripada jumlah ini</p>
                <div className="overview-parts">
                  <div>
                    <div className="metric-number">{value(institution)}</div>
                    <h3>Dalam institusi</h3>
                    <p>Rawatan di PUSPEN</p>
                  </div>
                  <div>
                    <div className="metric-number">{value(community)}</div>
                    <h3>Dalam komuniti</h3>
                    <p>Rawatan berasaskan komuniti</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="overview-complaints">
              <h3>Aduan terkumpul</h3>
              <div className="metric-number">{value(complaints)}</div>
              <p>Aduan ialah isyarat, bukan kesalahan yang disahkan atau ukuran prevalens.</p>
            </div>
          </div>
        ) : (
          <div className="overview-unavailable">
            <h3>Tiada petikan untuk penapis ini</h3>
            <p>
              Empat angka ini tersedia hanya bagi seluruh Malaysia pada 9 Ogos 2026, tertakluk akses
              anda.
            </p>
            <Link
              href={
                '/?' +
                filterQuery({
                  ...filters,
                  period: '2026-08-09',
                  geography: 'MY',
                  source: 'all',
                  organisation: 'all',
                })
              }
            >
              Lihat petikan kebangsaan <ArrowUpRight size={14} />
            </Link>
          </div>
        )}
        <details className="overview-source-details">
          <summary>
            Tentang angka ini <ChevronDown size={16} />
          </summary>
          <div className="overview-source-body">
            <div>
              <h3>Sumber & tarikh</h3>
              <p>
                Statistik Mingguan AADK, laporan 9 Ogos 2026, halaman 2. Ini petikan laporan yang
                dibekalkan, bukan suapan langsung.
              </p>
              {snapshot && <p>Dikemas kini dalam aplikasi: {dateBM(snapshot.refreshed)}.</p>}
            </div>
            <div>
              <h3>Cara membaca</h3>
              <p>
                Jumlah klien merangkumi rawatan institusi dan komuniti. Aduan dikira berasingan dan
                tidak ditambah kepada jumlah klien. Bilangan klien bukan ukuran prevalens
                masyarakat.
              </p>
              <p>Satu tempoh laporan tersedia; perubahan rasmi belum boleh dikira.</p>
            </div>
            <div>
              <h3>Perkara belum disahkan</h3>
              <p>
                Angka telah disemak dengan laporan. Takrif operasi, sasaran dan pihak yang
                bertanggungjawab terhadap setiap indikator masih perlu disahkan. AADK ialah sumber
                laporan.
              </p>
              <Link href="/indicators">
                Lihat definisi penuh <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </details>
      </section>
      <div className="overview-demo-heading">
        <span className="eyebrow small">SENARIO DEMO</span>
        <p>
          Nilai negeri di bawah ialah rekaan untuk meneroka peta; ia bukan pecahan angka AADK di
          atas.
        </p>
      </div>
      <ThreatMap zones={zones} shapes={shapes} filters={filters} variant="overview" />
      <section className="overview-teras" aria-labelledby="overview-teras-heading">
        <div className="overview-section-heading">
          <h2 id="overview-teras-heading">Teroka lima teras</h2>
          <span>Dasar Dadah Negara 2017</span>
        </div>
        <div className="overview-teras-grid">
          {teras.map((t) => (
            <Link
              key={t.n}
              href={'/teras/' + t.n + '?' + query}
              className={'overview-teras-link accent-' + t.accent}
            >
              <span className="overview-teras-number">0{t.n}</span>
              <div>
                <h3>{t.title}</h3>
                <Badge>{t.status}</Badge>
              </div>
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
