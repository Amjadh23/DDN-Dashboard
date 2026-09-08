import Link from 'next/link';
import { ShieldCheck, LockKeyhole, ArrowUpRight } from 'lucide-react';
import { getSession } from '@/lib/server/auth';
import { getGovernance } from '@/lib/server/governance';
import { PageHeading, Panel, Badge, DemoBadge, EmptyState } from '@/components/ui';
import { GovernanceControls } from '@/components/governance-controls';
import { dateBM } from '@/lib/domain/types';
export const metadata = { title: 'Tadbir urus' };
const decisions = [
  [
    '01',
    'Struktur & pemilikan',
    'Hierarki semasa, organisasi peserta dan pemilik berakauntabiliti bagi setiap dataset/Teras.',
  ],
  [
    '02',
    'Takrif & hasil',
    'Aktif, baharu, berulang, tamat rawatan, pemulihan, kembali menggunakan bahan dan reintegrasi.',
  ],
  [
    '03',
    'Geografi & penyebut',
    'Sumber populasi, versi sempadan dan geografi terendah yang dibenarkan.',
  ],
  ['04', 'Kaedah ancaman', 'Indikator, komponen, wajaran, ambang dan peraturan data hilang.'],
  [
    '05',
    'Pendedahan & privasi',
    'Sel kecil, kestabilan kadar, eksport, perkongsian data dan retensi.',
  ],
  [
    '06',
    'Perkhidmatan & peringkat',
    'Modaliti rawatan, peringkat undang-undang dan skop perkhidmatan kemudaratan.',
  ],
  [
    '07',
    'Identiti & pengehosan',
    'Penyedia identiti, residensi, rangkaian, storan dan perkhidmatan pengimbas diluluskan.',
  ],
  [
    '08',
    'Operasi & penerimaan',
    'Sokongan, ketersediaan, RTO/RPO, peranti/pelayar dan pemilik operasi.',
  ],
];
export default async function GovernancePage() {
  const session = await getSession(),
    data = await getGovernance(session),
    admin = ['organisation-admin', 'platform-admin', 'indicator-admin'].includes(session.role);
  return (
    <div className="page-content">
      <PageHeading
        eyebrow="TADBIR URUS / KEPERCAYAAN"
        title="Bukti yang boleh dipertanggungjawabkan"
        description="Jejak keputusan, sempadan akses dan perkara yang memerlukan pengesahan sebelum penggunaan rasmi."
      >
        <Link className="button button-secondary" href="/indicators">
          Daftar indikator
          <ArrowUpRight size={14} />
        </Link>
      </PageHeading>
      <div className="stack">
        <div className="responsibility-strip">
          <ShieldCheck size={22} />
          <div>
            <strong>Prototaip V1 · setempat</strong>
            <span>Tiada kelulusan pengeluaran diandaikan</span>
          </div>
          <p>
            AADK: peneraju/penyelaras DDN2017. JPPP/JRP/JPU: Teras1/2/3. Penugasan ini{' '}
            <b>explicitly assigned</b> dalam sumber sejarah; struktur semasa masih perlu disahkan.
          </p>
        </div>
        <Panel
          title="Daftar keputusan pihak berkepentingan"
          kicker="KEPUTUSAN TERBUKA"
          action={<Badge tone="warning">Validation required</Badge>}
        >
          <div className="decision-grid">
            {decisions.map(([id, title, body]) => (
              <article key={id}>
                <span>{id}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <Badge tone="warning">Belum diputuskan</Badge>
              </article>
            ))}
          </div>
        </Panel>
        <div className="grid-2">
          <Panel title="Kawalan yang digunakan">
            <div className="panel-body">
              <p className="body-copy">
                Kebenaran pelayan menggabungkan peranan, organisasi, geografi, Teras, sensitiviti
                dan keadaan aliran kerja. Melihat, memuat naik, mengesahkan, meluluskan, menerbitkan
                dan mengeksport ialah kebenaran berasingan.
              </p>
              <p className="body-copy">
                Sel kecil dan sel pelengkap disekat di bawah peraturan demonstrasi v1. Fail
                disulitkan dalam kuarantin, diimbas dan dibaca oleh pekerja berasingan. Versi
                penerbitan dan audit tidak ditulis semula.
              </p>
              <DemoBadge />
            </div>
          </Panel>
          <Panel title="Perkara yang kekal dikunci">
            <div className="panel-body">
              <LockKeyhole size={24} />
              <p className="body-copy">
                Komposit ancaman, ambang rasmi, kadar berasaskan populasi rasmi, pemetaan daerah
                tanpa penyebut sah, pemulihan berkekalan dan skop klinikal yang belum diluluskan.
              </p>
              <p className="body-copy">
                Tiada pautan identiti individu, koordinat sensitif, dokumen diplomatik atau akses AI
                kepada rekod terhad.
              </p>
            </div>
          </Panel>
        </div>
        {admin && <GovernanceControls role={session.role} organisation={session.organisation} />}
        {data.access.length > 0 && (
          <Panel title="Versi skop terkini" demo>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Profil</th>
                    <th>Geografi</th>
                    <th>Teras</th>
                    <th>Kuat kuasa</th>
                  </tr>
                </thead>
                <tbody>
                  {data.access.map((a) => (
                    <tr key={a.actor}>
                      <td>{a.actor}</td>
                      <td>{a.geographies.join(', ')}</td>
                      <td>{a.teras.join(', ')}</td>
                      <td>{dateBM(a.effective)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
        {admin && (
          <Panel title="Sejarah rujukan demo" demo>
            {data.references.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Kod / nama</th>
                      <th>Jenis</th>
                      <th>Kuat kuasa</th>
                      <th>Status tanggungjawab</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.references.map((r) => (
                      <tr key={r.id}>
                        <td>
                          {r.code}
                          <br />
                          {r.name}
                        </td>
                        <td>{r.kind}</td>
                        <td>{dateBM(r.effective)}</td>
                        <td>{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="Belum ada tambahan rujukan"
                description="Rujukan demo baharu akan ditambah sebagai versi berkuat kuasa tarikh; sejarah dikekalkan."
              />
            )}
          </Panel>
        )}
        {session.role === 'platform-admin' && (
          <Panel title="Kesihatan barisan kerja" kicker="METADATA OPERASI">
            <div className="panel-body">
              <div className="button-row">
                {data.queue.map((q) => (
                  <Badge key={q.state}>
                    {q.state}: {q.jobs} kerja
                  </Badge>
                ))}
              </div>
              <p className="chart-caveat">
                Kegagalan pekerja direkodkan dengan kod selamat dan tempoh, tanpa baris fail. Kerja
                gagal boleh dicuba semula daripada penyerahan dalam skop penyumbang. Pentadbir
                platform tidak mewarisi akses data perniagaan.
              </p>
            </div>
          </Panel>
        )}
        <Panel title="Jejak audit kekal" kicker="AKTOR · TINDAKAN · OBJEK · MASA · HASIL">
          {session.role === 'auditor' ? (
            <div className="table-scroll">
              <table>
                <caption>
                  100 peristiwa terkini dalam skop juruaudit. Kandungan fail, token dan catatan
                  sensitif tidak direkodkan.
                </caption>
                <thead>
                  <tr>
                    <th>Masa / aktor</th>
                    <th>Peristiwa</th>
                    <th>Hasil</th>
                    <th>Objek / jejak</th>
                    <th>Sebab selamat</th>
                  </tr>
                </thead>
                <tbody>
                  {data.audit.map((a) => (
                    <tr key={a.id}>
                      <td>
                        {dateBM(a.time)}
                        <br />
                        {a.actor}
                      </td>
                      <td>{a.action}</td>
                      <td>{a.result}</td>
                      <td className="id-cell">
                        {a.object}
                        <br />
                        {a.correlation}
                      </td>
                      <td>{a.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Akses juruaudit diperlukan"
              description="Profil juruaudit boleh memeriksa peristiwa kekal. Kebenaran pentadbiran platform tidak memberikan akses audit secara automatik."
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
