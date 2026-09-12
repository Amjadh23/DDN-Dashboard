import Link from 'next/link';
import { ArrowUpRight, Database, FileText, FlaskConical, ShieldCheck } from 'lucide-react';
import { Badge, DemoBadge, PageHeading, Panel } from '@/components/ui';
import type { MetricDefinition, Origin } from '@/lib/domain/types';
import { getSession } from '@/lib/server/auth';
import { getRegistry } from '@/lib/server/dal';
import { displayLabel } from '@/lib/domain/display';
import { Disclosure } from '@/components/disclosure';

interface CatalogueDataset {
  id: Origin;
  title: string;
  evidence: string;
  definitions: MetricDefinition[];
  source: string;
  lineage: string;
  fields: string;
  publication: string;
}

function unique(values: string[]) {
  return [...new Set(values)];
}

function dataset(origin: Origin, definitions: MetricDefinition[]): CatalogueDataset {
  const supplied = origin === 'supplied';
  return {
    id: origin,
    title: supplied ? 'Petikan Statistik Mingguan AADK' : 'Senario analisis demonstrasi',
    evidence: supplied ? 'Available' : 'Proposed',
    definitions,
    source: unique(definitions.map((definition) => definition.source)).join(' · '),
    lineage: supplied
      ? 'Laporan PDF dibekalkan → semakan visual sumber → pemerhatian agregat dibekalkan → indikator diterbitkan.'
      : 'Penjana agregat demonstrasi v1 → dataset demo berasingan → pemerhatian demo → paparan berlabel.',
    fields:
      'Kod indikator, nama, unit, tempoh, geografi, nilai/keadaan, versi definisi, sumber, pemilik dan metadata kualiti.',
    publication: supplied
      ? 'Petikan agregat yang disokong sumber; sebarang semakan mesti mengekalkan versi terdahulu.'
      : 'Dataset ini tidak boleh diterbitkan sebagai data rasmi.',
  };
}

export default async function DataCatalogue() {
  const session = await getSession();
  const registry = await getRegistry(session);
  const datasets = (['supplied', 'synthetic'] as const)
    .map((origin) =>
      dataset(
        origin,
        registry.filter((definition) => definition.origin === origin),
      ),
    )
    .filter((entry) => entry.definitions.length > 0);

  return (
    <div className="page-content">
      <PageHeading
        eyebrow="KETELUSAN & JEJAK DATA"
        title="Katalog data"
        description="Sumber, pemilik, kesegaran, medan dan jejak untuk dataset agregat dalam skop akses."
      >
        <Link href="/indicators" className="button button-secondary">
          Buka daftar indikator <ArrowUpRight size={15} />
        </Link>
      </PageHeading>

      <div className="muted-note">
        <ShieldCheck size={14} /> Tiada baris operasi atau nilai terhad dipaparkan. Katalog ini
        hanya menerangkan metadata agregat yang telah dibentuk untuk skop sesi semasa.
      </div>

      <div className="grid-2 section-space">
        {datasets.map((entry) => {
          const isDemo = entry.id === 'synthetic';
          const owners = unique(entry.definitions.map((definition) => definition.owner));
          const freshness = unique(entry.definitions.map((definition) => definition.freshness));
          const teras = unique(
            entry.definitions.map((definition) => String(definition.teras)),
          ).join(', ');
          return (
            <Panel
              key={entry.id}
              title={entry.title}
              kicker={isDemo ? 'DATASET REKAAN BERASINGAN' : 'SUMBER DIBEKALKAN'}
              action={
                <>
                  {isDemo && <DemoBadge />}
                  <Badge tone={isDemo ? 'demo' : 'source'}>{entry.evidence}</Badge>
                </>
              }
            >
              <div className="panel-body stack">
                <div>
                  {isDemo ? <FlaskConical size={20} /> : <FileText size={20} />}
                  <p>{entry.publication}</p>
                </div>
                <Disclosure
                  title="Pemilik, kesegaran & jejak data"
                  meta={`${entry.definitions.length} indikator · Teras ${teras}`}
                >
                  <div className="table-scroll registry-definition">
                    <table>
                      <tbody>
                        <tr>
                          <th scope="row">Pemilik</th>
                          <td>{owners.join(' · ')}</td>
                        </tr>
                        <tr>
                          <th scope="row">Status pemilik</th>
                          <td>
                            {unique(entry.definitions.map((d) => displayLabel(d.ownerStatus))).join(
                              ' · ',
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Kesegaran</th>
                          <td>{freshness.join(' · ')}</td>
                        </tr>
                        <tr>
                          <th scope="row">Sumber</th>
                          <td>{entry.source}</td>
                        </tr>
                        <tr>
                          <th scope="row">Medan metadata</th>
                          <td>{entry.fields}</td>
                        </tr>
                        <tr>
                          <th scope="row">Jejak data</th>
                          <td>{entry.lineage}</td>
                        </tr>
                        <tr>
                          <th scope="row">Liputan daftar</th>
                          <td>
                            {entry.definitions.length} indikator · Teras {teras}
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Kod indikator</th>
                          <td>
                            {entry.definitions.map((definition) => definition.code).join(', ')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </Disclosure>
                <Link
                  className="text-link"
                  href={
                    isDemo
                      ? '/indicators?q=DEMO%20%2F%20SYNTHETIC'
                      : '/indicators?q=Statistik%20Mingguan%20AADK'
                  }
                >
                  Lihat definisi dataset <ArrowUpRight size={14} />
                </Link>
              </div>
            </Panel>
          );
        })}
      </div>

      <Panel
        title="Hubungan katalog"
        kicker="DARI SUMBER KEPADA PENERBITAN"
        className="section-space"
      >
        <div className="panel-body grid-2">
          <div>
            <Database size={19} />
            <h3>Definisi dan versi</h3>
            <p>
              Daftar indikator menerangkan formula, unit, kualiti, penyekatan, caveat dan tarikh
              kuat kuasa setiap definisi.
            </p>
            <Link href="/indicators" className="text-link">
              Buka daftar indikator <ArrowUpRight size={14} />
            </Link>
          </div>
          <div>
            <FileText size={19} />
            <h3>Penyerahan dan semakan</h3>
            <p>
              Hab data menyimpan aliran templat, pengesahan, perakuan, kelulusan bebas dan revisi.
            </p>
            <Link href="/data/uploads" className="text-link">
              Buka hab data <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </Panel>
    </div>
  );
}
