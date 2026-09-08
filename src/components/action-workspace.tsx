'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, CalendarClock, CheckCircle2, MessageSquare, Plus } from 'lucide-react';
import { Badge, Panel, EmptyState } from './ui';
import type { ActionDTO } from '@/lib/server/dal';
import type { NoteDTO, DecisionContext } from '@/lib/server/collaboration';
import { demoIdentities, stateNames } from '@/lib/domain/demo-identities';
import { actionLabels } from '@/lib/domain/actions';
import { dateBM } from '@/lib/domain/types';
export function ActionWorkspace({
  actions,
  notes,
  context,
  canAct,
  canComment,
  actor,
}: {
  actions: ActionDTO[];
  notes: NoteDTO[];
  context: DecisionContext;
  canAct: boolean;
  canComment: boolean;
  actor: string;
}) {
  const router = useRouter(),
    [pending, start] = useTransition(),
    [kind, setKind] = useState('action'),
    [body, setBody] = useState(''),
    [owner, setOwner] = useState('demo-programme-manager'),
    [due, setDue] = useState('2026-09-30'),
    [priority, setPriority] = useState('normal'),
    [message, setMessage] = useState(''),
    [error, setError] = useState(false),
    [evidence, setEvidence] = useState<Record<string, string>>({});
  function request(url: string, data: unknown) {
    start(async () => {
      try {
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await r.json();
        if (!r.ok) throw new Error(result.error);
        setError(false);
        setMessage('Rekod disimpan bersama konteks dan jejak audit.');
        setBody('');
        router.refresh();
      } catch (e) {
        setError(true);
        setMessage(e instanceof Error ? e.message : 'Permintaan gagal.');
      }
    });
  }
  return (
    <div className="stack">
      {message && (
        <div className={`notice ${error ? 'notice-error' : ''}`} role={error ? 'alert' : 'status'}>
          {message}
        </div>
      )}
      <div className="workflow-steps action-summary">
        {[
          ['Terbuka', actions.filter((a) => a.status === 'open').length],
          ['Dalam tindakan', actions.filter((a) => a.status === 'in-progress').length],
          ['Semakan', actions.filter((a) => a.status === 'review').length],
          ['Ditutup', actions.filter((a) => a.status === 'closed').length],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <div className="upload-layout">
        <Panel
          title="Keputusan seterusnya"
          kicker={`${stateNames[context.geography] ?? 'Malaysia'} · TERAS ${context.teras}`}
          demo
        >
          <div className="panel-body stack">
            <p className="body-copy">
              Konteks: {dateBM(context.period)} ·{' '}
              {context.publication ?? 'Ruang kerja geografi / Teras'} · definisi v1. Nota tidak
              mengubah data; pembetulan menggunakan semakan penyerahan.
            </p>
            {canComment ? (
              <>
                <label>
                  Jenis rekod
                  <select value={kind} onChange={(e) => setKind(e.target.value)}>
                    <option value="action" disabled={!canAct}>
                      Tindakan berakauntabiliti
                    </option>
                    <option value="note">Nota</option>
                    <option value="decision">Keputusan</option>
                  </select>
                </label>
                <label>
                  {kind === 'action' ? 'Tajuk tindakan' : 'Catatan konteks'}
                  <textarea
                    value={body}
                    maxLength={kind === 'action' ? 180 : 2000}
                    placeholder="Rekod demonstrasi tanpa maklumat individu."
                    onChange={(e) => setBody(e.target.value)}
                  />
                </label>
                {kind === 'action' && (
                  <div className="form-grid">
                    <label>
                      Pemilik
                      <select value={owner} onChange={(e) => setOwner(e.target.value)}>
                        {Object.values(demoIdentities)
                          .filter((p) => p.organisation === 'demo-a' || p.organisation === '*')
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label>
                      Tarikh siap
                      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
                    </label>
                    <label>
                      Keutamaan tindakan
                      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                        <option value="normal">Biasa</option>
                        <option value="high">Tinggi</option>
                        <option value="urgent">Segera</option>
                      </select>
                    </label>
                    <div className="muted-note">
                      Keutamaan tindakan dipilih oleh pengguna; ia bukan klasifikasi ancaman.
                    </div>
                  </div>
                )}
                <div className="form-actions">
                  <button
                    className="button button-primary"
                    disabled={pending || body.trim().length < 3 || (kind === 'action' && !canAct)}
                    onClick={() =>
                      request('/api/v1/actions', {
                        kind,
                        body,
                        context,
                        ...(kind === 'action' ? { owner, dueDate: due, priority } : {}),
                      })
                    }
                  >
                    <Plus size={14} />
                    Simpan{' '}
                    {kind === 'action' ? 'tindakan' : kind === 'decision' ? 'keputusan' : 'nota'}
                  </button>
                </div>
              </>
            ) : (
              <EmptyState
                title="Paparan sahaja"
                description="Peranan semasa tidak mempunyai kebenaran mencipta catatan atau tindakan."
              />
            )}
          </div>
        </Panel>
        <Panel title="Nota & keputusan dalam konteks" kicker="REKOD KEKAL" demo>
          {notes.length ? (
            <div className="panel-body note-stream">
              {notes.map((n) => (
                <article key={n.id}>
                  <div className="note-meta">
                    <MessageSquare size={14} />
                    <Badge>{n.kind === 'decision' ? 'Keputusan' : 'Nota'}</Badge>
                    <span>{dateBM(n.createdAt)}</span>
                  </div>
                  <p>{n.body}</p>
                  <small>
                    {n.author} · T{n.context.teras} · {n.context.geography}
                  </small>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada catatan"
              description="Nota dan keputusan akan kekal bersama tempoh, geografi dan versi konteks yang dirujuk."
            />
          )}
        </Panel>
      </div>
      <Panel title="Tindakan dalam skop" kicker="PEMILIK · TEMPOH · BUKTI · PENGESAH" demo>
        {actions.length ? (
          <div className="action-list">
            {actions.map((a) => (
              <article key={a.id} className={`action-record action-${a.status}`}>
                <div className="action-record-heading">
                  <div>
                    <Badge tone={a.priority === 'urgent' ? 'warning' : 'neutral'}>
                      {a.priority === 'normal'
                        ? 'Biasa'
                        : a.priority === 'high'
                          ? 'Keutamaan tinggi'
                          : 'Segera'}
                    </Badge>
                    <h3>{a.title}</h3>
                  </div>
                  <Badge tone={a.status === 'closed' ? 'source' : 'neutral'}>
                    {actionLabels[a.status]}
                  </Badge>
                </div>
                <div className="action-meta">
                  <span>{a.owner}</span>
                  <span>
                    <CalendarClock size={13} />
                    {dateBM(a.dueDate)}
                  </span>
                  <span>{stateNames[a.geography] ?? a.geography}</span>
                  <span>
                    T{a.teras} · r{a.revision}
                  </span>
                  <span>Umur {a.ageDays} hari</span>
                </div>
                <details className="chart-details">
                  <summary>Konteks, bukti & versi</summary>
                  <p>
                    DEMO / SYNTHETIC · {a.context.period} ·{' '}
                    {a.context.publication ?? 'Konteks Teras/geografi'} · definisi{' '}
                    {a.context.definition ?? 'v1'}.
                  </p>
                  <p>{a.evidence ?? 'Bukti belum disertakan.'}</p>
                  {a.verifiedBy && <p>Penutupan disahkan oleh {a.verifiedBy}.</p>}
                  <Link
                    className="text-link"
                    href={`/map?geography=${a.geography}&period=${a.context.period ?? '2026-08-09'}`}
                  >
                    Buka konteks peta
                    <ArrowUpRight size={13} />
                  </Link>
                </details>
                {canAct && a.status !== 'closed' && (
                  <div className="action-controls">
                    {a.status === 'in-progress' && (
                      <label>
                        Bukti pelaksanaan
                        <textarea
                          maxLength={2000}
                          value={evidence[a.id] ?? ''}
                          onChange={(e) => setEvidence({ ...evidence, [a.id]: e.target.value })}
                          placeholder="Rujukan bukti demo dan hasil tindakan yang boleh disemak."
                        />
                      </label>
                    )}
                    <div className="button-row">
                      {a.status === 'open' && (
                        <button
                          disabled={pending}
                          className="button button-secondary"
                          onClick={() =>
                            request(`/api/v1/actions/${a.id}`, {
                              status: 'in-progress',
                              revision: a.revision,
                            })
                          }
                        >
                          Mulakan tindakan
                        </button>
                      )}
                      {a.status === 'in-progress' && (
                        <button
                          disabled={pending || (evidence[a.id]?.trim().length ?? 0) < 3}
                          className="button button-secondary"
                          onClick={() =>
                            request(`/api/v1/actions/${a.id}`, {
                              status: 'review',
                              revision: a.revision,
                              evidence: evidence[a.id],
                            })
                          }
                        >
                          Hantar bukti untuk pengesahan
                        </button>
                      )}
                      {a.status === 'review' && (
                        <>
                          <button
                            className="button button-secondary"
                            disabled={pending}
                            onClick={() =>
                              request(`/api/v1/actions/${a.id}`, {
                                status: 'in-progress',
                                revision: a.revision,
                              })
                            }
                          >
                            Kembalikan untuk tindakan
                          </button>
                          <button
                            className="button button-primary"
                            disabled={pending || actor === a.owner || actor === a.evidenceBy}
                            onClick={() =>
                              request(`/api/v1/actions/${a.id}`, {
                                status: 'closed',
                                revision: a.revision,
                              })
                            }
                          >
                            <CheckCircle2 size={14} />
                            Sahkan penutupan
                          </button>
                          <span className="chart-caveat">
                            Pengesah mesti berasingan daripada pemilik dan penulis bukti.
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Tiada tindakan dalam penapis ini"
            description="Cipta tindakan pertama dengan pemilik, tarikh siap dan konteks yang jelas."
          />
        )}
      </Panel>
    </div>
  );
}
