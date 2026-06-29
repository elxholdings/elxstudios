import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';

export const metadata: Metadata = { title: 'Pricing', description: 'Understand how Elx Studio prepares transparent manual project quotes.' };

export default async function PricingPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  return (
    <SiteShell locale={locale}>
      <PageIntro eyebrow="Manual quotes first" title="Price the actual work—not a vague category." intro="Submitting a brief is free. We quote only after reviewing the deliverables, deadline, source material and technical complexity. You do not pay simply to ask." />
      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[['Scope', 'Number and type of deliverables, project size and level of detail.'], ['Complexity', 'Research, calculations, modeling, specialist software and source-file condition.'], ['Deadline', 'Available production time and whether priority scheduling is needed.'], ['Revisions', 'Included review rounds and whether requested changes stay inside the approved scope.']].map(([title, text], index) => (
            <article key={title} className="bg-white p-7"><p className="text-sm font-black text-[#F06449]">0{index + 1}</p><h2 className="mt-12 text-3xl font-black tracking-[-0.04em]">{title}</h2><p className="mt-4 leading-7 text-black/60">{text}</p></article>
          ))}
        </div>
        <div className="mx-auto mt-16 grid max-w-[1440px] gap-10 bg-[#DDF65C] p-8 md:grid-cols-[1fr_auto] md:items-end md:p-12">
          <div><p className="text-sm font-black uppercase tracking-[.16em]">No-obligation review</p><h2 className="mt-5 max-w-4xl text-5xl font-black leading-[.92] tracking-[-0.06em] md:text-7xl">Send the brief. Review the quote. Decide from there.</h2></div>
          <Link href={`/start?lang=${locale}`} className="bg-[#102321] px-6 py-4 text-center text-sm font-black text-white">Request a quote →</Link>
        </div>
      </section>
    </SiteShell>
  );
}
