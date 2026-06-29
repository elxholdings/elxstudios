import { NextResponse } from 'next/server';
import { logAdminAudit } from '../../../lib/admin-audit';
import { getAuthContext, staffRoles } from '../../../lib/auth';
import { ELX_STUDIO_COMPANY_ID } from '../../../lib/meta';
import { getSupabaseAdminClient } from '../../../lib/supabase/admin';

const allowed = new Set(['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm','video/quicktime']);

export async function POST(request: Request) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const form = await request.formData(); const file = form.get('file');
  if (!(file instanceof File) || !allowed.has(file.type)) return NextResponse.json({ error: 'Upload a JPG, PNG, WebP, GIF, MP4, WebM or MOV file.' }, { status: 400 });
  if (file.size > 100 * 1024 * 1024) return NextResponse.json({ error: 'Media must be 100 MB or smaller.' }, { status: 400 });
  const admin = getSupabaseAdminClient(); if (!admin) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-140);
  const now = new Date(); const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await admin.storage.from('site-media').upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });
  const { data: publicData } = admin.storage.from('site-media').getPublicUrl(path);
  const record = { company_id: ELX_STUDIO_COMPANY_ID, kind: file.type.startsWith('video/') ? 'video' : 'image', file_name: file.name, title: String(form.get('title') || '').trim().slice(0, 200), alt_text: String(form.get('altText') || '').trim().slice(0, 500), mime_type: file.type, file_size: file.size, storage_path: path, public_url: publicData.publicUrl, created_by: user.id };
  const { data, error } = await admin.from('media_assets').insert(record).select('*').single();
  if (error) { await admin.storage.from('site-media').remove([path]); return NextResponse.json({ error: error.message }, { status: 400 }); }
  await logAdminAudit({ actorId: user.id, action: 'media.uploaded', entityType: 'media_asset', entityId: data.id, newData: { file_name: file.name, kind: record.kind, file_size: file.size }, request });
  return NextResponse.json({ ok: true, asset: data });
}
