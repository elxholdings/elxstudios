'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { buildWhatsAppUrl, defaultWhatsAppRouting, normalizeWhatsAppRouting, type WhatsAppRoute, type WhatsAppRoutingSetting } from '../../lib/whatsapp-config';

export type SettingRow = { key: string; value: unknown; updated_at: string };

const protectedContextIds = new Set(['start_floating', 'contact_page', 'intake_submitted', 'shop_inquiry']);

export default function SettingsClient({ settings, canManage }: { settings: SettingRow[]; canManage: boolean }) {
  const router = useRouter();
  const whatsappSetting = settings.find((item) => item.key === 'whatsapp_routing');
  const [routing, setRouting] = useState<WhatsAppRoutingSetting>(() => normalizeWhatsAppRouting(whatsappSetting?.value || defaultWhatsAppRouting));
  const advancedSettings = settings.filter((item) => item.key !== 'whatsapp_routing');
  const [drafts, setDrafts] = useState<Record<string, string>>(Object.fromEntries(advancedSettings.map((item) => [item.key, JSON.stringify(item.value, null, 2)])));
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function saveValue(key: string, value: unknown) {
    setBusy(key);
    setError('');
    setNotice('');
    const response = await fetch(`/api/admin/settings/${encodeURIComponent(key)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    const body = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) setError(body.error || 'Setting could not be saved.');
    else {
      setNotice(`${key.replaceAll('_', ' ')} saved.`);
      router.refresh();
    }
    setBusy('');
  }

  async function saveJson(key: string) {
    let value: unknown;
    try { value = JSON.parse(drafts[key]); }
    catch {
      setError(`${key}: invalid JSON.`);
      return;
    }
    await saveValue(key, value);
  }

  async function saveWhatsApp() {
    await saveValue('whatsapp_routing', normalizeWhatsAppRouting(routing));
  }

  return (
    <div className="grid gap-6">
      <section className="bg-white p-7 md:p-9">
        <p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Configuration</p>
        <h1 className="mt-2 text-5xl font-black tracking-[-.06em]">Client experience settings.</h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-black/50">Edit public routing, client-facing WhatsApp messages and operational JSON. Credentials still belong in Vercel environment variables, not here.</p>
      </section>

      {!canManage && <p className="bg-[#FFF0E8] p-4 text-sm font-bold">Read-only: administrator role is required to save settings.</p>}
      {(notice || error) && <p className={`p-4 text-sm font-bold ${error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-800'}`}>{error || notice}</p>}

      <WhatsAppManager routing={routing} setRouting={setRouting} canManage={canManage} busy={busy === 'whatsapp_routing'} onSave={saveWhatsApp} updatedAt={whatsappSetting?.updated_at || null} />

      <section className="grid gap-5">
        <div className="bg-[#102321] p-6 text-white">
          <p className="text-xs font-black uppercase tracking-[.14em] text-[#DDF65C]">Advanced JSON</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-.04em]">Operational settings.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">Use this only for structured settings that do not need a custom editor yet.</p>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {advancedSettings.map((setting) => (
            <article key={setting.key} className="bg-white p-6">
              <div className="flex justify-between gap-5">
                <h2 className="text-xl font-black">{setting.key.replaceAll('_', ' ')}</h2>
                <span className="text-[10px] text-black/35">{new Date(setting.updated_at).toLocaleString()}</span>
              </div>
              <textarea className="mt-5 min-h-64 w-full bg-[#102321] p-5 font-mono text-xs leading-5 text-white/70 outline-none" value={drafts[setting.key] || ''} onChange={(event) => setDrafts({ ...drafts, [setting.key]: event.target.value })} spellCheck={false} />
              <button onClick={() => void saveJson(setting.key)} disabled={!canManage || busy === setting.key} className="mt-4 bg-[#102321] px-5 py-3 text-xs font-black text-white disabled:opacity-35">Save setting</button>
            </article>
          ))}
          {advancedSettings.length === 0 && <p className="bg-white p-6 text-black/45">No advanced non-secret settings found.</p>}
        </div>
      </section>
    </div>
  );
}

function WhatsAppManager({ routing, setRouting, canManage, busy, onSave, updatedAt }: { routing: WhatsAppRoutingSetting; setRouting: (value: WhatsAppRoutingSetting) => void; canManage: boolean; busy: boolean; onSave: () => void; updatedAt: string | null }) {
  const previewTokens = useMemo(() => ({
    order_id: 'ELX-20260706-DEMO',
    name: 'Client Name',
    service: 'CAD & technical drawing / AutoCAD drafting',
    deadline: 'Flexible / not specified',
    budget: 'Not specified',
    files: 'Will send on WhatsApp',
    brief: 'Client project summary appears here.',
  }), []);

  function setCountry(defaultCountryCode: string) {
    setRouting({ ...routing, defaultCountryCode: defaultCountryCode.replace(/\D/g, '') || '254' });
  }

  function updateRoute(index: number, patch: Partial<WhatsAppRoute>) {
    setRouting({ ...routing, contexts: routing.contexts.map((item, i) => i === index ? { ...item, ...patch } : item) });
  }

  function addRoute() {
    const id = `custom_context_${routing.contexts.length + 1}`;
    setRouting({
      ...routing,
      contexts: [...routing.contexts, {
        id,
        label: 'New WhatsApp context',
        number: routing.contexts[0]?.number || '254110008034',
        enabled: true,
        message: 'Hello Elx Studio, I need help with a project.',
        notes: 'Describe where this route will be used.',
      }],
    });
  }

  function removeRoute(index: number) {
    const route = routing.contexts[index];
    if (protectedContextIds.has(route.id)) return;
    setRouting({ ...routing, contexts: routing.contexts.filter((_, i) => i !== index) });
  }

  return (
    <section className="grid gap-5">
      <div className="bg-[#073C3E] p-7 text-white md:p-9">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[.15em] text-[#DDF65C]">WhatsApp routing</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-.05em] md:text-6xl">Numbers, context and first messages.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">Each card controls a specific client touchpoint. Edit the number and the prefilled message clients see when they open WhatsApp.</p>
          </div>
          <div className="grid gap-2 text-xs">
            <label className="block font-black uppercase tracking-[.12em] text-white/45">Default country code</label>
            <input value={routing.defaultCountryCode} onChange={(event) => setCountry(event.target.value)} className="w-40 border border-white/15 bg-white/10 px-4 py-3 text-sm font-black text-white outline-none" />
            <span className="text-[10px] text-white/35">{updatedAt ? `Updated ${new Date(updatedAt).toLocaleString()}` : 'Not saved in database yet'}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {routing.contexts.map((route, index) => {
          const previewUrl = buildWhatsAppUrl(route, previewTokens, routing.defaultCountryCode);
          return (
            <article key={`${route.id}-${index}`} className="bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#F06449]">{route.id.replaceAll('_', ' ')}</p>
                  <h3 className="mt-2 text-2xl font-black tracking-[-.04em]">{route.label}</h3>
                </div>
                <label className="flex items-center gap-2 text-xs font-black">
                  <input type="checkbox" checked={route.enabled} onChange={(event) => updateRoute(index, { enabled: event.target.checked })} />
                  Enabled
                </label>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_.65fr]">
                <Field label="Context label">
                  <input className="elx-field" value={route.label} onChange={(event) => updateRoute(index, { label: event.target.value })} />
                </Field>
                <Field label="WhatsApp number">
                  <input className="elx-field" value={route.number} onChange={(event) => updateRoute(index, { number: event.target.value })} placeholder="254110008034" />
                </Field>
              </div>

              {!protectedContextIds.has(route.id) && (
                <Field label="Context ID">
                  <input className="elx-field" value={route.id} onChange={(event) => updateRoute(index, { id: event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') })} />
                </Field>
              )}

              <Field label="Prefilled message">
                <textarea className="elx-field min-h-36 resize-y" value={route.message} onChange={(event) => updateRoute(index, { message: event.target.value })} />
              </Field>

              {route.id === 'intake_submitted' && (
                <div className="mt-3 bg-[#F5F2E8] p-4 text-xs leading-5 text-black/55">
                  <p className="font-black text-black">Available tokens</p>
                  <p className="mt-1">{'{{order_id}} {{name}} {{service}} {{deadline}} {{budget}} {{files}} {{brief}}'}</p>
                </div>
              )}

              <Field label="Internal note">
                <input className="elx-field" value={route.notes || ''} onChange={(event) => updateRoute(index, { notes: event.target.value })} placeholder="Where this route appears" />
              </Field>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
                <a href={previewUrl} target="_blank" rel="noreferrer" className="text-xs font-black underline decoration-[#DDF65C] decoration-4 underline-offset-4">Preview WhatsApp link ↗</a>
                {!protectedContextIds.has(route.id) && <button type="button" onClick={() => removeRoute(index)} className="text-xs font-black text-red-700">Remove context</button>}
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <button type="button" onClick={addRoute} className="bg-white px-5 py-3 text-sm font-black">+ Add WhatsApp context</button>
        <button type="button" onClick={onSave} disabled={!canManage || busy} className="bg-[#102321] px-6 py-4 text-sm font-black text-white disabled:opacity-35">{busy ? 'Saving...' : 'Save WhatsApp routing'}</button>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="mt-4 block"><span className="text-xs font-black">{label}</span>{children}</label>;
}
