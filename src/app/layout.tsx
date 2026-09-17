import type { Metadata } from 'next';
import './globals.css';
import './identity.css';
import './map-identity.css';
import './assistant.css';
import { DemoAssistant } from '@/components/demo-assistant';
import { AppShell } from '@/components/app-shell';
import { getSession } from '@/lib/server/auth';

export const metadata: Metadata = {
  title: { default: 'DDN · Gambaran Nasional', template: '%s · DDN Malaysia' },
  description: 'Prototip kolaboratif Dasar Dadah Negara. Bukti bersama, tindakan bersepadu.',
  icons: { icon: '/aadk-logo.png' },
};
export const dynamic = 'force-dynamic';
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <html lang="ms">
      <body>
        <a className="skip-link" href="#main-content">
          Langkau ke kandungan utama
        </a>
        <AppShell session={{ name: session.name, role: session.role, id: session.id }}>
          {children}
        </AppShell>
        <DemoAssistant />
      </body>
    </html>
  );
}
