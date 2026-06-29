import type { Metadata } from 'next';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';
import ProjectWizard from './project-wizard';

export const metadata: Metadata = { title: 'Start a Project', description: 'Create a structured Elx Studio project brief and request a manual quote.' };

export default async function StartPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[]; service?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const service = Array.isArray(query?.service) ? query?.service[0] : query?.service;
  return (
    <SiteShell locale={locale}>
      <section className="px-5 py-14 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.55fr_1fr]">
          <div className="lg:sticky lg:top-36 lg:self-start">
            <p className="text-sm font-black uppercase tracking-[.18em] text-[#F06449]">Project intake</p>
            <h1 className="mt-5 text-6xl font-black leading-[.86] tracking-[-0.075em] md:text-8xl">Build a clear brief.</h1>
            <p className="mt-7 max-w-md text-lg leading-8 text-black/60">Submitting is free. The team reviews your requirements before confirming deliverables, timing or price.</p>
            <div className="mt-9 border-t border-black/15 pt-5 text-sm leading-6 text-black/55">No payment is collected on this page.<br />Files are not uploaded without secure storage.<br />Academic-use confirmation is required.</div>
          </div>
          <ProjectWizard initialService={service} locale={locale} />
        </div>
      </section>
    </SiteShell>
  );
}
