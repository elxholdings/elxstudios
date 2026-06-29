import { NextResponse } from 'next/server';
import { getAuthContext } from '../../../../lib/auth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

const statuses = new Set(['new','contacted','awaiting_payment','paid','fulfilled','cancelled']);
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { roles } = await getAuthContext(); if (!roles.some((role) => ['super_admin','admin'].includes(role))) return NextResponse.json({ error: 'Administrator access required.' }, { status: 403 });
  const { id } = await params; const body = await request.json().catch(() => ({})) as { status?: string }; if (!body.status || !statuses.has(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  const admin = getSupabaseAdminClient(); if (!admin) return NextResponse.json({ error: 'Database unavailable.' }, { status: 503 }); const { error } = await admin.from('product_requests').update({ status: body.status }).eq('id', id); if (error) return NextResponse.json({ error: error.message }, { status: 400 }); return NextResponse.json({ ok: true });
}
