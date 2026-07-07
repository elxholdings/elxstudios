import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LandingPage from './landing-page';
import { getSiteTranslations } from './google-translate';
import { getAuthContext } from './lib/auth';
import { getIntroAudioMix } from './lib/intro-audio-settings';
import { resolveLocale } from './locale';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams?: Promise<{ lang?: string | string[]; code?: string | string[]; intro?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const dictionary = await getSiteTranslations(locale);
  const title = locale === 'zh' ? '做到精准' : dictionary['Get It Right'] || 'Get It Right';
  const description = locale === 'zh'
    ? '为计算、理工科、建筑、CAD、3D 渲染、写作、财务和商业项目提供技术与专业支持。'
    : dictionary['Technical and professional project support for calculations, STEM, architecture, CAD, 3D rendering, writing, finance and business work.'] || 'Technical and professional project support for calculations, STEM, architecture, CAD, 3D rendering, writing, finance and business work.';

  return { title: { absolute: `Elx Studio | ${title}` }, description };
}

export default async function Page({ searchParams }: PageProps) {
  const query = await searchParams;
  const code = Array.isArray(query?.code) ? query.code[0] : query?.code;
  if (code) redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=/dashboard`);
  const locale = await resolveLocale(query?.lang);
  const forceIntro = (Array.isArray(query?.intro) ? query.intro[0] : query?.intro) === '1';
  const { user } = await getAuthContext();
  if (user && !forceIntro) redirect(`/dashboard?lang=${encodeURIComponent(locale)}`);
  const introAudio = await getIntroAudioMix();
  return <LandingPage locale={locale} forceIntro={forceIntro} introAudio={introAudio} />;
}
