'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export type ContentRow = {
  id: string; kind: 'page' | 'post' | 'portfolio'; slug: string; title: string;
  summary: string; body: string; seo_title: string; meta_description: string;
  status: string; updated_at: string; published_at: string | null;
};
const statuses = ['draft', 'review', 'published', 'archived'];

export default function ContentClient({ items }: { items: ContentRow[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ kind: 'post', title: '', slug: '', summary: '' });
  const [editing, setEditing] = useState<ContentRow | null>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function call(url: string, options: RequestInit, action: string) {
    setBusy(action); setError('');
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) setError(payload.error || 'Content action failed.'); else router.refresh();
    setBusy(''); return response.ok;
  }
  async function create(event: FormEvent) {
    event.preventDefault();
    const ok = await call('/api/admin/content', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }, 'create');
    if (ok) setForm({ kind: 'post', title: '', slug: '', summary: '' });
  }
  async function saveEdit(event: FormEvent) {
    event.preventDefault(); if (!editing) return;
    const ok = await call(`/api/admin/content/${editing.kind}/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing) }, `edit-${editing.id}`);
    if (ok) setEditing(null);
  }

  return <div className="grid gap-6">
    <section className="bg-[#073C3E] p-7 text-white md:p-10"><p className="text-xs font-black uppercase tracking-[.14em] text-[#DDF65C]">Publishing desk</p><h1 className="mt-2 text-5xl font-black tracking-[-.06em] md:text-7xl">Content, proof & authority.</h1><p className="mt-5 max-w-2xl text-sm leading-6 text-white/55">Prepare pages, resources and portfolio entries. Published controls database visibility; code-backed marketing pages remain managed in the repository.</p></section>
    <div className="grid gap-6 xl:grid-cols-[.65fr_1.35fr]">
      <form onSubmit={create} className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">New item</p><select className="elx-field mt-5" value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value })}><option value="post">Blog/resource</option><option value="page">CMS page</option><option value="portfolio">Portfolio item</option></select><input className="elx-field mt-3" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value, slug: form.slug || slugify(event.target.value) })} placeholder="Title" required /><input className="elx-field mt-3" value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} placeholder="slug" required /><textarea className="elx-field mt-3 min-h-28" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Summary or excerpt" /><button disabled={busy === 'create'} className="mt-5 bg-[#102321] px-5 py-3 text-sm font-black text-white">Create draft →</button></form>
      <section className="overflow-x-auto bg-white p-6"><div className="flex justify-between"><h2 className="text-3xl font-black">Library</h2><span className="text-xs text-black/35">{items.length} items</span></div><table className="mt-5 w-full min-w-[820px] text-left text-sm"><thead><tr className="text-[10px] uppercase tracking-[.1em] text-black/35"><th className="p-3">Type</th><th className="p-3">Title</th><th className="p-3">Updated</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead><tbody>{items.map((item) => <tr key={`${item.kind}-${item.id}`} className="border-t border-black/10"><td className="p-3 font-black capitalize">{item.kind}</td><td className="p-3"><strong>{item.title}</strong><small className="block text-black/35">/{item.slug}</small></td><td className="p-3">{new Date(item.updated_at).toLocaleDateString()}</td><td className="p-3"><select className="bg-[#F5F2E8] p-2 text-xs font-black capitalize" value={item.status} onChange={(event) => void call(`/api/admin/content/${item.kind}/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: event.target.value }) }, item.id)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td><td className="p-3"><button onClick={() => setEditing(item)} className="text-xs font-black underline">Edit</button></td></tr>)}</tbody></table>{items.length === 0 && <p className="mt-6 text-sm text-black/40">No CMS content yet.</p>}</section>
    </div>
    {editing && <form onSubmit={saveEdit} className="bg-white p-7"><div className="flex justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Edit {editing.kind}</p><h2 className="mt-2 text-3xl font-black">{editing.title}</h2></div><button type="button" onClick={() => setEditing(null)} className="text-sm font-black">Close</button></div><div className="mt-6 grid gap-4 md:grid-cols-2"><label className="text-xs font-black">Title<input className="elx-field" value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} /></label><label className="text-xs font-black">Status<select className="elx-field" value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value })}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div><label className="mt-5 block text-xs font-black">Summary / excerpt<textarea className="elx-field min-h-24" value={editing.summary} onChange={(event) => setEditing({ ...editing, summary: event.target.value })} /></label>{editing.kind !== 'portfolio' && <label className="mt-5 block text-xs font-black">Body<textarea className="elx-field min-h-64" value={editing.body} onChange={(event) => setEditing({ ...editing, body: event.target.value })} placeholder="Plain text or Markdown-ready content" /></label>}<div className="mt-5 grid gap-4 md:grid-cols-2"><label className="text-xs font-black">SEO title<input className="elx-field" value={editing.seo_title} onChange={(event) => setEditing({ ...editing, seo_title: event.target.value })} /></label><label className="text-xs font-black">Meta description<textarea className="elx-field min-h-20" value={editing.meta_description} onChange={(event) => setEditing({ ...editing, meta_description: event.target.value })} /></label></div><button disabled={busy === `edit-${editing.id}`} className="mt-6 bg-[#102321] px-5 py-3 text-sm font-black text-white">Save content</button></form>}
    {error && <p className="bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
  </div>;
}

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100); }
