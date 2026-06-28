import type { Metadata } from 'next';
import LandingPage from './landing-page';
import { getSiteTranslations } from './google-translate';
import { resolveLocale } from './locale';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: { lang?: string | string[] };
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = await resolveLocale(searchParams?.lang);
  const dictionary = await getSiteTranslations(locale);
  const title = locale === 'zh' ? '做到精准' : dictionary['Get It Right'] || 'Get It Right';
  const description = locale === 'zh'
    ? '为计算、理工科、建筑、CAD、3D 渲染、写作、财务和商业项目提供技术与专业支持。'
    : dictionary['Technical and professional project support for calculations, STEM, architecture, CAD, 3D rendering, writing, finance and business work.'] || 'Technical and professional project support for calculations, STEM, architecture, CAD, 3D rendering, writing, finance and business work.';

  return { title: `Elx Studio | ${title}`, description };
}

export default async function Page({ searchParams }: PageProps) {
  const locale = await resolveLocale(searchParams?.lang);
  const dictionary = await getSiteTranslations(locale);
  return <LandingPage locale={locale} dictionary={dictionary} />;
}
