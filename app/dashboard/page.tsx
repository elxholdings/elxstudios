import type { Metadata } from 'next';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';
import DashboardClient from './dashboard-client';

export const metadata: Metadata = { title: 'Client Workspace', description: 'View Elx Studio project references and progress saved on this device.' };

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  return <SiteShell locale={locale}><section className="px-5 py-8 md:px-10 md:py-12"><div className="mx-auto max-w-[1440px]"><DashboardClient locale={locale} /></div></section></SiteShell>;
}
