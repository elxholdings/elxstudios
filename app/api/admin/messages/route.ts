import { NextResponse } from 'next/server';
import { logAdminAudit } from '../../../lib/admin-audit';
import { getAuthContext, staffRoles } from '../../../lib/auth';
import { getSupabaseAdminClient } from '../../../lib/supabase/admin';

export async function POST(request: Request) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { orderId?: string; body?: string };
  const message = String(body.body || '').trim().slice(0, 5000);
  if (!body.orderId || !message) return NextResponse.json({ error: 'Order and message are required.' }, { status: 400 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Server database access is not configured.' }, { status: 503 });
  const { data: order } = await admin.from('orders').select('id, client_id, order_number').eq('id', body.orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  const { error } = await admin.from('order_messages').insert({ order_id: order.id, sender_id: user.id, recipient_id: order.client_id, body: message, scope: 'client' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (order.client_id) await admin.from('notifications').insert({ user_id: order.client_id, event_type: 'order_message', title: `New message on ${order.order_number}`, body: message.slice(0, 180), data: { order_id: order.id } });
  await logAdminAudit({ actorId: user.id, action: 'order.message_sent', entityType: 'order', entityId: order.id, newData: { body_length: message.length }, request });
  return NextResponse.json({ ok: true });
}
