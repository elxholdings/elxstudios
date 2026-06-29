'use client';

import { FormEvent, useState } from 'react';

export default function PurchaseRequestForm({ productId, productTitle }: { productId: string; productTitle: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError('');
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form).entries());
    const response = await fetch('/api/shop/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, productId }) });
    const payload = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) setError(payload.error || 'The request could not be sent.'); else { setDone(true); form.reset(); }
    setLoading(false);
  }
  if (done) return <div className="bg-white p-8"><p className="text-xs font-black uppercase tracking-[.16em] text-[#F06449]">Request received</p><h3 className="mt-4 text-3xl font-black">We will confirm {productTitle} with you.</h3><p className="mt-4 text-sm leading-6 text-black/55">Watch your email or WhatsApp for file and payment details.</p></div>;
  return <form onSubmit={submit} className="bg-white p-7 md:p-10"><div className="grid gap-5 md:grid-cols-2"><Field label="Full name"><input name="name" className="elx-field" required /></Field><Field label="Email"><input name="email" type="email" className="elx-field" required /></Field><Field label="WhatsApp"><input name="whatsapp" className="elx-field" placeholder="+254..." required /></Field><Field label="Customization or format notes"><input name="notes" className="elx-field" /></Field></div><input name="company" className="hidden" tabIndex={-1} autoComplete="off" />{error && <p className="mt-5 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}<button disabled={loading} className="mt-7 bg-[#102321] px-7 py-4 text-sm font-black text-white disabled:opacity-40">{loading ? 'Sending...' : 'Send purchase request →'}</button></form>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-black">{label}{children}</label>; }
