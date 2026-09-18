import Link from 'next/link';
import { ArrowUpRight, Info, CalendarDays, FileText } from 'lucide-react';
import { dateBM, DEMO_LABEL, formatNumber, type MetricDTO } from '@/lib/domain/types';
import { displayLabel } from '@/lib/domain/display';

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {typeof children === 'string' ? displayLabel(children) : children}
    </span>
  );
}
export function DemoBadge() {
  return <Badge tone="demo">{DEMO_LABEL}</Badge>;
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
  // A heading embedded in another page is a section of it, not a second page title.
  level = 1,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  level?: 1 | 2;
}) {
  const Title = level === 1 ? 'h1' : 'h2';
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span />
          {eyebrow}
        </div>
        <Title>{title}</Title>
        <p>{description}</p>
      </div>
      <div className="page-heading-actions">{children}</div>
    </div>
  );
}
export function Panel({
  title,
  kicker,
  children,
  className = '',
  action,
  demo = false,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  demo?: boolean;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          {kicker && <div className="eyebrow small">{kicker}</div>}
          <h2>{title}</h2>
        </div>
        <div className="panel-actions">
          {demo && <DemoBadge />}
          {action}
        </div>
      </div>
      {children}
    </section>
  );
}
export function MetricCard({
  metric,
  label,
  emptyCode,
}: {
  metric?: MetricDTO;
  label?: string;
  emptyCode?: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span>{label ?? metric?.definition.name}</span>
        <Link
          href={`/indicators#${metric?.definition.code ?? emptyCode}`}
          aria-label={`Definisi ${label ?? metric?.definition.name}`}
          className="subtle-icon"
        >
          <Info size={15} />
        </Link>
      </div>
      <div className="metric-number">
        {formatNumber(metric?.value ?? null)}
        <span>{metric?.definition.unit ?? '—'}</span>
      </div>
      <div className="metric-comparison">
        <span className="flat-line">—</span>
        <span>{metric ? 'Perbandingan belum tersedia' : 'Tiada nilai untuk penapis ini'}</span>
      </div>
      <div className="metric-footer">
        <Badge tone="source">{metric?.definition.evidence ?? 'Validation required'}</Badge>
        <span>{metric ? dateBM(metric.period) : 'Skop dipilih'}</span>
      </div>
      <details className="metric-details">
        <summary>
          Definisi & sumber <ArrowUpRight size={11} />
        </summary>
        {metric ? (
          <div>
            <p>
              {metric.definition.source}, hlm. {metric.definition.sourcePage}.
            </p>
            <p>
              <b>Keyakinan:</b> {metric.confidence}
            </p>
            <p>
              <b>Sasaran:</b> Belum diluluskan.
            </p>
            <p>
              <b>Dikemas kini:</b> {dateBM(metric.refreshed)}
            </p>
            <p>
              {metric.definition.owner} · {displayLabel(metric.definition.ownerStatus)}
            </p>
            <Link href={`/indicators#${metric.definition.code}`}>Buka definisi penuh</Link>
          </div>
        ) : (
          <p>Petikan dibekalkan hanya tersedia bagi 9 Ogos 2026 pada peringkat kebangsaan.</p>
        )}
      </details>
    </article>
  );
}
export function SourceNote({
  children,
  demo = false,
}: {
  children?: React.ReactNode;
  demo?: boolean;
}) {
  return (
    <div className="source-note">
      <FileText size={13} />
      <span>
        {demo && (
          <>
            <b>{DEMO_LABEL}</b> ·{' '}
          </>
        )}
        {children ??
          'Sumber: Statistik Mingguan AADK, 9 Ogos 2026 · halaman 2. Nilai petikan dibekalkan; bukan suapan langsung.'}
      </span>
    </div>
  );
}
export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <Info size={24} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function SnapshotChip() {
  return (
    <span className="snapshot-chip">
      <CalendarDays size={15} />
      Petikan 9 Ogos 2026
    </span>
  );
}
