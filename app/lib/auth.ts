import 'server-only';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from './supabase/server';

export const staffRoles = ['super_admin', 'admin', 'project_manager'] as const;

export async function getAuthContext() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null, roles: [] as string[] };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, roles: [] as string[] };

  const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  return { supabase, user, roles: (data || []).map((item) => item.role as string) };
}

export async function requireUser(next = '/dashboard') {
  const context = await getAuthContext();
  if (!context.supabase) redirect('/login?error=configuration');
  if (!context.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return context as typeof context & { user: NonNullable<typeof context.user>; supabase: NonNullable<typeof context.supabase> };
}

export async function requireStaff() {
  const context = await requireUser('/admin');
  if (!context.roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) redirect('/dashboard');
  return context;
}
