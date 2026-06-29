import { NextResponse } from 'next/server';
import { logAdminAudit } from '../../../../lib/admin-audit';
import { getAuthContext } from '../../../../lib/auth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, roles } = await getAuthContext(); if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => ['super_admin', 'admin'].includes(role))) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const { id } = await params; const admin = getSupabaseAdminClient(); if (!admin) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
  const { data } = await admin.from('media_assets').select('storage_path,file_name').eq('id', id).maybeSingle(); if (!data) return NextResponse.json({ error: 'Media not found.' }, { status: 404 });
  const { error } = await admin.from('media_assets').delete().eq('id', id); if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await admin.storage.from('site-media').remove([data.storage_path]);
  await logAdminAudit({ actorId: user.id, action: 'media.deleted', entityType: 'media_asset', entityId: id, oldData: data, request });
  return NextResponse.json({ ok: true });
}
