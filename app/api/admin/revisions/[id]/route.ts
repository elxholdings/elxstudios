import { NextResponse } from 'next/server';
import { getAuthContext, staffRoles } from '../../../../lib/auth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({})) as { status?: string; isInScope?: boolean };
  if (!['approved', 'declined', 'completed'].includes(String(body.status))) return NextResponse.json({ error: 'Invalid revision decision.' }, { status: 400 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Server database access is not configured.' }, { status: 503 });
  const { data: revision, error } = await admin.from('revisions').update({ status: body.status, is_in_scope: Boolean(body.isInScope), decided_by: user.id, decided_at: new Date().toISOString() }).eq('id', id).select('order_id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { data: order } = await admin.from('orders').select('client_id, order_number').eq('id', revision.order_id).single();
  if (order?.client_id) await admin.from('notifications').insert({ user_id: order.client_id, event_type: 'revision_decision', title: `Revision update for ${order.order_number}`, body: body.status === 'approved' ? 'The requested changes were approved and added to the work queue.' : 'The request needs a scope discussion before work begins.', data: { order_id: revision.order_id, revision_id: id } });
  return NextResponse.json({ ok: true });
}
