export type AssistantAnswer = {
  text: string;
  choices: string[];
  link?: { label: string; href: string };
};

export const starterChoices = ['Mulakan lawatan', 'Terangkan peta', 'Sumber data'];

export function assistantWelcome(path: string): AssistantAnswer {
  const context = path.startsWith('/map')
    ? 'Anda sedang meneroka peta strategik. Mahu saya terangkan lapisan atau cara memilih negeri?'
    : path.startsWith('/teras/')
      ? 'Anda sedang melihat salah satu daripada lima Teras DDN. Mahu memahami indikator, sumber data atau langkah seterusnya?'
      : 'Saya AIDA, pembantu digital Dasar Dadah Negara. Apa yang anda mahu terokai hari ini?';
  return { text: context, choices: starterChoices };
}

export function answerDemoQuestion(input: string): AssistantAnswer {
  const q = input.toLocaleLowerCase('ms').trim();
  if (/\bapi\b|chatgpt|model|betul.*ai|real ai|peraturan/.test(q))
    return {
      text: 'Saya menjawab berdasarkan panduan yang disediakan untuk dashboard ini dan tidak membaca nilai atau penapis semasa. Mahu cuba lawatan berpandu?',
      choices: ['Mulakan lawatan', 'Sumber data'],
    };
  if (/rawatan.*(?:saya|ubat)|diagnos|dos ubat|medical|diagnosis/.test(q))
    return {
      text: 'Saya hanya membantu navigasi dashboard dan tidak memberikan nasihat rawatan peribadi. Sila rujuk profesional kesihatan untuk keperluan rawatan. Mahu melihat tujuan halaman Rawatan & pemulihan?',
      choices: ['Lima teras', 'Sumber data'],
      link: { label: 'Buka Teras 2', href: '/teras/2' },
    };
  if (/lawatan|mula|tour|start|hello|hai|hi\b/.test(q))
    return {
      text: 'Mari mulakan dengan gambaran nasional untuk melihat ringkasan bersumber. Seterusnya, terokai peta senario demo dan pilih Teras yang berkaitan. Anda mahu melihat gambaran nasional atau mengenali lima Teras dahulu?',
      choices: ['Lima teras', 'Terangkan peta'],
      link: { label: 'Lihat gambaran nasional', href: '/' },
    };
  if (
    /sebenar|demo|sumber|data|official|real|\bangka\b|jumlah|berapa/.test(q) &&
    !/muat naik|upload/.test(q)
  )
    return {
      text: 'Label “Data dibekalkan” merujuk petikan sumber yang dinyatakan pada skrin. Label “DEMO / SYNTHETIC” menandakan senario rekaan. Saya tidak membaca nilai atau penapis semasa; buka “Definisi & sumber” pada kad untuk menyemaknya. Mahu melihat daftar indikator atau memahami peta demo?',
      choices: ['Terangkan peta', 'Daftar indikator'],
      link: { label: 'Semak katalog data', href: '/data/catalog' },
    };
  if (/peta|map|negeri|lapisan|kadar|bilangan|warna/.test(q))
    return {
      text: 'Pilih lapisan dan negeri. Dalam mod kadar, hijau bermaksud rendah, kuning sederhana dan merah tinggi secara relatif dalam senario demo. Julat kadar positif paparan dibahagi tiga; buka kaedah legenda untuk had semasa. Ini bukan tahap ancaman rasmi. Keyakinan data kekal biru dan mod bilangan menggunakan saiz simbol. Mahu memahami data yang disekat atau mencipta tindakan?',
      choices: ['Apa maksud disekat?', 'Cipta tindakan'],
      link: { label: 'Terokai peta strategik', href: '/map' },
    };
  if (/disekat|suppres|sifar|zero|tiada nilai/.test(q))
    return {
      text: 'Sifar bermaksud nilai yang dilaporkan ialah 0. “Disekat” bermaksud nilai tidak dipaparkan kerana kawalan pendedahan. “Tidak diketahui” dan “Tidak dikumpul” juga berbeza daripada sifar. Corak dan label peta membantu membezakannya. Mahu menyemak sumber atau beralih ke jadual peta?',
      choices: ['Sumber data', 'Terangkan peta'],
    };
  if (/teras|pillar|pemulihan|pencegahan|harm/.test(q))
    return {
      text: 'Lima Teras ialah Pendidikan Pencegahan; Rawatan dan Pemulihan; Penguatkuasaan; Pengurangan Kemudaratan; dan Kerjasama Antarabangsa. Setiap halaman membantu meneroka keperluan, proses, hasil, kos dan kepuasan. Mahu mencuba halaman rawatan atau aliran kerjasama?',
      choices: ['Muat naik data', 'Cipta tindakan'],
      link: { label: 'Terokai Rawatan & pemulihan', href: '/teras/2' },
    };
  if (/muat naik|upload|kelulusan|approve|workflow|aliran/.test(q))
    return {
      text: 'Aliran demo: penyumbang memuat naik → pengesahan fail → penjaga data mengesahkan sumber → penyemak bebas meluluskan → sekretariat menerbitkan. Penyerahan mesti lulus semakan; penghantar tidak boleh meluluskan sendiri. Pilih profil yang sesuai di penjuru atas. Mahu melihat hab data atau tindakan bersama?',
      choices: ['Cipta tindakan', 'Sumber data'],
      link: { label: 'Buka hab data', href: '/data/uploads' },
    };
  if (/tindakan|action|kerjasama/.test(q))
    return {
      text: 'Gunakan “Cipta tindakan” pada halaman berkaitan untuk membawa pemerhatian ke ruang tindakan bersama. Tetapkan pemilik, tarikh akhir dan bukti yang diperlukan. Saya boleh membuka halaman, tetapi tidak mencipta atau mengubah rekod bagi pihak anda. Mahu terus ke ruang tindakan atau melihat laporan?',
      choices: ['Laporan', 'Mulakan lawatan'],
      link: { label: 'Buka tindakan bersama', href: '/actions' },
    };
  if (/indikator|definisi|indicator/.test(q))
    return {
      text: 'Daftar indikator menerangkan maksud ukuran, unit, formula, sumber dan batas tafsiran. Ini tempat untuk menyemak sesuatu angka sebelum menggunakannya dalam perbincangan. Mahu melihat daftar itu atau kembali ke peta?',
      choices: ['Terangkan peta', 'Lima teras'],
      link: { label: 'Buka daftar indikator', href: '/indicators' },
    };
  if (/laporan|report|eksport|export/.test(q))
    return {
      text: 'Ruang laporan menyimpan paparan dan menyediakan eksport mengikut kebenaran profil. Label sumber dan demo perlu kekal bersama hasil eksport. Untuk mencuba, pilih profil Penganalisis sebelum mencuba fungsi laporan. Mahu membuka laporan atau bermula semula?',
      choices: ['Mulakan lawatan', 'Cipta tindakan'],
      link: { label: 'Buka laporan & paparan', href: '/reports' },
    };
  return {
    text: 'Saya belum mempunyai jawapan berpandu untuk soalan itu. Saya boleh membantu tentang peta, lima Teras, sumber data, muat naik dan tindakan. Bahagian mana yang anda mahu terokai?',
    choices: starterChoices,
  };
}
