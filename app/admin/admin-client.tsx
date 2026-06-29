'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../lib/supabase/client';

export type AdminOrder = {
  id: string; order_number: string; project_title: string; status: string; payment_status: string; quote_status: string;
  deadline: string | null; price: number | null; currency: string; client_id: string | null;
  assigned_manager_id: string | null; assigned_expert_id: string | null; created_at: string;
  category: { title: string } | null; service: { title: string } | null;
};
export type TeamMember = { id: string; name: string; roles: string[] };
export type AdminMessage = { id: string; order_id: string; sender_id: string; body: string; created_at: string };
export type AdminRevision = { id: string; order_id: string; reason: string; comments: string; status: string; is_in_scope: boolean | null; created_at: string };

const statuses = ['submitted', 'awaiting_quote', 'quote_sent', 'awaiting_payment', 'paid', 'assigned', 'in_progress', 'quality_review', 'ready_for_delivery', 'delivered', 'revision_requested', 'completed', 'cancelled'];

export default function AdminClient({ orders, team, userId, messages, revisions }: { orders: AdminOrder[]; team: TeamMember[]; userId: string; messages: AdminMessage[]; revisions: AdminRevision[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(orders[0]?.id || '');
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [quote, setQuote] = useState({ total: '', description: 'Professional project delivery', notes: '', currency: 'USD' });
  const [message, setMessage] = useState('');
  const selected = orders.find((order) => order.id === selectedId);
  const filtered = useMemo(() => orders.filter((order) => `${order.order_number} ${order.project_title} ${order.status}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const managers = team.filter((member) => member.roles.some((role) => ['super_admin', 'admin', 'project_manager'].includes(role)));
  const experts = team.filter((member) => member.roles.includes('expert'));
  const selectedMessages = messages.filter((item) => item.order_id === selectedId);
  const selectedRevisions = revisions.filter((item) => item.order_id === selectedId);

  async function call(url: string, options: RequestInit, action: string) {
    setBusy(action); setError(''); setNotice('');
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) setError(payload.error || 'The action could not be completed.'); else { setNotice('Saved successfully.'); router.refresh(); }
    setBusy('');
    return response.ok;
  }

  async function patchOrder(field: string, value: string | null) {
    if (!selected) return;
    await call(`/api/admin/orders/${selected.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value || null }) }, `order-${field}`);
  }

  async function sendQuote(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    const ok = await call('/api/admin/quotes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: selected.id, ...quote, total: Number(quote.total) }) }, 'quote');
    if (ok) setQuote((current) => ({ ...current, total: '', notes: '' }));
  }

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!selected || !message.trim()) return;
    const ok = await call('/api/admin/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: selected.id, body: message.trim() }) }, 'message');
    if (ok) setMessage('');
  }

  async function uploadDeliverable(file: File) {
    if (!selected) return;
    if (file.size > 50 * 1024 * 1024) { setError('Files must be 50 MB or smaller.'); return; }
    setBusy('deliverable'); setError(''); setNotice('');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setError('Supabase is not configured.'); setBusy(''); return; }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${selected.id}/final/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('deliverables').upload(path, file, { contentType: file.type || undefined });
    if (uploadError) { setError(uploadError.message); setBusy(''); return; }
    const response = await fetch('/api/admin/deliverables', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId: selected.id, title: file.name, storagePath: path }) });
    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) { await supabase.storage.from('deliverables').remove([path]); setError(payload.error || 'Deliverable metadata could not be saved.'); } else { setNotice('Approved deliverable published to the client.'); router.refresh(); }
    setBusy('');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <aside className="bg-[#102321] p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#DDF65C]">Operations</p><h1 className="mt-3 text-3xl font-black tracking-[-.04em]">Order control</h1>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search orders…" className="mt-6 w-full border-0 border-b border-white/20 bg-transparent py-3 text-sm outline-none placeholder:text-white/30" />
        <div className="mt-5 max-h-[70vh] space-y-2 overflow-y-auto">{filtered.map((order) => <button key={order.id} onClick={() => setSelectedId(order.id)} className={`w-full p-4 text-left ${selectedId === order.id ? 'bg-[#DDF65C] text-[#102321]' : 'bg-white/5'}`}><span className="text-[10px] font-black uppercase tracking-[.1em] opacity-50">{order.order_number}</span><strong className="mt-1 block text-sm">{order.project_title}</strong><span className="mt-2 block text-[10px] font-black uppercase opacity-50">{order.status.replaceAll('_', ' ')}</span></button>)}</div>
      </aside>

      {!selected ? <section className="bg-white p-10"><h2 className="text-4xl font-black">No orders yet.</h2></section> : <main className="grid gap-6">
        <section className="bg-white p-7 md:p-10"><div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">{selected.order_number}</p><h2 className="mt-2 text-4xl font-black tracking-[-.05em]">{selected.project_title}</h2><p className="mt-2 text-sm text-black/45">{selected.category?.title || 'Custom'} / {selected.service?.title || 'Scope review'}</p></div><span className="bg-[#F5F2E8] px-4 py-3 text-xs font-black capitalize">{selected.status.replaceAll('_', ' ')}</span></div>
          <div className="mt-8 grid gap-5 md:grid-cols-3"><Control label="Workflow status"><select className="elx-field capitalize" value={selected.status} disabled={busy === 'order-status'} onChange={(event) => void patchOrder('status', event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}</select></Control><Control label="Project manager"><select className="elx-field" value={selected.assigned_manager_id || ''} disabled={busy === 'order-assigned_manager_id'} onChange={(event) => void patchOrder('assigned_manager_id', event.target.value)}><option value="">Unassigned</option>{managers.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></Control><Control label="Expert"><select className="elx-field" value={selected.assigned_expert_id || ''} disabled={busy === 'order-assigned_expert_id'} onChange={(event) => void patchOrder('assigned_expert_id', event.target.value)}><option value="">Unassigned</option>{experts.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></Control></div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={sendQuote} className="bg-[#073C3E] p-7 text-white"><p className="text-xs font-black uppercase tracking-[.14em] text-[#DDF65C]">Manual quote</p><h3 className="mt-2 text-3xl font-black">Price the scope.</h3><div className="mt-5 grid grid-cols-[100px_1fr] gap-3"><select value={quote.currency} onChange={(event) => setQuote({ ...quote, currency: event.target.value })} className="border-0 border-b border-white/20 bg-transparent py-3 outline-none"><option className="text-black">USD</option><option className="text-black">KES</option><option className="text-black">EUR</option><option className="text-black">GBP</option></select><input type="number" min="0" step="0.01" value={quote.total} onChange={(event) => setQuote({ ...quote, total: event.target.value })} className="border-0 border-b border-white/20 bg-transparent py-3 outline-none" placeholder="Total" required /></div><input value={quote.description} onChange={(event) => setQuote({ ...quote, description: event.target.value })} className="mt-4 w-full border-0 border-b border-white/20 bg-transparent py-3 outline-none" placeholder="Line item" required /><textarea value={quote.notes} onChange={(event) => setQuote({ ...quote, notes: event.target.value })} className="mt-4 min-h-24 w-full border-0 border-b border-white/20 bg-transparent py-3 outline-none" placeholder="Scope notes and assumptions" /><button disabled={busy === 'quote'} className="mt-5 bg-[#DDF65C] px-5 py-3 text-sm font-black text-[#102321] disabled:opacity-40">Send quote →</button></form>
          <section className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Final delivery</p><h3 className="mt-2 text-3xl font-black">Publish an approved file.</h3><p className="mt-4 text-sm leading-6 text-black/50">The file is private and becomes visible only to this client through a one-minute signed link.</p><label className="mt-6 inline-flex cursor-pointer bg-[#102321] px-5 py-3 text-sm font-black text-white">{busy === 'deliverable' ? 'Uploading…' : 'Upload deliverable'}<input type="file" className="hidden" disabled={busy === 'deliverable'} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadDeliverable(file); event.currentTarget.value = ''; }} /></label></section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={sendMessage} className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Client conversation</p><h3 className="mt-2 text-3xl font-black">Order messages.</h3><div className="mt-5 max-h-72 space-y-2 overflow-y-auto">{selectedMessages.length === 0 ? <p className="bg-[#F5F2E8] p-4 text-sm text-black/45">No messages on this order.</p> : selectedMessages.map((item) => <div key={item.id} className={`p-4 text-sm ${item.sender_id === userId ? 'ml-6 bg-[#DDF65C]' : 'mr-6 bg-[#F5F2E8]'}`}><p className="text-[10px] font-black uppercase text-black/35">{item.sender_id === userId ? 'You' : 'Client'} / {new Date(item.created_at).toLocaleString()}</p><p className="mt-2 whitespace-pre-wrap leading-5">{item.body}</p></div>)}</div><textarea value={message} onChange={(event) => setMessage(event.target.value)} className="elx-field mt-4 min-h-24 resize-y" placeholder="A scoped update the client will see in their workspace…" required /><button disabled={busy === 'message'} className="mt-4 bg-[#102321] px-5 py-3 text-sm font-black text-white disabled:opacity-40">Send and notify →</button></form>
          <section className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Revision queue</p><h3 className="mt-2 text-3xl font-black">Requested changes.</h3><div className="mt-5 space-y-3">{selectedRevisions.length === 0 ? <p className="bg-[#F5F2E8] p-4 text-sm text-black/45">No revision requests.</p> : selectedRevisions.map((item) => <div key={item.id} className="bg-[#F5F2E8] p-4"><div className="flex justify-between gap-4"><strong className="text-sm">{item.reason}</strong><span className="text-[10px] font-black uppercase">{item.status}</span></div><p className="mt-2 text-sm leading-5 text-black/55">{item.comments}</p>{item.status === 'requested' && <div className="mt-3 flex gap-2"><button type="button" onClick={() => void call(`/api/admin/revisions/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved', isInScope: true }) }, `revision-${item.id}`)} className="bg-[#102321] px-3 py-2 text-xs font-black text-white">Approve</button><button type="button" onClick={() => void call(`/api/admin/revisions/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'declined', isInScope: false }) }, `revision-${item.id}`)} className="bg-white px-3 py-2 text-xs font-black">Out of scope</button></div>}</div>)}</div></section>
        </div>
        {notice && <p className="bg-[#E8F3E7] p-4 text-sm font-bold text-[#164F22]">{notice}</p>}{error && <p className="bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
      </main>}
    </div>
  );
}

function Control({ label, children }: { label: string; children: React.ReactNode }) { return <label><span className="text-xs font-black uppercase tracking-[.1em] text-black/40">{label}</span>{children}</label>; }
