// Decorative flat-style characters for the Ember identity. All art is aria-hidden;
// meaning is always carried by adjacent text. Shapes only, no external assets.
import { useId } from 'react';
import type { Role } from '@/lib/domain/policy';

type Hair = 'short' | 'side' | 'long' | 'bun' | 'tudung' | 'cap' | 'curly' | 'bald';
type Prop = 'book' | 'heart' | 'shield' | 'aid' | 'globe' | 'chart' | 'check' | 'key' | 'spark';
export type Persona = {
  skin: string;
  hair: Hair;
  hairColour: string;
  outfit: string;
  trim: string;
  backdrop: string;
  glasses?: boolean;
  lanyard?: boolean;
  headset?: boolean;
  vest?: boolean;
  prop?: Prop;
};

const ink = '#2a1c14';
// Neck and ears: skin mixed 18% toward a warm brown, as plain hex for standalone SVG use.
const shade = (skin: string) =>
  '#' +
  [1, 3, 5]
    .map((i, j) =>
      Math.round(parseInt(skin.slice(i, i + 2), 16) * 0.82 + [0x5a, 0x2a, 0x14][j] * 0.18)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

function HairBack({ p }: { p: Persona }) {
  if (p.hair === 'long')
    return (
      <path d="M50 64c-4 30 2 52 10 62h40c8-10 14-32 10-62-6-24-54-24-60 0z" fill={p.hairColour} />
    );
  if (p.hair === 'tudung')
    return (
      <>
        <path
          d="M42 96c-6 30 10 50 38 52 28-2 44-22 38-52-4 22-20 34-38 34s-34-12-38-34z"
          fill={p.trim}
        />
        <path
          d="M80 30c-28 0-38 22-38 46 0 26 14 46 38 48 24-2 38-22 38-48 0-24-10-46-38-46z"
          fill={p.hairColour}
        />
      </>
    );
  if (p.hair === 'bun') return <circle cx="80" cy="34" r="13" fill={p.hairColour} />;
  return null;
}

function HairFront({ p }: { p: Persona }) {
  const c = p.hairColour;
  switch (p.hair) {
    case 'short':
      return (
        <path
          d="M53 68c-3-26 10-36 28-36 19 0 31 12 26 36-3-12-12-18-26-18-13 0-23 5-28 18z"
          fill={c}
        />
      );
    case 'side':
      return (
        <path
          d="M53 70c-4-28 10-38 28-38 20 0 30 12 26 34-10-4-24-10-30-22-4 12-12 20-24 26z"
          fill={c}
        />
      );
    case 'long':
    case 'bun':
      return (
        <path
          d="M53 70c-2-26 10-38 27-38 19 0 31 14 27 38-6-14-16-22-27-22-12 0-21 8-27 22z"
          fill={c}
        />
      );
    case 'curly':
      return (
        <g fill={c}>
          {[52, 60, 69, 79, 89, 98, 106].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 44 : 50} r="11" />
          ))}
          <circle cx="54" cy="62" r="7" />
          <circle cx="106" cy="62" r="7" />
        </g>
      );
    case 'tudung':
      return (
        <path
          d="M54 64c4-18 14-26 26-26s22 8 26 26c-6-8-15-12-26-12s-20 4-26 12z"
          fill={c}
          opacity=".55"
        />
      );
    case 'cap':
      return (
        <g>
          <path d="M50 58c0-16 14-26 30-26s30 10 30 26z" fill={p.trim} />
          <rect x="48" y="54" width="64" height="9" rx="3" fill={ink} opacity=".85" />
          <path d="M60 63h40c-2 6-10 8-20 8s-18-2-20-8z" fill={ink} opacity=".9" />
          <circle cx="80" cy="45" r="6" fill="#f5c04a" />
        </g>
      );
    default:
      return null;
  }
}

