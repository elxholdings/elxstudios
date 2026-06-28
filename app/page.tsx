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

const capabilities = [
  {
    number: '01',
    title: 'Work through complex calculations',
    text: 'Get structured support for mathematics, science, engineering, data and technical problem-solving.',
    image: '/images/math-formulas.jpg',
    alt: 'Mathematical equations viewed through a magnifying glass',
    color: 'bg-[#DDF65C]',
  },
  {
    number: '02',
    title: 'Develop precise drawings and plans',
    text: 'Move from an early idea to clear floor plans, CAD drawings, models and technical documentation.',
    image: '/images/blueprint-tools.jpg',
    alt: 'Architectural plans with rulers and a protractor',
    color: 'bg-[#AFC8FF]',
  },
  {
    number: '03',
    title: 'Turn numbers into useful decisions',
    text: 'Build budgets, forecasts, reports and Excel models that make the story behind the figures easier to see.',
    image: '/images/analytics-dashboard.jpg',
    alt: 'A laptop displaying analytical charts and financial data',
    color: 'bg-[#FF9A76]',
  },
  {
    number: '04',
    title: 'Create polished visual outcomes',
    text: 'Present concepts with refined 3D models, renderings, diagrams, boards and presentation-ready visuals.',
    image: '/images/technical-render.jpg',
    alt: 'A geometric three-dimensional digital render',
    color: 'bg-[#C9B8FF]',
  },
];

