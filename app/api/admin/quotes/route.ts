import { NextResponse } from 'next/server';
import { logAdminAudit } from '../../../lib/admin-audit';
import { getAuthContext, staffRoles } from '../../../lib/auth';
import { getSupabaseAdminClient } from '../../../lib/supabase/admin';

export async function POST(request: Request) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { orderId?: string; total?: number; currency?: string; description?: string; notes?: string };
  const total = Number(body.total);
  const description = String(body.description || '').trim().slice(0, 500);
  const notes = String(body.notes || '').trim().slice(0, 3000);
  const currency = String(body.currency || 'USD').toUpperCase().slice(0, 3);
  if (!body.orderId || !description || !Number.isFinite(total) || total < 0) return NextResponse.json({ error: 'Order, line item and a valid total are required.' }, { status: 400 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Server database access is not configured.' }, { status: 503 });
  const { data: order } = await admin.from('orders').select('id, client_id, order_number').eq('id', body.orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  const { data: previous } = await admin.from('quotes').select('version').eq('order_id', order.id).order('version', { ascending: false }).limit(1);
  const version = Number(previous?.[0]?.version || 0) + 1;
  const validUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data: quote, error } = await admin.from('quotes').insert({ order_id: order.id, version, status: 'sent', subtotal: total, total, currency, notes, valid_until: validUntil, sent_by: user.id, sent_at: new Date().toISOString() }).select('id').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  await admin.from('quote_items').insert({ quote_id: quote.id, description, quantity: 1, unit_price: total, total, sort_order: 0 });
  await admin.from('orders').update({ price: total, currency, quote_status: 'sent', status: 'quote_sent' }).eq('id', order.id);
  if (order.client_id) await admin.from('notifications').insert({ user_id: order.client_id, event_type: 'quote_sent', title: `Quote ready for ${order.order_number}`, body: `${currency} ${total.toLocaleString()} — open your workspace to review the scope.`, data: { order_id: order.id, quote_id: quote.id } });
  await logAdminAudit({ actorId: user.id, action: 'quote.sent', entityType: 'quote', entityId: quote.id, newData: { order_id: order.id, version, total, currency }, request });
  return NextResponse.json({ ok: true, quoteId: quote.id });
}
