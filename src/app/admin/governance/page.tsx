import Link from 'next/link';
import { LockKeyhole, ArrowUpRight } from 'lucide-react';
import { getSession } from '@/lib/server/auth';
import { getGovernance } from '@/lib/server/governance';
import { PageHeading, Panel, Badge, DemoBadge, EmptyState } from '@/components/ui';
import { GovernanceControls } from '@/components/governance-controls';
import { dateBM } from '@/lib/domain/types';
import { Disclosure } from '@/components/disclosure';
import { Responsibility } from '@/components/responsibility';
import { actorName, geographyName, displayLabel } from '@/lib/domain/display';
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
        <Responsibility />
        <Disclosure
          title="Keputusan pihak berkepentingan"
          meta="8 perkara untuk pengesahan sebelum penggunaan rasmi"
        >
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
        </Disclosure>
        <Disclosure
          title="Kawalan & batasan prototaip"
          meta="Akses, privasi, penerbitan & kaedah yang belum diluluskan"
        >
          <div className="grid-2">
            <Panel title="Kawalan yang digunakan">
              <div className="panel-body">
                <p className="body-copy">
                  Kebenaran pelayan menggabungkan peranan, organisasi, geografi, Teras, sensitiviti
                  dan keadaan aliran kerja. Melihat, memuat naik, mengesahkan, meluluskan,
                  menerbitkan dan mengeksport ialah kebenaran berasingan.
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
                  Tiada pautan identiti individu, koordinat sensitif, dokumen diplomatik atau akses
                  AI kepada rekod terhad.
                </p>
              </div>
            </Panel>
          </div>
        </Disclosure>
        {admin && (
          <Disclosure title="Urus skop profil & rujukan demo">
            <GovernanceControls role={session.role} organisation={session.organisation} />
          </Disclosure>
        )}
        {data.access.length > 0 && (
          <Disclosure
            title="Versi skop terkini"
            meta={`${data.access.length} profil · DEMO / SYNTHETIC`}
          >
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
                      <td>{actorName(a.actor)}</td>
                      <td>{a.geographies.map(geographyName).join(', ')}</td>
                      <td>{a.teras.join(', ')}</td>
                      <td>{dateBM(a.effective)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Disclosure>
        )}
        {admin && (
          <Disclosure
            title="Sejarah rujukan demo"
            meta={`${data.references.length} rekod · DEMO / SYNTHETIC`}
          >
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
                        <td>{displayLabel(r.kind)}</td>
                        <td>{dateBM(r.effective)}</td>
                        <td>{displayLabel(r.status)}</td>
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
          </Disclosure>
        )}
        {session.role === 'platform-admin' && (
          <Panel title="Kesihatan barisan kerja" kicker="METADATA OPERASI">
            <div className="panel-body">
              <div className="button-row">
                {data.queue.map((q) => (
                  <Badge key={q.state}>
                    {displayLabel(q.state)}: {q.jobs} kerja
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
        <Disclosure
          title="Jejak audit kekal"
          meta={
            session.role === 'auditor'
              ? `${data.audit.length} peristiwa terkini`
              : 'Akses juruaudit diperlukan'
          }
        >
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
        </Disclosure>
      </div>
    </div>
  );
}
