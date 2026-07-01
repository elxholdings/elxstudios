import type { Metadata } from 'next';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';
import HowItWorksExperience from './how-it-works-experience';

export const metadata: Metadata = { title: 'How Elx Studio Works', description: 'See how to choose a service, submit a flexible project brief, approve a manual quote and receive work through Elx Studio.' };

export default async function ServicesPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  return <SiteShell locale={locale}><HowItWorksExperience locale={locale} /></SiteShell>;
}