function PropBadge({ prop, colour }: { prop: Prop; colour: string }) {
  const icon: Record<Prop, React.ReactNode> = {
    book: (
      <g fill="none" stroke={colour} strokeWidth="2.6" strokeLinejoin="round">
        <path d="M118 30c5-3 10-3 14 0v14c-4-3-9-3-14 0z" />
        <path d="M132 30c4-3 9-3 14 0v14c-5-3-10-3-14 0z" />
      </g>
    ),
    heart: (
      <path
        d="M132 46s-12-7-12-15c0-4 3-7 6-7 3 0 5 2 6 4 1-2 3-4 6-4 3 0 6 3 6 7 0 8-12 15-12 15z"
        fill={colour}
      />
    ),
    shield: (
      <g>
        <path d="M132 22l11 4v8c0 7-5 12-11 14-6-2-11-7-11-14v-8z" fill={colour} />
        <path
          d="M127 34l4 4 7-8"
          fill="none"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
    ),
    aid: (
      <g>
        <rect x="120" y="24" width="24" height="20" rx="5" fill={colour} />
        <path d="M132 28v12M126 34h12" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      </g>
    ),
    globe: (
      <g fill="none" stroke={colour} strokeWidth="2.4">
        <circle cx="132" cy="34" r="11" />
        <path d="M121 34h22M132 23c-6 7-6 15 0 22M132 23c6 7 6 15 0 22" />
      </g>
    ),
    chart: (
      <g fill={colour}>
        <rect x="122" y="34" width="5" height="10" rx="1.5" />
        <rect x="129.5" y="28" width="5" height="16" rx="1.5" />
        <rect x="137" y="23" width="5" height="21" rx="1.5" />
      </g>
    ),
    check: (
      <path
        d="M124 34l6 6 11-12"
        fill="none"
        stroke={colour}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    ),
    key: (
      <g fill="none" stroke={colour} strokeWidth="2.6" strokeLinecap="round">
        <circle cx="127" cy="34" r="5" />
        <path d="M132 34h11M139 34v5M143 34v4" />
      </g>
    ),
    spark: <path d="M132 22l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill={colour} />,
  };
  return (
    <g>
      <circle cx="132" cy="34" r="19" fill="#fff" />
      <circle cx="132" cy="34" r="19" fill={colour} opacity=".12" />
      {icon[prop]}
    </g>
  );
}

