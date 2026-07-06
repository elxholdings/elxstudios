import type { Metadata } from 'next';
import { MiniChart, PlanSketch } from '../components/client-graphics';
import { SiteShell } from '../components/site-shell';
import { getPublishedProducts } from '../lib/site-content';
import { resolveLocale } from '../locale';
import ShopCatalog from './shop-catalog';

export const metadata: Metadata = { title: 'House Plans & Architectural Models', description: 'Browse original house plans by bedrooms, floors and area. Choose PDF, editable CAD or plan customization packages from Elx Studio.', alternates: { canonical: '/shop' }, openGraph: { title: 'House Plans & Architectural Models | Elx Studio', description: 'Original architectural plans with PDF, CAD and customization options.', url: '/shop', type: 'website' } };

export default async function ShopPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams; const locale = await resolveLocale(query?.lang); const products = await getPublishedProducts();
  return <SiteShell locale={locale} showHeader={false}><main className="shop-presentation snap-sections bg-[#F8F7F2]">
    <section className="shop-slide relative flex min-h-[100svh] flex-col overflow-hidden bg-[#073C3E] px-5 text-white md:px-10">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between border-b border-white/10 py-5 text-xs font-black uppercase tracking-[.14em]">
        <a href={`/?lang=${encodeURIComponent(locale)}`} className="text-lg normal-case tracking-[-.06em] text-white">Elx<span className="text-[#F06449]">.</span></a>
        <span className="hidden text-white/45 sm:inline">Architectural plan shop</span>
        <a href="#plans" className="border border-white/20 px-4 py-2 text-[#DDF65C] transition hover:bg-white hover:text-[#073C3E]">See plans ↓</a>
      </div>
      <div className="mx-auto grid w-full max-w-[1440px] flex-1 gap-8 py-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:py-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#DDF65C]">Elx Studio / House plans</p>
          <h1 className="mt-5 max-w-4xl text-6xl font-black leading-[.82] tracking-[-.08em] md:text-8xl xl:text-9xl">Choose the plan. Then make it yours.</h1>
        </div>
        <div className="max-w-2xl lg:justify-self-end">
          <p className="text-xl font-black leading-8 md:text-2xl">Original architectural models, drawing sets and editable CAD packages for residential projects.</p>
          <p className="mt-5 leading-7 text-white/60">Start with a clean concept, compare bedrooms, area and file formats, then request the exact package before payment.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="border border-white/10 bg-white/5 p-3 text-white">
              <p className="text-[8px] font-black uppercase tracking-[.14em] text-[#DDF65C]">Plan logic</p>
              <PlanSketch className="mt-2 h-20 w-full" />
            </div>
            <div className="border border-white/10 bg-white/5 p-3 text-white">
              <p className="text-[8px] font-black uppercase tracking-[.14em] text-[#DDF65C]">Compare options</p>
              <MiniChart className="mt-2 h-20 w-full" />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-3 border-y border-white/15 py-4 text-[10px] font-black uppercase tracking-[.12em] text-white/70">
            <span>{products.length || 'New'} plans</span>
            <span>PDF + CAD</span>
            <span>Customizable</span>
          </div>
        </div>
      </div>
    </section>
    {products.length ? <ShopCatalog products={products} /> : <section className="shop-slide flex min-h-[100svh] items-center bg-[#F8F7F2] px-5 md:px-10"><div className="mx-auto max-w-[900px] bg-white p-10"><h2 className="text-3xl font-black">The first plan collection is being prepared.</h2><p className="mt-3 text-black/50">Check back shortly or send a custom architecture brief.</p></div></section>}
  </main></SiteShell>;
}
