'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  HeartPulse,
  ShieldCheck,
  HandHeart,
  Globe2,
  Database,
  BookOpen,
  ListChecks,
  FileBarChart2,
  Settings2,
  ChevronDown,
  Menu,
  X,
  ArrowUpRight,
  Layers3,
} from 'lucide-react';
import { roleLabels } from '@/lib/domain/demo-identities';
import type { Role } from '@/lib/domain/policy';

const navigation = [
  { href: '/', label: 'Gambaran nasional', icon: LayoutDashboard },
  { href: '/#pendidikan-pencegahan', label: 'Pendidikan pencegahan', icon: GraduationCap, n: '01' },
  { href: '/teras/2', label: 'Rawatan & pemulihan', icon: HeartPulse, n: '02' },
  { href: '/teras/3', label: 'Penguatkuasaan', icon: ShieldCheck, n: '03' },
  { href: '/teras/4', label: 'Pengurangan kemudaratan', icon: HandHeart, n: '04' },
  { href: '/teras/5', label: 'Kerjasama antarabangsa', icon: Globe2, n: '05' },
];
const workspace = [
  { href: '/data/uploads', label: 'Hab data', icon: Database },
  { href: '/data/catalog', label: 'Katalog data', icon: Layers3 },
  { href: '/indicators', label: 'Daftar indikator', icon: BookOpen },
  { href: '/actions', label: 'Tindakan bersama', icon: ListChecks },
  { href: '/reports', label: 'Laporan & paparan', icon: FileBarChart2 },
];
export function AppShell({
  children,
  session,
}: {
  children: React.ReactNode;
  session: { name: string; role: Role; id: string };
}) {
  const path = usePathname(),
    router = useRouter();
  const [open, setOpen] = useState(false),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  async function changeProfile(role: string) {
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/v1/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!r.ok) throw new Error('Profil tidak dapat ditukar.');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="app-frame">
      {open && (
        <button
          className="nav-backdrop"
          aria-label="Tutup navigasi"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Navigasi utama">
        <div className="brand">
          <Image
            className="brand-emblem"
            src="/aadk-logo.png"
            alt="Agensi Antidadah Kebangsaan"
            width={56}
            height={56}
            priority
          />
          <div>
            <strong>
              DDN<span className="brand-dot">.</span>
            </strong>
            <small>MALAYSIA</small>
          </div>
          <button
            className="icon-button mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
          >
            <X size={19} />
          </button>
        </div>
        <div className="brand-subtitle">DASAR DADAH NEGARA</div>
        <Link className="brand-mission" href="/" onClick={() => setOpen(false)}>
          <span className="mission-kicker">BUKTI MENJADI TINDAKAN</span>
          <strong>
            Lima teras.
            <br />
            Satu hala tuju.
          </strong>
          <span className="mission-link">
            Terokai peta strategik <ArrowUpRight size={15} />
          </span>
        </Link>
        <div className="nav-section-label">PUSAT STRATEGIK</div>
        <nav>
          {navigation.map((item, i) => (
            <div key={item.href}>
              {i === 2 && <div className="nav-section-label teras-nav-label">LIMA TERAS DASAR</div>}
              <Link
                className={`nav-item ${path === item.href ? 'active' : ''}`}
                href={item.href}
                aria-current={path === item.href ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                <item.icon size={17} strokeWidth={1.65} />
                <span>{item.label}</span>
                {item.n && <small>{item.n}</small>}
              </Link>
            </div>
          ))}
        </nav>
        <div className="nav-section-label">RUANG KOLABORASI</div>
        <nav>
          {workspace.map((item) => (
            <Link
              key={item.href}
              className={`nav-item ${path === item.href ? 'active' : ''}`}
              href={item.href}
              aria-current={path === item.href ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              <item.icon size={17} strokeWidth={1.65} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link
            className={`nav-item ${path.startsWith('/admin') ? 'active' : ''}`}
            href="/admin/governance"
            onClick={() => setOpen(false)}
          >
            <Settings2 size={17} />
            <span>Tadbir urus</span>
            <ArrowUpRight size={13} />
          </Link>
          <div className="environment">
            <span className="status-dot" />
            <div>
              <strong>Ruang demonstrasi</strong>
              <small>V1 · Pengesahan pihak berkepentingan</small>
            </div>
          </div>
        </div>
      </aside>
      <div className="main-frame">
        <header className="topbar">
          <div className="topbar-context">
            <button
              className="icon-button mobile-menu"
              onClick={() => setOpen(true)}
              aria-label="Buka navigasi"
              aria-expanded={open}
            >
              <Menu size={22} />
            </button>
            <span className="country-tag">Malaysia</span>
            <span>Ruang strategik kebangsaan</span>
            <span className="topbar-divider" />
            <span className="muted topbar-extra">Dasar Dadah Negara 2017</span>
          </div>
          <div className="profile">
            <span className="profile-avatar">{session.role === 'executive' ? 'EK' : 'DM'}</span>
            <label>
              <span>PROFIL DEMO</span>
              <select
                value={session.role}
                onChange={(e) => changeProfile(e.target.value)}
                disabled={busy}
                aria-label="Pilih profil demonstrasi"
              >
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <ChevronDown size={14} />
          </div>
        </header>
        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <footer className="app-footer">
          <span>
            DDN MALAYSIA <span className="muted">/</span> Ruang bukti & tindakan bersama
          </span>
          <span>Prototaip V1 · Bukan sistem operasi nasional</span>
        </footer>
      </div>
    </div>
  );
}
