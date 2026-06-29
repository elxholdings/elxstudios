'use client';

import Link from 'next/link';
import { FormEvent, useMemo, useState } from 'react';
import { serviceCategories } from '../data/services';
import { saveLocalOrder } from '../lib/local-orders';

type IntakeResponse = { orderId: string; cloudOrderId: string | null; cloudOrder: boolean; whatsappUrl: string };

type FormState = {
  category: string;
  subservice: string;
  title: string;
  brief: string;
  purpose: string;
  deadline: string;
  outputFormat: string;
  filesLink: string;
  name: string;
  email: string;
  whatsapp: string;
  integrityConfirmed: boolean;
};

const steps = ['Service', 'Project brief', 'Delivery', 'Contact & review'];

export default function ProjectWizard({ initialService = '', locale = 'en', authenticated = false }: { initialService?: string; locale?: string; authenticated?: boolean }) {
  const validInitial = serviceCategories.some((service) => service.slug === initialService) ? initialService : '';
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({ category: validInitial, subservice: '', title: '', brief: '', purpose: 'Professional', deadline: '', outputFormat: '', filesLink: '', name: '', email: '', whatsapp: '', integrityConfirmed: false });
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [addons, setAddons] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<IntakeResponse | null>(null);

  const category = useMemo(() => serviceCategories.find((service) => service.slug === form.category), [form.category]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleAddon(value: string) {
    setAddons((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function canContinue() {
    if (step === 0) return Boolean(form.category && form.subservice);
    if (step === 1) return Boolean(form.title.trim() && form.brief.trim() && form.purpose);
    if (step === 2) return Boolean(form.deadline && form.outputFormat);
    return Boolean(form.name.trim() && form.whatsapp.trim() && form.integrityConfirmed);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!canContinue()) return;
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          whatsapp: form.whatsapp,
          email: form.email,
          service: `${category?.title || form.category} — ${form.subservice}`,
          categorySlug: form.category,
          subservice: form.subservice,
          deadline: form.deadline,
          filesLink: form.filesLink,
          brief: form.brief,
          title: form.title,
          purpose: form.purpose,
          outputFormat: form.outputFormat,
          addOns: addons.join(', '),
          attachmentNames: fileNames.join(', '),
          integrityConfirmed: form.integrityConfirmed,
        }),
      });
      if (!response.ok) throw new Error('The request could not be submitted.');
      const data = (await response.json()) as IntakeResponse;
      const now = new Date().toISOString();
      if (!data.cloudOrder) saveLocalOrder({
        id: data.orderId,
        title: form.title,
        category: category?.title || form.category,
        subservice: form.subservice,
        purpose: form.purpose,
        deadline: form.deadline,
        outputFormat: form.outputFormat,
        brief: form.brief,
        files: fileNames,
        status: 'Submitted',
        paymentStatus: 'Awaiting quote',
        createdAt: now,
        updatedAt: now,
      });
      setResult(data);
    } catch {
      setError('We could not submit this brief. Check the required fields and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <section className="bg-white p-7 md:p-12">
        <p className="text-sm font-black uppercase tracking-[.16em] text-[#F06449]">Project received</p>
        <h2 className="mt-5 text-5xl font-black leading-none tracking-[-0.06em]">Your reference is<br />{result.orderId}</h2>
        <p className="mt-6 max-w-xl leading-7 text-black/60">{result.cloudOrder ? 'The brief is saved securely in your client workspace.' : 'The brief was received as a guest request. Create an account before your next project for secure cloud tracking.'} Continue on WhatsApp if you want to add immediate context while the team prepares your manual quote.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="bg-[#164F22] px-6 py-4 text-center text-sm font-black text-white">Continue on WhatsApp ↗</a>
          <Link href={`/dashboard?lang=${locale}`} className="bg-[#102321] px-6 py-4 text-center text-sm font-black text-white">Open my workspace →</Link>
        </div>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white">
      {!authenticated && <div className="bg-[#DDF65C] p-4 text-sm font-bold">Want this project saved online? <Link href="/login?next=/start" className="underline">Sign in</Link> or <Link href="/register?next=/start" className="underline">create an account</Link> before submitting.</div>}
      <div className="grid grid-cols-4 bg-[#102321] text-white">
        {steps.map((label, index) => (
          <button type="button" key={label} onClick={() => index < step && setStep(index)} className={`min-h-20 px-3 text-left text-xs font-black uppercase tracking-[.1em] ${index === step ? 'bg-[#DDF65C] text-[#102321]' : index < step ? 'text-white' : 'text-white/35'}`}>
            <span className="block text-[10px] opacity-55">0{index + 1}</span>{label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-10">
        {step === 0 && (
          <div>
            <StepTitle number="01" title="What kind of support do you need?" text="Choose the closest department and service. The team can refine the category after reviewing your brief." />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {serviceCategories.map((service) => (
                <button type="button" key={service.slug} onClick={() => setForm((current) => ({ ...current, category: service.slug, subservice: '' }))} className={`p-5 text-left ${form.category === service.slug ? 'bg-[#DDF65C]' : 'bg-[#F5F2E8]'}`}>
                  <span className="text-xs font-black uppercase tracking-[.12em] text-black/45">{service.eyebrow}</span>
                  <span className="mt-2 block text-lg font-black">{service.title}</span>
                </button>
              ))}
            </div>
            {category && <Field label="Specific service"><select value={form.subservice} onChange={(event) => update('subservice', event.target.value)} className="elx-field"><option value="">Select one</option>{category.subservices.map((item) => <option key={item}>{item}</option>)}</select></Field>}
          </div>
        )}

        {step === 1 && (
          <div>
            <StepTitle number="02" title="Describe the outcome." text="Explain what the finished work must help you do. Specific context produces a more accurate quote." />
            <Field label="Project title"><input className="elx-field" value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="e.g. Three-bedroom floor plan revision" /></Field>
            <Field label="Purpose"><div className="grid grid-cols-2 gap-2">{['Professional', 'Academic support'].map((purpose) => <button type="button" key={purpose} onClick={() => update('purpose', purpose)} className={`p-4 text-left text-sm font-black ${form.purpose === purpose ? 'bg-[#DDF65C]' : 'bg-[#F5F2E8]'}`}>{purpose}</button>)}</div></Field>
            <Field label="Instructions"><textarea className="elx-field min-h-44 resize-y" value={form.brief} onChange={(event) => update('brief', event.target.value)} placeholder="Goal, dimensions or data, software, references, standards and what a successful final file should contain..." /></Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <StepTitle number="03" title="Set the delivery requirements." text="Deadlines and editable-file needs affect scheduling and scope. No price is charged at this stage." />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Deadline"><input type="datetime-local" className="elx-field" value={form.deadline} onChange={(event) => update('deadline', event.target.value)} /></Field>
              <Field label="Primary output format"><select className="elx-field" value={form.outputFormat} onChange={(event) => update('outputFormat', event.target.value)}><option value="">Select format</option>{['PDF', 'DOCX', 'PPTX', 'XLSX / CSV', 'DWG / DXF', 'RVT / SKP', 'OBJ / FBX / STL', 'JPG / PNG', 'Other / multiple formats'].map((item) => <option key={item}>{item}</option>)}</select></Field>
            </div>
            <Field label="Optional add-ons"><div className="grid gap-2 sm:grid-cols-2">{['Editable source files', 'Priority scheduling', 'Presentation-ready formatting', 'Additional revision round'].map((item) => <label key={item} className="flex items-center gap-3 bg-[#F5F2E8] p-4 text-sm font-bold"><input type="checkbox" checked={addons.includes(item)} onChange={() => toggleAddon(item)} />{item}</label>)}</div></Field>
            <Field label="Supporting file link (optional)"><input className="elx-field" value={form.filesLink} onChange={(event) => update('filesLink', event.target.value)} placeholder="Private Drive, Dropbox, OneDrive or WeTransfer link" /></Field>
            <Field label="File checklist (files are not uploaded yet)"><input type="file" multiple className="elx-field" onChange={(event) => setFileNames(Array.from(event.target.files || []).map((file) => file.name))} /><p className="mt-2 text-xs leading-5 text-black/50">For privacy, this free version records file names only. Send the actual files through the private link or WhatsApp after scope review.</p></Field>
          </div>
        )}

        {step === 3 && (
          <div>
            <StepTitle number="04" title="Review and send the brief." text="Your contact details are used to return the quote and coordinate the project." />
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Full name"><input className="elx-field" value={form.name} onChange={(event) => update('name', event.target.value)} /></Field>
              <Field label="WhatsApp number"><input className="elx-field" value={form.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} placeholder="+254..." /></Field>
            </div>
            <Field label="Email (optional)"><input type="email" className="elx-field" value={form.email} onChange={(event) => update('email', event.target.value)} /></Field>
            <div className="mt-7 bg-[#F5F2E8] p-5 text-sm leading-6"><p className="font-black">Brief summary</p><p className="mt-2 text-black/60">{category?.title} / {form.subservice}<br />{form.title}<br />Due {form.deadline ? new Date(form.deadline).toLocaleString() : '—'} / {form.outputFormat}</p></div>
            <label className="mt-5 flex items-start gap-3 bg-[#FFF4E8] p-5 text-sm leading-6"><input type="checkbox" className="mt-1" checked={form.integrityConfirmed} onChange={(event) => update('integrityConfirmed', event.target.checked)} /><span>I confirm that I will use the work responsibly, follow applicable institutional or professional rules, and accept the <Link href="/academic-integrity" className="font-black underline">Academic Integrity Policy</Link>.</span></label>
          </div>
        )}

        {error && <p className="mt-6 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>}
        <div className="mt-9 flex items-center justify-between gap-4 border-t border-black/10 pt-6">
          <button type="button" disabled={step === 0 || loading} onClick={() => setStep((current) => Math.max(0, current - 1))} className="px-2 py-3 text-sm font-black disabled:opacity-25">← Back</button>
          {step < steps.length - 1 ? <button type="button" disabled={!canContinue()} onClick={() => setStep((current) => current + 1)} className="bg-[#102321] px-6 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-30">Continue →</button> : <button disabled={!canContinue() || loading} className="bg-[#102321] px-6 py-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-30">{loading ? 'Submitting…' : 'Submit for manual quote →'}</button>}
        </div>
      </div>
    </form>
  );
}

function StepTitle({ number, title, text }: { number: string; title: string; text: string }) {
  return <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#F06449]">Step {number}</p><h2 className="mt-3 text-4xl font-black leading-none tracking-[-0.05em] md:text-5xl">{title}</h2><p className="mt-4 max-w-2xl leading-7 text-black/55">{text}</p></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="mt-6 block"><span className="mb-2 block text-sm font-black">{label}</span>{children}</label>;
}
