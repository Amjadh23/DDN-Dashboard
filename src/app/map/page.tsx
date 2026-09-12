import type { Metadata } from 'next';
import { getSession } from '@/lib/server/auth';
import { getMapZones } from '@/lib/server/dal';
import { getStateShapes } from '@/lib/server/geometry';
import { parseFilters } from '@/lib/domain/filters';
import { PageHeading, DemoBadge } from '@/components/ui';
import { FilterBar } from '@/components/filters';
import { ThreatMap } from '@/components/threat-map';
export const metadata: Metadata = { title: 'Peta strategik' };
export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseFilters(await searchParams),
    session = await getSession();
  const [zones, shapes] = await Promise.all([getMapZones(session, filters), getStateShapes()]);
  return (
    <div className="page-content map-page">
      <PageHeading
        eyebrow="RUANG ANALISIS GEOGRAFI"
        title="Peta strategik Malaysia"
        description="Lihat beban, bekalan, kemudaratan, jurang perkhidmatan dan keyakinan secara berasingan."
      >
        <DemoBadge />
      </PageHeading>
      <FilterBar filters={filters} />
      <ThreatMap zones={zones} shapes={shapes} filters={filters} full />
      <div className="map-safeguards">
        <p>
          <strong>Komposit nasional</strong>
          <span>Belum diluluskan. Warna menunjukkan nilai lapisan, bukan skor ancaman rasmi.</span>
        </p>
        <p>
          <strong>Peringkat daerah</strong>
          <span>
            Data belum tersedia / belum disahkan. Paparan negeri digunakan sehingga data, populasi
            dan sempadan daerah sah tersedia.
          </span>
        </p>
        <p>
          <strong>Jadual setara</strong>
          <span>Semua nilai yang boleh didedahkan tersedia melalui butang paparan jadual.</span>
        </p>
      </div>
    </div>
  );
}
