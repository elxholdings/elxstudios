import { NextResponse } from 'next/server';
import { logAdminAudit } from '../../../../lib/admin-audit';
import { getAuthContext } from '../../../../lib/auth';
import { ELX_STUDIO_COMPANY_ID } from '../../../../lib/meta';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => ['super_admin', 'admin'].includes(role))) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const { key } = await params;
  if (key !== 'homepage') return NextResponse.json({ error: 'Unsupported content document.' }, { status: 400 });
  const body = await request.json().catch(() => ({})) as { content?: unknown };
  if (!body.content || typeof body.content !== 'object' || Array.isArray(body.content) || JSON.stringify(body.content).length > 150000) return NextResponse.json({ error: 'Invalid content document.' }, { status: 400 });
  const admin = getSupabaseAdminClient(); if (!admin) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
  const { data: old } = await admin.from('site_content').select('content').eq('company_id', ELX_STUDIO_COMPANY_ID).eq('key', key).maybeSingle();
  const { error } = await admin.from('site_content').upsert({ company_id: ELX_STUDIO_COMPANY_ID, key, label: 'Homepage', content: body.content, is_published: true, updated_by: user.id }, { onConflict: 'company_id,key' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await logAdminAudit({ actorId: user.id, action: 'site_content.updated', entityType: 'site_content', entityId: key, oldData: old?.content || null, newData: body.content, request });
  return NextResponse.json({ ok: true });
}
