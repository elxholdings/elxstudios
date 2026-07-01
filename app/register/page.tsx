import type { Metadata } from 'next';
import AuthForm from '../components/auth-form';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';

export const metadata: Metadata = { title: 'Create account' };

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[]; next?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const next = Array.isArray(query?.next) ? query?.next[0] : query?.next;
  return <SiteShell locale={locale}><main className="desktop-screen flex items-center px-5 py-8 md:px-10 lg:h-[calc(100svh-108px)] lg:min-h-[560px] lg:py-6"><AuthForm mode="register" next={next?.startsWith('/') ? next : '/dashboard'} /></main></SiteShell>;
}
