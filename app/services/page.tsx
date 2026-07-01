import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteShell } from '../components/site-shell';
import { serviceCategories } from '../data/services';
import { resolveLocale } from '../locale';
import ServiceProcess from './service-process';

export const metadata: Metadata = { title: 'Services', description: 'Explore documentation, STEM, architecture, CAD, 3D, finance and professional project services from Elx Studio.' };

export default async function ServicesPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams; const locale = await resolveLocale(query?.lang);
  return <SiteShell locale={locale}>
    <main className="desktop-screen bg-[#F8F7F2] lg:h-[calc(100svh-108px)] lg:min-h-[620px]"><div className="lg:grid lg:h-full lg:grid-cols-[.72fr_1.28fr]"><ServiceProcess /><section className="px-5 py-10 md:px-10 lg:flex lg:min-h-0 lg:flex-col lg:px-[clamp(2rem,4vw,5rem)] lg:py-[clamp(1.75rem,4vh,3.5rem)]"><div className="mb-6 flex items-end justify-between gap-6"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#F06449]">Services list</p><h1 className="mt-2 text-4xl font-black tracking-[-.055em] xl:text-5xl">Choose the work.</h1></div><p className="hidden max-w-xs text-right text-xs leading-5 text-black/45 xl:block">Open any department for its deliverables, formats and turnaround.</p></div>
      <div className="grid flex-1 gap-px bg-black/10 sm:grid-cols-2 lg:min-h-0">{serviceCategories.map((service,index) => <Link key={service.slug} href={`/services/${service.slug}?lang=${locale}`} className="service-compact group relative flex min-h-[132px] flex-col justify-between overflow-hidden bg-white p-4 transition hover:z-10 hover:shadow-lg xl:p-5" style={{ '--service-accent': service.accent } as CSSProperties}><div className="flex items-start justify-between"><ServiceIcon index={index} /><span className="text-[9px] font-black uppercase tracking-[.14em] text-black/30">{String(index + 1).padStart(2,'0')}</span></div><div className="mt-3"><p className="text-[8px] font-black uppercase tracking-[.14em] text-[#F06449]">{service.eyebrow}</p><div className="mt-1 flex items-end justify-between gap-3"><h2 className="text-lg font-black leading-[.98] tracking-[-.04em] xl:text-xl">{service.title}</h2><span className="text-sm font-black transition group-hover:translate-x-1">→</span></div></div></Link>)}</div>
      <p className="mt-4 text-[9px] font-black uppercase tracking-[.14em] text-black/40">All seven departments · one-page overview</p></section></div></main>
  </SiteShell>;
}

function ServiceIcon({ index }: { index: number }) { const paths = [<><path d="M8 5h13l5 5v17H8z"/><path d="M21 5v6h6M12 16h10M12 21h8"/></>,<><path d="M6 9h20M6 23h20M11 5v22M21 5v22"/><path d="m14 13 5 6m0-6-5 6"/></>,<><path d="m5 25 8-19 14 19z"/><path d="M10 19h12M13 6v19"/></>,<><path d="M5 25h22M8 21V11h6v10m4 0V6h6v15"/></>,<><path d="m16 4 12 7v14l-12 7-12-7V11z"/><path d="m4 11 12 7 12-7M16 18v14"/></>,<><path d="M7 7h18v22H7z"/><path d="M11 12h10M11 17h3m3 0h4m-10 5h3m3 0h4"/></>,<><path d="M5 9h22v17H5zM10 9V6h12v3"/><path d="M5 16h22M13 16v3h6v-3"/></>]; return <span className="service-icon grid h-9 w-9 place-items-center"><svg viewBox="0 0 32 32" className="h-6 w-6 fill-none stroke-current" strokeWidth="1.5">{paths[index]}</svg></span>; }
