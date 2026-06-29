import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '../../components/site-shell';
import { getPublishedProducts } from '../../lib/site-content';
import { resolveLocale } from '../../locale';
import PurchaseRequestForm from './purchase-request-form';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getPublishedProducts()).find((item) => item.slug === slug);
  return product ? { title: product.title, description: product.summary } : { title: 'Plan not found' };
}

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams?: Promise<{ lang?: string | string[] }> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const locale = await resolveLocale(query?.lang);
  const product = (await getPublishedProducts()).find((item) => item.slug === slug);
  if (!product) notFound();
  return <SiteShell locale={locale}><main className="bg-[#F5F2E8]">
    <section className="grid min-h-[75vh] lg:grid-cols-2"><div className="relative min-h-[430px] bg-[#102321]">{product.preview_video_url ? <video src={product.preview_video_url} controls className="h-full w-full object-cover" /> : product.cover_url && <img src={product.cover_url} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />}</div><div className="flex flex-col justify-center p-7 md:p-14 lg:p-20"><p className="text-xs font-black uppercase tracking-[.16em] text-[#F06449]">{product.eyebrow} / {product.category}</p><h1 className="mt-5 text-5xl font-black leading-[.9] tracking-[-.065em] md:text-7xl">{product.title}</h1><p className="mt-7 max-w-xl text-lg leading-8 text-black/60">{product.summary}</p><p className="mt-8 text-3xl font-black">{new Intl.NumberFormat('en', { style: 'currency', currency: product.currency }).format(product.price)}</p><a href="#request" className="mt-8 w-fit bg-[#102321] px-7 py-4 text-sm font-black text-white">Request this plan →</a></div></section>
    <section className="px-5 py-20 md:px-10 md:py-28"><div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.15fr_.85fr]"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#F06449]">About this package</p><p className="mt-6 max-w-3xl text-xl leading-9">{product.description}</p><div className="mt-12 grid gap-px bg-black/10 sm:grid-cols-2">{product.specifications.map((item) => <div key={item.label} className="bg-[#F5F2E8] p-5"><span className="text-xs font-black uppercase tracking-[.12em] text-black/40">{item.label}</span><strong className="mt-2 block text-xl">{item.value}</strong></div>)}</div></div><aside className="bg-white p-7 md:p-10"><h2 className="text-3xl font-black tracking-[-.04em]">Included files</h2><ul className="mt-6 grid gap-3">{product.included_files.map((item) => <li key={item} className="border-b border-black/10 pb-3 text-sm font-bold">{item}</li>)}</ul><p className="mt-7 text-xs leading-5 text-black/45">Concept and stock plans must be adapted to the site, structure, services, climate and applicable local approval requirements before construction.</p></aside></div></section>
    <section id="request" className="bg-[#DDF65C] px-5 py-20 md:px-10 md:py-28"><div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-xs font-black uppercase tracking-[.16em]">Purchase request</p><h2 className="mt-5 text-5xl font-black leading-[.9] tracking-[-.06em]">Confirm the format before paying.</h2><p className="mt-6 leading-7 text-black/60">We will confirm availability, included files and any customization you need. No payment is collected yet.</p></div><PurchaseRequestForm productId={product.id} productTitle={product.title} /></div></section>
  </main></SiteShell>;
}
