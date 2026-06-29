import { NextResponse } from 'next/server';
import { logAdminAudit } from '../../../../../lib/admin-audit';
import { getAuthContext, staffRoles } from '../../../../../lib/auth';
import { getSupabaseAdminClient } from '../../../../../lib/supabase/admin';

const tableMap = { page: 'cms_pages', post: 'blog_posts', portfolio: 'portfolio_items' } as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ kind: string; id: string }> }) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const { kind, id } = await params;
  const table = tableMap[kind as keyof typeof tableMap];
  if (!table) return NextResponse.json({ error: 'Unknown content type.' }, { status: 400 });
  const body = await request.json().catch(() => ({})) as { status?: string; title?: string; summary?: string; body?: string; seo_title?: string; meta_description?: string };
  if (body.status !== undefined && !['draft', 'review', 'published', 'archived'].includes(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
  const { data: old } = await admin.from(table).select('*').eq('id', id).maybeSingle();
  if (!old) return NextResponse.json({ error: 'Content not found.' }, { status: 404 });
  const updates: Record<string, unknown> = {};
  if (body.status !== undefined) { updates.status = body.status; updates.published_at = body.status === 'published' ? old.published_at || new Date().toISOString() : old.published_at; }
  if (body.title !== undefined) { const title = body.title.trim().slice(0, 250); if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 }); updates.title = title; }
  if (body.summary !== undefined) { if (kind === 'post') updates.excerpt = body.summary.trim().slice(0, 1000); if (kind === 'portfolio') updates.summary = body.summary.trim().slice(0, 1000); }
  if (body.body !== undefined && kind !== 'portfolio') updates.body = { ...(typeof old.body === 'object' && old.body ? old.body : {}), content: body.body.slice(0, 100000) };
  if (kind !== 'portfolio') { if (body.seo_title !== undefined) updates.seo_title = body.seo_title.trim().slice(0, 250) || null; if (body.meta_description !== undefined) updates.meta_description = body.meta_description.trim().slice(0, 500) || null; }
  if (!Object.keys(updates).length) return NextResponse.json({ error: 'No supported changes.' }, { status: 400 });
  const { error } = await admin.from(table).update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await logAdminAudit({ actorId: user.id, action: 'content.updated', entityType: kind, entityId: id, oldData: { title: old.title, status: old.status }, newData: updates, request });
  return NextResponse.json({ ok: true });
}
