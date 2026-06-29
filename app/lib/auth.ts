import 'server-only';

import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from './supabase/server';

export const staffRoles = ['super_admin', 'admin', 'project_manager'] as const;
export const adminEmail = 'hello@elxholdings.com';

function hasGoogleIdentity(user: { app_metadata?: Record<string, unknown>; identities?: Array<{ provider?: string }> | null }) {
  const providers = user.app_metadata?.providers;
  return user.app_metadata?.provider === 'google'
    || (Array.isArray(providers) && providers.includes('google'))
    || Boolean(user.identities?.some((identity) => identity.provider === 'google'));
}

function sessionUsedOAuth(accessToken?: string) {
  if (!accessToken) return false;
  try {
    const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString('utf8')) as {
      amr?: Array<{ method?: string }>;
    };
    return Boolean(payload.amr?.some((method) => method.method === 'oauth'));
  } catch {
    return false;
  }
}

export function isGoogleAdminSession(
  user: { email?: string | null; app_metadata?: Record<string, unknown>; identities?: Array<{ provider?: string }> | null },
  accessToken?: string,
) {
  return user.email?.trim().toLowerCase() === adminEmail && hasGoogleIdentity(user) && sessionUsedOAuth(accessToken);
}

export async function getAuthContext() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { supabase: null, user: null, roles: [] as string[] };

  const [{ data: { user } }, { data: { session } }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.auth.getSession(),
  ]);
  if (!user) return { supabase, user: null, roles: [] as string[] };

  const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
  const rawRoles = (data || []).map((item) => item.role as string);
  const roles = isGoogleAdminSession(user, session?.access_token)
    ? rawRoles
    : rawRoles.filter((role) => !staffRoles.includes(role as (typeof staffRoles)[number]));
  return { supabase, user, roles };
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
