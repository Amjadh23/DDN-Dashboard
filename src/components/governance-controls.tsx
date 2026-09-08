'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Panel, DemoBadge } from './ui';
import { demoIdentities, stateNames } from '@/lib/domain/demo-identities';
export function GovernanceControls({ role, organisation }: { role: string; organisation: string }) {
  const router = useRouter(),
    [pending, start] = useTransition(),
    [actor, setActor] = useState('demo-contributor'),
    [geography, setGeography] = useState('*'),
    [teras, setTeras] = useState('all'),
    [reason, setReason] = useState(''),
    [name, setName] = useState(''),
    [code, setCode] = useState('demo-'),
    [kind, setKind] = useState('programme'),
    [effective, setEffective] = useState('2026-09-07'),
    [message, setMessage] = useState(''),
    [error, setError] = useState(false);
  const canScope = ['platform-admin', 'organisation-admin'].includes(role);
  function send(data: unknown) {
    start(async () => {
      try {
        const r = await fetch('/api/v1/governance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          }),
          result = await r.json();
        if (!r.ok) throw new Error(result.error);
        setError(false);
        setMessage('Versi pentadbiran demo direkodkan.');
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
        <div role={error ? 'alert' : 'status'} className={`notice ${error ? 'notice-error' : ''}`}>
          {message}
        </div>
      )}
      <div className="grid-2">
        {canScope && (
          <Panel title="Skop profil demonstrasi" kicker="AKSES BERKUAT KUASA SERTA-MERTA" demo>
            <div className="panel-body stack">
              <label>
                Profil sasaran
                <select value={actor} onChange={(e) => setActor(e.target.value)}>
                  {Object.values(demoIdentities)
                    .filter(
                      (p) =>
                        p.id !== `demo-${role}` &&
                        (organisation === '*' || p.organisation === organisation),
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <div className="form-grid">
                <label>
                  Geografi dibenarkan
                  <select value={geography} onChange={(e) => setGeography(e.target.value)}>
                    <option value="*">Semua geografi demo</option>
                    <option value="MY">Agregat kebangsaan sahaja</option>
                    {Object.entries(stateNames).map(([id, n]) => (
                      <option key={id} value={id}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Teras dibenarkan
                  <select value={teras} onChange={(e) => setTeras(e.target.value)}>
                    <option value="all">Semua Teras</option>
                    {[1, 2, 3, 4, 5].map((t) => (
                      <option key={t} value={t}>
                        Teras {t}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Sebab perubahan akses
                <textarea
                  maxLength={500}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <div className="button-row">
                <button
                  disabled={pending || reason.trim().length < 3}
                  className="button button-primary"
                  onClick={() =>
                    send({
                      operation: 'scope',
                      actor,
                      geographies: [geography],
                      teras: teras === 'all' ? [1, 2, 3, 4, 5] : [Number(teras)],
                      reason,
                    })
                  }
                >
                  Simpan versi skop
                </button>
                <button
                  disabled={pending || reason.trim().length < 3}
                  className="button button-secondary"
                  onClick={() => send({ operation: 'revoke', actor, reason })}
                >
                  Batalkan sesi aktif
                </button>
              </div>
              <p className="chart-caveat">
                Peranan dan organisasi asas kekal daripada profil demo. Pentadbir tidak boleh
                memberikan skop melebihi kebenaran sendiri. Pembatalan sesi berkuat kuasa pada
                permintaan seterusnya.
              </p>
            </div>
          </Panel>
        )}
        <Panel title="Rujukan berkuat kuasa tarikh" kicker="REKOD TAMBAHAN · SEJARAH KEKAL" demo>
          <div className="panel-body stack">
            <div className="form-grid">
              <label>
                Jenis rujukan
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  {[
                    ['organisation', 'Organisasi'],
                    ['programme', 'Program'],
                    ['facility', 'Fasiliti'],
                    ['partner', 'Rakan'],
                    ['forum', 'Forum'],
                  ].map(([v, n]) => (
                    <option key={v} value={v}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Kod demo
                <input value={code} maxLength={65} onChange={(e) => setCode(e.target.value)} />
              </label>
            </div>
            <label>
              Nama paparan demo
              <input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} />
            </label>
            <label>
              Tarikh kuat kuasa
              <input type="date" value={effective} onChange={(e) => setEffective(e.target.value)} />
            </label>
            <label>
              Sebab / sumber rujukan
              <textarea
                value={reason}
                maxLength={500}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <button
              className="button button-primary"
              disabled={
                pending ||
                name.length < 3 ||
                reason.trim().length < 3 ||
                !/^demo-[a-z0-9-]+$/.test(code)
              }
              onClick={() => send({ operation: 'reference', kind, code, name, effective, reason })}
            >
              Tambah versi rujukan
            </button>
            <DemoBadge />
            <p className="chart-caveat">
              Semua rujukan ini memerlukan pengesahan pihak berkepentingan. Penambahan tidak
              menetapkan pemilikan dasar, sasaran atau ambang ancaman rasmi.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
