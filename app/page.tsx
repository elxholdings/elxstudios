'use client';

import { FormEvent, useMemo, useState } from 'react';

const services = [
  'Writing and Documentation',
  'STEM Support',
  'Architecture and Design',
  'CAD Drafting',
  '3D Modeling and Rendering',
  'Finance and Accounting',
  'Business and Professional Services',
];

const serviceCards = [
  { title: 'Writing & documentation', desc: 'Reports, proposals, research support, editing, formatting and professional documents.', tag: 'Clarity' },
  { title: 'STEM & technical work', desc: 'Math, science, engineering, data analysis, lab support and technical explanations.', tag: 'Precision' },
  { title: 'Architecture & CAD', desc: 'Floor plans, design boards, CAD drafting, Revit, SolidWorks and technical drawings.', tag: 'Structure' },
  { title: '3D rendering', desc: 'Interior, exterior, product renders, 3D models and presentation-ready visuals.', tag: 'Visuals' },
  { title: 'Finance & accounting', desc: 'Budgets, bookkeeping support, financial reports, forecasts and Excel models.', tag: 'Trust' },
  { title: 'Business support', desc: 'Pitch decks, company profiles, market research, resumes and professional presentations.', tag: 'Growth' },
];

type IntakeResponse = {
  orderId: string;
  whatsappUrl: string;
  message: string;
};

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntakeResponse | null>(null);
  const [error, setError] = useState('');

  const year = useMemo(() => new Date().getFullYear(), []);

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Could not submit project.');

      const data = (await response.json()) as IntakeResponse;
      setResult(data);
      form.reset();
    } catch (err) {
      setError('The form could not submit. Please use the WhatsApp button below and send your brief directly.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="relative min-h-screen overflow-hidden glow text-white">
        <div className="noise" />
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <a href="#top" className="text-xl font-semibold tracking-tight">Elx<span className="text-[#8EA5FF]">.</span> Studio</a>
          <div className="hidden items-center gap-8 text-sm text-white/[0.78] md:flex">
            <a href="#services">Services</a>
            <a href="#workflow">Workflow</a>
            <a href="#start">Start project</a>
          </div>
          <a href="#start" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-elx-midnight transition hover:bg-white/90">Get started</a>
        </nav>

        <div id="top" className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-20 md:grid-cols-[1.1fr_.9fr] md:items-center md:pt-28">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/[0.15] bg-white/[0.08] px-4 py-2 text-sm text-white/[0.78] backdrop-blur">Elx Holdings presents Elx Studio</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[.97] tracking-[-0.05em] md:text-7xl">
              Project support for students and professionals who need work done right.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/[0.72]">
              Writing, documentation, STEM, architecture, CAD, 3D rendering, finance and accounting support. Submit your brief today and continue on WhatsApp for fast onboarding.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#start" className="rounded-full bg-elx-blue px-7 py-4 text-center text-sm font-semibold text-white transition hover:brightness-95">Start a project</a>
              <a href="#services" className="rounded-full border border-white/[0.18] bg-white/[0.08] px-7 py-4 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/[0.12]">Explore services</a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/[0.12] bg-white/[0.08] p-4 shadow-2xl backdrop-blur-xl">
            <div className="rounded-[1.5rem] bg-white p-4 text-elx-ink">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[.24em] text-elx-muted">Live workflow</p>
                  <h2 className="text-2xl font-semibold tracking-tight">From brief to delivery</h2>
                </div>
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-elx-green">Open</span>
              </div>
              {[
                ['01', 'Client brief received', 'Form + WhatsApp onboarding'],
                ['02', 'Quote prepared', 'Deadline, complexity and file needs'],
                ['03', 'Work assigned', 'Specialist or internal project manager'],
                ['04', 'Delivery sent', 'Files, revisions and support'],
              ].map((item) => (
                <div key={item[0]} className="grid grid-cols-[48px_1fr] gap-4 border-b border-black/5 py-5 last:border-b-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-elx-fog text-sm font-bold text-elx-blue">{item[0]}</div>
                  <div>
                    <h3 className="font-semibold">{item[1]}</h3>
                    <p className="mt-1 text-sm text-elx-muted">{item[2]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[.24em] text-elx-blue">Services</p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">One studio for documentation, technical work and visual execution.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {serviceCards.map((card) => (
              <article key={card.title} className="group rounded-[1.75rem] border border-black/[0.08] bg-elx-fog p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-elx-soft">
                <span className="mb-10 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-elx-blue shadow-sm">{card.tag}</span>
                <h3 className="text-2xl font-semibold tracking-tight">{card.title}</h3>
                <p className="mt-4 leading-7 text-elx-muted">{card.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="grid-bg bg-elx-fog px-6 py-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] bg-elx-midnight p-8 text-white md:p-14">
          <div className="grid gap-10 md:grid-cols-[.9fr_1.1fr] md:items-center">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[.24em] text-[#8EA5FF]">MVP workflow</p>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Built to operate today, not someday.</h2>
              <p className="mt-5 text-lg leading-8 text-white/[0.68]">This first version removes unnecessary complexity. No heavy client portal yet. No complex expert marketplace yet. It captures demand, creates an order trail, and moves the client to WhatsApp where business can happen immediately.</p>
            </div>
            <div className="grid gap-3">
              {['Submit project brief', 'Receive order ID', 'Continue onboarding on WhatsApp', 'Admin quotes and collects payment manually', 'Work is delivered through WhatsApp, email or secure file link'].map((step, index) => (
                <div key={step} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-elx-midnight">{index + 1}</span>
                  <p className="text-white/[0.82]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="start" className="bg-white px-6 py-24">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[.24em] text-elx-blue">Start now</p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Send your project brief.</h2>
            <p className="mt-5 leading-8 text-elx-muted">After submission, the site creates a short order ID and prepares a WhatsApp message so the client can continue instantly. Replace the WhatsApp number in your environment variables before deployment.</p>
            <div className="mt-8 rounded-3xl bg-elx-fog p-6">
              <h3 className="font-semibold">Fast launch rule</h3>
              <p className="mt-2 text-sm leading-6 text-elx-muted">For file uploads today, ask clients to paste a Google Drive, Dropbox, WeTransfer or OneDrive link. Real platform file uploads can be added in the next upgrade.</p>
            </div>
          </div>

          <form onSubmit={submitProject} className="rounded-[2rem] border border-black/[0.08] bg-white p-5 shadow-elx-soft md:p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold">Full name</span>
                <input name="name" required className="mt-2 w-full rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="Client name" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">WhatsApp number</span>
                <input name="whatsapp" required className="mt-2 w-full rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="+254..." />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Email</span>
                <input name="email" type="email" className="mt-2 w-full rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="client@email.com" />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Service</span>
                <select name="service" required className="mt-2 w-full rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue">
                  <option value="">Select service</option>
                  {services.map((service) => <option key={service}>{service}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Deadline</span>
                <input name="deadline" required className="mt-2 w-full rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="Today, 24 hours, Friday..." />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Budget range</span>
                <input name="budget" className="mt-2 w-full rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="$50-$200, flexible..." />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold">File link</span>
                <input name="filesLink" className="mt-2 w-full rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="Google Drive, Dropbox, WeTransfer or say: I will send on WhatsApp" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold">Project brief</span>
                <textarea name="brief" required rows={6} className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="Describe exactly what you need, requirements, format, word count, drawings, software, citation style, deliverables..." />
              </label>
            </div>
            <button disabled={loading} className="mt-5 w-full rounded-full bg-elx-blue px-7 py-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit brief and continue on WhatsApp'}
            </button>
            {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            {result && (
              <div className="mt-5 rounded-3xl bg-green-50 p-5 text-sm text-green-900">
                <p className="font-semibold">Project received. Order ID: {result.orderId}</p>
                <p className="mt-1">Open WhatsApp to continue onboarding.</p>
                <a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-elx-green px-5 py-3 font-semibold text-white">Continue on WhatsApp</a>
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="border-t border-black/[0.08] bg-white px-6 py-10 text-sm text-elx-muted">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p>© {year} Elx Holdings. Elx Studio is a project support platform.</p>
          <div className="flex flex-wrap gap-5">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/academic-integrity">Academic integrity</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
