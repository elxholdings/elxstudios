import { NextResponse } from 'next/server';
import { getAuthContext, staffRoles } from '../../../lib/auth';
import { getSupabaseAdminClient } from '../../../lib/supabase/admin';

export async function POST(request: Request) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { orderId?: string; title?: string; storagePath?: string };
  const title = String(body.title || '').trim().slice(0, 500);
  const path = String(body.storagePath || '');
  if (!body.orderId || !title || !path.startsWith(`${body.orderId}/`)) return NextResponse.json({ error: 'Invalid delivery metadata.' }, { status: 400 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Server database access is not configured.' }, { status: 503 });
  const { data: order } = await admin.from('orders').select('id, client_id, order_number').eq('id', body.orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  const { data: previous } = await admin.from('deliverables').select('version').eq('order_id', order.id).order('version', { ascending: false }).limit(1);
  const version = Number(previous?.[0]?.version || 0) + 1;
  const { data: delivery, error } = await admin.from('deliverables').insert({ order_id: order.id, uploaded_by: user.id, title, storage_path: path, version, is_final: true, quality_status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await admin.from('orders').update({ status: 'ready_for_delivery' }).eq('id', order.id);
  if (order.client_id) await admin.from('notifications').insert({ user_id: order.client_id, event_type: 'deliverable_ready', title: `Files ready for ${order.order_number}`, body: 'An approved deliverable is available in your secure workspace.', data: { order_id: order.id, deliverable_id: delivery.id } });
  return NextResponse.json({ ok: true, deliverableId: delivery.id });
}
