import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import './reference-theme.css';
import './reference-components.css';
import './ember.css';
import { AppShell } from '@/components/app-shell';
import { getSession } from '@/lib/server/auth';

export const metadata: Metadata = {
  title: { default: 'Scenario Semasa · DDN Malaysia', template: '%s · DDN Malaysia' },
  description: 'Prototip kolaboratif Dasar Dadah Negara. Bukti bersama, tindakan bersepadu.',
};
export const dynamic = 'force-dynamic';
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
});
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const theme = (await cookies()).get('ddn-theme')?.value;
  return (
    <html
      lang="ms"
      className={jakarta.variable}
      data-theme={theme === 'light' || theme === 'dark' ? theme : undefined}
    >
      <body>
        <a className="skip-link" href="#main-content">
          Langkau ke kandungan utama
        </a>
        <AppShell session={{ name: session.name, role: session.role, id: session.id }}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
