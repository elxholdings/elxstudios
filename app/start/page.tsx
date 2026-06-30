import type { Metadata } from 'next';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';
import { getAuthContext } from '../lib/auth';
import ProjectWizard from './project-wizard';

export const metadata: Metadata = { title: 'Start a Project', description: 'Create a structured Elx Studio project brief and request a manual quote.' };

export default async function StartPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[]; service?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const service = Array.isArray(query?.service) ? query?.service[0] : query?.service;
  const { user } = await getAuthContext();
  return (
    <SiteShell locale={locale} showFooter={false}>
      <section className="flex min-h-[calc(100svh-116px)] items-center px-5 py-6 md:px-10 lg:py-5">
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-[.52fr_1fr] lg:items-start xl:gap-10">
          <div className="pt-2 lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#F06449]">Project intake</p>
            <h1 className="mt-4 text-5xl font-black leading-[.86] tracking-[-0.075em] md:text-6xl xl:text-7xl">Build a clear brief.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-black/60">Submitting is free. The team reviews your requirements before confirming deliverables, timing or price.</p>
            <div className="mt-6 max-w-md border-t border-black/15 pt-4 text-xs leading-5 text-black/55">No payment is collected on this page.<br />Files are not uploaded without secure storage.<br />Academic-use confirmation is required.</div>
          </div>
          <ProjectWizard initialService={service} locale={locale} authenticated={Boolean(user)} />
        </div>
      </section>
    </SiteShell>
  );
}
