import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import { EmptyState, Badge, DemoBadge, PageHeading, Panel } from '@/components/ui';
import { dateBM, type MetricDefinition } from '@/lib/domain/types';
import { getSession } from '@/lib/server/auth';
import { getRegistry } from '@/lib/server/dal';

type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function matches(definition: MetricDefinition, query: string) {
  if (!query) return true;
  return [
    definition.code,
    definition.name,
    definition.nameEn,
    definition.purpose,
    definition.evidence,
    definition.source,
    definition.owner,
  ]
    .join(' ')
    .toLocaleLowerCase('ms-MY')
    .includes(query);
}

function evidenceTone(definition: MetricDefinition) {
  if (definition.origin === 'synthetic') return 'demo';
  if (definition.evidence === 'Available') return 'source';
  return 'warning';
}

export default async function IndicatorRegistry({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const query = (first(params.q) ?? '').trim().toLocaleLowerCase('ms-MY');
  const requestedTeras = first(params.teras) ?? '';
  const teras = /^[1-5]$/.test(requestedTeras) ? Number(requestedTeras) : null;
  const session = await getSession();
  const registry = await getRegistry(session);
  const definitions = registry.filter(
    (definition) => (!teras || definition.teras === teras) && matches(definition, query),
  );

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="TADBIR URUS INDIKATOR"
        title="Daftar indikator"
        description="Takrif, sumber, pemilik, kualiti dan versi yang menerangkan setiap ukuran."
      >
        <Link href="/data/catalog" className="button button-secondary">
          Katalog data <ArrowUpRight size={15} />
        </Link>
      </PageHeading>

      <Panel title="Cari definisi" kicker="PENAPIS PELAYAN">
        <form
          action="/indicators"
          method="get"
          role="search"
          aria-label="Tapis daftar indikator"
          className="panel-body form-grid"
        >
          <label>
            Cari indikator
            <input
              name="q"
              defaultValue={first(params.q) ?? ''}
              placeholder="Kod, nama atau sumber"
            />
          </label>
          <label>
            Teras
            <select name="teras" defaultValue={requestedTeras}>
              <option value="">Semua teras</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  Teras {value}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions full-width">
            <Link href="/indicators" className="button button-secondary">
              Set semula
            </Link>
            <button type="submit" className="button button-primary">
              <Search size={14} /> Tapis
            </button>
          </div>
        </form>
      </Panel>

      <Panel
        title="Keyakinan data diasingkan daripada risiko"
        kicker="KAEDAH BELUM DIMUKTAMADKAN"
        className="section-space"
        action={<Badge tone="warning">Validation required</Badge>}
      >
        <div className="panel-body stack">
          <p>
            Keyakinan perlu menilai kelengkapan, ketepatan masa, kesahan, liputan geografi, kualiti
            denominator dan status penerbitan. Ia tidak mengubah tahap ancaman atau risiko.
          </p>
          <div className="muted-note">
            <strong>Formula dan wajaran keyakinan belum diluluskan</strong> · tiada versi kaedah
            diterbitkan. Indikator demo D-CONFIDENCE hanya menunjukkan kelengkapan medan rekaan.
          </div>
        </div>
      </Panel>

      <div className="section-mini-heading">
        <span>DEFINISI DALAM SKOP AKSES</span>
        <span>{definitions.length} hasil</span>
      </div>

      {definitions.length ? (
        <div className="stack">
          {definitions.map((definition) => (
            <div id={definition.code} key={definition.code}>
              <Panel
                title={`${definition.code} · ${definition.name}`}
                kicker={`TERAS ${definition.teras}`}
                action={
                  <>
                    {definition.origin === 'synthetic' && <DemoBadge />}
                    <Badge tone={evidenceTone(definition)}>{definition.evidence}</Badge>
                  </>
                }
              >
                <div className="panel-body stack">
                  <p>
                    {definition.purpose} <span lang="en">{definition.nameEn}</span>
                  </p>
                  <details className="registry-definition" open={definitions.length === 1}>
                    <summary>Formula, pemilik & definisi lengkap · {definition.version}</summary>
                    <div className="table-scroll">
                      <table>
                        <tbody>
                          <tr>
                            <th scope="row">Numerator</th>
                            <td>{definition.numerator}</td>
                          </tr>
                          <tr>
                            <th scope="row">Denominator</th>
                            <td>{definition.denominator}</td>
                          </tr>
                          <tr>
                            <th scope="row">Formula</th>
                            <td>{definition.formula}</td>
                          </tr>
                          <tr>
                            <th scope="row">Unit</th>
                            <td>{definition.unit}</td>
                          </tr>
                          <tr>
                            <th scope="row">Arah tafsiran</th>
                            <td>{definition.direction}</td>
                          </tr>
                          <tr>
                            <th scope="row">Dimensi</th>
                            <td>{definition.dimensions.join(' · ')}</td>
                          </tr>
                          <tr>
                            <th scope="row">Kekerapan</th>
                            <td>{definition.cadence}</td>
                          </tr>
                          <tr>
                            <th scope="row">Jangkaan kesegaran</th>
                            <td>{definition.freshness}</td>
                          </tr>
                          <tr>
                            <th scope="row">Sumber</th>
                            <td>
                              {definition.source}
                              {definition.sourcePage ? ` · halaman ${definition.sourcePage}` : ''}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Pemilik</th>
                            <td>
                              {definition.owner} · {definition.ownerStatus}
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">Peraturan kualiti</th>
                            <td>{definition.qualityRules}</td>
                          </tr>
                          <tr>
                            <th scope="row">Status sasaran</th>
                            <td>{definition.target}</td>
                          </tr>
                          <tr>
                            <th scope="row">Peraturan penyekatan</th>
                            <td>{definition.suppression}</td>
                          </tr>
                          <tr>
                            <th scope="row">Tafsiran & batasan</th>
                            <td>{definition.interpretation}</td>
                          </tr>
                          <tr>
                            <th scope="row">Versi definisi</th>
                            <td>
                              {definition.version} · berkuat kuasa{' '}
                              {dateBM(definition.effectiveFrom)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </details>
                </div>
              </Panel>
            </div>
          ))}
        </div>
      ) : (
        <Panel title="Tiada definisi sepadan" className="section-space">
          <EmptyState
            title="Tiada hasil"
            description="Ubah carian atau pilih teras lain. Penapis hanya mencari metadata dalam skop akses anda."
          />
        </Panel>
      )}
    </div>
  );
}
