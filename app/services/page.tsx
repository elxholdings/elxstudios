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
    <section className="flex min-h-[calc(100svh-112px)] items-center bg-[#F8F7F2] px-5 py-8 md:px-10"><div className="mx-auto w-full max-w-[1440px]"><div className="mb-7 grid gap-5 md:grid-cols-[1fr_.8fr] md:items-end"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#F06449]">Seven service departments</p><h1 className="mt-3 text-5xl font-black leading-[.88] tracking-[-.065em] md:text-7xl">Everything visible.<br />Nothing buried.</h1></div><p className="max-w-xl text-sm leading-6 text-black/55 md:justify-self-end">Choose the closest department. Each tile opens the full service list, typical deliverables, file formats and expected turnaround.</p></div>
      <div className="grid gap-px bg-black/10 sm:grid-cols-2 md:grid-cols-4">{serviceCategories.map((service,index) => <Link key={service.slug} href={`/services/${service.slug}?lang=${locale}`} className="service-compact group relative min-h-[190px] overflow-hidden bg-white p-5 transition hover:z-10 hover:-translate-y-1 hover:shadow-xl" style={{ '--service-accent': service.accent } as React.CSSProperties}><div className="flex items-start justify-between"><ServiceIcon index={index} /><span className="text-[9px] font-black uppercase tracking-[.14em] text-black/35">{String(index + 1).padStart(2,'0')}</span></div><p className="mt-5 text-[9px] font-black uppercase tracking-[.14em] text-[#F06449]">{service.eyebrow}</p><h2 className="mt-2 text-xl font-black leading-[.98] tracking-[-.04em]">{service.title}</h2><p className="mt-3 line-clamp-2 text-xs leading-5 text-black/50">{service.summary}</p><span className="absolute bottom-5 right-5 text-sm font-black transition group-hover:translate-x-1">→</span></Link>)}</div>
      <div className="mt-5 flex items-center justify-between text-[10px] font-black uppercase tracking-[.14em] text-black/45"><span>Tap any department for details</span><a href="#process" className="border-b border-black pb-1 text-[#102321]">See the process ↓</a></div></div></section>
    <ServiceProcess />
  </SiteShell>;
}

function ServiceIcon({ index }: { index: number }) { const paths = [<><path d="M8 5h13l5 5v17H8z"/><path d="M21 5v6h6M12 16h10M12 21h8"/></>,<><path d="M6 9h20M6 23h20M11 5v22M21 5v22"/><path d="m14 13 5 6m0-6-5 6"/></>,<><path d="m5 25 8-19 14 19z"/><path d="M10 19h12M13 6v19"/></>,<><path d="M5 25h22M8 21V11h6v10m4 0V6h6v15"/></>,<><path d="m16 4 12 7v14l-12 7-12-7V11z"/><path d="m4 11 12 7 12-7M16 18v14"/></>,<><path d="M7 7h18v22H7z"/><path d="M11 12h10M11 17h3m3 0h4m-10 5h3m3 0h4"/></>,<><path d="M5 9h22v17H5zM10 9V6h12v3"/><path d="M5 16h22M13 16v3h6v-3"/></>]; return <span className="service-icon grid h-11 w-11 place-items-center"><svg viewBox="0 0 32 32" className="h-8 w-8 fill-none stroke-current" strokeWidth="1.5">{paths[index]}</svg></span>; }
