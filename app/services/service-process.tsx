'use client';

import { useEffect, useState } from 'react';

const steps = [
  { number: '01', title: 'Share the brief', text: 'Send the goal, deadline, source files and required format.', icon: 'brief' },
  { number: '02', title: 'Confirm the scope', text: 'We confirm deliverables, timing and price before work begins.', icon: 'scope' },
  { number: '03', title: 'Follow the work', text: 'One reference and direct communication keep progress visible.', icon: 'work' },
  { number: '04', title: 'Receive the files', text: 'Review the outcome and receive the agreed file formats.', icon: 'files' },
];

export default function ServiceProcess() {
  const [active, setActive] = useState(0);
  useEffect(() => { const timer = window.setInterval(() => setActive((value) => (value + 1) % steps.length), 2800); return () => window.clearInterval(timer); }, []);
  return <section id="process" className="flex bg-[#073C3E] px-6 py-10 text-white md:px-10 lg:h-full lg:min-h-0 lg:px-[clamp(2rem,4vw,5rem)] lg:py-[clamp(2rem,5vh,4rem)]">
    <div className="flex w-full flex-col justify-between"><div><p className="text-xs font-black uppercase tracking-[.18em] text-[#DDF65C]">How it works</p><h2 className="mt-4 text-5xl font-black leading-[.87] tracking-[-.065em] xl:text-7xl">One brief.<br />Four moves.</h2><p className="mt-5 max-w-md text-sm leading-6 text-white/55">The full handoff is visible here. Select a stage or let the illustration move automatically.</p></div>
      <div className="my-8"><div className="relative flex items-center justify-between"><div className="absolute left-5 right-5 top-1/2 h-px bg-white/20"/><div className="absolute left-5 top-1/2 h-0.5 bg-[#DDF65C] transition-all duration-700" style={{ width: `calc(${active / 3 * 100}% - ${active === 0 ? 0 : 40}px)` }} />{steps.map((step,index) => <button key={step.number} type="button" onClick={() => setActive(index)} aria-label={step.title} className={`relative z-10 grid h-11 w-11 place-items-center border text-xs font-black transition-all ${active === index ? 'scale-110 border-[#DDF65C] bg-[#DDF65C] text-[#102321]' : 'border-white/25 bg-[#073C3E] text-white/55 hover:border-white'}`}>{step.number}</button>)}</div>
        <div className="mt-7 border-l-4 border-[#DDF65C] bg-white p-5 text-[#102321]"><div className="flex items-center gap-4"><ProcessIcon type={steps[active].icon} /><div><small className="font-black uppercase tracking-[.13em] text-[#F06449]">Stage {steps[active].number}</small><h3 className="mt-1 text-2xl font-black">{steps[active].title}</h3><p className="mt-1 text-sm leading-5 text-black/55">{steps[active].text}</p></div></div></div>
      </div>
      <a href="/start" className="inline-flex w-fit bg-[#DDF65C] px-6 py-4 text-sm font-black text-[#102321]">Start with your brief →</a></div>
  </section>;
}

function ProcessIcon({ type }: { type: string }) { return <span className="grid h-11 w-11 shrink-0 place-items-center bg-[#DDF65C]"><svg viewBox="0 0 32 32" className="h-7 w-7 fill-none stroke-current" strokeWidth="1.7">{type === 'brief' && <><path d="M8 4h12l4 4v20H8z"/><path d="M20 4v5h5M12 14h8M12 19h8"/></>}{type === 'scope' && <><circle cx="16" cy="16" r="11"/><path d="m11 16 3 3 7-8"/></>}{type === 'work' && <><path d="M4 8h24v17H4zM10 8V5h12v3"/><path d="M4 15h24M13 15v3h6v-3"/></>}{type === 'files' && <><path d="M7 5h12l5 5v17H7z"/><path d="M19 5v6h6M11 16h9M11 21h9"/></>}</svg></span>; }
