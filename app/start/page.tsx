import type { Metadata } from 'next';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';
import { getAuthContext } from '../lib/auth';
import { buildWhatsAppUrl, getWhatsAppRoute } from '../lib/whatsapp-config';
import { getWhatsAppRouting } from '../lib/whatsapp-routing';
import ProjectWizard from './project-wizard';

export const metadata: Metadata = { title: 'Start a Project', description: 'Create a structured Elx Studio project brief and request a manual quote.' };

export default async function StartPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[]; service?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const service = Array.isArray(query?.service) ? query?.service[0] : query?.service;
  const { user } = await getAuthContext();
  const whatsappRouting = await getWhatsAppRouting();
  const startWhatsApp = getWhatsAppRoute(whatsappRouting, 'start_floating');
  return (
    <SiteShell locale={locale} showFooter={false}>
      <section className="flex min-h-[calc(100svh-116px)] items-center px-5 py-6 md:px-10 lg:py-5">
        <div className="mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-[.52fr_1fr] lg:items-start xl:gap-10">
          <div className="pt-2 lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[.18em] text-[#F06449]">Project intake</p>
            <h1 className="mt-4 text-5xl font-black leading-[.86] tracking-[-0.075em] md:text-6xl xl:text-7xl">Build a clear brief.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-black/60">Start with the details you have. Your quote will confirm the deliverables, timing and price before paid work begins.</p>
            <div className="mt-6 max-w-md border-t border-black/15 pt-4 text-xs leading-5 text-black/55">No payment is collected here.<br />Files can be shared by private link or WhatsApp.<br />Academic-use confirmation is required.</div>
            <div className="mt-6 hidden max-w-md grid-cols-3 gap-px bg-black/10 text-center text-[9px] font-black uppercase tracking-[.1em] text-black/45 xl:grid">
              <span className="bg-white p-3">Scope</span>
              <span className="bg-white p-3">Files</span>
              <span className="bg-white p-3">Quote</span>
            </div>
          </div>
          <ProjectWizard initialService={service} locale={locale} authenticated={Boolean(user)} />
        </div>
      </section>
      <a href={buildWhatsAppUrl(startWhatsApp, {}, whatsappRouting.defaultCountryCode)} target="_blank" rel="noreferrer" aria-label="Chat with Elx Studio on WhatsApp" className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center bg-[#1FA855] text-white shadow-xl transition hover:-translate-y-1 hover:bg-[#178A45]">
        <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 fill-current"><path d="M16 4a11.3 11.3 0 0 0-9.8 17l-1.5 5.4 5.6-1.5A11.3 11.3 0 1 0 16 4Zm0 20.5c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.3.9.9-3.2-.2-.4a9.1 9.1 0 1 1 8 4.3Zm5-6.8c-.3-.1-1.6-.8-1.9-.9-.2-.1-.4-.1-.6.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.8-3.3-.3-.5.3-.5.8-1.7.1-.2 0-.4 0-.5l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 1.9.8 2.6.9 3.6.8.6-.1 1.6-.7 1.8-1.3.2-.6.2-1.2.2-1.3-.2-.3-.4-.4-1-.6Z" /></svg>
      </a>
    </SiteShell>
  );
}
