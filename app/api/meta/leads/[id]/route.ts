import { NextResponse } from 'next/server';
import { getAuthContext, staffRoles } from '../../../../lib/auth';
import { ELX_STUDIO_COMPANY_ID } from '../../../../lib/meta';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({})) as { status?: string };
  if (!['new', 'contacted', 'qualified', 'converted', 'archived'].includes(String(body.status))) return NextResponse.json({ error: 'Invalid lead status.' }, { status: 400 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Database access is not configured.' }, { status: 503 });
  const { error } = await admin.from('meta_leads').update({ status: body.status }).eq('id', id).eq('company_id', ELX_STUDIO_COMPANY_ID);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
