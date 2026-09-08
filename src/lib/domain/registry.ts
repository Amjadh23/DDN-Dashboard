import type { MetricDefinition } from './types';

const weekly = 'Statistik Mingguan AADK — 9 Ogos 2026';
const supplied = [
  ['T2-CLIENTS', 'Jumlah klien AADK', 'AADK clients', 47084, 'klien', 2],
  ['T2-MANDATORY', 'Laluan mandatori', 'Mandatory pathway', 44906, 'klien', 2],
  ['T2-VOLUNTARY', 'Laluan sukarela', 'Voluntary pathway', 2178, 'klien', 2],
  ['T2-INSTITUTION', 'Rawatan dalam institusi', 'Institutional rehabilitation', 5260, 'klien', 2],
  ['T2-COMMUNITY', 'Rawatan dalam komuniti', 'Community rehabilitation', 41824, 'klien', 2],
  ['T2-PRIVATE', 'Pemulihan persendirian', 'Private rehabilitation', 1391, 'klien', 2],
  ['T2-PUSPEN', 'Kemudahan PUSPEN', 'PUSPEN facilities', 30, 'kemudahan', 2],
  ['T2-DISTRICTS', 'Daerah RPDK', 'Community districts', 108, 'daerah', 2],
  ['T2-PRIVATE-CENTRES', 'Pusat persendirian', 'Private centres', 47, 'pusat', 2],
  ['T3-COMPLAINTS', 'Aduan terkumpul', 'Cumulative complaints', 5208, 'aduan', 3],
  ['T3-WEEKLY', 'Aduan mingguan', 'Weekly complaints', 172, 'aduan', 3],
  ['T3-ARRESTS', 'Tangkapan orang disyaki', 'Suspected-person arrests', 24947, 'tangkapan', 3],
  ['T3-OKT', 'Jumlah OKT di PSPD', 'Detainees at PSPD', 303, 'OKT', 3],
  ['T3-CENTRES', 'Pusat PSPD', 'PSPD centres', 18, 'pusat', 3],
] as const;
export const suppliedValues = supplied.map(([code, , , value]) => ({ code, value }));

function definition(
  code: string,
  name: string,
  nameEn: string,
  unit: string,
  teras: number,
  origin: 'supplied' | 'synthetic',
): MetricDefinition {
  const real = origin === 'supplied';
  return {
    code,
    name,
    nameEn,
    teras,
    origin,
    purpose: real
      ? 'Memahami beban perkhidmatan dalam petikan laporan yang dibekalkan.'
      : 'Menguji aliran analisis dan perbincangan menggunakan agregat rekaan.',
    evidence: real ? 'Available' : 'Proposed',
    numerator: name,
    denominator: real
      ? 'Tidak berkenaan untuk kiraan; populasi rasmi belum diluluskan.'
      : 'Populasi/kelayakan rekaan dalam senario; bukan anggaran rasmi.',
    formula:
      'Bilangan rekod agregat dalam tempoh dan skop yang dinyatakan. Kadar demo = bilangan / populasi demo × 100,000.',
    unit,
    direction: 'Konteks diperlukan; kenaikan tidak semestinya hasil lebih baik atau lebih buruk.',
    dimensions: real ? ['tempoh', 'peringkat kebangsaan'] : ['tempoh', 'negeri', 'organisasi demo'],
    cadence: real ? 'Petikan mingguan' : 'Senario dua tempoh',
    freshness: real
      ? 'Satu petikan pada 9 Ogos 2026; tiada suapan langsung.'
      : 'Data tetap untuk demonstrasi; bukan laporan semasa.',
    source: real ? weekly : 'Penjana agregat demonstrasi v1 · DEMO / SYNTHETIC',
    sourcePage: real ? 2 : null,
    owner: real
      ? 'AADK (sumber laporan); pemilik indikator semasa belum disahkan'
      : 'Pasukan Demo A (identiti rekaan)',
    ownerStatus: 'requires stakeholder validation',
    qualityRules:
      'Nilai bukan negatif; unit dan tempoh konsisten; jumlah disemak; versi definisi dipelihara.',
    target: 'Validation required — tiada sasaran atau ambang ancaman diluluskan.',
    suppression: real
      ? 'Agregat kebangsaan yang sudah dipaparkan dalam sumber; eksport terhad kepada nilai ini.'
      : 'Demo disclosure v1: 1–4 disekat, satu sel tambahan disekat; jumlah yang boleh membongkar sel tidak dipaparkan.',
    interpretation: code.startsWith('T3-')
      ? 'Aduan ialah isyarat. Tangkapan orang disyaki tidak membuktikan kesalahan atau prevalens.'
      : code.startsWith('T2-')
        ? 'Kiraan klien bukan ukuran pemulihan berkekalan. Status berulang bukan relaps. PPP berasingan daripada jumlah AADK.'
        : 'Senario rekaan tidak membuktikan keberkesanan program atau hubungan sebab-akibat.',
    version: 'v1',
    effectiveFrom: real ? '2026-08-09' : '2026-09-07',
  };
}
export const metricDefinitions: MetricDefinition[] = [
  ...supplied.map(([code, name, nameEn, , unit, teras]) =>
    definition(code, name, nameEn, unit, teras, 'supplied'),
  ),
  ...(
    [
      ['D-BURDEN', 'Beban klien demo', 'Demonstration client burden', 'rekod', 2],
      [
        'D-SUPPLY',
        'Isyarat penguatkuasaan demo',
        'Demonstration enforcement signals',
        'isyarat',
        3,
      ],
      ['D-HARM', 'Kejadian kemudaratan demo', 'Demonstration harm events', 'kejadian', 4],
      [
        'D-GAP',
        'Keperluan perkhidmatan belum dipenuhi',
        'Unmet demonstration service need',
        'keperluan',
        1,
      ],
      ['D-CONFIDENCE', 'Kelengkapan medan demo', 'Demonstration field completeness', '%', 1],
      [
        'D-T1-REACH',
        'Kehadiran program demo',
        'Demonstration programme attendance',
        'kehadiran',
        1,
      ],
      ['D-T2-FOLLOWUP', 'Susulan dinilai demo', 'Demonstration assessed follow-up', 'penilaian', 2],
      ['D-T3-OPERATIONS', 'Operasi demo', 'Demonstration operations', 'operasi', 3],
      ['D-T4-SCREENING', 'Saringan demo', 'Demonstration screening', 'saringan', 4],
      ['D-T5-COMMITMENTS', 'Komitmen demo', 'Demonstration commitments', 'komitmen', 5],
      ['D-CAPACITY', 'Kapasiti perkhidmatan demo', 'Demonstration service capacity', 'tempat', 2],
      ['D-POPULATION', 'Populasi demo', 'Demonstration population', 'orang', 1],
    ] as const
  ).map(([code, name, nameEn, unit, teras]) =>
    definition(code, name, nameEn, unit, teras, 'synthetic'),
  ),
];
export const definitionByCode = (code: string) => metricDefinitions.find((d) => d.code === code);
