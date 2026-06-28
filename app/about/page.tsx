import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';

export const metadata: Metadata = { title: 'About Elx Holdings', description: 'Learn how Elx Holdings and Elx Studio are structured to deliver accountable technical and professional services.' };

export default async function AboutPage({ searchParams }: { searchParams?: { lang?: string | string[] } }) {
  const locale = await resolveLocale(searchParams?.lang);
  return (
    <SiteShell locale={locale}>
      <PageIntro eyebrow="Elx Holdings" title="A durable home for specialist companies." intro="Elx Holdings is the parent organization. Elx Studio is its first active platform—built to make professional and technical project support easier to scope, manage and deliver." />
      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-2">
          <h2 className="text-5xl font-black leading-[.95] tracking-[-0.06em] md:text-7xl">The studio model keeps the client experience simple.</h2>
          <div className="space-y-7 text-lg leading-8 text-black/65">
            <p>Clients begin with one brief instead of searching across disconnected specialists. Elx Studio reviews the request, clarifies the scope and coordinates the right capability around the work.</p>
            <p>Every project should have a reference, an agreed scope, a visible status and a controlled delivery path. That operational discipline matters as much as the final document, model or drawing.</p>
            <p>The platform is being structured so future Elx companies can share a trusted foundation while keeping their own services and brand experience.</p>
          </div>
        </div>
      </section>
      <section className="bg-white px-5 py-20 md:px-10">
        <div className="mx-auto grid max-w-[1440px] gap-5 md:grid-cols-3">
          {[['01', 'Clear scope', 'We translate a loose request into defined deliverables, timing and responsibilities.'], ['02', 'Controlled quality', 'Files move through review before they are treated as final delivery.'], ['03', 'Responsible support', 'Academic and professional work is handled within clear ethical-use rules.']].map(([number, title, text]) => (
            <article key={number} className="bg-[#F5F2E8] p-8"><p className="text-sm font-black text-[#F06449]">{number}</p><h3 className="mt-12 text-3xl font-black tracking-[-0.04em]">{title}</h3><p className="mt-4 leading-7 text-black/60">{text}</p></article>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-[1440px]"><Link href={`/start?lang=${locale}`} className="inline-flex bg-[#102321] px-6 py-4 text-sm font-black text-white">Start a project →</Link></div>
      </section>
    </SiteShell>
  );
}
