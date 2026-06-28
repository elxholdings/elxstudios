import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { PageIntro, SiteShell } from '../components/site-shell';
import { serviceCategories } from '../data/services';
import { resolveLocale } from '../locale';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Explore documentation, STEM, architecture, CAD, 3D, finance and professional project services from Elx Studio.',
};

export default async function ServicesPage({ searchParams }: { searchParams?: { lang?: string | string[] } }) {
  const locale = await resolveLocale(searchParams?.lang);

  return (
    <SiteShell locale={locale}>
      <PageIntro eyebrow="Seven service departments" title="One studio for complex work." intro="Choose the department closest to your brief. We will review the details, confirm the exact deliverables and route the project to the right specialist." />
      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-5 md:grid-cols-2">
          {serviceCategories.map((service, index) => (
            <Link key={service.slug} href={`/services/${service.slug}?lang=${locale}`} className="group bg-white">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image src={service.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
              </div>
              <div className="p-7 md:p-9" style={{ backgroundColor: service.accent }}>
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-[.16em]">
                  <span>{String(index + 1).padStart(2, '0')} / {service.eyebrow}</span>
                  <span aria-hidden="true">↗</span>
                </div>
                <h2 className="mt-10 text-4xl font-black leading-none tracking-[-0.055em] md:text-5xl">{service.title}</h2>
                <p className="mt-5 max-w-xl leading-7 text-black/65">{service.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