export function Character({
  persona: p,
  size = 160,
  framed = true,
  className,
}: {
  persona: Persona;
  size?: number;
  framed?: boolean;
  className?: string;
}) {
  const face = p.hair === 'tudung' ? { rx: 22, ry: 25 } : { rx: 25, ry: 28 };
  // Framed characters are clipped to their circle so they read as complete badges.
  const clip = 'ddn-clip-' + useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (
    <svg
      className={className}
      viewBox="0 0 160 160"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      {framed && (
        <defs>
          <clipPath id={clip}>
            <circle cx="80" cy="80" r="78" />
          </clipPath>
        </defs>
      )}
      {framed && <circle cx="80" cy="80" r="78" fill={p.backdrop} />}
      <g clipPath={framed ? `url(#${clip})` : undefined}>
        {framed && <circle cx="118" cy="36" r="44" fill="#fff" opacity=".18" />}
        <HairBack p={p} />
        <path d="M30 160c0-34 22-50 50-50s50 16 50 50z" fill={p.outfit} />
        {p.vest && (
          <g>
            <path d="M44 128c6-10 16-16 24-17l-2 49H38c0-12 2-24 6-32z" fill="#ff8a1f" />
            <path d="M116 128c-6-10-16-16-24-17l2 49h28c0-12-2-24-6-32z" fill="#ff8a1f" />
            <path d="M42 140h24M94 140h24" stroke="#fff4c2" strokeWidth="4" />
          </g>
        )}
        <path
          d="M68 110l12 14 12-14"
          fill="none"
          stroke={p.trim}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        {p.lanyard && (
          <g>
            <path d="M70 112l10 22 10-22" fill="none" stroke={p.trim} strokeWidth="2.4" />
            <rect x="73" y="132" width="14" height="18" rx="3" fill="#fff" />
            <rect x="76" y="136" width="8" height="3" rx="1.5" fill={p.trim} />
          </g>
        )}
        <rect x="70" y="90" width="20" height="22" rx="9" fill={shade(p.skin)} />
        <circle cx="55" cy="74" r="6" fill={shade(p.skin)} />
        <circle cx="105" cy="74" r="6" fill={shade(p.skin)} />
        <ellipse cx="80" cy="72" rx={face.rx} ry={face.ry} fill={p.skin} />
        <HairFront p={p} />
        <path
          d="M68 66q4-3 8 0M84 66q4-3 8 0"
          fill="none"
          stroke={ink}
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".7"
        />
        <ellipse cx="72" cy="73" rx="2.6" ry="3.2" fill={ink} />
        <ellipse cx="88" cy="73" rx="2.6" ry="3.2" fill={ink} />
        <circle cx="66" cy="82" r="4.5" fill="#ff7b6b" opacity=".35" />
        <circle cx="94" cy="82" r="4.5" fill="#ff7b6b" opacity=".35" />
        <path
          d="M73 85q7 6 14 0"
          fill="none"
          stroke={ink}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {p.glasses && (
          <g fill="none" stroke={ink} strokeWidth="2">
            <circle cx="72" cy="73" r="7" />
            <circle cx="88" cy="73" r="7" />
            <path d="M79 73h2" />
          </g>
        )}
        {p.headset && (
          <g>
            <path
              d="M52 72c0-22 12-36 28-36s28 14 28 36"
              fill="none"
              stroke={ink}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect x="46" y="66" width="10" height="17" rx="5" fill={p.trim} />
            <rect x="104" y="66" width="10" height="17" rx="5" fill={p.trim} />
            <path
              d="M51 82c0 10 8 14 18 14"
              fill="none"
              stroke={ink}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="70" cy="96" r="3.4" fill={p.trim} />
          </g>
        )}
      </g>
      {framed && (
        <circle
          cx="80"
          cy="80"
          r="77"
          fill="none"
          stroke="#fff"
          strokeOpacity=".55"
          strokeWidth="2"
        />
      )}
      {p.prop && <PropBadge prop={p.prop} colour={p.trim} />}
    </svg>
  );
}

const skin = { a: '#f6d0b1', b: '#e9b48f', c: '#c98d62', d: '#9c6644', e: '#7a4c33' };

// One character per Teras; colours follow the Teras accent tokens.
export const terasPersonas: Record<1 | 2 | 3 | 4 | 5, Persona> = {
  1: {
    skin: skin.b,
    hair: 'tudung',
    hairColour: '#1f8f80',
    outfit: '#2fb59f',
    trim: '#0f766e',
    backdrop: '#cdf3ea',
    prop: 'book',
    lanyard: true,
  },
  2: {
    skin: skin.c,
    hair: 'short',
    hairColour: '#2b1d16',
    outfit: '#ffffff',
    trim: '#e2562a',
    backdrop: '#ffdccb',
    prop: 'heart',
    glasses: true,
  },
  3: {
    skin: skin.d,
    hair: 'cap',
    hairColour: '#2b1d16',
    outfit: '#2f3f8f',
    trim: '#24327a',
    backdrop: '#d6defc',
    prop: 'shield',
  },
  4: {
    skin: skin.a,
    hair: 'long',
    hairColour: '#3a2418',
    outfit: '#d6336c',
    trim: '#b1245a',
    backdrop: '#ffd6e3',
    prop: 'aid',
    vest: true,
  },
  5: {
    skin: skin.e,
    hair: 'side',
    hairColour: '#1c1410',
    outfit: '#6d4fd8',
    trim: '#5235b8',
    backdrop: '#e4dcff',
    prop: 'globe',
    lanyard: true,
  },
};

