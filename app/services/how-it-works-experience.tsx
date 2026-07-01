'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { serviceCategories } from '../data/services';

const tutorial = [
  { number: '01', kicker: 'Choose', title: 'Find the closest kind of work.', body: 'Start with a department, then select the specific service. If you are unsure, choose the closest match and we will refine it with you.', note: 'Seven departments. Dozens of specific services.', image: '/images/blueprint-tools.jpg' },
  { number: '02', kicker: 'Brief', title: 'Share only what helps.', body: 'Give us the goal, source material, deadline or preferred file format. Irrelevant fields can stay blank. A rough starting point is enough.', note: 'No bureaucratic obstacle course.', image: '/images/math-formulas.jpg' },
  { number: '03', kicker: 'Scope', title: 'Know the plan before you pay.', body: 'We review the request, clarify open questions and send a manual quote with deliverables, timing and assumptions.', note: 'Asking is free. No surprise checkout.', image: '/images/financial-analysis.jpg' },
  { number: '04', kicker: 'Delivery', title: 'Follow the work. Receive the files.', body: 'Your reference keeps messages, progress, files and revisions connected from assignment through final delivery.', note: 'Clear ownership from brief to done.', image: '/images/technical-render.jpg' },
];

export default function HowItWorksExperience({ locale = 'en' }: { locale?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (playing) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % tutorial.length), 5200);
    return () => window.clearInterval(timer);
  }, [playing]);

  async function toggleNarration() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) { await audio.play(); setPlaying(true); }
    else { audio.pause(); setPlaying(false); }
  }

  function syncScene() {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || !audio.duration) return;
    setActive(Math.min(tutorial.length - 1, Math.floor((audio.currentTime / audio.duration) * tutorial.length)));
  }

  const scene = tutorial[active];
  return (
    <main className="how-it-works-screen bg-[#071d1c] text-white lg:h-[calc(100svh-108px)] lg:min-h-[620px]">
      <audio ref={audioRef} src="/audio/elx-welcome.mp3" preload="metadata" onTimeUpdate={syncScene} onEnded={() => setPlaying(false)} />
      <section className="relative flex min-h-[640px] overflow-hidden lg:h-full lg:min-h-0">
        <div className="absolute inset-0 lg:left-[46%]">
          {tutorial.map((item, index) => <div key={item.number} className={`absolute inset-0 bg-cover bg-center transition duration-1000 ${index === active ? 'scale-100 opacity-80' : 'scale-[1.04] opacity-0'}`} style={{ backgroundImage: `url(${item.image})` }} />)}
          <div className="absolute inset-0 bg-gradient-to-r from-[#071d1c] via-[#071d1c]/40 to-[#071d1c]/10" />
        </div>
        <div className="noise" />

        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col px-5 py-7 md:px-10 lg:py-[clamp(1.5rem,3vh,2.5rem)]">
          <div className="flex items-center justify-between gap-5">
            <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#DDF65C]">How Elx Studio works</p><p className="mt-1 text-xs text-white/40">A two-minute orientation. Use the chapters or let Ryan guide you.</p></div>
            <button type="button" onClick={toggleNarration} className="flex items-center gap-3 border border-white/25 px-4 py-3 text-xs font-black"><span className="grid h-7 w-7 place-items-center bg-[#DDF65C] text-[#102321]">{playing ? 'Ⅱ' : '▶'}</span>{playing ? 'Pause narration' : 'Play narration'}</button>
          </div>

          <div className="my-auto grid items-center gap-8 py-6 lg:grid-cols-[.78fr_1.22fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-[#DDF65C]">{scene.number} / {scene.kicker}</p>
              <h1 className="mt-4 max-w-2xl text-[clamp(3rem,5vw,6rem)] font-black leading-[.84] tracking-[-.075em]">{scene.title}</h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-white/60 md:text-base md:leading-7">{scene.body}</p>
              <p className="mt-4 border-l-2 border-[#DDF65C] pl-4 text-xs font-black text-white/80">{scene.note}</p>
              <div className="mt-6 flex gap-2">
                <Link href={`/start?lang=${locale}`} className="bg-[#DDF65C] px-5 py-3 text-xs font-black text-[#102321]">Start your brief →</Link>
                <Link href={`/?lang=${locale}#top`} className="border border-white/25 px-5 py-3 text-xs font-black">Main site</Link>
              </div>
            </div>

            <div className="self-end lg:pl-10">
              <div className="grid gap-px bg-white/20 sm:grid-cols-4">{tutorial.map((item, index) => <button key={item.number} type="button" onClick={() => setActive(index)} className={`min-h-20 p-3 text-left transition ${index === active ? 'bg-[#DDF65C] text-[#102321]' : 'bg-[#071d1c]/80 text-white hover:bg-[#123b39]'}`}><span className="text-[9px] font-black opacity-50">{item.number}</span><span className="mt-1 block text-xs font-black">{item.kicker}</span></button>)}</div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between"><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/40">Choose a department to see its full service list</p><p className="hidden text-[9px] text-white/40 md:block">Select a card to explore · start from any service page</p></div>
            <div className="grid grid-cols-2 gap-px bg-white/20 sm:grid-cols-4 lg:grid-cols-7">
              {serviceCategories.map((service, index) => <Link key={service.slug} href={`/services/${service.slug}?lang=${locale}`} className="group flex min-h-[72px] flex-col justify-between bg-[#0b2928]/95 p-3 transition hover:bg-white hover:text-[#102321]"><span className="text-[8px] font-black uppercase tracking-[.12em] opacity-50">0{index + 1} / {service.eyebrow}</span><strong className="mt-2 text-[11px] leading-4">{service.title}</strong></Link>)}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
