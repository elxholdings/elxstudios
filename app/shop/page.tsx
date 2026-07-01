import type { Metadata } from 'next';
import { SiteShell } from '../components/site-shell';
import { getPublishedProducts } from '../lib/site-content';
import { resolveLocale } from '../locale';
import ShopCatalog from './shop-catalog';

export const metadata: Metadata = { title: 'House Plans & Architectural Models', description: 'Browse original house plans by bedrooms, floors and area. Choose PDF, editable CAD or plan customization packages from Elx Studio.', alternates: { canonical: '/shop' }, openGraph: { title: 'House Plans & Architectural Models | Elx Studio', description: 'Original architectural plans with PDF, CAD and customization options.', url: '/shop', type: 'website' } };

export default async function ShopPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams; const locale = await resolveLocale(query?.lang); const products = await getPublishedProducts();
  return <SiteShell locale={locale}><main className="snap-sections">
    <section className="bg-[#073C3E] px-5 py-16 text-white md:px-10 md:py-20"><div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#DDF65C]">Elx Studio / Architectural plan shop</p><h1 className="mt-5 max-w-5xl text-6xl font-black leading-[.86] tracking-[-.075em] md:text-8xl">A better starting point for your build.</h1></div><div><p className="max-w-xl text-lg leading-8 text-white/65">Explore original house concepts by bedrooms, floors, area and home type. Choose a PDF set, editable CAD package or request plan customization.</p><div className="mt-7 grid grid-cols-3 border-y border-white/15 py-4 text-xs font-black uppercase tracking-[.1em]"><span>Original plans</span><span>CAD options</span><span>Adaptable</span></div></div></div></section>
    <section className="bg-[#F8F7F2] px-5 py-14 md:px-10 md:py-20"><div className="mx-auto max-w-[1440px]">{products.length ? <ShopCatalog products={products} /> : <div className="bg-white p-10"><h2 className="text-3xl font-black">The first plan collection is being prepared.</h2><p className="mt-3 text-black/50">Check back shortly or send a custom architecture brief.</p></div>}</div></section>
  </main></SiteShell>;
}
