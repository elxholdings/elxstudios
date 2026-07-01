import type { Metadata } from 'next';
import AuthForm from '../components/auth-form';
import { SiteShell } from '../components/site-shell';

export const metadata: Metadata = { title: 'Choose a new password' };
export default function ResetPasswordPage() {
  return <SiteShell><main className="flex items-center px-5 py-8 md:px-10 lg:h-[calc(100svh-108px)] lg:min-h-[560px] lg:py-6"><AuthForm mode="reset" /></main></SiteShell>;
}
