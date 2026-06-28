import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteShell } from '../../components/site-shell';
import { getServiceCategory, serviceCategories } from '../../data/services';
import { resolveLocale } from '../../locale';

export function generateStaticParams() {
  return serviceCategories.map((service) => ({ slug: service.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const service = getServiceCategory(params.slug);
  return service ? { title: service.title, description: service.summary } : {};
}

export default async function ServiceDetailPage({ params, searchParams }: { params: { slug: string }; searchParams?: { lang?: string | string[] } }) {
  const service = getServiceCategory(params.slug);
  if (!service) notFound();
  const locale = await resolveLocale(searchParams?.lang);

  return (
    <SiteShell locale={locale}>
      <section className="bg-[#073C3E] text-white">
        <div className="mx-auto grid max-w-[1440px] lg:grid-cols-2">
          <div className="flex min-h-[560px] flex-col justify-between px-5 py-16 md:px-10 md:py-24">
            <p className="text-sm font-black uppercase tracking-[.18em] text-[#DDF65C]">{service.eyebrow} / Elx Studio</p>
            <div>
              <h1 className="text-6xl font-black leading-[.86] tracking-[-0.075em] md:text-8xl">{service.title}</h1>
              <p className="mt-8 max-w-xl text-xl leading-8 text-white/65">{service.summary}</p>
              <Link href={`/start?service=${service.slug}&lang=${locale}`} className="mt-9 inline-flex bg-[#DDF65C] px-6 py-4 text-sm font-black text-[#102321]">Request a quote →</Link>
            </div>
          </div>
          <div className="relative min-h-[420px] lg:min-h-full">
            <Image src={service.image} alt={`${service.title} technical work`} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-[#F06449]">Who this is for</p>
            <p className="mt-5 text-2xl font-bold leading-9">{service.whoFor}</p>
            <div className="mt-10 bg-white p-7">
              <p className="text-xs font-black uppercase tracking-[.16em] text-black/40">Typical turnaround</p>
              <p className="mt-3 font-bold">{service.turnaround}</p>
              <p className="mt-6 text-xs font-black uppercase tracking-[.16em] text-black/40">Pricing</p>
              <p className="mt-3 font-bold">Manual quote after brief review.</p>
            </div>
          </div>
          <div className="grid gap-10 md:grid-cols-2">
            <InfoList title="Services" items={service.subservices} />
            <InfoList title="Expected deliverables" items={service.deliverables} />
            <InfoList title="Supported formats" items={service.formats} />
            <InfoList title="What to submit" items={['Clear project goal', 'Deadline and required format', 'Source files or references', 'Dimensions, data or instructions where applicable']} />
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: service.accent }} className="px-5 py-20 md:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-4xl text-5xl font-black leading-[.92] tracking-[-0.06em] md:text-7xl">Have a brief that does not fit neatly into one category?</h2>
          <Link href={`/start?lang=${locale}`} className="shrink-0 bg-[#102321] px-6 py-4 text-sm font-black text-white">Share the full brief →</Link>
        </div>
      </section>
    </SiteShell>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="border-t border-black/15 pt-5">
      <h2 className="text-2xl font-black tracking-[-0.035em]">{title}</h2>
      <ul className="mt-5 grid gap-3 text-black/65">
        {items.map((item) => <li key={item} className="flex gap-3"><span className="font-black text-[#F06449]">+</span><span>{item}</span></li>)}
      </ul>
    </section>
  );
}
