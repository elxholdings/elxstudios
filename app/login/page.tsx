import type { Metadata } from 'next';
import AuthForm from '../components/auth-form';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';

export const metadata: Metadata = { title: 'Sign in' };

const errors: Record<string, string> = {
  admin_access: 'Admin access requires the Google account hello@elxholdings.com.',
  callback: 'Google sign-in could not be completed. Please try again.',
  configuration: 'Authentication is not configured for this deployment.',
};

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[]; next?: string | string[]; error?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const next = Array.isArray(query?.next) ? query?.next[0] : query?.next;
  const errorKey = Array.isArray(query?.error) ? query?.error[0] : query?.error;
  return <SiteShell locale={locale}><main className="flex items-center px-5 py-8 md:px-10 lg:h-[calc(100svh-108px)] lg:min-h-[560px] lg:py-6"><AuthForm mode="login" next={next?.startsWith('/') ? next : '/dashboard'} initialError={errorKey ? errors[errorKey] || 'Sign-in could not be completed.' : ''} /></main></SiteShell>;
}
