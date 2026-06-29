import { NextResponse } from 'next/server';
import { getAuthContext, staffRoles } from '../../../../lib/auth';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';

const validStatuses = new Set(['submitted', 'awaiting_quote', 'quote_sent', 'awaiting_payment', 'paid', 'assigned', 'in_progress', 'quality_review', 'ready_for_delivery', 'delivered', 'revision_requested', 'completed', 'cancelled', 'refunded']);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const updates: Record<string, string | null> = {};
  if ('status' in body) {
    const status = String(body.status || '');
    if (!validStatuses.has(status)) return NextResponse.json({ error: 'Invalid order status.' }, { status: 400 });
    updates.status = status;
    if (status === 'in_progress') updates.started_at = new Date().toISOString();
    if (status === 'completed') updates.completed_at = new Date().toISOString();
    if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();
  }
  for (const field of ['assigned_manager_id', 'assigned_expert_id'] as const) {
    if (field in body) {
      const value = body[field];
      if (value !== null && (typeof value !== 'string' || !/^[0-9a-f-]{36}$/i.test(value))) return NextResponse.json({ error: `Invalid ${field}.` }, { status: 400 });
      updates[field] = value as string | null;
    }
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'No supported changes supplied.' }, { status: 400 });
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Server database access is not configured.' }, { status: 503 });
  const { data: order, error } = await admin.from('orders').update(updates).eq('id', id).select('client_id, order_number').single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (order.client_id) await admin.from('notifications').insert({ user_id: order.client_id, event_type: 'order_updated', title: `${order.order_number} was updated`, body: updates.status ? `Status: ${updates.status.replaceAll('_', ' ')}` : 'The project team was updated.', data: { order_id: id } });
  return NextResponse.json({ ok: true });
}
