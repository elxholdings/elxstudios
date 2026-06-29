import type { Metadata } from 'next';
import AuthForm from '../components/auth-form';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';

export const metadata: Metadata = { title: 'Create account' };

export default async function RegisterPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[]; next?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const next = Array.isArray(query?.next) ? query?.next[0] : query?.next;
  return <SiteShell locale={locale}><main className="px-5 py-14 md:px-10 md:py-20"><AuthForm mode="register" next={next?.startsWith('/') ? next : '/dashboard'} /></main></SiteShell>;
}
