import Link from 'next/link';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { getSession } from '@/lib/server/auth';
import { getMapZones, getMetrics } from '@/lib/server/dal';
import { getStateShapes } from '@/lib/server/geometry';
import { parseFilters, filterQuery, isAnnualPeriod } from '@/lib/domain/filters';
import { stateNames } from '@/lib/domain/demo-identities';
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

export default async function ScenarioSemasa({
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
  const annual = isAnnualPeriod(filters.period);
  const total = metric(annual ? 'A-2-1-TOTAL' : 'T2-CLIENTS'),
    institution = metric(annual ? 'A-2-1-INSTITUTION' : 'T2-INSTITUTION'),
    community = metric(annual ? 'A-2-1-COMMUNITY' : 'T2-COMMUNITY'),
    complaints = metric('T3-COMPLAINTS');
  const value = (m: typeof total) =>
    m?.state === 'value' && m.value !== null ? formatNumber(m.value) : 'Tidak tersedia';
  const snapshot = total ?? institution ?? community ?? complaints;
  const query = filterQuery(filters);

  return (
    <div className="page-content overview-page">
      <PageHeading
        eyebrow="PUSAT STRATEGIK KEBANGSAAN"
        title="Scenario Semasa"
        description="Ringkasan nasional, analisis peta negeri dan tindakan bersama dalam satu paparan."
      />
      <FilterBar filters={filters} />
      <section className="overview-snapshot" aria-label="Data dibekalkan">
        <div className="overview-section-heading">
          <div>
            <span className="eyebrow small">DATA DIBEKALKAN</span>
            <h2>Klien AADK & aduan</h2>
          </div>
          <div className="overview-source-links">
            {snapshot && (
              <span>
                {dateBM(snapshot.period)} ·{' '}
                {filters.geography === 'MY' ? 'Malaysia' : stateNames[filters.geography]}
              </span>
            )}
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
                <p>
                  {annual
                    ? 'Klien direkodkan sepanjang tahun dalam rawatan institusi dan komuniti.'
                    : 'Klien dalam rawatan institusi dan komuniti.'}
                </p>
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
              <p>
                {annual
                  ? 'Jumlah tahunan ditahan: angka 7,394 dan 7,395 dalam sumber 2025 tidak konsisten.'
                  : 'Aduan ialah isyarat, bukan kesalahan yang disahkan atau ukuran prevalens.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="overview-unavailable">
            <h3>Tiada petikan untuk penapis ini</h3>
            <p>Tiada nilai sumber yang sepadan dengan tempoh, geografi dan akses semasa.</p>
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
                {annual
                  ? `Buku Maklumat Dadah 2025, Jadual 2.1, halaman 42–43. Tempoh ${filters.period}, tahunan.`
                  : 'Statistik Mingguan AADK, laporan 9 Ogos 2026, halaman 2.'}{' '}
                Ini petikan laporan yang dibekalkan, bukan suapan langsung.
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
              <p>
                {annual
                  ? 'Kaedah kiraan rawatan berubah pada 2025 kepada fasiliti terakhir. Perubahan merentas 2025 atau terhadap stok mingguan tidak dikira.'
                  : 'Satu tempoh mingguan dibekalkan; perubahan rasmi belum boleh dikira.'}
              </p>
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
        <span className="eyebrow small">
          {annual ? 'KONTEKS NEGERI · SUMBER DIBEKALKAN' : 'SENARIO DEMO'}
        </span>
        <p>
          {annual
            ? 'Peta beban menggunakan rekod dipadankan AADK/PDRM/KKM/PPP; skopnya lebih luas daripada klien rawatan AADK di atas. Lapisan lain belum mempunyai ukuran tahunan yang sepadan.'
            : 'Nilai negeri di bawah ialah rekaan untuk meneroka peta; ia bukan pecahan angka AADK di atas.'}
        </p>
      </div>
      <ThreatMap zones={zones} shapes={shapes} filters={filters} full />
      <div className="map-safeguards">
        <p>
          <strong>Komposit nasional</strong>
          <span>Belum diluluskan. Warna menunjukkan nilai lapisan, bukan skor ancaman rasmi.</span>
        </p>
        <p>
          <strong>Peringkat daerah</strong>
          <span>Data, populasi dan sempadan daerah belum disahkan. Paparan negeri digunakan.</span>
        </p>
        <p>
          <strong>Jadual setara</strong>
          <span>Semua nilai yang boleh didedahkan tersedia melalui butang paparan jadual.</span>
        </p>
      </div>
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
