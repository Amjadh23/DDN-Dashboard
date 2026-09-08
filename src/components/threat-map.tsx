'use client';
import Link from 'next/link';
import { useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Map,
  Table2,
  Plus,
  Minus,
  Maximize2,
  ArrowUpRight,
  ArrowUp,
  Info,
  Search,
  Layers3,
  LocateFixed,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Badge, DemoBadge } from './ui';
import type { StateShape } from '@/lib/server/geometry';
import { formatNumber, dateBM, type MapZoneDTO, type Layer } from '@/lib/domain/types';
import { filterQuery, type Filters } from '@/lib/domain/filters';

export const layerLabels: Record<Layer, string> = {
  burden: 'Beban / permintaan',
  supply: 'Bekalan / penguatkuasaan',
  harm: 'Kemudaratan',
  gap: 'Jurang perkhidmatan',
  confidence: 'Keyakinan data',
};
const stateLabels = {
  value: 'Nilai tersedia',
  unknown: 'Tidak diketahui',
  'not-collected': 'Tidak dikumpul',
  'not-applicable': 'Tidak berkenaan',
  suppressed: 'Disekat',
};
export function ThreatMap({
  zones,
  shapes,
  filters,
  full = false,
  variant = 'standard',
}: {
  zones: MapZoneDTO[];
  shapes: StateShape[];
  filters: Filters;
  full?: boolean;
  variant?: 'standard' | 'overview';
}) {
  const overview = variant === 'overview';
  const [pending, startTransition] = useTransition();
  const params = useSearchParams(),
    path = usePathname(),
    router = useRouter();
  const initial =
    params.get('state') ??
    (zones.some((z) => z.id === 'MY-03') ? 'MY-03' : (zones[0]?.id ?? 'MY-03'));
  const [selected, setSelected] = useState(initial),
    [tab, setTab] = useState<'map' | 'table'>('map'),
    [zoom, setZoom] = useState(1),
    [method, setMethod] = useState(false),
    [query, setQuery] = useState('');
  const sorted = [...zones].sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));
  const active = overview
    ? filters.geography !== 'MY'
      ? filters.geography
      : (params.get('state') ?? selected)
    : selected;
  const zone = zones.find((z) => z.id === active),
    shape = shapes.find((s) => s.id === active);
  const fullMapHref = `/map?${filterQuery(filters)}&state=${active}`;
  const max = Math.max(1, ...zones.map((z) => z.rate ?? 0));
  const countMax = Math.max(1, ...zones.map((z) => z.count ?? 0));
  const rank =
    zone && zone.rate !== null
      ? sorted.filter((z) => z.rate !== null).findIndex((z) => z.id === selected) + 1
      : null;
  function select(id: string) {
    setSelected(id);
    const p = new URLSearchParams(params);
    p.set('state', id);
    if (overview && filters.geography !== 'MY') {
      p.set('geography', id);
      router.replace(`${path}?${p}`, { scroll: false });
      return;
    }
    window.history.replaceState(null, '', `${path}?${p.toString()}`);
  }
  function update(key: keyof Filters, value: string) {
    const p = new URLSearchParams(params);
    for (const [k, v] of Object.entries({ ...filters, [key]: value })) p.set(k, v);
    p.set('state', active);
    startTransition(() => router.replace(`${path}?${p}`, { scroll: false }));
  }
  function fill(z?: MapZoneDTO) {
    if (!z || z.state === 'unknown') return 'url(#unknown-pattern)';
    if (z.state === 'suppressed') return 'url(#suppressed-pattern)';
    if (z.state === 'not-collected') return 'url(#not-collected-pattern)';
    if (z.state === 'not-applicable') return '#27303a';
    if (z.count === 0) return '#122535';
    if (filters.mode === 'count') return '#172d3c';
    return `hsl(193 ${35 + ((z.rate ?? 0) / max) * 26}% ${19 + ((z.rate ?? 0) / max) * 23}%)`;
  }
  const unit = filters.layer === 'confidence' ? '% medan sah' : 'per 100,000 populasi demo';
  return (
    <section
      className={`panel threat-panel ${full ? 'full-map-panel' : ''} ${overview ? 'overview-map' : ''}`}
      aria-label="Peta strategik Malaysia"
    >
      <div className="panel-heading">
        <div>
          <div className="eyebrow small">PERSPEKTIF GEOGRAFI</div>
          <h2>
            Peta strategik Malaysia<span className="live-mark">16 negeri & W.P.</span>
          </h2>
        </div>
        <div className="panel-actions">
          <DemoBadge />
          {overview ? (
            <Link href={fullMapHref} className="overview-map-link">
              Buka Peta Strategik <ArrowUpRight size={15} />
            </Link>
          ) : (
            !full && (
              <Link
                href={`/map?${filterQuery(filters)}&state=${selected}`}
                className="icon-button"
                aria-label="Buka ruang peta penuh"
              >
                <Maximize2 size={16} />
              </Link>
            )
          )}
        </div>
      </div>
      <div className="map-controls">
        <div className="layer-select">
          <Layers3 size={15} />
          <label className="sr-only" htmlFor={`layer-${full}`}>
            Lapisan peta
          </label>
          <select
            id={`layer-${full}`}
            disabled={overview && pending}
            value={filters.layer}
            onChange={(e) => update('layer', e.target.value)}
          >
            {Object.entries(layerLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="segmented">
          <button
            className={filters.mode === 'rate' ? 'selected' : ''}
            disabled={overview && pending}
            aria-pressed={filters.mode === 'rate'}
            onClick={() => update('mode', 'rate')}
          >
            {filters.layer === 'confidence' ? 'Peratus' : 'Kadar'}
          </button>
          <button
            className={filters.mode === 'count' ? 'selected' : ''}
            disabled={overview && pending}
            aria-pressed={filters.mode === 'count'}
            onClick={() => update('mode', 'count')}
          >
            Bilangan
          </button>
        </div>
        <div className="segmented map-view-toggle">
          <button
            className={tab === 'map' ? 'selected' : ''}
            onClick={() => setTab('map')}
            aria-label="Paparan peta"
          >
            <Map size={15} />
          </button>
          <button
            className={tab === 'table' ? 'selected' : ''}
            onClick={() => setTab('table')}
            aria-label="Paparan jadual"
          >
            <Table2 size={15} />
          </button>
        </div>
      </div>
      <div className="map-workspace">
        <div className="map-main">
          <div className="map-meta">
            <span className="map-layer-caption">
              {layerLabels[filters.layer]} <span>/</span>{' '}
              {filters.mode === 'rate' ? unit : 'bilangan agregat demo'}
            </span>
            {!overview && (
              <button
                className="text-button"
                onClick={() => setMethod(!method)}
                aria-expanded={method}
              >
                <Info size={13} />
                Kaedah & batasan
              </button>
            )}
          </div>
          {tab === 'map' ? (
            <div className="map-canvas">
              {!overview && (
                <div className="map-search">
                  <Search size={14} />
                  <label className="sr-only" htmlFor="state-search">
                    Cari negeri
                  </label>
                  <input
                    id="state-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Cari negeri…"
                  />
                  {query && (
                    <div className="search-results">
                      {shapes
                        .filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
                        .map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              select(s.id);
                              setQuery('');
                            }}
                          >
                            {s.name}
                            <ChevronRight size={14} />
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}
              <svg
                viewBox="0 0 1100 445"
                className="malaysia-map"
                role="group"
                aria-label="Peta Malaysia mengikut negeri, data demonstrasi; setiap negeri boleh dipilih melalui papan kekunci"
              >
                <defs>
                  <pattern id="unknown-pattern" width="7" height="7" patternUnits="userSpaceOnUse">
                    <rect width="7" height="7" fill="#182331" />
                    <path d="M0,7L7,0" stroke="#304353" strokeWidth="0.6" />
                  </pattern>
                  <pattern
                    id="suppressed-pattern"
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="6" height="6" fill="#253340" />
                    <path d="M0,0L6,6M0,6L6,0" stroke="#536174" strokeWidth="0.7" />
                  </pattern>
                  <pattern
                    id="not-collected-pattern"
                    width="7"
                    height="7"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="7" height="7" fill="#172331" />
                    <circle cx="3" cy="3" r="1" fill="#718294" />
                  </pattern>
                  <pattern id="sea-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.7" fill="#324754" />
                  </pattern>
                </defs>
                <rect width="1100" height="445" fill="url(#sea-grid)" opacity=".32" />
                <text x="485" y="180" className="ocean-label" textAnchor="middle">
                  LAUT CHINA SELATAN
                </text>
                <g
                  transform={`translate(${(1 - zoom) * (shape?.cx ?? 550)} ${(1 - zoom) * (shape?.cy ?? 220)}) scale(${zoom})`}
                >
                  {shapes.map((s) => {
                    const z = zones.find((z) => z.id === s.id);
                    return (
                      <path
                        key={s.id}
                        d={s.path}
                        fill={fill(z)}
                        fillRule="evenodd"
                        stroke={s.id === active ? '#abeee0' : '#5b7c8b'}
                        strokeWidth={s.id === active ? 2.6 : 0.85}
                        vectorEffect="non-scaling-stroke"
                        tabIndex={0}
                        role="button"
                        aria-pressed={s.id === active}
                        aria-label={`${s.name}: ${z ? stateLabels[z.state] : 'Tiada data dalam skop'}. DEMO / SYNTHETIC`}
                        onClick={() => select(s.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            select(s.id);
                          }
                        }}
                      >
                        <title>{`${s.name} · ${z?.count !== null && z?.count !== undefined ? `${formatNumber(z.count)} · ${formatNumber(z.rate, 1)} ${unit}` : 'Tiada nilai boleh dipaparkan'} · DEMO / SYNTHETIC`}</title>
                      </path>
                    );
                  })}
                  {filters.mode === 'count' &&
                    shapes.map((s) => {
                      const z = zones.find((z) => z.id === s.id);
                      return z?.count !== null && z?.count !== undefined && z.count > 0 ? (
                        <circle
                          key={s.id}
                          cx={s.cx}
                          cy={s.cy}
                          r={5 + Math.sqrt(z.count / countMax) * 18}
                          className="workload-circle"
                          onClick={() => select(s.id)}
                        >
                          <title>{`${s.name}: ${formatNumber(z.count)} · DEMO / SYNTHETIC`}</title>
                        </circle>
                      ) : null;
                    })}
                  {shapes
                    .filter((s) => ['MY-01', 'MY-03', 'MY-12', 'MY-13'].includes(s.id))
                    .map((s) => (
                      <text
                        key={s.id}
                        x={s.cx}
                        y={s.cy + (s.id === 'MY-13' ? 6 : 0)}
                        className="state-map-label"
                        textAnchor="middle"
                      >
                        {s.name.toUpperCase()}
                      </text>
                    ))}
                  {shape && (
                    <g pointerEvents="none">
                      <circle cx={shape.cx} cy={shape.cy - 19} r="4" fill="#d4fff5" />
                      <circle
                        cx={shape.cx}
                        cy={shape.cy - 19}
                        r="9"
                        fill="none"
                        stroke="#b0e9dc"
                        opacity=".45"
                      />
                    </g>
                  )}
                </g>
                <text x="200" y="408" className="region-label" textAnchor="middle">
                  SEMENANJUNG MALAYSIA
                </text>
                <text x="806" y="408" className="region-label" textAnchor="middle">
                  MALAYSIA TIMUR
                </text>
              </svg>
              {!overview && (
                <>
                  <div className="map-zoom">
                    <button
                      className="icon-button"
                      onClick={() => setZoom(Math.min(2.5, zoom + 0.3))}
                      aria-label="Zum masuk"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => setZoom(Math.max(1, zoom - 0.3))}
                      aria-label="Zum keluar"
                    >
                      <Minus size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => setZoom(1)}
                      aria-label="Tetapkan semula zum"
                    >
                      <LocateFixed size={16} />
                    </button>
                  </div>
                  <div className="map-compass">
                    <span>N</span>
                    <ArrowUp size={18} />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="map-table-wrap">
              <table>
                <caption className="sr-only">
                  Nilai negeri · DEMO / SYNTHETIC · {filters.period}
                </caption>
                <thead>
                  <tr>
                    <th>Negeri / W.P.</th>
                    <th>Bilangan</th>
                    <th>{filters.layer === 'confidence' ? 'Peratus' : 'Kadar / 100k'}</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((z) => (
                    <tr key={z.id} className={z.id === active ? 'selected-row' : ''}>
                      <th>
                        <button className="table-link" onClick={() => select(z.id)}>
                          {z.name}
                        </button>
                      </th>
                      <td>
                        {overview && z.state !== 'value'
                          ? stateLabels[z.state]
                          : formatNumber(z.count)}
                      </td>
                      <td>
                        {overview && z.state !== 'value'
                          ? stateLabels[z.state]
                          : formatNumber(z.rate, 1)}
                      </td>
                      <td>{stateLabels[z.state]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!zones.length && (
                <p className="table-empty">
                  Tiada kadar rasmi: populasi dan sempadan rasmi belum diluluskan. Pilih data
                  demonstrasi untuk meneroka interaksi.
                </p>
              )}
            </div>
          )}
          <div className="map-legend">
            <div className="rate-legend">
              <span>
                {filters.mode === 'rate'
                  ? 'Skala nilai, bukan tahap ancaman'
                  : 'Saiz simbol = bilangan'}
              </span>
              {filters.mode === 'rate' && (
                <>
                  <div className="legend-ramp" />
                  <div className="legend-values">
                    <span>0</span>
                    <span>{formatNumber(max, 1)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="legend-states">
              <span>
                <i className="legend-zero" />
                Sifar
              </span>
              <span>
                <i className="legend-unknown" />
                Tidak diketahui
              </span>
              <span>
                <i className="legend-suppressed" />
                Disekat
              </span>
              <span>
                <i className="legend-missing" />
                Tidak dikumpul
              </span>
              <span>
                <i className="legend-na" />
                Tidak berkenaan
              </span>
            </div>
          </div>
        </div>
        <aside className="zone-detail" aria-live="polite">
          <div className="zone-detail-label">
            <span>NEGERI DIPILIH</span>
            {!overview && <span>{selected}</span>}
          </div>
          <h3>{shape?.name ?? 'Pilih negeri'}</h3>
          <div className="zone-detail-badges">
            <DemoBadge />
            <Badge>{zone ? stateLabels[zone.state] : 'Tiada data dalam skop'}</Badge>
          </div>
          <div
            className={`zone-value ${overview && (!zone || zone.state !== 'value') ? 'zone-unavailable' : ''}`}
          >
            {overview && (!zone || zone.state !== 'value')
              ? zone
                ? stateLabels[zone.state]
                : 'Tiada data dalam skop'
              : formatNumber(
                  overview && filters.mode === 'count'
                    ? (zone?.count ?? null)
                    : (zone?.rate ?? null),
                  overview && filters.mode === 'count' ? 0 : 1,
                )}
            {(!overview || zone?.state === 'value') && (
              <small>{overview && filters.mode === 'count' ? 'bilangan agregat demo' : unit}</small>
            )}
          </div>
          {overview && zone?.state === 'suppressed' && (
            <p className="overview-state-explanation">
              Nilai disekat untuk melindungi kiraan kecil. Ia tidak bermaksud sifar.
            </p>
          )}
          {overview && (!zone || (zone.state !== 'value' && zone.state !== 'suppressed')) && (
            <p className="overview-state-explanation">
              Nilai tidak tersedia bagi lapisan dan skop ini. Status ini tidak bermaksud sifar.
            </p>
          )}
          {(!overview || filters.compare !== 'none') && (
            <div className="zone-comparison">
              {zone?.change !== null && zone?.change !== undefined ? (
                <>
                  <ArrowUpRight size={15} />
                  {zone.change > 0 ? '+' : ''}
                  {formatNumber(zone.change, 1)}% berbanding 2 Ogos
                </>
              ) : (
                <>
                  <span>—</span> Tiada perbandingan yang boleh dikira
                </>
              )}
            </div>
          )}
          <div className="zone-facts">
            <div>
              <span>Bilangan agregat</span>
              <strong>{formatNumber(zone?.count ?? null)}</strong>
            </div>
            <div>
              <span>{filters.layer === 'confidence' ? 'Medan dijangka' : 'Populasi demo'}</span>
              <strong>{formatNumber(zone?.denominator ?? null)}</strong>
            </div>
            {!overview && (
              <div>
                <span>Kedudukan kadar</span>
                <strong>
                  {rank
                    ? `${String(rank).padStart(2, '0')} / ${sorted.filter((z) => z.rate !== null).length}`
                    : 'Tidak boleh dibandingkan'}
                </strong>
              </div>
            )}
            <div>
              <span>Tempoh</span>
              <strong>{dateBM(filters.period)}</strong>
            </div>
          </div>
          <div className="confidence-block">
            <div>
              <span>
                <ShieldCheck size={14} />
                Kelengkapan medan demo
              </span>
              <strong>
                {zone?.confidence == null ? 'Tidak tersedia' : `${formatNumber(zone.confidence)}%`}
              </strong>
            </div>
            <div className="meter">
              <span style={{ width: `${zone?.confidence ?? 0}%` }} />
            </div>
            <p>
              Kelengkapan ialah satu dimensi keyakinan. Formula keyakinan menyeluruh belum
              diluluskan.
            </p>
          </div>
          {!overview && (
            <>
              <div className="zone-context">
                <h4>Perkara untuk diteliti</h4>
                <p>
                  {zone?.state === 'suppressed'
                    ? 'Nilai dan pemacu disekat. Perincian yang boleh membongkar sel kecil tidak dihantar ke paparan.'
                    : filters.layer === 'burden'
                      ? 'Bandingkan keperluan rawatan dengan liputan perkhidmatan. Bilangan klien tidak mewakili prevalens masyarakat.'
                      : filters.layer === 'supply'
                        ? 'Isyarat penguatkuasaan tidak membuktikan kesalahan atau kadar prevalens.'
                        : filters.layer === 'harm'
                          ? 'Asingkan kejadian kemudaratan daripada jumlah perkhidmatan yang diberikan.'
                          : 'Semak liputan, kelengkapan dan pemilik tindakan sebelum membuat keputusan.'}
                </p>
              </div>
              <Link
                className="button button-primary zone-action"
                href={`/actions?geography=${selected}&teras=${filters.layer === 'harm' ? 4 : filters.layer === 'supply' ? 3 : filters.layer === 'gap' ? 1 : 2}&layer=${filters.layer}&period=${filters.period}&publication=${encodeURIComponent(zone?.publication ?? 'demo-v1')}`}
              >
                <Plus size={15} />
                Cipta tindakan bersama
              </Link>
              {zone && (
                <details className="metric-details">
                  <summary>Pemacu, sumber & versi</summary>
                  <p>DEMO / SYNTHETIC · {zone.source}</p>
                  <dl className="id-cell">
                    <dt>Populasi / penyebut</dt>
                    <dd>{zone.denominatorSource}</dd>
                    <dt>Sempadan</dt>
                    <dd>{zone.boundary}</dd>
                    <dt>Definisi / penerbitan</dt>
                    <dd>
                      {zone.definition} · {zone.publication}
                    </dd>
                    <dt>Segar semula</dt>
                    <dd>7 September 2026</dd>
                  </dl>
                  {zone.drivers.length ? (
                    <table>
                      <caption>Pemacu senario · DEMO / SYNTHETIC</caption>
                      <thead>
                        <tr>
                          <th>Komponen</th>
                          <th>Nilai</th>
                        </tr>
                      </thead>
                      <tbody>
                        {zone.drivers.map((d) => (
                          <tr key={d.label}>
                            <th>{d.label}</th>
                            <td>
                              {formatNumber(d.value)} {d.unit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>Pemacu tidak tersedia atau disekat.</p>
                  )}
                  <p>
                    Pecahan demografi dan program yang disokong boleh disemak melalui Teras
                    berkaitan; titik sensitif tidak dipaparkan.
                  </p>
                </details>
              )}
              <Link
                href={`/teras/${filters.layer === 'harm' ? 4 : filters.layer === 'supply' ? 3 : filters.layer === 'gap' ? 1 : 2}?${filterQuery(filters)}`}
                className="zone-teras-link"
              >
                Teroka Teras berkaitan <ArrowUpRight size={14} />
              </Link>
            </>
          )}
        </aside>
      </div>
      {!overview && method && (
        <div className="map-method">
          <h3>Kaedah yang boleh diperiksa</h3>
          <p>
            <b>DEMO / SYNTHETIC.</b> Kiraan dan populasi adalah rekaan. Kadar = bilangan ÷ populasi
            demo × 100,000. Warna ialah skala berterusan nilai terendah–tertinggi dalam paparan; ia
            tidak memberikan kategori ancaman. Saiz bulatan menunjukkan beban mutlak.
          </p>
          <div className="method-grid">
            <p>
              <b>Keyakinan:</b> kelengkapan medan demo dipaparkan secara berasingan. Ketepatan,
              liputan, kesegaran, denominator dan status penerbitan masih perlu dinilai. Tiada
              formula keyakinan rasmi diluluskan.
            </p>
            <p>
              <b>Penzonan & komposit:</b> dinyahaktifkan. Komponen, wajaran, ambang, kaedah data
              hilang dan peraturan minimum mesti diluluskan dahulu.
            </p>
            <p>
              <b>Geografi:</b> geoBoundaries / OpenStreetMap, 2017, versi 9469f09, ODbL 1.0.
              Sempadan contoh; bukan garis dasar kerajaan yang diluluskan. Daerah tidak tersedia
              tanpa data dan denominator sah.
            </p>
            <p>
              <b>Pendedahan:</b> dasar demo v1 menyekat kiraan 1–4 serta satu sel tambahan. Kadar,
              pemacu dan perbandingan berkaitan turut disekat. Dasar rasmi belum disahkan.
            </p>
          </div>
          <p>
            <b>Versi:</b> definisi {zone?.definition ?? 'v1'} · {zone?.publication ?? 'demo-v1'} ·
            Segar semula 7 September 2026. {zone?.source}.
          </p>
        </div>
      )}
      <div className="print-metadata">
        DEMO / SYNTHETIC · {layerLabels[filters.layer]} · {filters.period} · {selected} ·{' '}
        {filters.mode === 'rate' ? 'Kadar per 100,000 populasi demo' : 'Bilangan'} · Definisi{' '}
        {zone?.definition ?? 'v1'} · Penerbitan {zone?.publication ?? 'Tidak tersedia'} · Sempadan{' '}
        {zone?.boundary ?? 'Tidak tersedia'}. {zone?.source}. Kiraan 1–4 dan sel pelengkap disekat;
        tiada ambang ancaman rasmi. Kiraan bukan prevalens dan tidak membuktikan impak.
      </div>
      <div className="map-bottom-note">
        <span>DEMO / SYNTHETIC · Tiada ambang ancaman diluluskan</span>
        <button className="text-button" onClick={() => setTab(tab === 'map' ? 'table' : 'map')}>
          {tab === 'map' ? 'Lihat jadual setara' : 'Kembali ke peta'} <ArrowUpRight size={13} />
        </button>
      </div>
    </section>
  );
}
