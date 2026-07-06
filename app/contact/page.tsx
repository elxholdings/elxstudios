import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';

export const metadata: Metadata = { title: 'Contact', description: 'Contact Elx Studio about a project, existing order, partnership or general question.' };

export default async function ContactPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '254110008034').replace(/\D/g, '');
  return (
    <SiteShell locale={locale}>
      <PageIntro eyebrow="Contact" title="Start with the right channel." intro="For a new project, the brief gives you the fastest path to a quote. For an existing order, include your Elx reference so the conversation stays connected." />
      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1100px] gap-5 md:grid-cols-2">
          <article className="bg-white p-8 md:p-10"><p className="text-sm font-black uppercase tracking-[.16em] text-[#F06449]">New project</p><h2 className="mt-8 text-4xl font-black tracking-[-0.05em]">Create a clear brief</h2><p className="mt-5 leading-7 text-black/60">Choose the closest service and add the details you already have. Your quote will confirm the final scope before payment.</p><Link href={`/start?lang=${locale}`} className="mt-8 inline-flex bg-[#102321] px-5 py-4 text-sm font-black text-white">Start project →</Link></article>
          <article className="bg-[#DDF65C] p-8 md:p-10"><p className="text-sm font-black uppercase tracking-[.16em]">Existing order or question</p><h2 className="mt-8 text-4xl font-black tracking-[-0.05em]">Continue on WhatsApp</h2><p className="mt-5 leading-7 text-black/60">Include your order reference when following up about a quote, progress update, delivery or revision.</p><a href={`https://wa.me/${number}`} target="_blank" rel="noreferrer" className="mt-8 inline-flex bg-[#102321] px-5 py-4 text-sm font-black text-white">Open WhatsApp ↗</a></article>
        </div>
      </section>
    </SiteShell>
  );
}
