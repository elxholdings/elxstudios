'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type MetaIntegration = { id: string; product: string; external_account_id: string; display_name: string | null; status: string; scopes: string[]; token_expires_at: string | null; metadata: Record<string, unknown>; updated_at: string };
export type MetaLead = { id: string; leadgen_id: string; contact_name: string | null; contact_email: string | null; contact_phone: string | null; status: string; fields: Record<string, unknown>; created_time: string | null; created_at: string };
export type MetaWebhookEvent = { id: string; provider: string; object_type: string | null; processing_status: string; received_at: string; processing_error: string | null };
export type MetaAction = { id: string; action: string; target_id: string | null; status: string; external_result_id: string | null; error_message: string | null; created_at: string };
export type MetaConfig = { appId: boolean; appSecret: boolean; encryptionKey: boolean; webhookToken: boolean; whatsappToken: boolean; whatsappPhoneId: boolean; apiVersion: string };

const productNames: Record<string, string> = { facebook_user: 'Facebook login', facebook_page: 'Facebook Pages', instagram: 'Instagram', marketing: 'Marketing API', whatsapp: 'WhatsApp' };

export default function MetaClient({ integrations, leads, events, actions, config }: { integrations: MetaIntegration[]; leads: MetaLead[]; events: MetaWebhookEvent[]; actions: MetaAction[]; config: MetaConfig }) {
  const router = useRouter();
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [facebook, setFacebook] = useState({ pageId: integrations.find((item) => item.product === 'facebook_page')?.external_account_id || '', message: '', link: '', confirmed: false });
  const [instagram, setInstagram] = useState({ instagramId: integrations.find((item) => item.product === 'instagram')?.external_account_id || '', imageUrl: '', caption: '', confirmed: false });
  const [whatsapp, setWhatsapp] = useState({ to: '', message: '', confirmed: false });
  const [insightTarget, setInsightTarget] = useState('');
  const [insights, setInsights] = useState<unknown>(null);
  const pages = integrations.filter((item) => item.product === 'facebook_page');
  const instagramAccounts = integrations.filter((item) => item.product === 'instagram');
  const insightOptions = useMemo(() => integrations.filter((item) => ['facebook_page', 'instagram', 'marketing'].includes(item.product)), [integrations]);

  async function api(url: string, options: RequestInit, action: string) {
    setBusy(action); setError(''); setNotice('');
    const response = await fetch(url, options);
    const payload = await response.json().catch(() => ({})) as { error?: string; id?: string };
    if (!response.ok) setError(payload.error || 'Meta request failed.'); else { setNotice(payload.id ? `Completed. Meta reference: ${payload.id}` : 'Saved successfully.'); router.refresh(); }
    setBusy('');
    return response.ok;
  }

  async function publishFacebook(event: FormEvent) {
    event.preventDefault(); if (!facebook.confirmed) return;
    const ok = await api('/api/meta/publish/facebook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(facebook) }, 'facebook');
    if (ok) setFacebook((current) => ({ ...current, message: '', link: '', confirmed: false }));
  }
  async function publishInstagram(event: FormEvent) {
    event.preventDefault(); if (!instagram.confirmed) return;
    const ok = await api('/api/meta/publish/instagram', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(instagram) }, 'instagram');
    if (ok) setInstagram((current) => ({ ...current, imageUrl: '', caption: '', confirmed: false }));
  }
  async function sendWhatsApp(event: FormEvent) {
    event.preventDefault(); if (!whatsapp.confirmed) return;
    const ok = await api('/api/meta/whatsapp/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(whatsapp) }, 'whatsapp');
    if (ok) setWhatsapp({ to: '', message: '', confirmed: false });
  }
  async function loadInsights() {
    const integration = integrations.find((item) => item.id === insightTarget);
    if (!integration) return;
    setBusy('insights'); setError('');
    const response = await fetch(`/api/meta/insights?product=${encodeURIComponent(integration.product)}&accountId=${encodeURIComponent(integration.external_account_id)}`);
    const payload = await response.json() as unknown as { error?: string };
    if (!response.ok) setError(payload.error || 'Insights request failed.'); else setInsights(payload);
    setBusy('');
  }
  async function updateLead(id: string, status: string) {
    await api(`/api/meta/leads/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }, `lead-${id}`);
  }

  const coreReady = config.appId && config.appSecret && config.encryptionKey && config.webhookToken;
  return (
    <div className="grid gap-6">
      <section className="bg-[#073C3E] p-7 text-white md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-6"><div><p className="text-xs font-black uppercase tracking-[.16em] text-[#DDF65C]">Meta platform</p><h1 className="mt-3 max-w-4xl text-5xl font-black leading-[.9] tracking-[-.065em] md:text-7xl">Connections, leads and publishing.</h1><p className="mt-5 max-w-2xl leading-7 text-white/55">Development mode is useful now. Advanced production permissions remain gated by Meta Business Verification.</p></div>{coreReady ? <a href="/api/meta/oauth/start" className="bg-[#DDF65C] px-6 py-4 text-sm font-black text-[#102321]">Connect Meta assets →</a> : <span className="bg-white/10 px-5 py-3 text-sm font-bold text-white/55">Credentials required</span>}</div>
      </section>

      <section className="grid gap-3 md:grid-cols-5">{[
        ['Facebook Pages', pages.length > 0], ['Instagram', instagramAccounts.length > 0], ['Lead Ads', events.some((item) => item.provider === 'facebook')], ['Marketing', integrations.some((item) => item.product === 'marketing')], ['WhatsApp', config.whatsappToken && config.whatsappPhoneId],
      ].map(([label, ready]) => <div key={String(label)} className="bg-white p-5"><p className={`text-xs font-black uppercase tracking-[.1em] ${ready ? 'text-[#164F22]' : 'text-black/35'}`}>{ready ? 'Ready' : 'Pending'}</p><p className="mt-2 font-black">{label}</p></div>)}</section>

      <div className="grid gap-6 xl:grid-cols-[.8fr_1.2fr]">
        <section className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Configuration</p><h2 className="mt-2 text-3xl font-black">Developer checklist</h2><div className="mt-6 grid gap-2">{[
          ['App ID', config.appId], ['App secret', config.appSecret], ['Token encryption', config.encryptionKey], ['Webhook verify token', config.webhookToken], ['WhatsApp test token', config.whatsappToken], ['WhatsApp phone ID', config.whatsappPhoneId],
        ].map(([label, ready]) => <div key={String(label)} className="flex justify-between bg-[#F5F2E8] p-4 text-sm"><strong>{label}</strong><span className={`font-black ${ready ? 'text-[#164F22]' : 'text-[#F06449]'}`}>{ready ? 'Configured' : 'Missing'}</span></div>)}</div><div className="mt-6 bg-[#102321] p-5 text-xs leading-6 text-white/60"><strong className="text-white">Meta callback</strong><br />https://elxholdings.com/api/meta/oauth/callback<br /><br /><strong className="text-white">Webhook + verify URL</strong><br />https://elxholdings.com/api/meta/webhook<br /><br /><strong className="text-white">Data deletion callback</strong><br />https://elxholdings.com/api/meta/data-deletion<br /><br />Graph API default: {config.apiVersion}</div></section>
        <section className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Connected assets</p><h2 className="mt-2 text-3xl font-black">Accounts</h2>{integrations.length === 0 ? <p className="mt-6 bg-[#F5F2E8] p-5 text-sm text-black/50">No Meta assets connected yet. Add the four server secrets, then use the connection button.</p> : <div className="mt-6 grid gap-2">{integrations.map((item) => <div key={item.id} className="grid gap-2 bg-[#F5F2E8] p-4 sm:grid-cols-[150px_1fr_auto] sm:items-center"><span className="text-xs font-black uppercase tracking-[.08em] text-black/40">{productNames[item.product] || item.product}</span><span><strong className="block text-sm">{item.display_name || item.external_account_id}</strong><small className="text-black/40">{item.external_account_id}</small></span><span className="text-xs font-black capitalize text-[#164F22]">{item.status}</span></div>)}</div>}</section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={publishFacebook} className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Facebook Page</p><h2 className="mt-2 text-3xl font-black">Publish a post</h2><select className="elx-field mt-5" value={facebook.pageId} onChange={(event) => setFacebook({ ...facebook, pageId: event.target.value })} required><option value="">Select Page</option>{pages.map((page) => <option key={page.id} value={page.external_account_id}>{page.display_name}</option>)}</select><textarea className="elx-field mt-4 min-h-28" value={facebook.message} onChange={(event) => setFacebook({ ...facebook, message: event.target.value })} placeholder="Post copy…" required /><input className="elx-field mt-4" type="url" value={facebook.link} onChange={(event) => setFacebook({ ...facebook, link: event.target.value })} placeholder="Optional link" /><Confirm checked={facebook.confirmed} setChecked={(confirmed) => setFacebook({ ...facebook, confirmed })} text="Publish this post publicly to the selected Facebook Page." /><button disabled={!facebook.confirmed || busy === 'facebook' || pages.length === 0} className="mt-4 bg-[#102321] px-5 py-3 text-sm font-black text-white disabled:opacity-35">Publish to Facebook</button></form>
        <form onSubmit={publishInstagram} className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Instagram professional</p><h2 className="mt-2 text-3xl font-black">Publish an image</h2><select className="elx-field mt-5" value={instagram.instagramId} onChange={(event) => setInstagram({ ...instagram, instagramId: event.target.value })} required><option value="">Select account</option>{instagramAccounts.map((account) => <option key={account.id} value={account.external_account_id}>{account.display_name}</option>)}</select><input className="elx-field mt-4" type="url" value={instagram.imageUrl} onChange={(event) => setInstagram({ ...instagram, imageUrl: event.target.value })} placeholder="Public HTTPS JPEG URL" required /><textarea className="elx-field mt-4 min-h-28" value={instagram.caption} onChange={(event) => setInstagram({ ...instagram, caption: event.target.value })} placeholder="Caption…" /><Confirm checked={instagram.confirmed} setChecked={(confirmed) => setInstagram({ ...instagram, confirmed })} text="Publish this image publicly to the selected Instagram account." /><button disabled={!instagram.confirmed || busy === 'instagram' || instagramAccounts.length === 0} className="mt-4 bg-[#102321] px-5 py-3 text-sm font-black text-white disabled:opacity-35">Publish to Instagram</button></form>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Insights</p><h2 className="mt-2 text-3xl font-black">Last 30 days</h2><div className="mt-5 flex gap-3"><select className="elx-field" value={insightTarget} onChange={(event) => setInsightTarget(event.target.value)}><option value="">Select connected asset</option>{insightOptions.map((item) => <option key={item.id} value={item.id}>{productNames[item.product]} / {item.display_name}</option>)}</select><button type="button" onClick={() => void loadInsights()} disabled={!insightTarget || busy === 'insights'} className="bg-[#102321] px-5 text-sm font-black text-white disabled:opacity-35">Load</button></div>{insights !== null && <pre className="mt-5 max-h-80 overflow-auto bg-[#102321] p-5 text-xs leading-5 text-white/65">{JSON.stringify(insights, null, 2)}</pre>}</section>
        <form onSubmit={sendWhatsApp} className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">WhatsApp Cloud API</p><h2 className="mt-2 text-3xl font-black">Send a test message</h2><input className="elx-field mt-5" value={whatsapp.to} onChange={(event) => setWhatsapp({ ...whatsapp, to: event.target.value })} placeholder="Recipient with country code" required /><textarea className="elx-field mt-4 min-h-28" value={whatsapp.message} onChange={(event) => setWhatsapp({ ...whatsapp, message: event.target.value })} placeholder="Test message…" required /><Confirm checked={whatsapp.confirmed} setChecked={(confirmed) => setWhatsapp({ ...whatsapp, confirmed })} text="Send this WhatsApp message to the specified recipient." /><button disabled={!whatsapp.confirmed || busy === 'whatsapp' || !config.whatsappToken} className="mt-4 bg-[#164F22] px-5 py-3 text-sm font-black text-white disabled:opacity-35">Send test message</button></form>
      </div>

      <section className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Lead Ads</p><h2 className="mt-2 text-3xl font-black">Captured leads</h2>{leads.length === 0 ? <p className="mt-5 bg-[#F5F2E8] p-5 text-sm text-black/50">Lead webhooks will appear here after a connected Page submits a `leadgen` event.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="text-xs uppercase text-black/35"><tr><th className="p-3">Contact</th><th className="p-3">Email</th><th className="p-3">Phone</th><th className="p-3">Received</th><th className="p-3">Status</th></tr></thead><tbody>{leads.map((lead) => <tr key={lead.id} className="border-t border-black/10"><td className="p-3 font-bold">{lead.contact_name || 'Unnamed'}</td><td className="p-3">{lead.contact_email || '—'}</td><td className="p-3">{lead.contact_phone || '—'}</td><td className="p-3">{new Date(lead.created_time || lead.created_at).toLocaleString()}</td><td className="p-3"><select value={lead.status} onChange={(event) => void updateLead(lead.id, event.target.value)} className="bg-[#F5F2E8] p-2 font-bold"><option>new</option><option>contacted</option><option>qualified</option><option>converted</option><option>archived</option></select></td></tr>)}</tbody></table></div>}</section>

      <div className="grid gap-6 xl:grid-cols-2"><section className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Webhook health</p><div className="mt-5 grid gap-2">{events.length === 0 ? <p className="bg-[#F5F2E8] p-4 text-sm text-black/45">No signed events received.</p> : events.slice(0, 10).map((item) => <div key={item.id} className="flex justify-between gap-4 bg-[#F5F2E8] p-4 text-sm"><span><strong className="capitalize">{item.provider}</strong><small className="mt-1 block text-black/40">{new Date(item.received_at).toLocaleString()}</small></span><span className={`font-black capitalize ${item.processing_status === 'failed' ? 'text-red-700' : 'text-[#164F22]'}`}>{item.processing_status}</span></div>)}</div></section><section className="bg-white p-7"><p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Action log</p><div className="mt-5 grid gap-2">{actions.length === 0 ? <p className="bg-[#F5F2E8] p-4 text-sm text-black/45">No outbound Meta actions.</p> : actions.slice(0, 10).map((item) => <div key={item.id} className="flex justify-between gap-4 bg-[#F5F2E8] p-4 text-sm"><span><strong>{item.action}</strong><small className="mt-1 block text-black/40">{new Date(item.created_at).toLocaleString()}</small></span><span className={`font-black capitalize ${item.status === 'failed' ? 'text-red-700' : 'text-[#164F22]'}`}>{item.status}</span></div>)}</div></section></div>
      {notice && <p className="bg-[#E8F3E7] p-4 text-sm font-bold text-[#164F22]">{notice}</p>}{error && <p className="bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
    </div>
  );
}

function Confirm({ checked, setChecked, text }: { checked: boolean; setChecked: (value: boolean) => void; text: string }) { return <label className="mt-5 flex items-start gap-3 bg-[#FFF4E8] p-4 text-xs font-bold leading-5"><input type="checkbox" className="mt-1" checked={checked} onChange={(event) => setChecked(event.target.checked)} /><span>{text}</span></label>; }
