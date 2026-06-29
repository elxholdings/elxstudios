import type { Metadata } from 'next';
import { SiteShell } from '../components/site-shell';
import { requireStaff } from '../lib/auth';
import AdminClient, { type AdminMessage, type AdminOrder, type AdminRevision, type TeamMember } from './admin-client';

export const metadata: Metadata = { title: 'Operations' };

export default async function AdminPage() {
  const { supabase, user } = await requireStaff();
  const [{ data: orders }, { data: profiles }, { data: roles }, { data: messages }, { data: revisions }] = await Promise.all([
    supabase.from('orders').select('id, order_number, project_title, status, payment_status, quote_status, deadline, price, currency, client_id, assigned_manager_id, assigned_expert_id, created_at, category:service_categories(title), service:services(title)').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name'),
    supabase.from('user_roles').select('user_id, role'),
    supabase.from('order_messages').select('id, order_id, sender_id, body, created_at').eq('scope', 'client').order('created_at'),
    supabase.from('revisions').select('id, order_id, reason, comments, status, is_in_scope, created_at').order('created_at', { ascending: false }),
  ]);
  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile.full_name || 'Unnamed team member']));
  const teamMap = new Map<string, TeamMember>();
  for (const role of roles || []) {
    const member: TeamMember = teamMap.get(role.user_id) || { id: role.user_id, name: profileMap.get(role.user_id) || 'Unnamed team member', roles: [] };
    member.roles.push(role.role as string);
    teamMap.set(role.user_id, member);
  }
  return <SiteShell><section className="px-5 py-8 md:px-10 md:py-12"><div className="mx-auto max-w-[1440px]"><AdminClient orders={(orders || []) as unknown as AdminOrder[]} team={Array.from(teamMap.values())} userId={user.id} messages={(messages || []) as unknown as AdminMessage[]} revisions={(revisions || []) as unknown as AdminRevision[]} /></div></section></SiteShell>;
}
