import type { Metadata } from 'next';
import { SiteShell } from '../components/site-shell';
import { getPublishedProducts } from '../lib/site-content';
import { resolveLocale } from '../locale';

export const metadata: Metadata = { title: 'CAD & Architecture Plan Shop', description: 'Ready-to-customize CAD drawings, architecture plans and design packages from Elx Studio.' };

export default async function ShopPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const products = await getPublishedProducts();
  return <SiteShell locale={locale}><main>
    <section className="bg-[#073C3E] px-5 py-20 text-white md:px-10 md:py-28"><div className="mx-auto max-w-[1440px]"><p className="text-xs font-black uppercase tracking-[.18em] text-[#DDF65C]">Elx Studio / Digital plan shop</p><h1 className="mt-6 max-w-6xl text-6xl font-black leading-[.86] tracking-[-.075em] md:text-9xl">Plans that give the project a serious head start.</h1><p className="mt-8 max-w-2xl text-lg leading-8 text-white/60">Browse editable CAD, architecture and design concept packages. Every purchase request is reviewed for file compatibility and intended use before payment.</p></div></section>
    <section className="bg-[#F5F2E8] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto max-w-[1440px]"><div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{products.map((product) => <a href={`/shop/${product.slug}`} key={product.id} className="group bg-white"><div className="aspect-[4/3] overflow-hidden bg-[#102321]">{product.cover_url && <img src={product.cover_url} alt={product.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />}</div><div className="p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">{product.eyebrow} / {product.category}</p><h2 className="mt-4 text-3xl font-black leading-none tracking-[-.045em]">{product.title}</h2><p className="mt-4 leading-7 text-black/55">{product.summary}</p><div className="mt-8 flex items-end justify-between"><strong className="text-2xl">{new Intl.NumberFormat('en', { style: 'currency', currency: product.currency }).format(product.price)}</strong><span className="text-sm font-black">View plan →</span></div></div></a>)}</div>{products.length === 0 && <div className="bg-white p-10"><h2 className="text-3xl font-black">The first plan collection is being prepared.</h2><p className="mt-3 text-black/50">Check back shortly or send a custom architecture brief.</p></div>}</div></section>
  </main></SiteShell>;
}
