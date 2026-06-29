'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '../../../lib/supabase/client';

export type OrderWorkspaceData = {
  order: {
    id: string; order_number: string; project_title: string; instructions: string; purpose: string | null;
    status: string; payment_status: string; quote_status: string; deadline: string | null; output_formats: string[];
    price: number | null; currency: string; created_at: string;
    category: { title: string } | null; service: { title: string } | null;
  };
  files: Array<{ id: string; file_name: string; file_size: number | null; file_type: string | null; storage_bucket: string; storage_path: string; version: number; created_at: string }>;
  messages: Array<{ id: string; sender_id: string; body: string; created_at: string }>;
  revisions: Array<{ id: string; reason: string; comments: string; status: string; created_at: string }>;
  deliverables: Array<{ id: string; title: string; storage_path: string; version: number; created_at: string }>;
  quote: { id: string; version: number; status: string; total: number; currency: string; notes: string | null; valid_until: string | null } | null;
  quoteItems: Array<{ id: string; description: string; quantity: number; unit_price: number; total: number }>;
};

const stages = ['submitted', 'quote_sent', 'awaiting_payment', 'paid', 'assigned', 'in_progress', 'quality_review', 'ready_for_delivery', 'delivered', 'completed'];

export default function OrderWorkspace({ data, userId }: { data: OrderWorkspaceData; userId: string }) {
  const { order } = data;
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('Changes required');
  const [revision, setRevision] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const progressIndex = Math.max(0, stages.indexOf(order.status));

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setBusy('message'); setError('');
    const supabase = getSupabaseBrowserClient();
    const { error: sendError } = supabase ? await supabase.from('order_messages').insert({ order_id: order.id, sender_id: userId, body: message.trim(), scope: 'client' }) : { error: new Error('Supabase is not configured.') };
    if (sendError) setError(sendError.message); else { setMessage(''); router.refresh(); }
    setBusy('');
  }

  async function requestRevision(event: FormEvent) {
    event.preventDefault();
    if (!revision.trim()) return;
    setBusy('revision'); setError('');
    const response = await fetch(`/api/orders/${order.id}/revision`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason, comments: revision.trim() }) });
    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) setError(payload.error || 'Revision request could not be sent.'); else { setRevision(''); router.refresh(); }
    setBusy('');
  }

  async function uploadFile(file: File) {
    if (file.size > 50 * 1024 * 1024) { setError('Files must be 50 MB or smaller.'); return; }
    setBusy('upload'); setError('');
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setError('Supabase is not configured.'); setBusy(''); return; }
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${order.id}/source/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('order-files').upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (uploadError) { setError(uploadError.message); setBusy(''); return; }
    const { error: metadataError } = await supabase.from('order_files').insert({ order_id: order.id, uploaded_by: userId, file_name: file.name, file_type: file.type || null, file_size: file.size, storage_bucket: 'order-files', storage_path: path, visibility: 'shared' });
    if (metadataError) { await supabase.storage.from('order-files').remove([path]); setError(metadataError.message); } else router.refresh();
    setBusy('');
  }

  async function download(bucket: string, path: string) {
    setBusy(path); setError('');
    const supabase = getSupabaseBrowserClient();
    const { data: signed, error: signedError } = supabase ? await supabase.storage.from(bucket).createSignedUrl(path, 60) : { data: null, error: new Error('Supabase is not configured.') };
    if (signedError || !signed) setError(signedError?.message || 'Download link could not be created.'); else window.open(signed.signedUrl, '_blank', 'noopener,noreferrer');
    setBusy('');
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
      <main className="grid gap-6">
        <section className="bg-white p-7 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">{order.order_number}</p><h1 className="mt-2 text-4xl font-black tracking-[-.05em] md:text-5xl">{order.project_title}</h1><p className="mt-3 text-sm text-black/45">{order.category?.title || 'Custom project'} / {order.service?.title || 'Scope review'}</p></div><span className="bg-[#DDF65C] px-4 py-3 text-xs font-black capitalize">{order.status.replaceAll('_', ' ')}</span></div>
          <div className="mt-9"><div className="h-2 bg-[#E8E4D8]"><div className="h-full bg-[#F06449]" style={{ width: `${Math.max(5, ((progressIndex + 1) / stages.length) * 100)}%` }} /></div><div className="mt-3 flex justify-between text-[10px] font-black uppercase tracking-[.08em] text-black/35"><span>Submitted</span><span>Production</span><span>Delivered</span></div></div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3"><Fact label="Deadline" value={order.deadline ? new Date(order.deadline).toLocaleString() : 'To be confirmed'} /><Fact label="Quote" value={order.quote_status.replaceAll('_', ' ')} /><Fact label="Payment" value={order.payment_status.replaceAll('_', ' ')} /></div>
          <div className="mt-8 border-t border-black/10 pt-7"><p className="text-xs font-black uppercase tracking-[.12em] text-black/40">Project brief</p><p className="mt-3 whitespace-pre-wrap leading-7 text-black/60">{order.instructions}</p></div>
        </section>

        {data.quote && <section className="bg-[#073C3E] p-7 text-white md:p-10"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#DDF65C]">Quote v{data.quote.version} / {data.quote.status}</p><h2 className="mt-3 text-4xl font-black">{data.quote.currency} {Number(data.quote.total).toLocaleString()}</h2></div>{data.quote.valid_until && <p className="text-sm text-white/50">Valid until {new Date(data.quote.valid_until).toLocaleDateString()}</p>}</div>{data.quoteItems.length > 0 && <div className="mt-7 divide-y divide-white/10 border-t border-white/10">{data.quoteItems.map((item) => <div key={item.id} className="flex justify-between gap-4 py-4 text-sm"><span>{item.description} × {item.quantity}</span><strong>{data.quote?.currency} {Number(item.total).toLocaleString()}</strong></div>)}</div>}{data.quote.notes && <p className="mt-5 text-sm leading-6 text-white/55">{data.quote.notes}</p>}</section>}

        <section className="bg-white p-7 md:p-10">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Private files</p><h2 className="mt-2 text-3xl font-black">Source files & deliverables</h2></div><label className="cursor-pointer bg-[#102321] px-5 py-3 text-sm font-black text-white">{busy === 'upload' ? 'Uploading…' : '+ Upload source'}<input type="file" className="hidden" disabled={Boolean(busy)} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadFile(file); event.currentTarget.value = ''; }} /></label></div>
          {data.files.length === 0 && data.deliverables.length === 0 ? <p className="mt-6 bg-[#F5F2E8] p-5 text-sm text-black/50">No files yet. Upload source material here instead of sending public links.</p> : <div className="mt-6 grid gap-2">{data.files.map((file) => <FileRow key={file.id} title={file.file_name} meta={`Source / v${file.version}`} busy={busy === file.storage_path} onClick={() => download(file.storage_bucket, file.storage_path)} />)}{data.deliverables.map((file) => <FileRow key={file.id} title={file.title} meta={`Approved deliverable / v${file.version}`} busy={busy === file.storage_path} onClick={() => download('deliverables', file.storage_path)} />)}</div>}
        </section>
      </main>

      <aside className="grid content-start gap-6">
        <section className="bg-white p-6"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Order conversation</p><div className="mt-5 max-h-[430px] space-y-3 overflow-y-auto">{data.messages.length === 0 ? <p className="bg-[#F5F2E8] p-4 text-sm text-black/50">No messages yet. Use this secure thread for project-specific decisions.</p> : data.messages.map((item) => <div key={item.id} className={`p-4 ${item.sender_id === userId ? 'ml-6 bg-[#DDF65C]' : 'mr-6 bg-[#F5F2E8]'}`}><p className="text-[10px] font-black uppercase tracking-[.1em] text-black/40">{item.sender_id === userId ? 'You' : 'Elx Studio'} / {new Date(item.created_at).toLocaleString()}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{item.body}</p></div>)}</div><form onSubmit={sendMessage} className="mt-5"><textarea className="elx-field min-h-24 resize-y" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message…" /><button disabled={busy === 'message' || !message.trim()} className="mt-3 bg-[#102321] px-5 py-3 text-sm font-black text-white disabled:opacity-35">Send message →</button></form></section>

        <section className="bg-white p-6"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Revisions</p>{data.revisions.length > 0 && <div className="mt-4 space-y-2">{data.revisions.map((item) => <div key={item.id} className="bg-[#F5F2E8] p-4"><p className="text-xs font-black capitalize">{item.status} / {item.reason}</p><p className="mt-2 text-sm leading-5 text-black/55">{item.comments}</p></div>)}</div>}<form onSubmit={requestRevision} className="mt-5"><select className="elx-field" value={reason} onChange={(event) => setReason(event.target.value)}><option>Changes required</option><option>Incorrect output</option><option>Missing deliverable</option><option>Scope clarification</option></select><textarea className="elx-field mt-3 min-h-24 resize-y" value={revision} onChange={(event) => setRevision(event.target.value)} placeholder="Describe the exact changes and acceptance criteria…" /><button disabled={busy === 'revision' || !revision.trim()} className="mt-3 bg-[#F06449] px-5 py-3 text-sm font-black text-white disabled:opacity-35">Request revision</button></form></section>
        {error && <p className="bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
      </aside>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) { return <div className="bg-[#F5F2E8] p-4"><p className="text-[10px] font-black uppercase tracking-[.1em] text-black/35">{label}</p><p className="mt-2 text-sm font-bold capitalize">{value}</p></div>; }
function FileRow({ title, meta, busy, onClick }: { title: string; meta: string; busy: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} disabled={busy} className="flex items-center justify-between gap-4 bg-[#F5F2E8] p-4 text-left disabled:opacity-45"><span><strong className="block text-sm">{title}</strong><span className="mt-1 block text-xs text-black/40">{meta}</span></span><span className="text-xs font-black">{busy ? 'Signing…' : 'Download →'}</span></button>; }
