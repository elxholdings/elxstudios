import { NextResponse } from 'next/server';
import { logAdminAudit } from '../../../lib/admin-audit';
import { getAuthContext } from '../../../lib/auth';
import { ELX_STUDIO_COMPANY_ID } from '../../../lib/meta';
import { getSupabaseAdminClient } from '../../../lib/supabase/admin';

export async function POST(request: Request) {
  const { user, roles } = await getAuthContext(); if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => ['super_admin', 'admin'].includes(role))) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const body = await request.json().catch(() => ({})) as Record<string, unknown>; const title = String(body.title || '').trim().slice(0, 250); const slug = String(body.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 120);
  if (!title || !slug) return NextResponse.json({ error: 'Title and slug are required.' }, { status: 400 });
  const admin = getSupabaseAdminClient(); if (!admin) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 });
  const { data, error } = await admin.from('digital_products').insert({ company_id: ELX_STUDIO_COMPANY_ID, title, slug, summary: String(body.summary || '').trim().slice(0, 1000), price: Math.max(0, Number(body.price) || 0), currency: 'USD', status: 'draft', created_by: user.id, updated_by: user.id }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await logAdminAudit({ actorId: user.id, action: 'product.created', entityType: 'digital_product', entityId: data.id, newData: { title, slug }, request });
  return NextResponse.json({ ok: true, id: data.id });
}
