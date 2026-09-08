import { allowed, type Session } from '@/lib/domain/policy';
import { dateBM, formatNumber } from '@/lib/domain/types';
import {
  getSourceSnapshot,
  type SourcePurpose,
  type SourceSetting,
  type SourceTableDTO,
} from '@/lib/server/source-snapshot';
import { Badge, EmptyState, Panel, SourceNote } from './ui';

export interface SourceEvidenceProps {
  session: Session;
  purpose: SourcePurpose;
  geography?: string;
  setting?: SourceSetting;
}

const purposeTitles: Record<SourcePurpose, string> = {
  1: 'Konteks beban daripada sumber dibekalkan',
  2: 'Bukti rawatan dan pemulihan dibekalkan',
  3: 'Bukti aduan dan tangkapan OYDS dibekalkan',
};

const unitLabels: Record<string, string> = {
  clients: 'klien',
  facilities: 'fasiliti',
  districts: 'daerah',
  complaints: 'aduan',
  source_count: 'kiraan sumber',
};

function EvidenceTable({ table }: { table: SourceTableDTO }) {
  return (
    <details className="metric-details">
      <summary>
        {table.label} · hlm. {table.sourcePage}
      </summary>
      <div className="table-scroll">
        <table>
          <caption className="sr-only">
            {table.label}. Sumber halaman {table.sourcePage}.
          </caption>
          <thead>
            <tr>
              <th scope="col">Geografi / kategori sumber</th>
              {table.columns.map((column) => (
                <th scope="col" key={column.key}>
                  {column.label}
                </th>
              ))}
              <th scope="col">Halaman</th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={`${table.key}-${row.label}`}>
                <th scope="row">
                  {row.label}
                  {row.note && <span className="sr-only">. {row.note}</span>}
                </th>
                {table.columns.map((column) => {
                  const value = row.values[column.key];
                  return (
                    <td key={column.key}>
                      {value === null
                        ? row.status === 'unresolved'
                          ? 'Belum dinyatakan'
                          : 'Tidak berkenaan'
                        : formatNumber(value)}
                    </td>
                  );
                })}
                <td>{row.sourcePage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.rows.length === 0 && (
        <p className="muted-note">Tiada pecahan yang sah untuk geografi dan tetapan ini.</p>
      )}
      {table.caveat && <p className="muted-note">{table.caveat}</p>}
    </details>
  );
}

export function SourceEvidence({
  session,
  purpose,
  geography = 'MY',
  setting,
}: SourceEvidenceProps) {
  const canView = allowed(session, 'view', {
    organisation: 'shared',
    geography: 'MY',
    teras: purpose,
    sensitivity: 'public-aggregate',
    state: 'published',
  });
  if (!canView) {
    return (
      <Panel
        className="source-evidence"
        title={purposeTitles[purpose]}
        kicker="Sumber dibekalkan"
        action={<Badge tone="source">Akses terkawal</Badge>}
      >
        <div className="panel-body">
          <EmptyState
            title="Bukti sumber tidak dapat dipaparkan"
            description="Peranan atau skop sesi ini tidak membenarkan paparan agregat awam yang telah diterbitkan."
          />
        </div>
      </Panel>
    );
  }
  const snapshot = getSourceSnapshot(session, { purpose, geography, setting });
  const hasEvidence =
    snapshot.summary.length > 0 ||
    snapshot.dimensions.length > 0 ||
    snapshot.tables.some((table) => table.rows.length > 0);

  return (
    <Panel
      className="source-evidence"
      title={purposeTitles[purpose]}
      kicker={`${snapshot.setting ?? 'AADK'} · ${dateBM(snapshot.period)}`}
      action={<Badge tone="source">{snapshot.evidence}</Badge>}
    >
      <div className="panel-body stack">
        {snapshot.summary.length > 0 && (
          <div className="grid-3">
            {snapshot.summary.map((item) => (
              <article className="metric-card" key={`${item.sourcePage}-${item.label}`}>
                <div className="metric-top">
                  <span>{item.label}</span>
                  <Badge tone="source">hlm. {item.sourcePage}</Badge>
                </div>
                <div className="metric-number">
                  {formatNumber(item.value)}
                  <span>{unitLabels[item.unit] ?? item.unit}</span>
                </div>
                {item.semanticNote && <p className="muted-note">{item.semanticNote}</p>}
              </article>
            ))}
          </div>
        )}

        {snapshot.dimensions.length > 0 && (
          <div className="grid-2">
            {snapshot.dimensions.map((dimension) => (
              <details className="metric-details" key={dimension.key}>
                <summary>
                  {dimension.label} · hlm. {dimension.sourcePage}
                </summary>
                <div className="table-scroll">
                  <table>
                    <caption className="sr-only">
                      {dimension.label}. Sumber halaman {dimension.sourcePage}.
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Kategori sumber</th>
                        <th scope="col">Bilangan klien</th>
                        <th scope="col">Halaman</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dimension.values.map((item) => (
                        <tr key={`${dimension.key}-${item.label}`}>
                          <th scope="row">
                            {item.label}
                            {item.semanticNote && (
                              <span className="sr-only">. {item.semanticNote}</span>
                            )}
                          </th>
                          <td>{formatNumber(item.value)}</td>
                          <td>{item.sourcePage}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
        )}

        {snapshot.tables.map((table) => (
          <EvidenceTable table={table} key={table.key} />
        ))}

        {!hasEvidence && (
          <EmptyState
            title="Pecahan sumber tidak tersedia"
            description="Petikan dibekalkan tidak mempunyai nilai yang boleh dipaparkan bagi geografi dan tetapan ini."
          />
        )}

        <div className="muted-note">
          {snapshot.caveats.map((caveat) => (
            <p key={caveat}>{caveat}</p>
          ))}
        </div>

        <SourceNote>
          Sumber: {snapshot.sourceTitle} · hlm. {snapshot.sourcePages.join(', ') || 'tiada pecahan'}{' '}
          · status {snapshot.publicationState} · klasifikasi {snapshot.sensitivity}. SHA-256{' '}
          {snapshot.sourceHash}.
        </SourceNote>
      </div>
    </Panel>
  );
}
