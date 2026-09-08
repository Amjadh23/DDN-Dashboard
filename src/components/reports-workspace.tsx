'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Panel } from './ui';
import { filterQuery, type Filters } from '@/lib/domain/filters';
import type { SavedReportDTO, ReportExportDTO } from '@/lib/server/reports';
import { FilterBar } from './filters';
import { dateBM } from '@/lib/domain/types';
import { stateNames } from '@/lib/domain/demo-identities';
export function ReportsWorkspace({
  saved,
  exports,
  filters,
}: {
  saved: SavedReportDTO[];
  exports: ReportExportDTO[];
  filters: Filters;
}) {
  const router = useRouter(),
    [title, setTitle] = useState(''),
    [message, setMessage] = useState(''),
    [pending, start] = useTransition();
  function send(url: string, data: unknown) {
    start(async () => {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setMessage('Rekod laporan tersedia.');
        router.refresh();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : 'Permintaan gagal.');
      }
    });
  }
  return (
    <div className="stack">
      <FilterBar filters={filters} />
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <Panel title="Simpan paparan semasa" kicker="SNAPSHOT PERIBADI">
        <div className="panel-body stack">
          <p>
            {dateBM(filters.period)} · {stateNames[filters.geography] ?? 'Seluruh Malaysia'} ·{' '}
            {
              {
                burden: 'Beban / permintaan',
                supply: 'Bekalan / penguatkuasaan',
                harm: 'Kemudaratan',
                gap: 'Jurang perkhidmatan',
                confidence: 'Keyakinan data',
              }[filters.layer]
            }
          </p>
          <label>
            Tajuk paparan
            <input
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Semakan keperluan negeri"
            />
          </label>
          <div className="button-row">
            <button
              className="button button-primary"
              disabled={pending || title.trim().length < 3}
              onClick={() => send('/api/v1/reports', { title, filters })}
            >
              Simpan snapshot
            </button>
            <Link className="button button-secondary" href={`/map?${filterQuery(filters)}`}>
              Semak penapis pada peta
            </Link>
          </div>
          <p className="chart-caveat">
            Eksport besar tidak tersedia dalam V1. Snapshot terhad kepada 14 petikan sumber dan 16
            negeri; data sumber dan DEMO / SYNTHETIC dipisahkan. Kebenaran disahkan semula pada
            setiap eksport dan muat turun.
          </p>
        </div>
      </Panel>
      <div className="grid-2">
        <Panel title="Paparan tersimpan" kicker="VERSI BEKU">
          <div className="panel-body stack report-history">
            {!saved.length && <p>Belum ada paparan tersimpan untuk profil ini.</p>}
            {saved.map((v) => (
              <article className="action-record" key={v.id}>
                <h3>{v.title}</h3>
                <p className="chart-caveat">
                  {v.classification} · {v.filters.period} · {v.filters.geography}
                </p>
                <details>
                  <summary>Versi & sumber</summary>
                  <p className="id-cell">
                    Penerbitan: {v.publications.join(', ')}
                    <br />
                    Definisi: {v.definitions.join(', ')}
                    <br />
                    Sempadan: {v.boundaries.join(', ')}
                    <br />
                    Dijana: {v.generatedAt}
                  </p>
                </details>
                <div className="button-row">
                  {(['csv', 'xlsx'] as const).map((format) => (
                    <button
                      key={format}
                      disabled={pending}
                      className="button button-secondary"
                      onClick={() => send(`/api/v1/reports/${v.id}/exports`, { format })}
                    >
                      Eksport {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Panel>
        <Panel title="Fail eksport" kicker="PAUTAN PERIBADI · 15 MINIT">
          <div className="panel-body stack report-history">
            {!exports.length && <p>Jana eksport daripada paparan tersimpan.</p>}
            {exports.map((v) => (
              <article key={v.id} className="action-record">
                <h3>
                  {v.format.toUpperCase()} · {v.classification}
                </h3>
                <p className="chart-caveat">Tamat: {v.expiresAt}</p>
                <a className="button button-secondary" href={v.downloadUrl}>
                  Muat turun {v.format.toUpperCase()}
                </a>
              </article>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
