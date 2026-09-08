export const terasInfo: Record<
  number,
  {
    title: string;
    subtitle: string;
    question: string;
    accent: string;
    committee: string;
    responsibility: string;
    source: string;
    caveat: string;
  }
> = {
  1: {
    title: 'Pendidikan pencegahan',
    subtitle: 'Jangkauan yang tepat. Perlindungan yang bermakna.',
    question: 'Di mana keperluan meningkat, dan adakah program mencapai kumpulan sasaran?',
    accent: 'teal',
    committee: 'JPPP',
    responsibility: 'explicitly assigned',
    source: 'DDN 2017, halaman 31 & 87',
    caveat:
      'Profil klien ialah konteks beban; ia tidak mengukur keberkesanan program pencegahan. Status berulang bukan relaps.',
  },
  2: {
    title: 'Rawatan dan pemulihan',
    subtitle: 'Fahami perjalanan jagaan, bukan sekadar jumlah klien.',
    question: 'Adakah akses, kesinambungan jagaan, susulan dan reintegrasi dapat dibezakan?',
    accent: 'blue',
    committee: 'JRP',
    responsibility: 'explicitly assigned',
    source: 'DDN 2017, halaman 87',
    caveat:
      'Tamat rawatan tidak bermaksud pulih berkekalan. Status berulang bukan relaps. Pemulihan memerlukan takrif yang diluluskan.',
  },
  3: {
    title: 'Penguatkuasaan',
    subtitle: 'Isyarat yang jelas. Respons yang bertanggungjawab.',
    question:
      'Bagaimanakah isyarat bekalan, respons bersama dan peringkat undang-undang dapat diteliti?',
    accent: 'amber',
    committee: 'JPU',
    responsibility: 'explicitly assigned',
    source: 'DDN 2017, halaman 87',
    caveat:
      'Aduan ialah isyarat, bukan kesalahan yang disahkan. Tangkapan orang disyaki bukan bukti bersalah, sabitan atau prevalens.',
  },
  4: {
    title: 'Pengurangan kemudaratan',
    subtitle: 'Kurangkan kemudaratan. Perluaskan akses perlindungan.',
    question: 'Di mana kemudaratan dan jurang liputan perkhidmatan memerlukan perhatian?',
    accent: 'rose',
    committee: 'Tanggungjawab bersama',
    responsibility: 'requires stakeholder validation',
    source: 'DDN 2017; pemilik khusus belum disahkan',
    caveat:
      'Laporan mingguan yang dibekalkan tidak mengandungi ukuran hasil kemudaratan ini. Semua senario di halaman ini ialah rekaan.',
  },
  5: {
    title: 'Kerjasama antarabangsa',
    subtitle: 'Daripada hubungan kepada komitmen yang dilaksanakan.',
    question: 'Adakah kerjasama menghasilkan tindakan, pemindahan amalan dan bukti penutupan?',
    accent: 'violet',
    committee: 'Tanggungjawab bersama',
    responsibility: 'requires stakeholder validation',
    source: 'DDN 2017; pemilik rakan belum disahkan',
    caveat:
      'Bilangan aktiviti tidak membuktikan impak antarabangsa. Rakan, instrumen dan komitmen demo bukan hubungan diplomatik sebenar.',
  },
};
export const preventionStrategies = [
  'Penyebaran maklumat',
  'Pendidikan pencegahan formal',
  'Pemerkasaan komuniti',
  'Persekitaran',
  'Identifikasi & rujukan',
  'Alternatif',
];
