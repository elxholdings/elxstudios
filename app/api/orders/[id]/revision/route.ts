import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';
import { getSupabaseServerClient } from '../../../../lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!supabase || !user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { reason?: string; comments?: string };
  const reason = String(body.reason || '').trim().slice(0, 200);
  const comments = String(body.comments || '').trim().slice(0, 3000);
  if (!reason || !comments) return NextResponse.json({ error: 'Reason and comments are required.' }, { status: 400 });
  const { data: order } = await supabase.from('orders').select('id').eq('id', id).eq('client_id', user.id).maybeSingle();
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  const { error } = await supabase.from('revisions').insert({ order_id: id, requested_by: user.id, reason, comments, supporting_file_paths: [] });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const admin = getSupabaseAdminClient();
  if (admin) await admin.from('orders').update({ status: 'revision_requested' }).eq('id', id);
  return NextResponse.json({ ok: true });
}
