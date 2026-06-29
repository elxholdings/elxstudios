import { NextResponse } from 'next/server';
import { logAdminAudit } from '../../../../../lib/admin-audit';
import { getAuthContext } from '../../../../../lib/auth';
import { ELX_STUDIO_COMPANY_ID } from '../../../../../lib/meta';
import { getSupabaseAdminClient } from '../../../../../lib/supabase/admin';

const validRoles = new Set(['super_admin', 'admin', 'project_manager', 'expert', 'client']);
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, roles } = await getAuthContext(); if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 }); if (!roles.some((role) => ['super_admin', 'admin'].includes(role))) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const { id } = await params; const body = await request.json().catch(() => ({})) as { roles?: string[] }; const nextRoles = Array.from(new Set(body.roles || [])); if (nextRoles.length === 0 || nextRoles.some((role) => !validRoles.has(role))) return NextResponse.json({ error: 'Choose at least one valid role.' }, { status: 400 });
  const admin = getSupabaseAdminClient(); if (!admin) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 }); const { data: current } = await admin.from('user_roles').select('role').eq('user_id', id).eq('company_id', ELX_STUDIO_COMPANY_ID); const oldRoles = (current || []).map((item) => item.role as string);
  if (id === user.id && oldRoles.some((role) => ['super_admin', 'admin'].includes(role)) && !nextRoles.some((role) => ['super_admin', 'admin'].includes(role))) return NextResponse.json({ error: 'You cannot remove your own administrative access.' }, { status: 400 });
  if (oldRoles.includes('super_admin') && !nextRoles.includes('super_admin')) { const { count } = await admin.from('user_roles').select('user_id', { count: 'exact', head: true }).eq('company_id', ELX_STUDIO_COMPANY_ID).eq('role', 'super_admin'); if ((count || 0) <= 1) return NextResponse.json({ error: 'The final super administrator cannot be removed.' }, { status: 400 }); }
  const toAdd = nextRoles.filter((role) => !oldRoles.includes(role)); const toRemove = oldRoles.filter((role) => !nextRoles.includes(role));
  if (toAdd.length) { const { error } = await admin.from('user_roles').insert(toAdd.map((role) => ({ user_id: id, company_id: ELX_STUDIO_COMPANY_ID, role, granted_by: user.id }))); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); }
  if (toRemove.length) { const { error } = await admin.from('user_roles').delete().eq('user_id', id).eq('company_id', ELX_STUDIO_COMPANY_ID).in('role', toRemove); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); }
  await logAdminAudit({ actorId: user.id, action: 'team.roles_updated', entityType: 'user', entityId: id, oldData: { roles: oldRoles }, newData: { roles: nextRoles }, request }); return NextResponse.json({ ok: true });
}
