'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { defaultIntroAudioMix, normalizeIntroAudioMix, type IntroAudioMixSetting } from '../../lib/intro-audio-config';
import { buildWhatsAppUrl, defaultWhatsAppRouting, normalizeWhatsAppRouting, type WhatsAppRoute, type WhatsAppRoutingSetting } from '../../lib/whatsapp-config';

export type SettingRow = { key: string; value: unknown; updated_at: string };

const protectedContextIds = new Set(['start_floating', 'contact_page', 'intake_submitted', 'shop_inquiry']);

export default function SettingsClient({ settings, canManage }: { settings: SettingRow[]; canManage: boolean }) {
  const router = useRouter();
  const whatsappSetting = settings.find((item) => item.key === 'whatsapp_routing');
  const introAudioSetting = settings.find((item) => item.key === 'intro_audio_mix');
  const [routing, setRouting] = useState<WhatsAppRoutingSetting>(() => normalizeWhatsAppRouting(whatsappSetting?.value || defaultWhatsAppRouting));
  const [introAudio, setIntroAudio] = useState<IntroAudioMixSetting>(() => normalizeIntroAudioMix(introAudioSetting?.value || defaultIntroAudioMix));
  const advancedSettings = settings.filter((item) => !['whatsapp_routing', 'intro_audio_mix'].includes(item.key));
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

  async function saveIntroAudio(value: IntroAudioMixSetting = introAudio) {
    await saveValue('intro_audio_mix', normalizeIntroAudioMix(value));
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

      <IntroAudioManager audioMix={introAudio} setAudioMix={setIntroAudio} canManage={canManage} busy={busy === 'intro_audio_mix'} onSave={saveIntroAudio} updatedAt={introAudioSetting?.updated_at || null} />

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

function IntroAudioManager({ audioMix, setAudioMix, canManage, busy, onSave, updatedAt }: { audioMix: IntroAudioMixSetting; setAudioMix: (value: IntroAudioMixSetting) => void; canManage: boolean; busy: boolean; onSave: (value?: IntroAudioMixSetting) => Promise<void>; updatedAt: string | null }) {
  const timelineMax = Math.max(30, Math.ceil(audioMix.voiceDuration || 90), Math.ceil(audioMix.musicEnd || 0));
  const [uploading, setUploading] = useState('');
  const [uploadError, setUploadError] = useState('');

  function patchAudio(patch: Partial<IntroAudioMixSetting>) {
    const next = normalizeIntroAudioMix({ ...audioMix, ...patch });
    setAudioMix(next);
    return next;
  }

  function setVolume(key: 'voiceVolume' | 'musicVolume', value: string) {
    patchAudio({ [key]: Number(value) / 100 } as Partial<IntroAudioMixSetting>);
  }

  async function uploadAudio(event: ChangeEvent<HTMLInputElement>, target: 'voice' | 'music') {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setUploadError('');
    setUploading(target);
    const form = new FormData();
    form.append('title', target === 'voice' ? `${audioMix.guideName || 'Pastor Wrench'} intro voice` : 'Intro background music');
    form.append('altText', target === 'voice' ? 'Guided introduction narration' : 'Background music for the guided introduction');
    form.append('file', file);
    const response = await fetch('/api/admin/media', { method: 'POST', body: form });
    const payload = await response.json().catch(() => ({})) as { error?: string; asset?: { public_url?: string; kind?: string } };
    if (!response.ok || !payload.asset?.public_url) setUploadError(payload.error || 'Audio upload failed.');
    else {
      const next = patchAudio(target === 'voice' ? { voiceUrl: payload.asset.public_url } : { musicUrl: payload.asset.public_url });
      await onSave(next);
    }
    event.currentTarget.value = '';
    setUploading('');
  }

  async function applyBundledMusic() {
    setUploadError('');
    setUploading('bundled_music');
    const next = patchAudio({
      musicUrl: '/audio/intro-music.mp3',
      musicVolume: 0.14,
      musicStart: 0,
      musicEnd: Math.min(88.88, audioMix.voiceDuration || 88.88),
      musicFadeIn: 2,
      musicFadeOut: 6,
      musicLoop: false,
    });
    await onSave(next);
    setUploading('');
  }

  async function clearMusic() {
    setUploadError('');
    setUploading('clear_music');
    const next = patchAudio({ musicUrl: '', musicStart: 0, musicEnd: 15, musicLoop: false });
    await onSave(next);
    setUploading('');
  }

  return (
    <section className="grid gap-5">
      <div className="bg-[#061b1a] p-7 text-white md:p-9">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[.15em] text-[#DDF65C]">Intro voice and background music</p>
            <h2 className="mt-2 max-w-4xl text-4xl font-black tracking-[-.05em] md:text-6xl">Pastor Wrench audio mix.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/55">Control the guided introduction voice, music bed, timeline window and volume balance shown on the first-time visitor experience.</p>
          </div>
          <div className="text-xs text-white/45">{updatedAt ? `Updated ${new Date(updatedAt).toLocaleString()}` : 'Using default audio until saved'}</div>
        </div>
      </div>

      {uploadError && <p className="bg-red-50 p-4 text-sm font-bold text-red-700">{uploadError}</p>}

      <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
        <article className="bg-white p-6">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#F06449]">Voice track</p>
          <div className="mt-5 grid gap-4 md:grid-cols-[.7fr_1fr]">
            <Field label="Guide name">
              <input className="elx-field" value={audioMix.guideName} onChange={(event) => patchAudio({ guideName: event.target.value })} />
            </Field>
            <Field label="Voice file URL">
              <input className="elx-field" value={audioMix.voiceUrl} onChange={(event) => patchAudio({ voiceUrl: event.target.value })} placeholder="/audio/elx-welcome.mp3" />
            </Field>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label={`Voice volume: ${Math.round(audioMix.voiceVolume * 100)}%`}>
              <input type="range" min="0" max="100" value={Math.round(audioMix.voiceVolume * 100)} onChange={(event) => setVolume('voiceVolume', event.target.value)} className="w-full accent-[#102321]" />
            </Field>
            <Field label={`Voice duration: ${formatSeconds(audioMix.voiceDuration)}`}>
              <input type="number" min="10" max="600" step="0.1" className="elx-field" value={audioMix.voiceDuration} onChange={(event) => patchAudio({ voiceDuration: Number(event.target.value) })} />
            </Field>
          </div>
          <Field label={uploading === 'voice' ? 'Uploading voice...' : 'Upload replacement voice audio'}>
            <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/mp4,audio/aac,audio/flac" onChange={(event) => void uploadAudio(event, 'voice')} className="elx-field" disabled={!canManage || uploading === 'voice'} />
          </Field>
          <div className="mt-5 bg-[#F5F2E8] p-4">
            <p className="mb-2 text-xs font-black">Voice preview</p>
            <audio controls src={audioMix.voiceUrl} className="w-full" />
          </div>
        </article>

        <article className="bg-white p-6">
          <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#F06449]">Background music</p>
          <div className="mt-4 grid gap-3 bg-[#F5F2E8] p-4">
            <p className="text-xs font-bold text-black/55">Fast path: use the optimized intro music already bundled with the website. No upload needed.</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => void applyBundledMusic()} disabled={!canManage || Boolean(uploading) || busy} className="bg-[#102321] px-4 py-3 text-xs font-black text-white disabled:opacity-35">{uploading === 'bundled_music' ? 'Applying...' : 'Use bundled intro music'}</button>
              <button type="button" onClick={() => void clearMusic()} disabled={!canManage || Boolean(uploading) || busy} className="border border-black/15 px-4 py-3 text-xs font-black disabled:opacity-35">{uploading === 'clear_music' ? 'Clearing...' : 'No background music'}</button>
            </div>
          </div>
          <Field label="Music file URL">
            <input className="elx-field" value={audioMix.musicUrl} onChange={(event) => patchAudio({ musicUrl: event.target.value })} placeholder="/audio/intro-bed.mp3 or https://..." />
          </Field>
          <Field label={uploading === 'music' ? 'Uploading music...' : 'Upload background music'}>
            <input type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/ogg,audio/mp4,audio/aac,audio/flac" onChange={(event) => void uploadAudio(event, 'music')} className="elx-field" disabled={!canManage || uploading === 'music'} />
          </Field>
          <Field label={`Music volume: ${Math.round(audioMix.musicVolume * 100)}%`}>
            <input type="range" min="0" max="100" value={Math.round(audioMix.musicVolume * 100)} onChange={(event) => setVolume('musicVolume', event.target.value)} className="w-full accent-[#102321]" />
          </Field>
          <label className="mt-4 flex items-center gap-3 text-sm font-black">
            <input type="checkbox" checked={audioMix.musicLoop} onChange={(event) => patchAudio({ musicLoop: event.target.checked })} />
            Loop selected music segment during intro
          </label>
          {audioMix.musicUrl ? <div className="mt-5 bg-[#F5F2E8] p-4"><p className="mb-2 text-xs font-black">Music preview</p><audio controls src={audioMix.musicUrl} className="w-full" /></div> : <p className="mt-5 bg-[#F5F2E8] p-4 text-xs font-bold text-black/45">Upload a music file, paste a public audio URL, or use a file path from /public/audio to enable background music.</p>}
          <button type="button" onClick={() => void onSave(audioMix)} disabled={!canManage || busy || Boolean(uploading)} className="mt-5 w-full bg-[#DDF65C] px-5 py-3 text-xs font-black text-[#102321] disabled:opacity-35">{busy ? 'Saving...' : 'Save current music settings'}</button>
        </article>
      </div>

      <article className="bg-white p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.14em] text-[#F06449]">Music timeline</p>
            <h3 className="mt-1 text-2xl font-black tracking-[-.04em]">Drag the music window that should play behind the voice.</h3>
          </div>
          <p className="text-xs font-black text-black/45">{formatSeconds(audioMix.musicStart)} → {formatSeconds(audioMix.musicEnd)}</p>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Field label={`Start: ${formatSeconds(audioMix.musicStart)}`}>
            <input type="range" min="0" max={timelineMax} step="0.1" value={audioMix.musicStart} onChange={(event) => patchAudio({ musicStart: Number(event.target.value) })} className="w-full accent-[#DDF65C]" />
          </Field>
          <Field label={`End: ${formatSeconds(audioMix.musicEnd)}`}>
            <input type="range" min="0" max={timelineMax} step="0.1" value={audioMix.musicEnd} onChange={(event) => patchAudio({ musicEnd: Number(event.target.value) })} className="w-full accent-[#DDF65C]" />
          </Field>
          <Field label="Fade in seconds">
            <input type="number" min="0" max="20" step="0.1" className="elx-field" value={audioMix.musicFadeIn} onChange={(event) => patchAudio({ musicFadeIn: Number(event.target.value) })} />
          </Field>
          <Field label="Fade out seconds">
            <input type="number" min="0" max="20" step="0.1" className="elx-field" value={audioMix.musicFadeOut} onChange={(event) => patchAudio({ musicFadeOut: Number(event.target.value) })} />
          </Field>
        </div>
      </article>

      <article className="bg-white p-6">
        <Field label="Pastor Wrench script">
          <textarea className="elx-field min-h-72 resize-y leading-6" value={audioMix.transcript} onChange={(event) => patchAudio({ transcript: event.target.value })} />
        </Field>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-xs leading-5 text-black/45">When you regenerate audio, keep “E. L. X.” written with periods or spaces so the voice reads the letters instead of saying “Elx.”</p>
          <button type="button" onClick={() => void onSave(audioMix)} disabled={!canManage || busy || Boolean(uploading)} className="bg-[#102321] px-6 py-4 text-sm font-black text-white disabled:opacity-35">{busy ? 'Saving...' : 'Save intro audio mix'}</button>
        </div>
      </article>
    </section>
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

function formatSeconds(value: number) {
  const seconds = Math.max(0, Math.floor(value || 0));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}
