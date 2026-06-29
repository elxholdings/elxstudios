import type { Metadata } from 'next';
import AuthForm from '../components/auth-form';
import { SiteShell } from '../components/site-shell';

export const metadata: Metadata = { title: 'Reset password' };
export default function ForgotPasswordPage() {
  return <SiteShell><main className="px-5 py-14 md:px-10 md:py-20"><AuthForm mode="forgot" /></main></SiteShell>;
}
