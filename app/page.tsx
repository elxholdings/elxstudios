'use client';

import Image from 'next/image';
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
  { title: 'Writing & documentation', desc: 'Turn rough notes into clear reports, proposals, edited drafts and presentation-ready documents.', tag: 'Clarity' },
  { title: 'STEM & technical work', desc: 'Get accurate, well-explained support for analysis, calculations, data and technical problem-solving.', tag: 'Precision' },
  { title: 'Architecture & CAD', desc: 'Move from concept to precise floor plans, CAD drawings, Revit models and technical documentation.', tag: 'Structure' },
  { title: '3D modeling & rendering', desc: 'Bring interiors, exteriors and products to life with polished models and presentation-quality visuals.', tag: 'Visuals' },
  { title: 'Finance & accounting', desc: 'Make sense of the numbers with budgets, reports, forecasts, bookkeeping support and Excel models.', tag: 'Confidence' },
  { title: 'Business & career', desc: 'Present yourself and your ideas clearly through pitch decks, profiles, research, resumes and presentations.', tag: 'Growth' },
];

const visualStories = [
  {
    image: '/images/document-workspace.jpg',
    alt: 'An organized desk with a business plan, laptop and notebook',
    eyebrow: 'Writing & business',
    title: 'Ideas shaped into clear, credible documents.',
    creditUrl: 'https://www.pexels.com/photo/documents-pens-and-laptop-on-a-desk-8970653/',
    position: 'object-[center_62%]',
  },
  {
    image: '/images/architecture-drafting.jpg',
    alt: 'An architect drafting a detailed building design by hand',
    eyebrow: 'Architecture & technical',
    title: 'Details developed with care and precision.',
    creditUrl: 'https://www.pexels.com/photo/architect-drawing-a-design-sketch-17115288/',
    position: 'object-center',
  },
  {
    image: '/images/financial-analysis.jpg',
    alt: 'A professional reviewing financial documents with a calculator',
    eyebrow: 'Finance & analysis',
    title: 'Complex numbers turned into useful answers.',
    creditUrl: 'https://www.pexels.com/photo/financial-analysis-with-calculator-and-documents-33175651/',
    position: 'object-center',
  },
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
      setError('We could not send your brief just now. Please try again or contact us directly on WhatsApp.');
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
            <a href="#workflow">How it works</a>
            <a href="#start">Start a project</a>
          </div>
          <a href="#start" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-elx-midnight transition hover:bg-white/90">Get started</a>
        </nav>

        <div id="top" className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-20 md:grid-cols-[1.1fr_.9fr] md:items-center md:pt-28">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-white/[0.15] bg-white/[0.08] px-4 py-2 text-sm text-white/[0.78] backdrop-blur">Professional support, without the runaround</p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[.97] tracking-[-0.05em] md:text-7xl">
              Bring us the brief. Leave with work you&apos;re proud to use.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/[0.72]">
              Whether you need a polished report, technical drawing, 3D visual, financial model or professional presentation, Elx Studio helps you move from a demanding brief to a clear, finished result.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#start" className="rounded-full bg-elx-blue px-7 py-4 text-center text-sm font-semibold text-white transition hover:brightness-95">Tell us what you need</a>
              <a href="#services" className="rounded-full border border-white/[0.18] bg-white/[0.08] px-7 py-4 text-center text-sm font-semibold text-white backdrop-blur transition hover:bg-white/[0.12]">See how we can help</a>
            </div>
            <p className="mt-6 text-sm text-white/60">Clear scope &nbsp;•&nbsp; Practical timelines &nbsp;•&nbsp; Human communication</p>
          </div>

          <div className="relative min-h-[520px] overflow-hidden rounded-[2rem] border border-white/[0.12] bg-white/[0.08] shadow-2xl">
            <Image
              src="/images/team-collaboration.jpg"
              alt="A professional team collaborating around laptops in a bright office"
              fill
              priority
              sizes="(min-width: 768px) 42vw, 100vw"
              className="object-cover object-[58%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-elx-midnight via-elx-midnight/10 to-transparent" />
            <a href="https://www.pexels.com/photo/office-team-working-together-7652126/" target="_blank" rel="noreferrer" className="absolute right-5 top-5 rounded-full bg-black/35 px-3 py-1.5 text-xs text-white/80 backdrop-blur">Photo: Pexels</a>
            <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/15 bg-black/45 p-6 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#AFC0FF]">Your project, clearly managed</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Your brief stays at the centre.</h2>
              <p className="mt-2 leading-7 text-white/70">Share the context once. We&apos;ll clarify the details, agree the scope and keep the next step easy to understand.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[.24em] text-elx-blue">Ways we can help</p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-6xl">The right support for the work in front of you.</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-elx-muted">Come with a detailed brief or just the beginnings of an idea. We&apos;ll help you define the deliverable and match it with the right kind of expertise.</p>
          </div>
          <div className="mb-12 grid gap-4 md:grid-cols-3">
            {visualStories.map((story) => (
              <article key={story.title} className="group relative min-h-[360px] overflow-hidden rounded-[1.75rem] bg-elx-midnight text-white">
                <Image src={story.image} alt={story.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className={`object-cover transition duration-500 group-hover:scale-[1.03] ${story.position}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
                <a href={story.creditUrl} target="_blank" rel="noreferrer" className="absolute right-4 top-4 rounded-full bg-black/35 px-3 py-1.5 text-xs text-white/80 backdrop-blur">Pexels</a>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[.22em] text-white/65">{story.eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-semibold leading-tight tracking-tight">{story.title}</h3>
                </div>
              </article>
            ))}
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
              <p className="mb-3 text-sm font-semibold uppercase tracking-[.24em] text-[#8EA5FF]">How it works</p>
              <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">You always know what happens next.</h2>
              <p className="mt-5 text-lg leading-8 text-white/[0.68]">You should not have to manage every detail to get good work. We keep the process straightforward, from the first message to the final files.</p>
            </div>
            <div className="grid gap-3">
              {['Share your brief and supporting files', 'Confirm the scope, timeline and price', 'Stay updated while the work takes shape', 'Review and receive your completed files'].map((step, index) => (
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
            <p className="mb-3 text-sm font-semibold uppercase tracking-[.24em] text-elx-blue">Ready when you are</p>
            <h2 className="text-4xl font-semibold tracking-[-0.04em] md:text-5xl">Tell us what you need.</h2>
            <p className="mt-5 leading-8 text-elx-muted">Give us the context, deadline and format you have in mind. We&apos;ll review the details and continue on WhatsApp with any questions, a clear scope and the next steps.</p>
            <div className="mt-8 rounded-3xl bg-elx-fog p-6">
              <h3 className="font-semibold">Have supporting files?</h3>
              <p className="mt-2 text-sm leading-6 text-elx-muted">Paste a Google Drive, Dropbox, WeTransfer or OneDrive link below. If that is easier, you can send the files when we continue on WhatsApp.</p>
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
                <span className="text-sm font-semibold">When do you need it?</span>
                <input name="deadline" required className="mt-2 w-full rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="Today, 24 hours, Friday..." />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">Budget range <span className="font-normal text-elx-muted">(optional)</span></span>
                <input name="budget" className="mt-2 w-full rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="$50-$200, flexible..." />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold">Supporting files <span className="font-normal text-elx-muted">(optional)</span></span>
                <input name="filesLink" className="mt-2 w-full rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="Paste a Drive, Dropbox, WeTransfer or OneDrive link" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-semibold">What would you like help with?</span>
                <textarea name="brief" required rows={6} className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-elx-fog px-4 py-3 outline-none focus:border-elx-blue" placeholder="Tell us about the goal, requirements, format, software, references and the finished files you expect..." />
              </label>
            </div>
            <button disabled={loading} className="mt-5 w-full rounded-full bg-elx-blue px-7 py-4 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Sending your brief...' : 'Send my brief and continue on WhatsApp'}
            </button>
            {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            {result && (
              <div className="mt-5 rounded-3xl bg-green-50 p-5 text-sm text-green-900">
                <p className="font-semibold">We have your brief. Reference: {result.orderId}</p>
                <p className="mt-1">Continue on WhatsApp and we&apos;ll take it from here.</p>
                <a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full bg-elx-green px-5 py-3 font-semibold text-white">Continue on WhatsApp</a>
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="border-t border-black/[0.08] bg-white px-6 py-10 text-sm text-elx-muted">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p>© {year} Elx Holdings. Elx Studio is a project support platform.</p>
            <p className="mt-1 text-xs">Photography sourced from <a href="https://www.pexels.com" target="_blank" rel="noreferrer" className="underline underline-offset-2">Pexels</a>.</p>
          </div>
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