const workflow = [
  ['Share the brief', 'Tell us the goal, required format, deadline and any instructions you already have.'],
  ['Confirm the plan', 'We clarify open questions and agree on the deliverables, timing and price.'],
  ['Follow the progress', 'Continue on WhatsApp for direct communication while the work takes shape.'],
  ['Receive the files', 'Review the completed work and receive your final files in the agreed format.'],
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
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Could not submit project.');
      setResult((await response.json()) as IntakeResponse);
      form.reset();
    } catch {
      setError('We could not send your brief just now. Please try again or contact us directly on WhatsApp.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="overflow-hidden bg-[#F5F2E8] text-[#102321]">
      <header className="sticky top-0 z-50 bg-[#F5F2E8]">
        <nav className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-10">
          <a href="#top" className="text-2xl font-black tracking-[-0.06em]">Elx<span className="text-[#F06449]">.</span>Studio</a>
          <div className="hidden items-center gap-8 text-sm font-semibold md:flex">
            <a href="#services" className="transition hover:opacity-60">Expertise</a>
            <a href="#workflow" className="transition hover:opacity-60">How it works</a>
            <a href="#start" className="transition hover:opacity-60">Send a brief</a>
          </div>
          <a href="#start" className="bg-[#102321] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#F06449]">Start a project <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <section id="top" className="bg-[#073C3E] text-white">
        <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-16 md:px-10 md:pb-12 md:pt-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
            <div>
              <a href="#services" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[.14em] text-[#DDF65C]">
                Technical & professional project support <span aria-hidden="true">→</span>
              </a>
              <h1 className="max-w-5xl text-[clamp(4.6rem,11vw,10rem)] font-black leading-[.78] tracking-[-0.085em]">
                Get it<br /><span className="text-[#DDF65C]">right.</span>
              </h1>
            </div>
            <div className="max-w-xl pb-2 lg:pb-5">
              <p className="text-xl leading-8 text-white/72 md:text-2xl md:leading-9">Bring us the difficult brief—the calculations, drawings, models, reports and details. We&apos;ll help turn it into clear, polished work you can use with confidence.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#start" className="bg-[#DDF65C] px-7 py-4 text-center text-sm font-bold text-[#102321] transition hover:bg-white">Send your brief</a>
                <a href="#services" className="px-1 py-4 text-center text-sm font-bold underline decoration-white/35 underline-offset-8 transition hover:decoration-white">Explore our expertise</a>
              </div>
            </div>
          </div>

          <div className="-mx-5 mt-14 md:-mx-10 md:mt-20">
            <div className="relative aspect-[16/7] min-h-[340px] overflow-hidden">
              <Image src="/images/technical-render.jpg" alt="A geometric three-dimensional digital render" fill priority sizes="100vw" className="object-cover" />
            </div>
            <div className="grid bg-[#DDF65C] text-[#102321] sm:grid-cols-3">
              {['CAD + 3D', 'STEM + analysis', 'Reports + finance'].map((item) => (
                <div key={item} className="px-5 py-4 font-bold md:px-8">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F5F2E8]">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-y-8 px-5 py-12 md:grid-cols-4 md:px-10 md:py-16">
          {[
            ['7', 'service areas'],
            ['01', 'reference for every brief'],
            ['Direct', 'WhatsApp communication'],
            ['Flexible', 'delivery formats'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-3xl font-black tracking-[-0.05em] md:text-5xl">{value}</p>
              <p className="mt-2 max-w-[12rem] text-sm leading-5 text-black/55">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F5F2E8] px-5 py-24 md:px-10 md:py-36">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-2">
          <p className="text-sm font-bold uppercase tracking-[.18em] text-[#F06449]">Built around your brief</p>
          <div>
            <h2 className="text-5xl font-black leading-[.94] tracking-[-0.065em] md:text-7xl">Your project can be complex. The process shouldn&apos;t be.</h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-black/60">No endless searching for different specialists. No wondering what happens next. Start with one clear brief and move forward with the right support around the work.</p>
          </div>
        </div>
      </section>

      <section id="services" className="bg-white px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-14 max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[.18em] text-[#F06449]">Everything you need</p>
            <h2 className="mt-5 text-5xl font-black leading-[.92] tracking-[-0.065em] md:text-8xl">From first calculation to final presentation.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {capabilities.map((item) => (
              <article key={item.title} className={`${item.color} group overflow-hidden`}>
                <div className="flex min-h-[330px] flex-col justify-between p-7 md:p-10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black">{item.number}</span>
                    <span className="text-2xl transition group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
                  </div>
                  <div>
                    <h3 className="max-w-xl text-3xl font-black leading-[1] tracking-[-0.045em] md:text-5xl">{item.title}</h3>
                    <p className="mt-5 max-w-xl leading-7 text-black/65">{item.text}</p>
                  </div>
                </div>
                <div className="relative block aspect-[16/10] overflow-hidden">
                  <Image src={item.image} alt={item.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.035]" />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 pt-6">
            <p className="mb-6 text-sm font-bold uppercase tracking-[.18em] text-black/45">Also available</p>
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              {['Reports & proposals', 'Editing & formatting', 'Research support', 'Pitch decks', 'Company profiles', 'Resumes & presentations'].map((item) => (
                <span key={item} className="text-sm font-bold">{item}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-[#073C3E] px-5 py-24 text-white md:px-10 md:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-sm font-bold uppercase tracking-[.18em] text-[#DDF65C]">How it works</p>
              <h2 className="mt-5 text-5xl font-black leading-[.9] tracking-[-0.065em] md:text-7xl">A clear path from brief to done.</h2>
              <a href="#start" className="mt-8 inline-flex bg-[#DDF65C] px-6 py-4 text-sm font-bold text-[#102321]">Start your project →</a>
            </div>
            <div className="border-t border-white/10">
              {workflow.map(([title, text], index) => (
                <div key={title} className="grid gap-5 border-b border-white/10 py-8 md:grid-cols-[80px_1fr] md:py-10">
                  <span className="text-sm font-bold text-[#DDF65C]">0{index + 1}</span>
                  <div>
                    <h3 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">{title}</h3>
                    <p className="mt-3 max-w-xl leading-7 text-white/60">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="start" className="bg-[#DDF65C] px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.18em]">Ready when you are</p>
            <h2 className="mt-5 text-6xl font-black leading-[.87] tracking-[-0.075em] md:text-8xl">Let&apos;s get to work.</h2>
            <p className="mt-7 max-w-md text-lg leading-8 text-black/65">Share the context, deadline and format you have in mind. We&apos;ll review the details and continue with you on WhatsApp.</p>
            <div className="mt-10 max-w-md border-t border-black/20 pt-5">
              <p className="font-black">Have supporting files?</p>
              <p className="mt-2 text-sm leading-6 text-black/60">Paste a Drive, Dropbox, WeTransfer or OneDrive link—or send the files when we continue on WhatsApp.</p>
            </div>
            <div className="relative mt-8 block aspect-[16/10] overflow-hidden">
              <Image src="/images/calculator-charts.jpg" alt="A calculator placed over printed charts and analytical reports" fill sizes="(min-width: 1024px) 32vw, 100vw" className="object-cover" />
            </div>
          </div>

          <form onSubmit={submitProject} className="bg-white p-5 md:p-10">
            <div className="grid gap-5 md:grid-cols-2">
              <label>
                <span className="text-sm font-bold">Full name</span>
                <input name="name" required className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder="Your name" />
              </label>
              <label>
                <span className="text-sm font-bold">WhatsApp number</span>
                <input name="whatsapp" required className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder="+254..." />
              </label>
              <label>
                <span className="text-sm font-bold">Email <span className="font-normal text-black/45">(optional)</span></span>
                <input name="email" type="email" className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder="you@email.com" />
              </label>
              <label>
                <span className="text-sm font-bold">What do you need?</span>
                <select name="service" required className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0">
                  <option value="">Select a service</option>
                  {services.map((service) => <option key={service}>{service}</option>)}
                </select>
              </label>
              <label>
                <span className="text-sm font-bold">When do you need it?</span>
                <input name="deadline" required className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder="Today, Friday, 24 hours..." />
              </label>
              <label>
                <span className="text-sm font-bold">Budget range <span className="font-normal text-black/45">(optional)</span></span>
                <input name="budget" className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder="$50–$200, flexible..." />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-bold">Supporting files <span className="font-normal text-black/45">(optional)</span></span>
                <input name="filesLink" className="mt-2 w-full border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder="Paste a Drive, Dropbox, WeTransfer or OneDrive link" />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-bold">Tell us about the project</span>
                <textarea name="brief" required rows={6} className="mt-2 w-full resize-none border-0 border-b border-black/20 bg-transparent px-0 py-3.5 outline-none transition focus:border-[#073C3E] focus:ring-0" placeholder="Describe the goal, requirements, format, software, references and finished files you expect..." />
              </label>
            </div>
            <button disabled={loading} className="mt-6 w-full bg-[#102321] px-7 py-4 text-sm font-bold text-white transition hover:bg-[#F06449] disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Sending your brief...' : 'Send my brief and continue on WhatsApp →'}
            </button>
            {error && <p className="mt-4 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            {result && (
              <div className="mt-5 bg-[#E7F7E8] p-5 text-sm text-[#164F22]">
                <p className="font-bold">We have your brief. Reference: {result.orderId}</p>
                <p className="mt-1">Continue on WhatsApp and we&apos;ll take it from here.</p>
                <a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex bg-[#164F22] px-5 py-3 font-bold text-white">Continue on WhatsApp ↗</a>
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="bg-[#102321] px-5 py-12 text-white md:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-3xl font-black tracking-[-0.06em]">Elx<span className="text-[#F06449]">.</span>Studio</p>
            <p className="mt-3 text-sm text-white/50">© {year} Elx Holdings. Professional and technical project support.</p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm font-semibold text-white/65">
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/academic-integrity">Academic integrity</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
