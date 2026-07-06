import type { Metadata } from 'next';
import Link from 'next/link';
import { ClientProofStrip, ExpertiseBoard } from '../components/client-graphics';
import { PageIntro, SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';

export const metadata: Metadata = { title: 'About Elx Holdings', description: 'Learn how Elx Holdings and Elx Studio are structured to deliver accountable technical and professional services.' };

export default async function AboutPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  return (
    <SiteShell locale={locale}>
      <PageIntro eyebrow="Elx Holdings" title="Specialist support without the chaos." intro="Elx Studio helps you turn a difficult brief into clear deliverables, visible progress and files you can actually use." />
      <section className="px-5 py-16 md:px-10 md:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[.88fr_1.12fr] lg:items-center">
          <div>
            <h2 className="text-5xl font-black leading-[.95] tracking-[-0.06em] md:text-7xl">One brief. The right capability around it.</h2>
            <div className="mt-7 space-y-5 text-base leading-7 text-black/65">
              <p>You do not need to know every technical term before asking. Share the goal, deadline, source files or rough notes, and the request is shaped into a clear scope.</p>
              <p>Your project should have a reference, agreed deliverables, visible progress and a controlled delivery path. That discipline matters as much as the final document, model, chart or drawing.</p>
              <p>Elx Holdings is the parent organization behind Elx Studio. The focus is simple: make specialist work easier for clients to request, follow and receive.</p>
            </div>
          </div>
          <ExpertiseBoard />
        </div>
      </section>
      <section className="bg-white px-5 py-14 md:px-10">
        <div className="mx-auto max-w-[1440px]">
          <ClientProofStrip />
        </div>
        <div className="mx-auto mt-5 grid max-w-[1440px] gap-5 md:grid-cols-3">
          {[['01', 'Clear scope', 'Your loose request becomes defined deliverables, timing and assumptions.'], ['02', 'Controlled quality', 'Files are checked against the agreed scope before final delivery.'], ['03', 'Responsible support', 'Academic and professional work is handled within clear ethical-use rules.']].map(([number, title, text]) => (
            <article key={number} className="bg-[#F5F2E8] p-8"><p className="text-sm font-black text-[#F06449]">{number}</p><h3 className="mt-12 text-3xl font-black tracking-[-0.04em]">{title}</h3><p className="mt-4 leading-7 text-black/60">{text}</p></article>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-[1440px]"><Link href={`/start?lang=${locale}`} className="inline-flex bg-[#102321] px-6 py-4 text-sm font-black text-white">Start a project →</Link></div>
      </section>
    </SiteShell>
  );
}
