'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import { stateNames } from '@/lib/domain/demo-identities';
import { filterQuery, defaultFilters, type Filters } from '@/lib/domain/filters';
export function FilterBar({
  filters,
  variant = 'full',
}: {
  filters: Filters;
  variant?: 'full' | 'overview';
}) {
  const path = usePathname(),
    router = useRouter(),
    params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(false);
  function update(key: keyof Filters, value: string) {
    const query = new URLSearchParams(params);
    for (const [k, v] of Object.entries({ ...filters, [key]: value })) query.set(k, v);
    if (variant === 'overview' && key === 'geography') {
      if (value === 'MY') query.delete('state');
      else query.set('state', value);
    }
    startTransition(() => router.replace(`${path}?${query}`, { scroll: false }));
  }
  return (
    <div className={`filter-wrapper ${pending ? 'is-loading' : ''}`} aria-busy={pending}>
      <div className="filter-bar">
        <div className="filter-label">
          <SlidersHorizontal size={16} />
          <span>Penapis</span>
        </div>
        <label>
          Tempoh
          <select value={filters.period} onChange={(e) => update('period', e.target.value)}>
            <option value="2026-08-09">9 Ogos 2026</option>
            <option value="2026-08-02">2 Ogos 2026 · demo sahaja</option>
          </select>
        </label>
        <label>
          Geografi
          <select value={filters.geography} onChange={(e) => update('geography', e.target.value)}>
            <option value="MY">Seluruh Malaysia</option>
            {Object.entries(stateNames).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {variant === 'full' && (
          <>
            <label>
              Bandingkan
              <select value={filters.compare} onChange={(e) => update('compare', e.target.value)}>
                <option value="none">Tiada perbandingan</option>
                <option value="2026-08-02">2 Ogos 2026 · demo</option>
              </select>
            </label>
            <button
              className="filter-more"
              aria-expanded={expanded}
              onClick={() => setExpanded(!expanded)}
            >
              Lagi <ChevronDown size={14} />
            </button>
          </>
        )}
        <button
          className="icon-button reset-filter"
          title="Tetapkan semula penapis"
          aria-label="Tetapkan semula penapis"
          onClick={() =>
            startTransition(() => router.replace(`${path}?${filterQuery(defaultFilters)}`))
          }
        >
          <RotateCcw size={14} />
        </button>
      </div>
      {variant === 'full' && expanded && (
        <div className="expanded-filters">
          <label>
            Status data
            <select value={filters.source} onChange={(e) => update('source', e.target.value)}>
              <option value="all">Semua (diasingkan)</option>
              <option value="supplied">Petikan dibekalkan</option>
              <option value="synthetic">DEMO / SYNTHETIC</option>
            </select>
          </label>
          <label>
            Organisasi
            <select
              value={filters.organisation}
              onChange={(e) => update('organisation', e.target.value)}
            >
              <option value="all">Semua yang dibenarkan</option>
              <option value="demo-a">Pasukan Demo A</option>
              <option value="demo-b">Pasukan Demo B</option>
            </select>
          </label>
          <label>
            Kelengkapan demo
            <select
              value={filters.confidence}
              onChange={(e) => update('confidence', e.target.value)}
            >
              <option value="all">Semua kelengkapan</option>
              <option value="complete">100% medan demo</option>
            </select>
          </label>
          {[
            'Program / intervensi',
            'Fasiliti',
            'Bahan',
            'Demografi',
            'Laluan',
            'Peratus populasi',
          ].map((name) => (
            <label key={name}>
              {name}
              <select disabled aria-describedby="filter-limits">
                <option>Tidak tersedia untuk paparan ini</option>
              </select>
            </label>
          ))}
          <div className="unavailable-filters" id="filter-limits">
            <p>
              Dimensi petikan ini tidak menyokong penapisan silang. Demografi dan laluan yang
              tersedia dipaparkan sebagai jadual sumber berasingan pada Teras 1–3; penyebut rasmi
              belum disahkan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
