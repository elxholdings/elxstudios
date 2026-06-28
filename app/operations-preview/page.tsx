import type { Metadata } from 'next';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';
import OperationsClient from './operations-client';

export const metadata: Metadata = { title: 'Operations Preview', robots: { index: false, follow: false } };
export default async function OperationsPreviewPage({ searchParams }: { searchParams?: { lang?: string | string[] } }) { const locale = await resolveLocale(searchParams?.lang); return <SiteShell locale={locale}><section className="px-5 py-8 md:px-10 md:py-12"><div className="mx-auto max-w-[1440px]"><OperationsClient /></div></section></SiteShell>; }
