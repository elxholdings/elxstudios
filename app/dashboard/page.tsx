import type { Metadata } from 'next';
import { SiteShell } from '../components/site-shell';
import { resolveLocale } from '../locale';
import { requireUser } from '../lib/auth';
import DashboardClient, { type DashboardOrder } from './dashboard-client';

export const metadata: Metadata = { title: 'Client Workspace', description: 'Track secure Elx Studio projects, files, messages and delivery progress.' };

export default async function DashboardPage({ searchParams }: { searchParams?: Promise<{ lang?: string | string[] }> }) {
  const query = await searchParams;
  const locale = await resolveLocale(query?.lang);
  const { supabase, user } = await requireUser('/dashboard');
  const [{ data: orders }, { data: profile }, { count: unread }] = await Promise.all([
    supabase.from('orders').select('id, order_number, project_title, status, payment_status, quote_status, deadline, created_at, category:service_categories(title), service:services(title)').eq('client_id', user.id).order('created_at', { ascending: false }),
    supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle(),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).is('read_at', null),
  ]);
  const name = profile?.full_name || user.user_metadata.full_name || user.email || 'Client';
  return <SiteShell locale={locale}><section className="px-5 py-8 md:px-10 md:py-12"><div className="mx-auto max-w-[1440px]"><DashboardClient locale={locale} name={name} unread={unread || 0} orders={(orders || []) as unknown as DashboardOrder[]} /></div></section></SiteShell>;
}
