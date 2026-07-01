'use client';

import { useRef, useState } from 'react';

const scenes = [
  { label: 'Welcome', title: 'Serious work.\nCalm support.', body: 'Science, technology, engineering, finance, business and professional project support.', image: '/images/technical-render.jpg' },
  { label: 'Choose', title: 'Start with the\nclosest service.', body: 'Pick a department, then choose the specific work you need. We can refine the scope with you.', image: '/images/blueprint-tools.jpg' },
  { label: 'Brief', title: 'Tell us what\nyou know.', body: 'Add only the details that matter. Leave irrelevant fields blank and continue.', image: '/images/math-formulas.jpg' },
  { label: 'Build', title: 'One quote.\nVisible progress.', body: 'We confirm scope and price, assign the right specialist, and keep the work accountable.', image: '/images/analytics-dashboard.jpg' },
  { label: 'Deliver', title: 'Review. Refine.\nReceive.', body: 'Get the agreed files, support and revisions without losing the thread of the project.', image: '/images/document-workspace.jpg' },
];

export default function WelcomePresentation({ locale = 'en' }: { locale?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);

  async function toggleNarration() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) { await audio.play(); setPlaying(true); }
    else { audio.pause(); setPlaying(false); }
  }

  function syncScene() {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration) || audio.duration === 0) return;
    setActive(Math.min(scenes.length - 1, Math.floor((audio.currentTime / audio.duration) * scenes.length)));
  }

  const scene = scenes[active];
  return (
    <section id="welcome" className="welcome-presentation relative flex min-h-[calc(100svh-80px)] overflow-hidden bg-[#071d1c] text-white">
      <audio ref={audioRef} src="/audio/elx-welcome.mp3" preload="metadata" onTimeUpdate={syncScene} onEnded={() => setPlaying(false)} />
      <div className="absolute inset-0">
        {scenes.map((item, index) => <div key={item.label} className={`absolute inset-0 bg-cover bg-center transition duration-1000 ${index === active ? 'scale-100 opacity-55' : 'scale-[1.035] opacity-0'}`} style={{ backgroundImage: `url(${item.image})` }} />)}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,26,25,.98)_0%,rgba(4,26,25,.88)_45%,rgba(4,26,25,.3)_100%)]" />
        <div className="noise" />
      </div>
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] items-end gap-8 px-5 py-10 md:px-10 lg:grid-cols-[1fr_.7fr] lg:py-12">
        <div>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[.18em] text-[#DDF65C]"><span>Elx Studio orientation</span><span className="h-px w-12 bg-[#DDF65C]" /><span>0{active + 1} / 05</span></div>
          <p className="mt-8 text-xs font-black uppercase tracking-[.18em] text-white/55">{scene.label}</p>
          <h1 className="mt-3 whitespace-pre-line text-[clamp(3.8rem,8vw,8.5rem)] font-black leading-[.79] tracking-[-.08em]">{scene.title}</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/70 md:text-xl md:leading-8">{scene.body}</p>
        </div>
        <div className="lg:justify-self-end lg:w-full lg:max-w-md">
          <div className="grid grid-cols-5 gap-1">{scenes.map((item, index) => <button key={item.label} type="button" aria-label={`Show ${item.label}`} onClick={() => setActive(index)} className={`h-1 transition ${index === active ? 'bg-[#DDF65C]' : 'bg-white/25'}`} />)}</div>
          <button type="button" onClick={toggleNarration} className="mt-6 flex w-full items-center justify-between border-y border-white/20 py-4 text-left text-sm font-black"><span>{playing ? 'Pause Ryan' : 'Listen to Ryan'}</span><span className="grid h-8 w-8 place-items-center bg-[#DDF65C] text-[#102321]">{playing ? 'Ⅱ' : '▶'}</span></button>
          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <a href="#top" className="bg-[#DDF65C] px-5 py-4 text-center text-sm font-black text-[#102321]">Read part 2 →</a>
            <a href={`/start?lang=${locale}`} className="border border-white/40 px-5 py-4 text-center text-sm font-black text-white">Skip to project brief</a>
          </div>
          <p className="mt-4 text-[10px] leading-4 text-white/40">The presentation moves with the narration. You can also select any chapter above. <a href="/audio/elx-welcome-transcript.txt" target="_blank" className="underline underline-offset-2">Read transcript</a>.</p>
        </div>
      </div>
    </section>
  );
}
