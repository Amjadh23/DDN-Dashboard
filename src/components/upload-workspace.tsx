'use client';
import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UploadCloud, FileCheck2, RefreshCw, ArrowUpRight, Download } from 'lucide-react';
import { templates, uploadDictionary, templateCSV, type TemplateId } from '@/lib/domain/uploads';
import { workflowLabels } from '@/lib/domain/workflow';
import { stateNames } from '@/lib/domain/demo-identities';
import { formatNumber, dateBM } from '@/lib/domain/types';
import type { SubmissionDTO } from '@/lib/server/workflow';
import { Panel, DemoBadge, Badge, EmptyState } from './ui';
import { Disclosure } from './disclosure';
import { RecordList } from './record-list';
import { actorName, geographyName, organisationName } from '@/lib/domain/display';
function download(content: string, name: string) {
  const a = document.createElement('a'),
    url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
export function UploadWorkspace({
  submissions,
  canUpload,
}: {
  submissions: SubmissionDTO[];
  canUpload: boolean;
  role: string;
}) {
  const router = useRouter(),
    [pending, start] = useTransition(),
    [template, setTemplate] = useState<TemplateId>('aggregate'),
    [teras, setTeras] = useState(2),
    [geography, setGeography] = useState('MY-01'),
    [period, setPeriod] = useState('2026-08-09'),
    [file, setFile] = useState<File | null>(null),
    [synthetic, setSynthetic] = useState(false),
    [message, setMessage] = useState(''),
    [error, setError] = useState(false),
    [selected, setSelected] = useState(
      submissions.find((s) => !['published', 'rejected'].includes(s.state))?.id ??
        submissions[0]?.id ??
        '',
    ),
    [reason, setReason] = useState(''),
    [attestation, setAttestation] = useState(false),
    [predecessor, setPredecessor] = useState(''),
    [view, setView] = useState('current');
  const active = submissions.find((s) => s.id === selected) ?? submissions[0];
  const current = submissions.filter((s) => !['published', 'rejected'].includes(s.state));
  const shown =
    view === 'history'
      ? submissions.filter((s) => ['published', 'rejected'].includes(s.state))
      : current;
  const busy = submissions.some((s) => ['quarantined', 'validating'].includes(s.state));
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => router.refresh(), 2500);
    return () => clearInterval(timer);
  }, [busy, router]);
  async function submit() {
    setError(false);
    setMessage('');
    if (!file || !synthetic) {
      setError(true);
      setMessage('Pilih fail dan sahkan penggunaan data rekaan sahaja.');
      return;
    }
    start(async () => {
      try {
        const format = file.name.toLowerCase().endsWith('.xlsx')
          ? 'xlsx'
          : file.name.toLowerCase().endsWith('.csv')
            ? 'csv'
            : null;
        if (!format || file.size > 2 * 1024 * 1024)
          throw new Error('CSV/XLSX sahaja, maksimum 2 MB.');
        const r = await fetch('/api/v1/uploads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template,
            teras,
            geography,
            period,
            format,
            synthetic: true,
            ...(predecessor ? { predecessor, revisionReason: reason } : {}),
          }),
        });
        const target = await r.json();
        if (!r.ok) throw new Error(target.error);
        const upload = await fetch(target.url, {
          method: 'PUT',
          headers: { 'x-upload-token': target.token, 'Content-Type': 'application/octet-stream' },
          body: file,
        });
        const result = await upload.json();
        if (!upload.ok) throw new Error(result.error);
        setSelected(target.id);
        setMessage('Fail dalam kuarantin. Pekerja akan mengimbas dan mengesahkan sebelum semakan.');
        router.refresh();
      } catch (e) {
        setError(true);
        setMessage(e instanceof Error ? e.message : 'Permintaan gagal.');
      }
    });
  }
  function act(operation: string) {
    if (!active) return;
    start(async () => {
      setError(false);
      try {
        const r = await fetch(`/api/v1/uploads/${active.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            operation === 'retry'
              ? { operation }
              : { operation, revision: active.revision, reason, attestation },
          ),
        });
        const result = await r.json();
        if (!r.ok) throw new Error(result.error);
        setMessage('Keadaan dikemas kini. Jejak audit dan versi dipelihara.');
        setReason('');
        setAttestation(false);
        router.refresh();
      } catch (e) {
        setError(true);
        setMessage(e instanceof Error ? e.message : 'Permintaan gagal.');
      }
    });
  }
  function revise() {
    if (!active?.publication) return;
    setPredecessor(active.publication);
    setTemplate(active.template as TemplateId);
    setTeras(active.teras);
    setGeography(active.geography);
    setPeriod(active.period);
    setReason('');
    setMessage(
      'Semakan baharu: muat naik fail pembetulan dan rekod sebab. Penerbitan terdahulu kekal.',
    );
    document.getElementById('upload-form')?.scrollIntoView({ behavior: 'smooth' });
  }
  return (
    <div className="stack">
      {message && (
        <div role={error ? 'alert' : 'status'} className={`notice ${error ? 'notice-error' : ''}`}>
          {message}
        </div>
      )}
      <Disclosure
        title="Aliran semakan & penerbitan"
        meta="Penghantar, penjaga data, penyemak bebas dan sekretariat"
      >
        <div className="workflow-steps">
          {[
            'Templat',
            'Kuarantin & imbasan',
            'Validasi',
            'Pengesahan penjaga',
            'Semakan bebas',
            'Penerbitan',
          ].map((s, i) => (
            <div key={s}>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <strong>{s}</strong>
            </div>
          ))}
        </div>
      </Disclosure>
      <Panel
        title="Penyerahan & sejarah versi"
        kicker="KERJA SEMASA & REKOD TERDAHULU"
        action={
          <button className="button button-secondary" onClick={() => router.refresh()}>
            <RefreshCw size={13} />
            Segar semula
          </button>
        }
      >
        <div className="panel-body">
          <label className="compact-select">
            Paparan penyerahan
            <select value={view} onChange={(e) => setView(e.target.value)}>
              <option value="current">Perlu tindakan ({current.length})</option>
              <option value="history">
                Sejarah penerbitan & penolakan ({submissions.length - current.length})
              </option>
            </select>
          </label>
        </div>
        {shown.length ? (
          <RecordList key={view} label="penyerahan" size={4} className="submission-list">
            {shown.map((s) => (
              <button
                key={s.id}
                className={`submission-row ${active?.id === s.id ? 'selected-row' : ''}`}
                aria-pressed={active?.id === s.id}
                onClick={() => setSelected(s.id)}
              >
                <span>
                  <strong>{templates.find((t) => t.id === s.template)?.name ?? s.template}</strong>
                  <small>
                    {geographyName(s.geography)} · Teras {s.teras} · {dateBM(s.period)}
                  </small>
                </span>
                <span>
                  <Badge
                    tone={
                      s.state === 'invalid' || s.state === 'rejected'
                        ? 'warning'
                        : s.state === 'published'
                          ? 'source'
                          : 'neutral'
                    }
                  >
                    {workflowLabels[s.state]}
                  </Badge>
                  <DemoBadge />
                </span>
              </button>
            ))}
          </RecordList>
        ) : (
          <EmptyState
            title={
              view === 'history'
                ? 'Belum ada sejarah penyerahan'
                : 'Tiada penyerahan menunggu tindakan'
            }
            description={
              view === 'history'
                ? 'Versi diterbitkan dan penolakan akan kekal di sini.'
                : 'Sediakan penyerahan baharu atau buka sejarah untuk melihat versi terdahulu.'
            }
          />
        )}
      </Panel>
      {active && (
        <Panel title="Semakan penyerahan dipilih" kicker={workflowLabels[active.state]} demo>
          <div className="panel-body stack">
            <p className="next-step">
              <strong>Seterusnya:</strong>{' '}
              {
                {
                  draft: 'Penyumbang melengkapkan muat naik fail.',
                  quarantined: 'Tunggu keputusan imbasan dan semakan fail.',
                  validating:
                    'Semakan fail sedang dijalankan. Paparan dikemas kini secara automatik.',
                  invalid: 'Penyumbang membetulkan ralat yang disenaraikan.',
                  validated: 'Penjaga data mengesahkan sumber, liputan dan kualiti.',
                  submitted: 'Penyemak bebas meluluskan atau menolak dengan sebab.',
                  approved: 'Sekretariat menerbitkan versi yang diluluskan.',
                  published:
                    'Versi tersedia untuk analisis. Pembetulan menggunakan semakan baharu.',
                  rejected: 'Semak sebab penolakan dan sediakan penyerahan pembetulan.',
                }[active.state]
              }
            </p>
            <Disclosure
              title="Pemilik, sumber & jejak versi"
              meta={`${organisationName(active.organisation)} · Dikemas kini ${dateBM(active.updatedAt)}`}
            >
              <div className="metadata-grid">
                <div>
                  <strong>Sumber & pemilik demo</strong>
                  <p>
                    {organisationName(active.organisation)} · {actorName(active.submitter)}
                  </p>
                </div>
                <div>
                  <strong>Jejak versi</strong>
                  <p>
                    Semakan kerja {active.revision} · {active.publication ?? 'Belum diterbitkan'}
                    {active.predecessor && <> · Semakan {active.predecessor}</>}
                  </p>
                </div>
                <div>
                  <strong>Imbasan fail</strong>
                  <p>
                    {active.scanStatus === 'clean'
                      ? 'Bersih'
                      : active.scanStatus === 'failed'
                        ? 'Gagal — penerbitan dihalang'
                        : 'Menunggu'}
                  </p>
                </div>
              </div>
            </Disclosure>
            {active.errors.length > 0 && (
              <>
                <div className="notice notice-error" role="status">
                  {active.errors.length} ralat. Pembetulan diperlukan sebelum penyerahan.
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>Baris</th>
                        <th>Medan</th>
                        <th>Pembetulan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {active.errors.map((issue, i) => (
                        <tr key={i}>
                          <td>{issue.row || 'Fail'}</td>
                          <td>{issue.column}</td>
                          <td>{issue.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="button button-secondary"
                  onClick={() =>
                    download(
                      [
                        'row,column,code,message',
                        ...active.errors.map((e) =>
                          [e.row, e.column, e.code, e.message]
                            .map((v) => `"${String(v).replaceAll('"', '""')}"`)
                            .join(','),
                        ),
                      ].join('\r\n'),
                      `demo-validation-${active.id}.csv`,
                    )
                  }
                >
                  Muat turun ralat CSV
                </button>
                {canUpload && active.scanStatus === 'failed' && (
                  <button
                    disabled={pending}
                    className="button button-secondary"
                    onClick={() => act('retry')}
                  >
                    Cuba semula imbasan
                  </button>
                )}
              </>
            )}
            {active.warnings.length > 0 && (
              <div className="notice">
                {active.warnings.map((w) => (
                  <p key={`${w.row}-${w.code}`}>{w.message}</p>
                ))}
                Justifikasi mesti disertakan dalam pengesahan dan semakan.
              </div>
            )}
            {active.preview.length > 0 && (
              <div className="table-scroll">
                <table>
                  <caption>
                    Pratonton terkawal · DEMO / SYNTHETIC · sehingga 20 daripada {active.rows} baris
                  </caption>
                  <thead>
                    <tr>
                      <th>Indikator</th>
                      <th>Geografi</th>
                      <th>Nilai</th>
                      <th>Unit</th>
                      <th>Penyebut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {active.preview.map((r, i) => (
                      <tr key={i}>
                        <td>{r.code}</td>
                        <td>{r.geography}</td>
                        <td>{r.state === 'suppressed' ? 'Disekat' : formatNumber(r.value)}</td>
                        <td>{r.unit}</td>
                        <td>{formatNumber(r.denominator)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="chart-caveat">
                  Nilai 1–4 dan sel pelengkap disekat di bawah peraturan demo v1. Tiada jumlah yang
                  membongkar nilai kecil.
                </p>
              </div>
            )}
            {active.reason && <p className="body-copy">Sebab terkawal: {active.reason}</p>}
            {(active.canSubmit || active.canApprove || active.canPublish) && (
              <>
                <label>
                  Sebab / justifikasi
                  <textarea
                    value={reason}
                    maxLength={500}
                    placeholder="Rekod semakan sumber, liputan, kualiti dan keputusan."
                    onChange={(e) => setReason(e.target.value)}
                  />
                </label>
                {active.canSubmit && (
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={attestation}
                      onChange={(e) => setAttestation(e.target.checked)}
                    />
                    Sumber, liputan, kualiti dan semua amaran telah disemak. Data ini rekaan.
                  </label>
                )}
                <div className="button-row">
                  {active.canSubmit && (
                    <button
                      disabled={pending || !attestation || reason.trim().length < 3}
                      className="button button-primary"
                      onClick={() => act('submit')}
                    >
                      Sahkan & hantar untuk semakan
                    </button>
                  )}
                  {active.canApprove && (
                    <>
                      <button
                        disabled={pending || reason.trim().length < 3}
                        className="button button-secondary"
                        onClick={() => act('reject')}
                      >
                        Tolak dengan sebab
                      </button>
                      <button
                        disabled={pending || reason.trim().length < 3}
                        className="button button-primary"
                        onClick={() => act('approve')}
                      >
                        Luluskan versi
                      </button>
                    </>
                  )}
                  {active.canPublish && (
                    <button
                      disabled={pending || reason.trim().length < 3}
                      className="button button-primary"
                      onClick={() => act('publish')}
                    >
                      Terbitkan DEMO / SYNTHETIC
                    </button>
                  )}
                </div>
              </>
            )}
            {active.state === 'published' && (
              <div className="button-row">
                <Link
                  href={`/map?geography=${active.geography}&period=${active.period}&layer=${active.teras === 3 ? 'supply' : active.teras === 4 ? 'harm' : 'burden'}`}
                  className="button button-secondary"
                >
                  Lihat peta
                  <ArrowUpRight size={13} />
                </Link>
                {canUpload && (
                  <button onClick={revise} className="button button-secondary">
                    Cipta semakan baharu
                  </button>
                )}
              </div>
            )}
            <p className="chart-caveat">
              Dikemas kini {dateBM(active.updatedAt)}. Penghantar tidak boleh meluluskan penyerahan
              sendiri. Pertukaran profil ialah simulasi aktor berasingan dalam prototaip setempat.
            </p>
          </div>
        </Panel>
      )}
      <Disclosure
        title={predecessor ? 'Muat naik semakan baharu' : 'Sediakan penyerahan baharu'}
        open={canUpload && (submissions.length === 0 || Boolean(predecessor))}
      >
        <div className="upload-layout">
          <Panel
            title={predecessor ? 'Semakan penerbitan' : 'Sediakan penyerahan'}
            kicker="DATA REKAAN SAHAJA"
            demo
          >
            <div className="panel-body" id="upload-form">
              <div className="form-grid">
                <label>
                  Templat domain
                  <select
                    value={template}
                    onChange={(e) => {
                      setTemplate(e.target.value as TemplateId);
                      const t = templates.find((t) => t.id === e.target.value);
                      if (t?.teras) setTeras(t.teras);
                    }}
                  >
                    {templates.map((t) => (
                      <option value={t.id} key={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Teras
                  <select
                    value={teras}
                    disabled={template !== 'aggregate'}
                    onChange={(e) => setTeras(Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        Teras {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Geografi
                  <select value={geography} onChange={(e) => setGeography(e.target.value)}>
                    <option value="MY">Malaysia (agregat kebangsaan)</option>
                    {Object.entries(stateNames).map(([id, name]) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Tempoh
                  <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                    <option value="2026-08-09">9 Ogos 2026</option>
                    <option value="2026-08-02">2 Ogos 2026</option>
                  </select>
                </label>
              </div>
              <div className="template-meta">
                <span>Skema 1.0</span>
                <span>Pasukan Demo A · pemilik perlu pengesahan</span>
                <span>Tarikh tutup rasmi belum ditetapkan</span>
              </div>
              <div className="button-row">
                <button
                  className="button button-secondary"
                  onClick={() =>
                    download(
                      templateCSV(template, { teras, geography, period, organisation: 'demo-a' }),
                      `demo-${template}-v1.csv`,
                    )
                  }
                >
                  <Download size={14} />
                  Contoh CSV
                </button>
                <a
                  className="button button-secondary"
                  href={`/api/v1/templates?template=${template}&teras=${teras}&geography=${geography}&period=${period}&format=xlsx`}
                >
                  <Download size={14} />
                  Contoh XLSX
                </a>
              </div>
              <p className="chart-caveat">
                Contoh boleh dimuat turun dan disunting sebagai data rekaan. Jangan muat naik nama,
                nombor pengenalan, naratif kes atau data peribadi. Maksimum 2 MB / 1,000 baris.
              </p>
              {canUpload ? (
                <>
                  <label className="upload-drop">
                    <UploadCloud size={30} />
                    <strong>Pilih fail untuk kuarantin</strong>
                    <span>CSV atau XLSX · tanpa formula atau makro</span>
                    <span className="button button-secondary">Pilih fail</span>
                    <span aria-live="polite">{file?.name ?? 'Belum ada fail dipilih'}</span>
                    <input
                      className="file-input-overlay"
                      aria-label="Pilih fail CSV atau XLSX"
                      type="file"
                      accept=".csv,.xlsx"
                      onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={synthetic}
                      onChange={(e) => setSynthetic(e.target.checked)}
                    />
                    Saya sahkan fail ini hanya mengandungi DEMO / SYNTHETIC dan tiada data peribadi.
                  </label>
                  {predecessor && (
                    <>
                      <p className="chart-caveat">Versi terdahulu: {predecessor}</p>
                      <label>
                        Sebab semakan
                        <textarea
                          value={reason}
                          maxLength={500}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </label>
                    </>
                  )}
                  <div className="form-actions">
                    {predecessor && (
                      <button
                        className="button button-secondary"
                        onClick={() => setPredecessor('')}
                      >
                        Batal semakan
                      </button>
                    )}
                    <button
                      className="button button-primary"
                      disabled={pending || !file || !synthetic}
                      onClick={submit}
                    >
                      {pending ? 'Memproses…' : 'Muat naik & kuarantin'}
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="muted-note">
                  Profil semasa tidak mempunyai kebenaran muat naik. Gunakan profil Penyumbang atau
                  Penjaga data untuk perjalanan demonstrasi ini.
                </div>
              )}
            </div>
          </Panel>
          <Panel title="Kontrak & kawalan" kicker="SUMBER → KEPUTUSAN">
            <div className="panel-body">
              <FileCheck2 size={28} className="teal-text" />
              <h3>Setiap versi mempunyai jejak</h3>
              <p className="body-copy">
                Fail disimpan secara peribadi dan disulitkan. Imbasan malware serta pembacaan
                berlaku dalam pekerja berasingan. Ralat menghalang penyerahan; penjaga data
                mengesahkan sumber, liputan dan kualiti.
              </p>
              <p className="body-copy">
                Penyemak bebas memerlukan sebab bagi kelulusan atau penolakan. Sekretariat
                menerbitkan versi diluluskan. Data demo tidak boleh menjadi penerbitan rasmi.
              </p>
              <details className="dictionary">
                <summary>Kamus data & nilai terkawal</summary>
                {uploadDictionary.map((d) => (
                  <p key={d.column}>
                    <code>{d.column}</code>
                    <br />
                    {d.instruction}
                  </p>
                ))}
              </details>
              <div className="muted-note">
                Tiada padanan individu atau pautan identiti. Definisi, pemilik, populasi dan
                peraturan rasmi masih memerlukan pengesahan.
              </div>
            </div>
          </Panel>
        </div>
      </Disclosure>
    </div>
  );
}
