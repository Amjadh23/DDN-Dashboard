'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarClock } from 'lucide-react';
import { Badge, DemoBadge } from './ui';
const partners = [
  {
    name: 'Rakan demo A',
    country: 'Thailand',
    lon: 101,
    lat: 15,
    theme: 'Latihan & pembangunan keupayaan',
    status: 'Aktif',
    due: '30 Sep 2026',
  },
  {
    name: 'Rakan demo B',
    country: 'Indonesia',
    lon: 118,
    lat: -3,
    theme: 'Pertukaran amalan',
    status: 'Dalam semakan',
    due: '15 Okt 2026',
  },
  {
    name: 'Rakan demo C',
    country: 'Australia',
    lon: 135,
    lat: -25,
    theme: 'Penyelidikan bersama',
    status: 'Aktif',
    due: '2 Nov 2026',
  },
  {
    name: 'Rakan demo D',
    country: 'Japan',
    lon: 138,
    lat: 37,
    theme: 'Perkongsian pengetahuan',
    status: 'Pembaharuan',
    due: '20 Sep 2026',
  },
  {
    name: 'Rakan demo E',
    country: 'Germany',
    lon: 10,
    lat: 51,
    theme: 'Penilaian & bukti',
    status: 'Aktif',
    due: '10 Dis 2026',
  },
];
export function PartnerMap({ shapes }: { shapes: { name: string; path: string }[] }) {
  const [active, setActive] = useState(0);
  const p = partners[active],
    origin = { x: (102 + 180) * 2, y: (82 - 4) * 2 };
  return (
    <div className="partner-layout">
      <div>
        <div className="partner-map-canvas">
          <svg
            viewBox="0 0 720 345"
            role="group"
            aria-label="Peta rakan demonstrasi, bukan hubungan diplomatik sebenar"
          >
            <defs>
              <pattern id="world-grid" width="25" height="25" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r=".6" fill="#3f435a" />
              </pattern>
            </defs>
            <rect width="720" height="345" fill="url(#world-grid)" />
            {shapes.map((s) => (
              <path
                key={s.name}
                d={s.path}
                fill={
                  partners.some((p) => p.country === s.name)
                    ? '#4b466d'
                    : s.name === 'Malaysia'
                      ? '#899bb5'
                      : '#1b2c3c'
                }
                stroke="#395065"
                strokeWidth=".45"
              />
            ))}
            {partners.map((p, i) => {
              const x = (p.lon + 180) * 2,
                y = (82 - p.lat) * 2;
              return (
                <g key={p.name}>
                  <path
                    d={`M${origin.x},${origin.y} Q${(origin.x + x) / 2},${Math.min(origin.y, y) - 40} ${x},${y}`}
                    stroke={active === i ? '#b7a6df' : '#645d82'}
                    fill="none"
                    strokeWidth={active === i ? 1.5 : 0.7}
                    strokeDasharray="3 4"
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={active === i ? 6 : 4}
                    fill={active === i ? '#d4c6fa' : '#8a7aaf'}
                    tabIndex={0}
                    role="button"
                    aria-label={`Pilih ${p.name}, lokasi contoh ${p.country}`}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setActive(i);
                    }}
                  />
                  <text x={x + 10} y={y + 3} className="partner-map-label">
                    {p.name.replace('Rakan demo ', '')}
                  </text>
                </g>
              );
            })}
            <circle cx={origin.x} cy={origin.y} r="4" fill="#a2dcce" />
            <text x={origin.x - 13} y={origin.y + 15} className="partner-map-label">
              MALAYSIA
            </text>
          </svg>
        </div>
        <div className="partner-selector">
          {partners.map((p, i) => (
            <button
              key={p.name}
              className={active === i ? 'selected' : ''}
              onClick={() => setActive(i)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="chart-caveat">
          Peta lokasi contoh · Natural Earth, domain awam. Titik mewakili negara secara umum, bukan
          alamat atau lokasi operasi.
        </p>
      </div>
      <aside className="partner-detail">
        <DemoBadge />
        <h3>{p.name}</h3>
        <p>Lokasi ilustrasi: {p.country}</p>
        <Badge tone={p.status === 'Pembaharuan' ? 'warning' : 'neutral'}>{p.status}</Badge>
        <div className="divider" />
        <h4>Tema kerjasama</h4>
        <p>{p.theme}</p>
        <h4>Semakan instrumen demo</h4>
        <p className="icon-text">
          <CalendarClock size={14} />
          {p.due}
        </p>
        <h4>Pemilik komitmen</h4>
        <p>Sekretariat Demo · pemilik perlu pengesahan</p>
        <Link
          href="/actions?teras=5&geography=MY&publication=demo-t5-2026-08-09-v1"
          className="text-link"
        >
          Jejaki komitmen
          <ArrowUpRight size={14} />
        </Link>
      </aside>
    </div>
  );
}
