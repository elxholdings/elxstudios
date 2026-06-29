import type { Metadata } from 'next';
import { requireStaff } from '../../lib/auth';
import { getSupabaseAdminClient } from '../../lib/supabase/admin';
import ClientsClient, { type ClientRow } from './clients-client';

export const metadata: Metadata = { title: 'Clients | Elx Operations' };

export default async function ClientsPage() {
  await requireStaff();
  const admin = getSupabaseAdminClient(); if (!admin) return <p>Database unavailable.</p>;
  const [{ data: roles }, { data: profiles }, { data: orders }, usersResult] = await Promise.all([
    admin.from('user_roles').select('user_id').eq('role', 'client'),
    admin.from('profiles').select('id, full_name, phone, country, status, created_at'),
    admin.from('orders').select('client_id, status, price, currency'),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const profileMap = new Map((profiles || []).map((profile) => [profile.id, profile]));
  const userMap = new Map(usersResult.data.users.map((user) => [user.id, user]));
  const activeStatuses = new Set(['submitted', 'awaiting_quote', 'quote_sent', 'awaiting_payment', 'paid', 'assigned', 'in_progress', 'quality_review', 'ready_for_delivery', 'revision_requested']);
  const clients: ClientRow[] = (roles || []).map(({ user_id }) => {
    const profile = profileMap.get(user_id); const auth = userMap.get(user_id); const clientOrders = (orders || []).filter((order) => order.client_id === user_id);
    const quoted = clientOrders.reduce<Record<string, number>>((acc, order) => { if (order.price) acc[order.currency] = (acc[order.currency] || 0) + Number(order.price); return acc; }, {});
    return { id: user_id, name: profile?.full_name || auth?.user_metadata.full_name || 'Unnamed client', email: auth?.email || '', phone: profile?.phone || '', country: profile?.country || '', status: profile?.status || 'pending', createdAt: profile?.created_at || auth?.created_at || '', lastSignIn: auth?.last_sign_in_at || null, orders: clientOrders.length, active: clientOrders.filter((order) => activeStatuses.has(order.status)).length, quoted };
  });
  return <ClientsClient clients={clients} />;
}
