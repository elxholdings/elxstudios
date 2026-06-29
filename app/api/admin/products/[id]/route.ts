import { NextResponse } from 'next/server';
import { logAdminAudit } from '../../../../lib/admin-audit';
import { getAuthContext } from '../../../../lib/auth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, roles } = await getAuthContext(); if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => ['super_admin', 'admin'].includes(role))) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const { id } = await params; const body = await request.json().catch(() => ({})) as Record<string, unknown>; const admin = getSupabaseAdminClient(); if (!admin) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
  const { data: old } = await admin.from('digital_products').select('*').eq('id', id).maybeSingle(); if (!old) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  const status = String(body.status ?? old.status); if (!['draft','published','archived'].includes(status)) return NextResponse.json({ error: 'Invalid product status.' }, { status: 400 });
  const updates = { title: String(body.title ?? old.title).trim().slice(0, 250), eyebrow: String(body.eyebrow ?? old.eyebrow).trim().slice(0, 120), summary: String(body.summary ?? old.summary).trim().slice(0, 1000), description: String(body.description ?? old.description).trim().slice(0, 10000), category: String(body.category ?? old.category).trim().slice(0, 120), price: Math.max(0, Number(body.price ?? old.price) || 0), currency: String(body.currency ?? old.currency).toUpperCase().slice(0, 3), cover_url: String(body.cover_url ?? old.cover_url ?? '').trim().slice(0, 2000) || null, preview_video_url: String(body.preview_video_url ?? old.preview_video_url ?? '').trim().slice(0, 2000) || null, included_files: Array.isArray(body.included_files) ? body.included_files.map(String).map((item) => item.trim()).filter(Boolean).slice(0, 30) : old.included_files, specifications: Array.isArray(body.specifications) ? body.specifications.slice(0, 30) : old.specifications, status, featured: typeof body.featured === 'boolean' ? body.featured : old.featured, sort_order: Number.isInteger(Number(body.sort_order)) ? Number(body.sort_order) : old.sort_order, updated_by: user.id };
  if (!updates.title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  const { error } = await admin.from('digital_products').update(updates).eq('id', id); if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await logAdminAudit({ actorId: user.id, action: 'product.updated', entityType: 'digital_product', entityId: id, oldData: { title: old.title, status: old.status }, newData: updates, request });
  return NextResponse.json({ ok: true });
}
