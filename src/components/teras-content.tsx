import Link from 'next/link';
import { ArrowUpRight, LockKeyhole, CheckCircle2 } from 'lucide-react';
import { Panel, Badge, EmptyState } from './ui';
import { Bars, Funnel, LineChart, Matrix, DemoMetric, DemoSource, type ChartDatum } from './charts';
import { preventionStrategies } from '@/lib/domain/teras';

type Scenario = { value: (n: number) => number; scope: string; period: string; factor: number };
export const perspectives = [
  ['needs', 'Keperluan'],
  ['process', 'Proses'],
  ['outcomes', 'Hasil'],
  ['cost', 'Kos'],
  ['satisfaction', 'Kepuasan'],
] as const;
function data(labels: string[], values: number[], s: Scenario): ChartDatum[] {
  return labels.map((label, i) => ({ label, value: s.value(values[i]) }));
}
export function TerasContent({
  teras,
  perspective,
  scenario,
}: {
  teras: number;
  perspective: string;
  scenario: Scenario | null;
}) {
  if (!scenario)
    return (
      <Panel title="Senario tambahan">
        <EmptyState
          title="Tiada senario dalam skop ini"
          description="Penapis atau peranan semasa tidak membenarkan senario rekaan. Pilih DEMO / SYNTHETIC dan organisasi demo yang dibenarkan."
        />
      </Panel>
    );
  const s = scenario,
    v = s.value;
  if (perspective === 'cost')
    return (
      <div className="stack">
        <div className="metrics-grid">
          <DemoMetric
            period={s.period}
            scope={s.scope}
            label="Perbelanjaan demo"
            value={v(184000)}
            unit="RM"
            code={`D-T${teras}-COST`}
            description="Jumlah kos direkodkan dalam senario agregat; bukan peruntukan atau akaun kerajaan."
          />
          <DemoMetric
            period={s.period}
            scope={s.scope}
            label="Output disahkan dalam demo"
            value={v(800)}
            unit="output"
            code={`D-T${teras}-OUTPUT`}
            description="Bilangan output contoh yang ditandai lengkap; hasil berbeza tidak digabungkan."
          />
          <DemoMetric
            period={s.period}
            scope={s.scope}
            label="Kos per output demo"
            value={v(800) ? Math.round(v(184000) / v(800)) : null}
            unit="RM / output"
            code={`D-T${teras}-UNITCOST`}
            description="Kos senario dibahagi dengan output contoh. Bukan ukuran keberkesanan kos sebenar."
          />
          <DemoMetric
            period={s.period}
            scope={s.scope}
            label="Kos per hasil"
            value={null}
            unit="—"
            code={`D-T${teras}-OUTCOMECOST`}
            description="Perlu pengesahan — takrif hasil dan kaedah pengagihan kos belum diluluskan."
          />
        </div>
        <div className="grid-2">
          <Panel title="Komponen perbelanjaan" kicker="KOS DEMO" demo>
            <Bars
              data={data(
                ['Penyampaian', 'Pembangunan keupayaan', 'Sokongan & rujukan', 'Penilaian'],
                [88000, 43000, 35000, 18000],
                s,
              )}
              unit="RM"
              caption="Kos mengikut komponen"
            />
          </Panel>
          <Panel title="Jejak dan batasan kos">
            <div className="panel-body">
              <p className="body-copy">
                Setiap kos memerlukan tempoh, organisasi pembiaya, pusat kos, kaedah pengagihan dan
                output yang sepadan. Perbandingan antara program tidak wajar dibuat tanpa menyamakan
                skop dan definisi.
              </p>
              <div className="decision-placeholder">
                <LockKeyhole size={20} />
                <h3>Kaedah kos menunggu pengesahan</h3>
                <p>
                  Harga, peruntukan dan kesimpulan kecekapan rasmi tidak diasumsikan daripada
                  senario ini.
                </p>
              </div>
            </div>
          </Panel>
        </div>
        <DemoSource />
      </div>
    );
  if (perspective === 'satisfaction')
    return (
      <div className="stack">
        <div className="metrics-grid">
          <DemoMetric
            period={s.period}
            scope={s.scope}
            label="Respons diterima"
            value={v(360)}
            unit="respons"
            code={`D-T${teras}-RESPONSES`}
            description="Respons rekaan bagi latihan penilaian; tiada maklumat individu."
          />
          <DemoMetric
            period={s.period}
            scope={s.scope}
            label="Dijemput memberi maklum balas"
            value={v(600)}
            unit="jemputan"
            code={`D-T${teras}-INVITED`}
            description="Denominator respons: jemputan dalam senario, bukan populasi negara."
          />
          <DemoMetric
            period={s.period}
            scope={s.scope}
            label="Kadar respons demo"
            value={v(600) ? Math.round((v(360) / v(600)) * 100) : null}
            unit="%"
            code={`D-T${teras}-RESPONSE-RATE`}
            description="Respons / jemputan × 100. Bias bukan respons belum boleh ditentukan."
          />
          <DemoMetric
            period={s.period}
            scope={s.scope}
            label="Aduan perkhidmatan demo"
            value={v(24)}
            unit="aduan"
            code={`D-T${teras}-FEEDBACK`}
            description="Isyarat maklum balas rekaan, bukan kesalahan yang disahkan."
          />
        </div>
        <div className="grid-2">
          <Panel title="Pengalaman peserta / rakan" demo>
            <Bars
              data={data(
                ['Sangat berpuas hati', 'Berpuas hati', 'Neutral', 'Kurang berpuas hati'],
                [125, 163, 54, 18],
                s,
              )}
              unit="respons"
              caption="Taburan maklum balas demo"
            />
          </Panel>
          <Panel title="Halangan yang dilaporkan" demo>
            <Bars
              data={data(
                ['Masa / jadual', 'Jarak / pengangkutan', 'Maklumat tidak jelas', 'Akses sokongan'],
                [62, 49, 31, 22],
                s,
              )}
              unit="sebutan"
              caption="Halangan dalam senario, jawapan berbilang dibenarkan"
            />
          </Panel>
        </div>
        <div className="muted-note">
          Instrumen, skala, kaedah persampelan dan pemilik tinjauan rasmi perlu diluluskan. Rekod
          pentadbiran tidak mengukur penerimaan sosial atau stigma.
        </div>
        <DemoSource />
      </div>
    );
  if (teras === 1)
    return (
      <div className="stack">
        {perspective === 'needs' ? (
          <>
            <div className="metrics-grid">
              <DemoMetric
                period={s.period}
                scope={s.scope}
                label="Program dalam senario"
                value={v(128)}
                unit="program"
                code="D-T1-PROGRAMMES"
                description="Program contoh merentas tetapan pendidikan, keluarga, komuniti dan tempat kerja."
              />
              <DemoMetric
                period={s.period}
                scope={s.scope}
                label="Kumpulan layak demo"
                value={v(8600)}
                unit="sasaran"
                code="D-T1-ELIGIBLE"
                description="Denominator liputan ditetapkan dalam senario rekaan sahaja."
              />
              <DemoMetric
                period={s.period}
                scope={s.scope}
                label="Kehadiran direkodkan"
                value={v(6400)}
                unit="kehadiran"
                code="D-T1-REACH"
                description="Kehadiran bukan orang unik; deduplikasi mesti disahkan sebelum mengira jangkauan individu."
              />
              <DemoMetric
                period={s.period}
                scope={s.scope}
                label="Liputan demo"
                value={v(8600) ? Math.round((v(6400) / v(8600)) * 1000) / 10 : null}
                unit="%"
                code="D-T1-COVERAGE"
                description="Kehadiran senario / sasaran senario × 100; bukan ukuran kejayaan pencegahan."
              />
            </div>
            <div className="grid-2">
              <Panel title="Keperluan berbanding liputan" kicker={s.scope} demo>
                <Matrix
                  rows={['Segmen demo A', 'Segmen demo B', 'Segmen demo C', 'Segmen demo D']}
                  columns={['Keperluan demo', 'Dicapai demo', 'Belum dicapai']}
                  values={[
                    [v(980), v(420), v(560)],
                    [v(870), v(640), v(230)],
                    [v(740), v(390), v(350)],
                    [v(690), v(500), v(190)],
                  ]}
                  caption="Keperluan dan liputan rekaan"
                  unit="rekod sasaran"
                />
              </Panel>
              <Panel title="Trend jangkauan senario" demo>
                <LineChart
                  data={data(
                    ['5 Jul', '12 Jul', '19 Jul', '26 Jul', '2 Ogos', '9 Ogos'],
                    [720, 780, 815, 860, 910, 980],
                    s,
                  )}
                  unit="kehadiran"
                  caption="Kehadiran mingguan demo"
                />
              </Panel>
            </div>
          </>
        ) : perspective === 'process' ? (
          <>
            <div className="grid-2">
              <Panel title="Daripada sasaran kepada penilaian" kicker="ALIRAN PENYAMPAIAN" demo>
                <Funnel
                  data={data(
                    [
                      'Layak / disasarkan',
                      'Berdaftar',
                      'Hadir',
                      'Selesai',
                      'Dinilai',
                      'Peningkatan dinilai',
                    ],
                    [8600, 7200, 6400, 5600, 4800, 3200],
                    s,
                  )}
                  caption="Funnel penyampaian pencegahan"
                  note="Kiraan ialah tahap dalam kohort demo yang sama. Tidak semua peserta dinilai; peningkatan bukan bukti impak kausal."
                />
              </Panel>
              <Panel title="Kualiti pelaksanaan" demo>
                <Bars
                  data={[
                    { label: 'Kehadiran', value: 89 },
                    { label: 'Penyelesaian', value: 88 },
                    { label: 'Sesi mengikut jadual', value: 92 },
                    { label: 'Fasilitator dilatih', value: 84 },
                    { label: 'Pematuhan modul contoh', value: 81 },
                  ]}
                  unit="%"
                  caption="Proses penyampaian demo; setiap denominator terhad pada senario"
                />
              </Panel>
            </div>
            <Panel
              title="Enam strategi dasar, empat tetapan"
              kicker="KATEGORI POLICY · NILAI DEMO"
              demo
            >
              <Matrix
                rows={preventionStrategies}
                columns={['Pendidikan', 'Keluarga', 'Komuniti', 'Tempat kerja']}
                values={[
                  [32, 18, 26, 17],
                  [28, 9, 12, 8],
                  [4, 14, 31, 11],
                  [12, 8, 18, 16],
                  [9, 13, 16, 7],
                  [18, 15, 22, 12],
                ].map((r) => r.map(v))}
                caption="Matriks strategi dan tetapan"
              />
              <div className="panel-body">
                <p className="chart-caveat">
                  Nama strategi: DDN2017, halaman31. Angka program ialah rekaan; dasar tidak
                  membuktikan bahawa aktiviti ini telah dijalankan.
                </p>
              </div>
            </Panel>
          </>
        ) : (
          <>
            <div className="grid-2">
              <Panel title="Penilaian sebelum & selepas" demo>
                <Matrix
                  rows={[
                    'Pengetahuan',
                    'Faktor perlindungan',
                    'Kemahiran menolak',
                    'Mencari bantuan',
                  ]}
                  columns={['Sebelum', 'Selepas']}
                  values={[
                    [54, 71],
                    [61, 74],
                    [49, 68],
                    [58, 73],
                  ]}
                  caption="Skor instrumen rekaan — bukan instrumen sah"
                  unit="skor demo / 100"
                />
              </Panel>
              <Panel title="Rujukan dan susulan" demo>
                <Funnel
                  data={data(
                    [
                      'Dikenal pasti dalam senario',
                      'Ditawarkan rujukan',
                      'Menerima rujukan',
                      'Susulan direkodkan',
                    ],
                    [240, 216, 178, 142],
                    s,
                  )}
                  caption="Aliran rujukan pencegahan demo"
                  note="Instrumen penilaian rasmi, persetujuan dan definisi rujukan masih memerlukan pengesahan."
                />
              </Panel>
            </div>
            <div className="muted-note">
              Perubahan skor dalam kumpulan rekaan menunjukkan bentuk analisis. Ia bukan bukti
              program menyebabkan perubahan, dan bukan data responden sebenar.
            </div>
          </>
        )}
        <DemoSource />
      </div>
    );
  if (teras === 2)
    return (
      <div className="stack">
        {perspective === 'needs' ? (
          <>
            <div className="grid-2">
              <Panel title="Kapasiti dan permintaan perkhidmatan" demo>
                <Bars
                  data={data(
                    [
                      'Institusi — kapasiti contoh',
                      'Institusi — digunakan',
                      'Komuniti — slot contoh',
                      'Komuniti — digunakan',
                    ],
                    [1400, 1120, 2800, 2310],
                    s,
                  )}
                  unit="slot"
                  caption="Kapasiti perkhidmatan rekaan"
                />
              </Panel>
              <Panel title="Akses dan masa menunggu" demo>
                <Bars
                  data={[
                    { label: 'Rujukan ke saringan', value: 4 },
                    { label: 'Saringan ke permulaan', value: 8 },
                    { label: 'Permulaan susulan', value: 6 },
                  ]}
                  unit="hari median"
                  caption="Masa menunggu demo; bukan SLA rasmi"
                />
              </Panel>
            </div>
            <div className="grid-3">
              {[
                ['Kakitangan demo', v(128), 'petugas'],
                ['Rujukan diterima', v(1420), 'rujukan'],
                ['Saringan selesai', v(1210), 'saringan'],
              ].map(([label, value, unit]) => (
                <DemoMetric
                  period={s.period}
                  scope={s.scope}
                  key={String(label)}
                  label={String(label)}
                  value={Number(value)}
                  unit={String(unit)}
                  code={`D-T2-${label}`}
                  description="Rekod agregat rekaan bagi perancangan akses; bukan kapasiti fasiliti AADK sebenar."
                />
              ))}
            </div>
          </>
        ) : perspective === 'process' ? (
          <div className="grid-2">
            <Panel title="Pengekalan dalam jagaan" demo>
              <LineChart
                data={[
                  { label: 'Mula', value: 100 },
                  { label: '30 hari', value: 88 },
                  { label: '90 hari', value: 73 },
                  { label: '180 hari', value: 64 },
                ]}
                unit="% kohort layak"
                caption="Pengekalan kohort demo"
              />
            </Panel>
            <Panel title="Penggunaan dan kesinambungan" demo>
              <Bars
                data={[
                  { label: 'Penghunian institusi contoh', value: 80 },
                  { label: 'Pematuhan sesi contoh', value: 84 },
                  { label: 'Penilaian selepas rawatan', value: 72 },
                ]}
                unit="%"
                caption="Proses rawatan demo"
              />
              <div className="panel-body">
                <p className="chart-caveat">
                  Tempoh jagaan median demo: 84 hari. Rekod terhenti: {v(140)}; sebab dan definisi
                  dropout perlu disahkan.
                </p>
              </div>
            </Panel>
          </div>
        ) : (
          <>
            <div className="grid-2">
              <Panel title="Susulan mengikut horizon" demo>
                <Matrix
                  rows={['3 bulan', '6 bulan', '12 bulan']}
                  columns={['Layak demo', 'Dinilai', 'Tiada susulan']}
                  values={[
                    [v(640), v(580), v(60)],
                    [v(510), v(408), v(102)],
                    [v(360), v(252), v(108)],
                  ]}
                  caption="Susulan kohort rekaan, horizon berasingan"
                  unit="rekod"
                />
              </Panel>
              <Panel title="Pemulihan berkekalan">
                <div className="panel-body">
                  <div className="decision-placeholder">
                    <LockKeyhole size={22} />
                    <Badge tone="warning">Validation required</Badge>
                    <h3>Takrif pemulihan belum diluluskan</h3>
                    <p>
                      Tamat rawatan, susulan, kembali menggunakan bahan dan pemulihan ialah konsep
                      berbeza. Tiada skor atau kadar pemulihan direka.
                    </p>
                  </div>
                </div>
              </Panel>
            </div>
            <Panel title="Reintegrasi: domain yang perlu dinilai" kicker="KOMPONEN BERASINGAN" demo>
              <div className="domain-cards">
                {[
                  'Pekerjaan / pendidikan',
                  'Perumahan stabil',
                  'Sokongan keluarga',
                  'Sokongan komuniti',
                  'Stigma / diskriminasi',
                  'Kesihatan fizikal & mental',
                ].map((name) => (
                  <div key={name}>
                    <CheckCircle2 size={16} />
                    <h3>{name}</h3>
                    <p>Cadangan · Instrumen, kohort, tempoh susulan dan pemilik perlu disahkan.</p>
                  </div>
                ))}
              </div>
              <div className="panel-body">
                <p className="chart-caveat">
                  Komposit reintegrasi dinyahaktifkan. Kejadian buruk dan pengalaman klien/keluarga
                  memerlukan kontrak sumber berasingan.
                </p>
              </div>
            </Panel>
          </>
        )}
        <DemoSource />
      </div>
    );
  if (teras === 3)
    return (
      <div className="stack">
        {perspective === 'needs' ? (
          <div className="grid-2">
            <Panel title="Bahan × geografi" demo>
              <Matrix
                rows={['Skop A', 'Skop B', 'Skop C', 'Skop D']}
                columns={['Bahan demo A', 'Bahan demo B', 'Bahan demo C']}
                values={[
                  [24, 12, 7],
                  [18, 27, 8],
                  [31, 14, 11],
                  [16, 9, 6],
                ].map((r) => r.map(v))}
                caption="Isyarat bahan rekaan"
                unit="isyarat"
              />
            </Panel>
            <Panel title="Peristiwa dan kuantiti rampasan" demo>
              <Bars
                data={data(
                  ['Peristiwa bahan A', 'Peristiwa bahan B', 'Peristiwa bahan C'],
                  [76, 54, 31],
                  s,
                )}
                unit="peristiwa"
                caption="Peristiwa rampasan demo"
              />
              <div className="panel-body">
                <p className="chart-caveat">
                  Kuantiti senario: bahan A {v(120)} kg; bahan B {v(840)} tablet; bahan C {v(32)}{' '}
                  liter. Unit tidak dijumlahkan.
                </p>
              </div>
            </Panel>
          </div>
        ) : perspective === 'process' ? (
          <>
            <div className="grid-2">
              <Panel title="Peringkat undang-undang berasingan" demo>
                <Funnel
                  data={data(
                    [
                      'Aduan / isyarat',
                      'Operasi',
                      'Tangkapan',
                      'Siasatan',
                      'Pertuduhan',
                      'Pelupusan pendakwaan',
                      'Sabitan',
                    ],
                    [1200, 820, 710, 590, 370, 280, 180],
                    s,
                  )}
                  caption="Aliran undang-undang contoh"
                  note="Tahap ini bukan inferens daripada laporan AADK. Definisi dan padanan kohort kes sebenar belum disahkan; tangkapan bukan sabitan."
                />
              </Panel>
              <Panel title="Masa kitaran dan tunggakan" demo>
                <Bars
                  data={[
                    { label: 'Respons aduan', value: 3 },
                    { label: 'Permintaan maklumat', value: 7 },
                    { label: 'Semakan siasatan', value: 24 },
                    { label: 'Tunggakan contoh', value: 38 },
                  ]}
                  unit="hari median"
                  caption="Tempoh operasi rekaan"
                />
              </Panel>
            </div>
            <Panel title="Penyertaan bersama" demo>
              <Matrix
                rows={['Pasukan Demo A', 'Pasukan Demo B', 'Pasukan Demo C']}
                columns={['Operasi', 'Latihan', 'Permintaan', 'Pematuhan']}
                values={[
                  [18, 8, 32, 26],
                  [13, 6, 28, 19],
                  [9, 7, 16, 21],
                ].map((r) => r.map(v))}
                caption="Koordinasi organisasi rekaan"
              />
            </Panel>
          </>
        ) : (
          <>
            <div className="grid-2">
              <Panel title="Aset mengikut kedudukan undang-undang" demo>
                <Bars
                  data={data(
                    ['Dibekukan', 'Disita', 'Diperintah lucut hak', 'Dipulangkan'],
                    [480000, 310000, 120000, 40000],
                    s,
                  )}
                  unit="RM"
                  caption="Aset demo; peringkat tidak boleh dijumlahkan"
                />
              </Panel>
              <Panel title="Isyarat bekalan tambahan" demo>
                <Matrix
                  rows={['NPS', 'Prekursor', 'Makmal', 'Pintasan sempadan']}
                  columns={['Isyarat', 'Disemak', 'Tindakan demo']}
                  values={[
                    [18, 12, 8],
                    [24, 20, 11],
                    [7, 6, 4],
                    [31, 26, 19],
                  ].map((r) => r.map(v))}
                  caption="Senario keupayaan penguatkuasaan"
                />
                <div className="panel-body">
                  <p className="chart-caveat">
                    Indeks gangguan bekalan dinyahaktifkan; tiada taktik, pemberi maklumat, naratif
                    kes atau lokasi operasi didedahkan.
                  </p>
                </div>
              </Panel>
            </div>
            <div className="muted-note">
              Ukuran akhir dan peringkat undang-undang mesti menggunakan definisi serta kohort yang
              sepadan. Angka berasingan tidak membuktikan satu rantaian kes sebenar.
            </div>
          </>
        )}
        <DemoSource />
      </div>
    );
  if (teras === 4)
    return (
      <div className="stack">
        {perspective === 'needs' ? (
          <>
            <div className="metrics-grid">
              <DemoMetric
                period={s.period}
                scope={s.scope}
                label="Kejadian kemudaratan demo"
                value={v(420)}
                unit="kejadian"
                code="D-HARM"
                description="Kejadian rekaan untuk meneroka jurang perkhidmatan; bukan rekod klinikal."
              />
              <DemoMetric
                period={s.period}
                scope={s.scope}
                label="Jangkauan perkhidmatan"
                value={v(310)}
                unit="kontak"
                code="D-T4-CONTACTS"
                description="Kontak perkhidmatan tidak sama dengan orang unik atau kejadian."
              />
              <DemoMetric
                period={s.period}
                scope={s.scope}
                label="Kematian berkaitan dadah"
                value={null}
                unit="—"
                code="D-T4-DEATHS"
                description="Perlu pengesahan — definisi kematian dan perkaitan dadah belum diluluskan."
              />
              <DemoMetric
                period={s.period}
                scope={s.scope}
                label="Overdos fatal / tidak fatal"
                value={null}
                unit="—"
                code="D-T4-OVERDOSE"
                description="Kategori berasingan; tiada data dibekalkan atau definisi yang diluluskan."
              />
            </div>
            <div className="grid-2">
              <Panel title="Kemudaratan dan liputan" demo>
                <Matrix
                  rows={['Skop A', 'Skop B', 'Skop C']}
                  columns={['Keperluan', 'Dilayani', 'Jurang']}
                  values={[
                    [v(180), v(130), v(50)],
                    [v(140), v(110), v(30)],
                    [v(100), v(70), v(30)],
                  ]}
                  caption="Keperluan dan perkhidmatan dalam senario"
                  unit="rekod layak"
                />
              </Panel>
              <Panel title="Trend kejadian demo" demo>
                <LineChart
                  data={data(
                    ['5 Jul', '12 Jul', '19 Jul', '26 Jul', '2 Ogos', '9 Ogos'],
                    [72, 66, 81, 69, 63, 70],
                    s,
                  )}
                  unit="kejadian"
                  caption="Kemudaratan rekaan mengikut minggu"
                />
              </Panel>
            </div>
          </>
        ) : perspective === 'process' ? (
          <>
            <div className="grid-2">
              <Panel title="Daripada saringan kepada jagaan" demo>
                <Funnel
                  data={data(
                    [
                      'Saringan',
                      'Keputusan reaktif',
                      'Dirujuk',
                      'Memulakan jagaan',
                      'Penilaian susulan',
                    ],
                    [1200, 240, 216, 178, 142],
                    s,
                  )}
                  caption="Kaskad saringan demo"
                  note="Saringan, keputusan ujian dan hasil klinikal tidak boleh dianggap setara. Tiada data pesakit sebenar digunakan."
                />
              </Panel>
              <Panel title="Intervensi × geografi" demo>
                <Matrix
                  rows={['Skop A', 'Skop B', 'Skop C', 'Skop D']}
                  columns={['Outreach', 'Saringan', 'Rujukan', 'Susulan']}
                  values={[
                    [32, 26, 18, 15],
                    [28, 23, 17, 13],
                    [24, 19, 13, 11],
                    [21, 16, 12, 8],
                  ].map((r) => r.map(v))}
                  caption="Liputan intervensi rekaan"
                />
              </Panel>
            </div>
            <Panel title="Kontrak perkhidmatan yang dicadangkan">
              <div className="domain-cards">
                {[
                  'HIV / HBV / HCV',
                  'TB / STI',
                  'Rawatan berbantu ubat',
                  'Detoksifikasi',
                  'Kesihatan mental',
                  'Sokongan keluarga',
                ].map((x) => (
                  <div key={x}>
                    <h3>{x}</h3>
                    <p>
                      Cadangan · Definisi, skop klinikal, pemilik dan penyebut memerlukan
                      pengesahan.
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          </>
        ) : (
          <>
            <div className="grid-2">
              <Panel title="Pengekalan perkhidmatan demo" demo>
                <LineChart
                  data={[
                    { label: 'Mula', value: 100 },
                    { label: '30 hari', value: 86 },
                    { label: '90 hari', value: 74 },
                    { label: '180 hari', value: 68 },
                  ]}
                  unit="% kohort demo"
                  caption="Pengekalan rekaan, bukan hasil klinikal"
                />
              </Panel>
              <Panel title="Skop klinikal belum diluluskan">
                <div className="panel-body">
                  <div className="decision-placeholder">
                    <LockKeyhole size={21} />
                    <h3>Perkhidmatan tertentu dikunci</h3>
                    <p>
                      Nalokson dan peralatan steril tidak diaktifkan sebagai indikator. Skop rasmi
                      perlu disahkan dahulu.
                    </p>
                  </div>
                  <p className="chart-caveat">
                    Kemasukan kecemasan/hospital, kecederaan, perumahan, ekonomi dan hasil klinikal
                    memerlukan kontrak definisi serta pemilikan berasingan.
                  </p>
                </div>
              </Panel>
            </div>
            <div className="muted-note">
              Tiada ukuran kesihatan atau hasil dalam paparan ini diambil daripada laporan mingguan
              AADK. Pentafsiran mesti membezakan kejadian, kontak, ujian dan individu.
            </div>
          </>
        )}
        <DemoSource />
      </div>
    );
  return (
    <div className="stack">
      {perspective === 'needs' ? (
        <>
          <div className="metrics-grid">
            <DemoMetric
              period={s.period}
              scope={s.scope}
              label="Rakan dalam senario"
              value={5}
              unit="rakan"
              code="D-T5-PARTNERS"
              description="Lima rakan rekaan pada peta; bukan hubungan atau perjanjian sebenar."
            />
            <DemoMetric
              period={s.period}
              scope={s.scope}
              label="Instrumen aktif demo"
              value={v(12)}
              unit="instrumen"
              code="D-T5-INSTRUMENTS"
              description="Instrumen contoh mengikut kitaran hayat; pemilikan diplomatik belum disahkan."
            />
            <DemoMetric
              period={s.period}
              scope={s.scope}
              label="Komitmen terbuka"
              value={v(24)}
              unit="komitmen"
              code="D-T5-COMMITMENTS"
              description="Komitmen rekaan dengan pemilik, tarikh tamat dan bukti penutupan."
            />
            <DemoMetric
              period={s.period}
              scope={s.scope}
              label="Semakan hampir tiba"
              value={v(3)}
              unit="instrumen"
              code="D-T5-RENEWALS"
              description="Tarikh senario untuk menguji notis pembaharuan; bukan obligasi negara."
            />
          </div>
          <Panel title="Rakan × tema strategik" demo>
            <Matrix
              rows={[
                'Rakan demo A',
                'Rakan demo B',
                'Rakan demo C',
                'Rakan demo D',
                'Rakan demo E',
              ]}
              columns={['Latihan', 'Penyelidikan', 'Amalan', 'Pertukaran']}
              values={[
                [8, 2, 6, 5],
                [5, 4, 7, 6],
                [6, 8, 4, 3],
                [9, 5, 6, 8],
                [4, 7, 8, 5],
              ]}
              caption="Liputan tema rakan rekaan"
            />
          </Panel>
        </>
      ) : perspective === 'process' ? (
        <>
          <div className="grid-2">
            <Panel title="Hubungan kepada output yang disahkan" demo>
              <Funnel
                data={data(
                  [
                    'Penglibatan',
                    'Komitmen direkodkan',
                    'Tindakan dilaksana',
                    'Bukti diterima',
                    'Penutupan disahkan',
                  ],
                  [48, 36, 28, 23, 19],
                  s,
                )}
                caption="Kitaran kerjasama antarabangsa demo"
                note="Output berbeza tidak digabungkan menjadi skor impak. Bilangan aktiviti sahaja tidak membuktikan hasil domestik."
              />
            </Panel>
            <Panel title="Pertukaran maklumat mengikut masa" demo>
              <LineChart
                data={[
                  { label: 'Mac', value: 12 },
                  { label: 'Apr', value: 10 },
                  { label: 'Mei', value: 11 },
                  { label: 'Jun', value: 8 },
                  { label: 'Jul', value: 9 },
                  { label: 'Ogos', value: 7 },
                ]}
                unit="hari median"
                caption="Respons permintaan rekaan, tiada kandungan dilindungi"
              />
            </Panel>
          </div>
          <Panel title="Kitaran instrumen demo" demo>
            <div className="timeline">
              {[
                ['Draf', 'Rakan demo B', '12 Sep 2026'],
                ['Aktif', 'Rakan demo A', '30 Sep 2026'],
                ['Pembaharuan', 'Rakan demo D', '20 Sep 2026'],
                ['Semakan penutupan', 'Rakan demo C', '2 Nov 2026'],
              ].map(([stage, partner, date]) => (
                <div key={stage}>
                  <span />
                  <Badge>{stage}</Badge>
                  <h3>{partner}</h3>
                  <p>{date}</p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      ) : (
        <>
          <div className="grid-2">
            <Panel title="Pemindahan keupayaan" demo>
              <Funnel
                data={data(
                  [
                    'Latihan / penempatan',
                    'Selesai',
                    'Dinilai',
                    'Peningkatan dinilai',
                    'Amalan dipindahkan',
                  ],
                  [180, 162, 140, 112, 76],
                  s,
                )}
                caption="Saluran latihan dan amalan rekaan"
              />
            </Panel>
            <Panel title="Amalan daripada idea kepada penggunaan" demo>
              <Bars
                data={data(
                  [
                    'Dikenal pasti',
                    'Dinilai',
                    'Dirintis',
                    'Diterima pakai',
                    'Diperluas',
                    'Ditolak',
                  ],
                  [24, 19, 12, 8, 3, 4],
                  s,
                )}
                unit="amalan"
                caption="Status amalan demo, kategori tidak semestinya kohort tunggal"
              />
            </Panel>
          </div>
          <div className="muted-note">
            Bukti output bersama, peningkatan kompetensi dan ketepatan pelaporan perlu disahkan.
            Metadata perjanjian tidak memberikan akses kepada dokumen diplomatik atau operasi.
          </div>
        </>
      )}
      <DemoSource />
      <Panel title="Komitmen dengan akauntabiliti" demo>
        <div className="panel-body">
          <p className="body-copy">
            Setiap komitmen memerlukan pemilik, organisasi, tempoh, status, umur tindakan dan bukti
            yang boleh disemak. Penutupan perlu disahkan oleh aktor berasingan.
          </p>
          <Link
            className="button button-secondary"
            href="/actions?teras=5&geography=MY&publication=demo-t5-2026-08-09-v1"
          >
            Buka ruang tindakan
            <ArrowUpRight size={15} />
          </Link>
        </div>
      </Panel>
    </div>
  );
}
