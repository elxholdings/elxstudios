import type { Metadata } from 'next';
import { requireStaff } from '../../lib/auth';
import { getSupabaseAdminClient } from '../../lib/supabase/admin';
import TeamClient, { type TeamRow } from './team-client';

export const metadata: Metadata = { title: 'Team | Elx Operations' };

export default async function TeamPage() {
  const { roles: currentRoles } = await requireStaff(); const admin = getSupabaseAdminClient(); if (!admin) return <p>Database unavailable.</p>;
  const [{ data: roles }, { data: profiles }, { data: experts }, { data: orders }, { data: assignments }, usersResult] = await Promise.all([
    admin.from('user_roles').select('user_id, role'), admin.from('profiles').select('id, full_name, status'), admin.from('expert_profiles').select('user_id, skills, availability'), admin.from('orders').select('assigned_manager_id, assigned_expert_id, status'), admin.from('task_assignments').select('expert_id, status'), admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const staffIds = new Set((roles || []).filter((item) => item.role !== 'client').map((item) => item.user_id)); const profilesMap = new Map((profiles || []).map((item) => [item.id, item])); const expertsMap = new Map((experts || []).map((item) => [item.user_id, item])); const usersMap = new Map(usersResult.data.users.map((item) => [item.id, item]));
  const members: TeamRow[] = Array.from(staffIds).map((id) => { const profile = profilesMap.get(id); const expert = expertsMap.get(id); return { id, name: profile?.full_name || usersMap.get(id)?.user_metadata.full_name || 'Unnamed team member', email: usersMap.get(id)?.email || '', roles: (roles || []).filter((item) => item.user_id === id).map((item) => item.role as string), status: profile?.status || 'pending', assignedOrders: (orders || []).filter((order) => (order.assigned_manager_id === id || order.assigned_expert_id === id) && !['completed', 'cancelled'].includes(order.status)).length, activeTasks: (assignments || []).filter((item) => item.expert_id === id && ['accepted', 'in_progress'].includes(item.status)).length, skills: (expert?.skills || []) as string[], availability: expert?.availability || null }; });
  return <TeamClient members={members} canManage={currentRoles.some((role) => ['super_admin', 'admin'].includes(role))} />;
}
