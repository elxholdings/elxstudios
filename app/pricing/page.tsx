import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';

export const metadata: Metadata = { title: 'Pricing', description: 'Understand how Elx Studio prepares transparent manual project quotes.' };
const factors = [
  ['Scope', 'Deliverables, project size and level of detail.'],
  ['Complexity', 'Research, calculations, software and source-file condition.'],
  ['Deadline', 'Production time and priority scheduling requirements.'],
  ['Revisions', 'Included review rounds and approved-scope changes.'],
];

export default async function PricingPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams; const locale = await resolveLocale(query?.lang);
  return <SiteShell locale={locale}><main className="desktop-screen bg-[#F8F7F2] lg:h-[calc(100svh-108px)] lg:min-h-[620px]">
    <section className="flex bg-[#073C3E] px-5 py-12 text-white md:px-10 lg:h-[38%] lg:min-h-0 lg:items-center lg:py-8"><div className="mx-auto grid w-full max-w-[1440px] gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#DDF65C]">Manual quotes first</p><h1 className="mt-4 max-w-4xl text-5xl font-black leading-[.87] tracking-[-.07em] md:text-7xl">Price the actual work.<br />Not a vague category.</h1></div><p className="max-w-xl text-sm leading-6 text-white/60 lg:justify-self-end">Submitting a brief is free. We quote after reviewing deliverables, deadline, source material and technical complexity. You do not pay simply to ask.</p></div></section>
    <section className="px-5 py-8 md:px-10 lg:flex lg:h-[62%] lg:min-h-0 lg:items-center lg:py-6"><div className="mx-auto w-full max-w-[1440px]"><div className="grid gap-px bg-black/10 md:grid-cols-4">{factors.map(([title,text],index) => <article key={title} className="bg-white p-5 xl:p-6"><div className="flex items-center justify-between"><span className="text-xs font-black text-[#F06449]">0{index + 1}</span><span className="h-2 w-2" style={{ backgroundColor: ['#F4B8A7','#DDF65C','#AFC8FF','#88C9C2'][index] }} /></div><h2 className="mt-6 text-2xl font-black tracking-[-.04em]">{title}</h2><p className="mt-3 text-sm leading-6 text-black/55">{text}</p></article>)}</div>
      <div className="mt-4 grid gap-5 bg-[#DDF65C] p-5 md:grid-cols-[1fr_auto] md:items-center xl:p-7"><div><p className="text-[9px] font-black uppercase tracking-[.16em]">No-obligation review</p><h2 className="mt-2 text-3xl font-black leading-[.94] tracking-[-.05em] md:text-4xl">Send the brief. Review the quote. Decide from there.</h2></div><Link href={`/start?lang=${locale}`} className="bg-[#102321] px-6 py-4 text-center text-sm font-black text-white">Request a quote →</Link></div>
    </div></section>
  </main></SiteShell>;
}
