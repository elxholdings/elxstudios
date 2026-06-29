import type { Metadata } from 'next';
import Link from 'next/link';
import { PageIntro, SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';

export const metadata: Metadata = { title: 'How It Works', description: 'See the Elx Studio project workflow from brief and quote through production, quality review and final delivery.' };

const stages = [
  ['01', 'Submit the brief', 'Choose a service, explain the goal, set the deadline and list the files or output formats involved.'],
  ['02', 'Scope and quote', 'We review complexity, clarify open questions and send a manual quote with deliverables and timing.'],
  ['03', 'Confirm and begin', 'The project begins only after you approve the scope and the agreed payment arrangement is confirmed.'],
  ['04', 'Track the work', 'Your workspace keeps the order reference, deadline and current production stage together.'],
  ['05', 'Quality review', 'Drafts are checked against the brief, file requirements and service-specific quality checklist.'],
  ['06', 'Delivery and revision', 'Receive the agreed files, review them and request an in-scope revision when needed.'],
] as const;

export default async function HowItWorksPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  return (
    <SiteShell locale={locale}>
      <PageIntro eyebrow="From brief to delivery" title="A process you can follow." intro="Complex work becomes easier to manage when every handoff is explicit. This is the operating path Elx Studio is building into the platform." />
      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-[1100px] border-t border-black/15">
          {stages.map(([number, title, text]) => (
            <article key={number} className="grid gap-5 border-b border-black/15 py-9 md:grid-cols-[100px_1fr_1fr] md:items-start">
              <span className="text-sm font-black text-[#F06449]">{number}</span>
              <h2 className="text-3xl font-black tracking-[-0.04em]">{title}</h2>
              <p className="leading-7 text-black/60">{text}</p>
            </article>
          ))}
        </div>
        <div className="mx-auto mt-12 max-w-[1100px]"><Link href={`/start?lang=${locale}`} className="inline-flex bg-[#102321] px-6 py-4 text-sm font-black text-white">Create a project brief →</Link></div>
      </section>
    </SiteShell>
  );
}
