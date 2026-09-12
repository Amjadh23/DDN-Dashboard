import { formatNumber, dateBM } from '@/lib/domain/types';
import { DemoBadge, SourceNote } from './ui';
import { disclose } from '@/lib/domain/semantics';
export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}
function needsDisclosure(data: ChartDatum[], unit: string) {
  return !/%|skor|hari|RM/.test(unit) && data.some((d) => d.value > 0 && d.value < 5);
}
function DisclosedChart({
  data,
  unit,
  caption,
}: {
  data: ChartDatum[];
  unit: string;
  caption: string;
}) {
  const values = disclose(
    data.map((d) => d.value),
    5,
  );
  return (
    <div className="chart">
      <p className="chart-caveat">
        DEMO / SYNTHETIC · Sel kecil dan sel pelengkap disekat. Graf tidak dilukis supaya nilai
        tidak boleh dibina semula.
      </p>
      <table>
        <caption>{caption} · DEMO / SYNTHETIC</caption>
        <thead>
          <tr>
            <th>Kategori</th>
            <th>{unit}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={d.label}>
              <th>{d.label}</th>
              <td>{values[i] === null ? 'Disekat' : formatNumber(values[i], 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ChartDetails({
  data,
  unit,
  caption,
}: {
  data: ChartDatum[];
  unit: string;
  caption: string;
}) {
  return (
    <details className="chart-details">
      <summary>Jadual & takrif paparan</summary>
      <p>
        {caption} · DEMO / SYNTHETIC · {unit}. Versi senario v1; sasaran dan pemilik rasmi belum
        disahkan. Nilai dihasilkan untuk menunjukkan bentuk analisis sahaja.
      </p>
      <table>
        <caption className="sr-only">{caption} · DEMO / SYNTHETIC</caption>
        <thead>
          <tr>
            <th>Kategori</th>
            <th>Nilai ({unit})</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th>{d.label}</th>
              <td>{formatNumber(d.value, 1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
export function Bars({
  data,
  unit = 'rekod',
  caption,
  horizontal = true,
}: {
  data: ChartDatum[];
  unit?: string;
  caption: string;
  horizontal?: boolean;
}) {
  if (needsDisclosure(data, unit))
    return <DisclosedChart data={data} unit={unit} caption={caption} />;
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="chart">
      <div
        className={horizontal ? 'horizontal-bars' : 'vertical-bars'}
        role="img"
        aria-label={`${caption}. DEMO / SYNTHETIC. ${data.map((d) => `${d.label}: ${formatNumber(d.value)} ${unit}`).join('; ')}`}
      >
        {data.map((d, i) => (
          <div className="bar-row" key={d.label}>
            <span className="bar-label">{d.label}</span>
            <div className="bar-track">
              <span
                style={{
                  [horizontal ? 'width' : 'height']: `${(d.value / max) * 100}%`,
                  background: d.color ?? `var(--chart-accent, #7fbfb4)`,
                  opacity: 1 - i * 0.055,
                }}
              />
            </div>
            <strong>
              {formatNumber(d.value, 1)}
              <small>{unit === '%' ? '%' : ''}</small>
            </strong>
          </div>
        ))}
      </div>
      <ChartDetails data={data} unit={unit} caption={caption} />
    </div>
  );
}
export function LineChart({
  data,
  unit = 'rekod',
  caption,
}: {
  data: ChartDatum[];
  unit?: string;
  caption: string;
}) {
  if (needsDisclosure(data, unit))
    return <DisclosedChart data={data} unit={unit} caption={caption} />;
  const max = Math.max(1, ...data.map((d) => d.value)) * 1.18;
  const points = data.map((d, i) => [
    40 + i * (490 / (data.length - 1 || 1)),
    170 - (d.value / max) * 140,
  ]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  return (
    <div className="chart">
      <svg
        className="line-chart"
        viewBox="0 0 560 210"
        role="img"
        aria-label={`${caption}. DEMO / SYNTHETIC; ${unit}.`}
      >
        <defs>
          <linearGradient id={`area-${caption.replaceAll(' ', '-')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-accent, #7fbfb4)" stopOpacity=".18" />
            <stop offset="100%" stopColor="var(--chart-accent, #7fbfb4)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((n) => (
          <g key={n}>
            <line
              x1="40"
              x2="533"
              y1={170 - n * 140}
              y2={170 - n * 140}
              stroke="#2b4050"
              strokeDasharray="3 6"
            />
            <text x="29" y={173 - n * 140} textAnchor="end">
              {formatNumber(n * max)}
            </text>
          </g>
        ))}
        <path d={`${line} L530,170 L40,170Z`} fill={`url(#area-${caption.replaceAll(' ', '-')})`} />
        <path
          d={line}
          fill="none"
          stroke="var(--chart-accent, #7fbfb4)"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {points.map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r="3.5"
              fill="#142632"
              stroke="var(--chart-accent, #7fbfb4)"
              strokeWidth="1.5"
            />
            <text x={x} y="194" textAnchor="middle">
              {data[i].label}
            </text>
          </g>
        ))}
      </svg>
      <ChartDetails data={data} unit={unit} caption={caption} />
    </div>
  );
}
export function Funnel({
  data,
  caption,
  unit = 'rekod',
  note,
}: {
  data: ChartDatum[];
  caption: string;
  unit?: string;
  note?: string;
}) {
  if (needsDisclosure(data, unit))
    return <DisclosedChart data={data} unit={unit} caption={caption} />;
  return (
    <div className="chart">
      <div
        className="funnel"
        role="img"
        aria-label={`${caption}. DEMO / SYNTHETIC. ${data.map((d) => `${d.label} ${d.value}`).join('; ')}`}
      >
        {data.map((d, i) => (
          <div className="funnel-stage" key={d.label}>
            <span className="stage-index">0{i + 1}</span>
            <div>
              <span>{d.label}</span>
              <div
                className="funnel-bar"
                style={{
                  width: `${Math.max(6, (d.value / data[0].value) * 100)}%`,
                  opacity: 1 - i * 0.09,
                }}
              />
            </div>
            <strong>
              {formatNumber(d.value)}
              <small>{unit}</small>
            </strong>
          </div>
        ))}
      </div>
      {note && <p className="chart-caveat">{note}</p>}
      <ChartDetails data={data} unit={unit} caption={caption} />
    </div>
  );
}
export function Matrix({
  rows,
  columns,
  values,
  caption,
  unit = 'aktiviti',
}: {
  rows: string[];
  columns: string[];
  values: number[][];
  caption: string;
  unit?: string;
}) {
  const isMeasure = /%|skor|hari|RM/.test(unit);
  const safe = isMeasure ? values : values.map((row) => disclose(row, 5));
  const max = Math.max(1, ...safe.flat().map((value) => value ?? 0));
  return (
    <div
      className="matrix-wrap"
      role="region"
      aria-label={`${caption} · DEMO / SYNTHETIC`}
      tabIndex={0}
    >
      <table className="matrix">
        <caption>{caption} · DEMO / SYNTHETIC</caption>
        <thead>
          <tr>
            <th>Skop</th>
            {columns.map((c) => (
              <th key={c}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r}>
              <th>{r}</th>
              {columns.map((c, j) => (
                <td key={c}>
                  <span
                    style={{
                      background: `color-mix(in srgb, var(--chart-accent, #7fbfb4) ${12 + ((safe[i][j] ?? 0) / max) * 25}%, #112331)`,
                    }}
                  >
                    {safe[i][j] === null ? 'Disekat' : safe[i][j]}
                    <span className="sr-only"> {unit}</span>
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="chart-caveat">
        Warna menunjukkan intensiti nilai sahaja; bukan tahap ancaman atau prestasi diluluskan.
        Unit: {unit}.
      </p>
    </div>
  );
}
export function DemoMetric({
  label,
  value,
  unit,
  code,
  description,
  period = '2026-08-09',
  scope = 'Senario kebangsaan',
}: {
  label: string;
  value: number | null;
  unit: string;
  code: string;
  description: string;
  period?: string;
  scope?: string;
}) {
  return (
    <article className="metric-card demo-metric">
      <div className="metric-top">
        <span>{label}</span>
        <DemoBadge />
      </div>
      <div className="metric-number">
        {value !== null && needsDisclosure([{ label, value }], unit)
          ? 'Disekat'
          : formatNumber(value, 1)}
        <span>{unit}</span>
      </div>
      {value === null && <p>{description}</p>}
      <details className="metric-details">
        <summary>Takrif & konteks</summary>
        <p>
          {code} · Cadangan · versi demo v1 · {scope} · petikan senario {dateBM(period)} · dikemas
          kini 7 September 2026. Sumber: penjana senario rekaan; pemilik: Pasukan Demo A (perlu
          pengesahan pihak berkepentingan). Keyakinan rasmi dan sasaran belum disahkan. Nilai contoh
          ini bukan statistik rasmi.
        </p>
        <p>{description}</p>
        <p>
          Perbandingan: tiada perubahan KPI dipaparkan; kadar dan median contoh tidak ditafsir
          sebagai kiraan. Denominator serta formula khusus dinyatakan dalam huraian. Data tetap
          untuk validasi reka bentuk sahaja.
        </p>
      </details>
    </article>
  );
}
export function DemoSource({ children }: { children?: React.ReactNode }) {
  return (
    <SourceNote demo>
      {children ??
        'Cadangan · Tempoh dan skop mengikut penapis. Pemilik, definisi operasi dan sasaran rasmi perlu pengesahan.'}
    </SourceNote>
  );
}
