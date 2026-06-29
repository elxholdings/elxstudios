import type { Metadata } from 'next';
import Link from 'next/link';
import { requireStaff } from '../lib/auth';
import { getSupabaseAdminClient } from '../lib/supabase/admin';

export const metadata: Metadata = { title: 'Operations Overview' };

type OverviewOrder = { id: string; order_number: string; project_title: string; status: string; price: number | null; currency: string; deadline: string | null; created_at: string };

export default async function AdminOverviewPage() {
  await requireStaff();
  const admin = getSupabaseAdminClient();
  if (!admin) return <ErrorState />;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const [{ data: orderRows }, { count: clients }, { count: openTickets }, { count: pendingRevisions }, { count: unreadMessages }, { count: leads }, { data: assignments }] = await Promise.all([
    admin.from('orders').select('id, order_number, project_title, status, price, currency, deadline, created_at').order('created_at', { ascending: false }),
    admin.from('user_roles').select('user_id', { count: 'exact', head: true }).eq('role', 'client'),
    admin.from('support_tickets').select('id', { count: 'exact', head: true }).in('status', ['open', 'in_progress', 'reopened']),
    admin.from('revisions').select('id', { count: 'exact', head: true }).eq('status', 'requested'),
    admin.from('order_messages').select('id', { count: 'exact', head: true }).is('read_at', null).gte('created_at', weekAgo),
    admin.from('meta_leads').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    admin.from('task_assignments').select('status, expert_id'),
  ]);
  const orders = (orderRows || []) as OverviewOrder[];
  const activeStatuses = ['submitted', 'awaiting_quote', 'quote_sent', 'awaiting_payment', 'paid', 'assigned', 'in_progress', 'quality_review', 'ready_for_delivery', 'revision_requested'];
  const active = orders.filter((order) => activeStatuses.includes(order.status));
  const overdue = active.filter((order) => order.deadline && new Date(order.deadline) < now).length;
  const newThisWeek = orders.filter((order) => order.created_at >= weekAgo).length;
  const unassigned = active.filter((order) => ['submitted', 'awaiting_quote'].includes(order.status)).length;
  const statusCounts = orders.reduce<Record<string, number>>((acc, order) => { acc[order.status] = (acc[order.status] || 0) + 1; return acc; }, {});
  const maxStatus = Math.max(1, ...Object.values(statusCounts));
  const valueByCurrency = orders.reduce<Record<string, number>>((acc, order) => { if (order.price) acc[order.currency] = (acc[order.currency] || 0) + Number(order.price); return acc; }, {});
  const busyExperts = new Set((assignments || []).filter((item) => ['accepted', 'in_progress'].includes(item.status)).map((item) => item.expert_id)).size;
  return <div className="grid gap-6">
    <section className="bg-[#073C3E] p-7 text-white md:p-10"><p className="text-xs font-black uppercase tracking-[.16em] text-[#DDF65C]">Executive overview</p><div className="mt-3 flex flex-wrap items-end justify-between gap-6"><div><h1 className="text-5xl font-black tracking-[-.065em] md:text-7xl">Good operations<br />start here.</h1><p className="mt-5 max-w-xl text-sm leading-6 text-white/55">A live view of demand, delivery risk, team load and client follow-up. Payments remain manual by design.</p></div><Link href="/admin/orders" className="bg-[#DDF65C] px-6 py-4 text-sm font-black text-[#102321]">Open order control →</Link></div></section>
    <section className="grid grid-cols-2 gap-3 xl:grid-cols-6"><Metric label="All orders" value={orders.length} /><Metric label="Active" value={active.length} /><Metric label="New / 7 days" value={newThisWeek} /><Metric label="Overdue" value={overdue} alert={overdue > 0} /><Metric label="Clients" value={clients || 0} /><Metric label="New leads" value={leads || 0} /></section>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <section className="bg-white p-6 md:p-8"><div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Pipeline</p><h2 className="mt-2 text-3xl font-black">Orders by stage</h2></div><span className="text-xs text-black/35">{orders.length} total</span></div><div className="mt-7 grid gap-4">{Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([status, count]) => <div key={status}><div className="flex justify-between text-xs font-black capitalize"><span>{status.replaceAll('_', ' ')}</span><span>{count}</span></div><div className="mt-2 h-2 bg-[#E8E4D8]"><div className="h-full bg-[#073C3E]" style={{ width: `${(count / maxStatus) * 100}%` }} /></div></div>)}</div></section>
      <section className="bg-white p-6 md:p-8"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Attention queue</p><h2 className="mt-2 text-3xl font-black">Needs a human</h2><div className="mt-6 grid gap-2"><Queue href="/admin/orders" label="Unassigned / unquoted" value={unassigned} /><Queue href="/admin/orders" label="Overdue projects" value={overdue} alert /><Queue href="/admin/support" label="Open support tickets" value={openTickets || 0} /><Queue href="/admin/orders" label="Pending revisions" value={pendingRevisions || 0} /><Queue href="/admin/orders" label="Recent unread messages" value={unreadMessages || 0} /><Queue href="/admin/team" label="Experts with active tasks" value={busyExperts} /></div></section>
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]"><section className="bg-white p-6 md:p-8"><div className="flex items-end justify-between"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Recent work</p><h2 className="mt-2 text-3xl font-black">Latest orders</h2></div><Link href="/admin/orders" className="text-xs font-black">View all →</Link></div><div className="mt-6 grid gap-2">{orders.slice(0, 7).map((order) => <Link key={order.id} href="/admin/orders" className="grid gap-2 bg-[#F5F2E8] p-4 md:grid-cols-[150px_1fr_140px] md:items-center"><span className="text-[10px] font-black uppercase tracking-[.1em] text-black/40">{order.order_number}</span><strong className="text-sm">{order.project_title}</strong><span className="text-xs font-black capitalize">{order.status.replaceAll('_', ' ')}</span></Link>)}{orders.length === 0 && <p className="bg-[#F5F2E8] p-5 text-sm text-black/45">No orders yet.</p>}</div></section><section className="bg-[#102321] p-6 text-white md:p-8"><p className="text-xs font-black uppercase tracking-[.14em] text-[#DDF65C]">Quoted value</p><h2 className="mt-2 text-3xl font-black">Pipeline value</h2><div className="mt-8 grid gap-5">{Object.entries(valueByCurrency).map(([currency, value]) => <div key={currency}><p className="text-4xl font-black">{currency} {value.toLocaleString()}</p><p className="mt-1 text-xs text-white/35">Quoted across all orders</p></div>)}{Object.keys(valueByCurrency).length === 0 && <p className="text-sm text-white/45">No quotes have been priced yet.</p>}</div><p className="mt-10 border-t border-white/10 pt-5 text-xs leading-5 text-white/35">Currencies are intentionally reported separately. No false exchange-rate consolidation.</p></section></div>
  </div>;
}

function Metric({ label, value, alert = false }: { label: string; value: number; alert?: boolean }) { return <div className={`p-5 ${alert ? 'bg-[#FFF0E8]' : 'bg-white'}`}><p className={`text-3xl font-black ${alert ? 'text-[#C13D20]' : ''}`}>{value}</p><p className="mt-2 text-[10px] font-black uppercase tracking-[.1em] text-black/40">{label}</p></div>; }
function Queue({ href, label, value, alert = false }: { href: string; label: string; value: number; alert?: boolean }) { return <Link href={href} className="flex items-center justify-between bg-[#F5F2E8] p-4 text-sm"><strong>{label}</strong><span className={`text-xl font-black ${alert && value > 0 ? 'text-[#C13D20]' : ''}`}>{value}</span></Link>; }
function ErrorState() { return <p className="bg-red-50 p-6 font-bold text-red-700">Supabase service access is not configured.</p>; }
