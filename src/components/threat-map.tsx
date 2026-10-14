'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
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
import { Badge } from './ui';
import type { StateShape } from '@/lib/server/geometry';
import { formatNumber, dateBM, type MapZoneDTO, type Layer } from '@/lib/domain/types';
import { filterQuery, isAnnualPeriod, type Filters } from '@/lib/domain/filters';
import { demoPalette, relativeDemoRange, relativeDemoBand } from '@/lib/domain/map-palette';

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
const W = 1100,
  H = 445;
type View = { k: number; x: number; y: number };
const home: View = { k: 1, x: 0, y: 0 };
function clampView(v: View): View {
  const k = Math.min(4, Math.max(1, v.k));
  if (k === 1) return home;
  const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
  return { k, x: clamp(v.x, W * (1 - k) - 120, 120), y: clamp(v.y, H * (1 - k) - 80, 80) };
}
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
  const supplied = isAnnualPeriod(filters.period) && filters.source !== 'synthetic';
  const evidenceLabel = supplied ? 'Data dibekalkan · sempadan DEMO' : 'DEMO / SYNTHETIC';
  const [pending, startTransition] = useTransition();
  const params = useSearchParams(),
    path = usePathname(),
    router = useRouter();
  const initial =
    params.get('state') ??
    (zones.some((z) => z.id === 'MY-03') ? 'MY-03' : (zones[0]?.id ?? 'MY-03'));
  const [selected, setSelected] = useState(initial),
    [tab, setTab] = useState<'map' | 'table'>('map'),
    [view, setView] = useState<View>(home),
    [hover, setHover] = useState<{ id: string; x: number; y: number; flip: boolean } | null>(null),
    [focusBand, setFocusBand] = useState<'low' | 'medium' | 'high' | null>(null),
    [dragging, setDragging] = useState(false),
    [hint, setHint] = useState(false),
    [method, setMethod] = useState(false),
    [query, setQuery] = useState('');
  const svgRef = useRef<SVGSVGElement>(null),
    canvasRef = useRef<HTMLDivElement>(null),
    drag = useRef<{ x: number; y: number; from: View; moved: boolean } | null>(null),
    suppressClick = useRef(false),
    hintTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const interactive = !overview;
  const sorted = [...zones].sort((a, b) => (b.rate ?? -1) - (a.rate ?? -1));
  const active = filters.geography !== 'MY' ? filters.geography : (params.get('state') ?? selected);
  const zone = zones.find((z) => z.id === active),
    shape = shapes.find((s) => s.id === active);
  const fullMapHref = `/?${filterQuery(filters)}&state=${active}`;
  const max = Math.max(1, ...zones.map((z) => z.rate ?? 0));
  const countMax = Math.max(1, ...zones.map((z) => z.count ?? 0));
  const suppliedBands =
    supplied && ['2024', '2025'].includes(filters.period) && filters.layer === 'burden';
  const bandLabel = suppliedBands
    ? 'Kadar relatif · kaedah DEMO'
    : 'Tahap relatif · DEMO / SYNTHETIC';
  const bandVersion = suppliedBands ? 'supplied-relative-range-v1' : demoPalette.version;
  const bandText = (level: 'low' | 'medium' | 'high') =>
    suppliedBands
      ? demoPalette[level].label.replace('relatif demo', 'kadar relatif')
      : demoPalette[level].label;
  const demoRange =
    (!supplied || suppliedBands) && filters.layer !== 'confidence' && filters.mode === 'rate'
      ? relativeDemoRange(zones, suppliedBands)
      : null;
  const band = (z?: MapZoneDTO) => relativeDemoBand(z, demoRange, suppliedBands);
  const selectedBand = band(zone);
  const rank =
    zone && zone.rate !== null
      ? sorted.filter((z) => z.rate !== null).findIndex((z) => z.id === active) + 1
      : null;
  function select(id: string) {
    setSelected(id);
    const p = new URLSearchParams(params);
    p.set('state', id);
    if (filters.geography !== 'MY') {
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
  function svgPoint(clientX: number, clientY: number) {
    const svg = svgRef.current,
      m = svg?.getScreenCTM();
    if (!svg || !m) return { x: W / 2, y: H / 2 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }
  function zoomAt(px: number, py: number, k: number) {
    const next = Math.min(4, Math.max(1, k));
    setView(
      clampView({
        k: next,
        x: px - (px - view.x) * (next / view.k),
        y: py - (py - view.y) * (next / view.k),
      }),
    );
  }
  function flyTo(id: string) {
    const target = shapes.find((s) => s.id === id);
    if (!target) return;
    const k = Math.max(view.k, 2.2);
    setView(clampView({ k, x: W / 2 - target.cx * k, y: H / 2 - target.cy * k }));
  }
  function tipAt(id: string, clientX: number, clientY: number) {
    const box = canvasRef.current?.getBoundingClientRect();
    if (box)
      setHover({
        id,
        x: clientX - box.left,
        y: clientY - box.top,
        flip: clientX - box.left > box.width - 260,
      });
  }
  function tipAtShape(id: string) {
    const target = shapes.find((s) => s.id === id),
      m = svgRef.current?.getScreenCTM(),
      box = canvasRef.current?.getBoundingClientRect();
    if (!target || !m || !box) return;
    const p = new DOMPoint(
      target.cx * view.k + view.x,
      target.cy * view.k + view.y,
    ).matrixTransform(m);
    setHover({ id, x: p.x - box.left, y: p.y - box.top, flip: p.x - box.left > box.width - 260 });
  }
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !interactive) return;
    function onWheel(e: WheelEvent) {
      if (!e.ctrlKey && !e.metaKey) {
        setHint(true);
        clearTimeout(hintTimer.current);
        hintTimer.current = setTimeout(() => setHint(false), 1400);
        return;
      }
      e.preventDefault();
      const p = svgPoint(e.clientX, e.clientY);
      setView((v) => {
        const k = Math.min(4, Math.max(1, v.k * Math.exp(-e.deltaY * 0.0025)));
        return clampView({
          k,
          x: p.x - (p.x - v.x) * (k / v.k),
          y: p.y - (p.y - v.y) * (k / v.k),
        });
      });
    }
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  });
  function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (!interactive || e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, from: view, moved: false };
    const move = (ev: PointerEvent) => {
      const d = drag.current,
        svg = svgRef.current;
      if (!d || !svg) return;
      const scale = W / svg.getBoundingClientRect().width;
      const dx = (ev.clientX - d.x) * scale,
        dy = (ev.clientY - d.y) * scale;
      if (!d.moved && Math.hypot(dx, dy) < 5) return;
      if (!d.moved) setDragging(true);
      d.moved = true;
      setHover(null);
      if (d.from.k > 1) setView(clampView({ ...d.from, x: d.from.x + dx, y: d.from.y + dy }));
    };
    const up = () => {
      if (drag.current?.moved) suppressClick.current = true;
      drag.current = null;
      setDragging(false);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
  const hoverZone = hover ? zones.find((z) => z.id === hover.id) : undefined,
    hoverShape = hover ? shapes.find((s) => s.id === hover.id) : undefined;
  const tipValue = (z?: MapZoneDTO) =>
    !z
      ? 'Tiada data dalam skop'
      : z.state !== 'value'
        ? stateLabels[z.state]
        : filters.mode === 'count'
          ? `${formatNumber(z.count)} ${supplied ? 'orang direkodkan' : 'bilangan agregat demo'}`
          : `${formatNumber(z.rate, 1)} ${unit}`;
  function zoneClass(z: MapZoneDTO | undefined, id: string) {
    const c = ['map-zone'];
    if (id === active) c.push('is-active');
    if (hover?.id === id) c.push('is-hovered');
    if (focusBand && band(z) !== focusBand) c.push('is-dimmed');
    if (z && z.state === 'not-applicable') c.push('zone-fill-na');
    else if (z && z.state === 'value' && z.count === 0) c.push('zone-fill-zero');
    else if (z && z.state === 'value' && filters.mode === 'count') c.push('zone-fill-count');
    return c.join(' ');
  }
  function fill(z?: MapZoneDTO) {
    if (!z || z.state === 'unknown') return 'url(#unknown-pattern)';
    if (z.state === 'suppressed') return 'url(#suppressed-pattern)';
    if (z.state === 'not-collected') return 'url(#not-collected-pattern)';
    if (z.state === 'not-applicable') return '#27303a';
    if (z.count === 0) return '#122535';
    if (filters.mode === 'count') return '#172d3c';
    if (z.rate === null) return 'url(#unknown-pattern)';
    const level = band(z);
    if (level) return demoPalette[level].colour;
    return `hsl(225 ${45 + ((z.rate ?? 0) / max) * 35}% ${26 + ((z.rate ?? 0) / max) * 34}%)`;
  }
  const unit =
    filters.layer === 'confidence'
      ? '% medan sah'
      : supplied
        ? 'per 100,000 penduduk'
        : 'per 100,000 populasi demo';
  return (
    <section
      id="peta-strategik"
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
          <Badge tone={supplied ? 'source' : 'demo'}>{evidenceLabel}</Badge>
          {overview ? (
            <Link href={fullMapHref} className="overview-map-link">
              Buka Scenario Semasa <ArrowUpRight size={15} />
            </Link>
          ) : (
            !full && (
              <Link
                href={`/?${filterQuery(filters)}&state=${active}`}
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
            disabled={pending}
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
            disabled={pending}
            aria-pressed={filters.mode === 'rate'}
            onClick={() => update('mode', 'rate')}
          >
            {filters.layer === 'confidence' ? 'Peratus' : 'Kadar'}
          </button>
          <button
            className={filters.mode === 'count' ? 'selected' : ''}
            disabled={pending}
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
              {filters.mode === 'rate'
                ? unit
                : supplied
                  ? 'orang direkodkan'
                  : 'bilangan agregat demo'}
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
            <div
              className={`map-canvas ${interactive && view.k > 1 ? 'can-pan' : ''} ${dragging ? 'is-dragging' : ''}`}
              ref={canvasRef}
            >
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
                              flyTo(s.id);
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
                ref={svgRef}
                viewBox="0 0 1100 445"
                className="malaysia-map"
                onPointerDown={onPointerDown}
                onClickCapture={(e) => {
                  if (suppressClick.current) {
                    suppressClick.current = false;
                    e.stopPropagation();
                  }
                }}
                onDoubleClick={(e) => {
                  if (!interactive) return;
                  const p = svgPoint(e.clientX, e.clientY);
                  zoomAt(p.x, p.y, view.k * 1.6);
                }}
                role="group"
                aria-label={`Peta Malaysia mengikut negeri, ${evidenceLabel}; setiap negeri boleh dipilih melalui papan kekunci`}
              >
                <defs>
                  <pattern id="unknown-pattern" width="7" height="7" patternUnits="userSpaceOnUse">
                    <rect width="7" height="7" fill="#182331" className="pat-unknown-bg" />
                    <path
                      d="M0,7L7,0"
                      stroke="#304353"
                      strokeWidth="0.6"
                      className="pat-unknown-line"
                    />
                  </pattern>
                  <pattern
                    id="suppressed-pattern"
                    width="6"
                    height="6"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="6" height="6" fill="#253340" className="pat-suppressed-bg" />
                    <path
                      d="M0,0L6,6M0,6L6,0"
                      stroke="#536174"
                      strokeWidth="0.7"
                      className="pat-suppressed-line"
                    />
                  </pattern>
                  <pattern
                    id="not-collected-pattern"
                    width="7"
                    height="7"
                    patternUnits="userSpaceOnUse"
                  >
                    <rect width="7" height="7" fill="#172331" className="pat-missing-bg" />
                    <circle cx="3" cy="3" r="1" fill="#718294" className="pat-missing-dot" />
                  </pattern>
                  <pattern id="sea-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.7" fill="#324754" className="sea-dot" />
                  </pattern>
                </defs>
                <rect width="1100" height="445" fill="url(#sea-grid)" opacity=".32" />
                <text x="485" y="180" className="ocean-label" textAnchor="middle">
                  LAUT CHINA SELATAN
                </text>
                <g
                  className={`map-stage ${dragging ? '' : 'is-smooth'}`}
                  style={{
                    transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
                    transformOrigin: '0 0',
                  }}
                >
                  {shapes.map((s, i) => {
                    const z = zones.find((z) => z.id === s.id);
                    return (
                      <path
                        key={s.id}
                        d={s.path}
                        fill={fill(z)}
                        fillRule="evenodd"
                        className={zoneClass(z, s.id)}
                        style={{ '--i': i } as React.CSSProperties}
                        vectorEffect="non-scaling-stroke"
                        tabIndex={0}
                        role="button"
                        aria-pressed={s.id === active}
                        aria-label={`${s.name}: ${z ? stateLabels[z.state] : 'Tiada data dalam skop'}. ${evidenceLabel}`}
                        onClick={() => select(s.id)}
                        onPointerMove={(e) => {
                          if (!drag.current?.moved) tipAt(s.id, e.clientX, e.clientY);
                        }}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => tipAtShape(s.id)}
                        onBlur={() => setHover(null)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            select(s.id);
                          }
                        }}
                      >
                        <desc>{`${tipValue(z)}${band(z) ? ` · ${bandText(band(z)!)}` : ''}`}</desc>
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
                          vectorEffect="non-scaling-stroke"
                          onClick={() => select(s.id)}
                          onPointerMove={(e) => {
                            if (!drag.current?.moved) tipAt(s.id, e.clientX, e.clientY);
                          }}
                          onPointerLeave={() => setHover(null)}
                        >
                          <title>{`${s.name}: ${formatNumber(z.count)} · ${evidenceLabel}`}</title>
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
                  <g className="map-highlights" aria-hidden="true" pointerEvents="none">
                    {hoverShape && hoverShape.id !== active && (
                      <path
                        d={hoverShape.path}
                        fillRule="evenodd"
                        className="map-hover-outline"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                    {shape && (
                      <path
                        key={shape.id}
                        d={shape.path}
                        fillRule="evenodd"
                        className="map-active-outline"
                        vectorEffect="non-scaling-stroke"
                      />
                    )}
                  </g>
                  {shape && (
                    <g
                      className="map-pin"
                      aria-hidden="true"
                      pointerEvents="none"
                      transform={`translate(${shape.cx} ${shape.cy - 24}) scale(${1 / view.k})`}
                    >
                      <ellipse className="map-pin-shadow" cx="0" cy="6" rx="7" ry="2.6" />
                      <circle className="map-pin-pulse" cx="0" cy="6" r="8" />
                      <g className="map-pin-drop" key={shape.id}>
                        <path
                          className="map-pin-body"
                          d="M0 6C-7-3-11-8-11-14a11 11 0 1 1 22 0c0 6-4 11-11 20z"
                        />
                        <circle cx="0" cy="-14" r="4.2" fill="#fff" />
                      </g>
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
              {hover && (
                <div
                  className={`map-tooltip ${hover.flip ? 'flip' : ''}`}
                  style={{ left: hover.x, top: hover.y }}
                  aria-hidden="true"
                >
                  <span className="map-tooltip-name">
                    {hoverShape?.name ?? hover.id}
                    {hover.id === active && <em>Dipilih</em>}
                  </span>
                  {hoverZone?.state === 'value' ? (
                    <strong>
                      {formatNumber(
                        filters.mode === 'count' ? hoverZone.count : hoverZone.rate,
                        filters.mode === 'count' ? 0 : 1,
                      )}
                      <small>
                        {filters.mode === 'count'
                          ? supplied
                            ? 'orang direkodkan'
                            : 'bilangan agregat demo'
                          : unit}
                      </small>
                    </strong>
                  ) : (
                    <strong>{tipValue(hoverZone)}</strong>
                  )}
                  {band(hoverZone) && (
                    <span className={`map-band-tag band-${band(hoverZone)}`}>
                      {bandText(band(hoverZone)!)}
                    </span>
                  )}
                  <span className="map-tooltip-meta">
                    {hoverZone?.state === 'value' && hoverZone.confidence != null
                      ? `Kelengkapan ${formatNumber(hoverZone.confidence)}% · `
                      : ''}
                    {evidenceLabel}
                  </span>
                </div>
              )}
              {interactive && (
                <div className={`map-hint ${hint ? 'show' : ''}`} aria-hidden="true">
                  Tekan Ctrl + tatal untuk zum · seret untuk alih
                </div>
              )}
              {!overview && (
                <>
                  <div className="map-zoom">
                    <button
                      className="icon-button"
                      onClick={() => zoomAt(shape?.cx ?? W / 2, shape?.cy ?? H / 2, view.k * 1.35)}
                      aria-label="Zum masuk"
                    >
                      <Plus size={16} />
                    </button>
                    <button
                      className="icon-button"
                      onClick={() => zoomAt(shape?.cx ?? W / 2, shape?.cy ?? H / 2, view.k / 1.35)}
                      aria-label="Zum keluar"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="map-zoom-level">{view.k.toFixed(1)}×</span>
                    <button
                      className="icon-button"
                      onClick={() => setView(home)}
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
                  Nilai negeri · {evidenceLabel} · {filters.period}
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
                      <td>{z.state !== 'value' ? stateLabels[z.state] : formatNumber(z.count)}</td>
                      <td>
                        {z.state !== 'value' ? stateLabels[z.state] : formatNumber(z.rate, 1)}
                      </td>
                      <td>
                        {stateLabels[z.state]}
                        {band(z) && (
                          <span className={`map-band-tag band-${band(z)}`}>
                            {bandText(band(z)!)}
                          </span>
                        )}
                      </td>
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
            {demoRange ? (
              <div className="demo-band-legend">
                <strong>{bandLabel}</strong>
                <div className="demo-band-swatches">
                  {(['low', 'medium', 'high'] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      className={`band-chip ${focusBand === level ? 'is-on' : ''}`}
                      aria-pressed={focusBand === level}
                      title="Serlahkan negeri dalam tahap ini"
                      onClick={() => setFocusBand(focusBand === level ? null : level)}
                    >
                      <i style={{ background: demoPalette[level].colour }} />
                      {demoPalette[level].label.split(' · ')[0]}
                    </button>
                  ))}
                </div>
                <details>
                  <summary>Bagaimana warna ditentukan?</summary>
                  <p>
                    Julat kadar positif dalam paparan ini dibahagi kepada tiga bahagian sama. Warna
                    berubah bersama penapis; bukan ambang ancaman rasmi atau perbandingan tahap
                    antara tempoh. Rendah: ≤ {formatNumber(demoRange.low, 2)}; sederhana: &gt;{' '}
                    {formatNumber(demoRange.low, 2)} hingga {formatNumber(demoRange.medium, 2)};
                    tinggi: &gt; {formatNumber(demoRange.medium, 2)}. Unit: {unit}. Had dipaparkan
                    dibundarkan; klasifikasi menggunakan nilai penuh. Sifar dan nilai disekat tidak
                    dikelaskan. Versi: {bandVersion}.
                  </p>
                </details>
              </div>
            ) : (
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
            )}
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
            {!overview && <span>{active}</span>}
          </div>
          <h3>{shape?.name ?? 'Pilih negeri'}</h3>
          <div className="zone-detail-badges">
            <Badge tone={supplied ? 'source' : 'demo'}>{evidenceLabel}</Badge>
            <Badge>{zone ? stateLabels[zone.state] : 'Tiada data dalam skop'}</Badge>
          </div>
          {selectedBand && (
            <span className={`map-band-tag band-${selectedBand}`}>{bandText(selectedBand)}</span>
          )}
          <div
            className={`zone-value ${!zone || zone.state !== 'value' ? 'zone-unavailable' : ''}`}
          >
            {!zone || zone.state !== 'value'
              ? zone
                ? stateLabels[zone.state]
                : 'Tiada data dalam skop'
              : formatNumber(
                  filters.mode === 'count' ? (zone?.count ?? null) : (zone?.rate ?? null),
                  filters.mode === 'count' ? 0 : 1,
                )}
            {zone?.state === 'value' && (
              <small>
                {filters.mode === 'count'
                  ? supplied
                    ? 'orang direkodkan'
                    : 'bilangan agregat demo'
                  : unit}
              </small>
            )}
          </div>
          {zone?.state === 'suppressed' && (
            <p className="overview-state-explanation">
              Nilai disekat untuk melindungi kiraan kecil. Ia tidak bermaksud sifar.
            </p>
          )}
          {(!zone || (zone.state !== 'value' && zone.state !== 'suppressed')) && (
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
              <span>
                {filters.layer === 'confidence'
                  ? 'Medan dijangka'
                  : supplied
                    ? 'Penduduk DOSM'
                    : 'Populasi demo'}
              </span>
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
                {supplied ? 'Keyakinan belum disahkan' : 'Kelengkapan medan demo'}
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
                href={`/actions?geography=${active}&teras=${filters.layer === 'harm' ? 4 : filters.layer === 'supply' ? 3 : filters.layer === 'gap' ? 1 : 2}&layer=${filters.layer}&period=${filters.period}&publication=${encodeURIComponent(zone?.publication ?? 'demo-v1')}`}
              >
                <Plus size={15} />
                Cipta tindakan bersama
              </Link>
              {zone && (
                <details className="metric-details">
                  <summary>Pemacu, sumber & versi</summary>
                  <p>
                    {evidenceLabel} · {zone.source}
                  </p>
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
                    <dd>{supplied ? '7 Oktober 2026' : '7 September 2026'}</dd>
                  </dl>
                  {zone.drivers.length ? (
                    <table>
                      <caption>Pemacu · {evidenceLabel}</caption>
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
            <b>{evidenceLabel}.</b>{' '}
            {supplied
              ? 'Kiraan pentadbiran dipadankan daripada sumber; bukan prevalens. Kadar = kiraan ÷ penduduk DOSM tahun sepadan × 100,000. Penyebut hanya tersedia untuk 2024–2025.'
              : 'Kiraan dan populasi adalah rekaan. Kadar = bilangan ÷ populasi demo × 100,000.'}{' '}
            {demoRange
              ? `${bandLabel}: tiga bahagian sama julat kadar positif. Kaedah ${bandVersion}; had berubah bersama penapis, bukan kategori ancaman rasmi.`
              : 'Warna ialah skala berterusan nilai terendah–tertinggi dalam paparan; ia tidak memberikan kategori ancaman.'}{' '}
            Saiz bulatan menunjukkan beban mutlak.
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
              <b>Pendedahan:</b>{' '}
              {supplied
                ? 'Agregat negeri daripada sumber dibekalkan. Sel orang kecil dan pecahan tidak konsisten ditahan sebelum import; dasar rasmi belum disahkan.'
                : 'Dasar demo v1 menyekat kiraan 1–4 serta satu sel tambahan. Kadar, pemacu dan perbandingan berkaitan turut disekat. Dasar rasmi belum disahkan.'}
            </p>
          </div>
          <p>
            <b>Versi:</b> definisi {zone?.definition ?? 'v1'} · {zone?.publication ?? 'demo-v1'} ·
            Segar semula {supplied ? '7 Oktober 2026' : '7 September 2026'}. {zone?.source}.
          </p>
        </div>
      )}
      <div className="print-metadata">
        {demoRange &&
          `${bandLabel} · ${bandVersion} · Julat positif ${formatNumber(demoRange.min, 2)}–${formatNumber(demoRange.max, 2)}; rendah ≤ ${formatNumber(demoRange.low, 2)}, sederhana ≤ ${formatNumber(demoRange.medium, 2)}; bukan ambang rasmi. `}
        {evidenceLabel} · {layerLabels[filters.layer]} · {filters.period} · {active} ·{' '}
        {filters.mode === 'rate' ? unit : 'Bilangan'} · Definisi {zone?.definition ?? 'v1'} ·
        Penerbitan {zone?.publication ?? 'Tidak tersedia'} · Sempadan{' '}
        {zone?.boundary ?? 'Tidak tersedia'}. {zone?.source}. Kiraan 1–4 dan sel pelengkap disekat;
        tiada ambang ancaman rasmi. Kiraan bukan prevalens dan tidak membuktikan impak.
      </div>
      <div className="map-bottom-note">
        <span>
          {evidenceLabel} ·{' '}
          {demoRange
            ? `Warna = ${suppliedBands ? 'kadar relatif · kaedah DEMO' : 'tahap relatif demo'}; bukan ambang rasmi`
            : 'Tiada ambang ancaman diluluskan'}
        </span>
        <button className="text-button" onClick={() => setTab(tab === 'map' ? 'table' : 'map')}>
          {tab === 'map' ? 'Lihat jadual setara' : 'Kembali ke peta'} <ArrowUpRight size={13} />
        </button>
      </div>
    </section>
  );
}