export const aidaPersona: Persona = {
  skin: skin.b,
  hair: 'tudung',
  hairColour: '#e2562a',
  outfit: '#2a1c14',
  trim: '#ff8a4c',
  backdrop: '#ffe2d1',
  headset: true,
};

// Demo profiles only: varied, fictional and not tied to any real person.
export const rolePersonas: Record<Role, Persona> = {
  executive: {
    skin: skin.c,
    hair: 'side',
    hairColour: '#1c1410',
    outfit: '#2a1c14',
    trim: '#e2562a',
    backdrop: '#ffd9c4',
    lanyard: true,
    prop: 'spark',
  },
  analyst: {
    skin: skin.a,
    hair: 'bun',
    hairColour: '#2b1d16',
    outfit: '#3b5bdb',
    trim: '#24327a',
    backdrop: '#dbe4ff',
    glasses: true,
    prop: 'chart',
  },
  contributor: {
    skin: skin.d,
    hair: 'curly',
    hairColour: '#1c1410',
    outfit: '#0f9d8a',
    trim: '#0f766e',
    backdrop: '#cdf3ea',
    prop: 'book',
  },
  steward: {
    skin: skin.b,
    hair: 'tudung',
    hairColour: '#c2410c',
    outfit: '#7c2d12',
    trim: '#9a3412',
    backdrop: '#ffe4cc',
    prop: 'check',
  },
  reviewer: {
    skin: skin.e,
    hair: 'short',
    hairColour: '#120d0a',
    outfit: '#6d4fd8',
    trim: '#5235b8',
    backdrop: '#e4dcff',
    glasses: true,
    prop: 'check',
  },
  'programme-manager': {
    skin: skin.c,
    hair: 'tudung',
    hairColour: '#d6336c',
    outfit: '#3a2418',
    trim: '#b1245a',
    backdrop: '#ffd6e3',
    lanyard: true,
    prop: 'chart',
  },
  'restricted-analyst': {
    skin: skin.a,
    hair: 'short',
    hairColour: '#5a3a24',
    outfit: '#475569',
    trim: '#334155',
    backdrop: '#e2e8f0',
    glasses: true,
    prop: 'key',
  },
  secretariat: {
    skin: skin.d,
    hair: 'long',
    hairColour: '#1c1410',
    outfit: '#e2562a',
    trim: '#b93c0c',
    backdrop: '#ffdccb',
    prop: 'spark',
  },
  auditor: {
    skin: skin.b,
    hair: 'bald',
    hairColour: '#1c1410',
    outfit: '#1f2937',
    trim: '#d99a1e',
    backdrop: '#fdecc8',
    glasses: true,
    prop: 'check',
  },
  'organisation-admin': {
    skin: skin.e,
    hair: 'tudung',
    hairColour: '#0f766e',
    outfit: '#134e4a',
    trim: '#0f9d8a',
    backdrop: '#cdf3ea',
    lanyard: true,
    prop: 'key',
  },
  'platform-admin': {
    skin: skin.c,
    hair: 'curly',
    hairColour: '#2b1d16',
    outfit: '#24327a',
    trim: '#3b5bdb',
    backdrop: '#dbe4ff',
    headset: true,
    prop: 'key',
  },
  'indicator-admin': {
    skin: skin.a,
    hair: 'bun',
    hairColour: '#3a2418',
    outfit: '#d99a1e',
    trim: '#a16207',
    backdrop: '#fdecc8',
    prop: 'chart',
  },
};

export function TerasCharacter({
  n,
  size = 120,
  className,
}: {
  n: number;
  size?: number;
  className?: string;
}) {
  const persona = terasPersonas[n as 1 | 2 | 3 | 4 | 5];
  return persona ? <Character persona={persona} size={size} className={className} /> : null;
}

export function TerasEnsemble() {
  return (
    <div className="teras-ensemble" aria-hidden="true">
      {([1, 2, 3, 5] as const).map((n) => (
        <Character key={n} persona={terasPersonas[n]} size={112} className={`ensemble-${n}`} />
      ))}
    </div>
  );
}
