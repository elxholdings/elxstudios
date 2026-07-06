'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const INTRO_KEY = 'elx-guided-intro-v3';
const duration = 80.88;
const scenes = [
  { start: 0, end: 13, label: 'Welcome', title: 'Complex work belongs here.', copy: 'Bring the calculations, drawings, reports, models or messy notes. You get a clearer path forward.' },
  { start: 13, end: 29, label: 'Capabilities', title: 'Seven departments. One brief.', copy: 'Choose the closest service and the work can be shaped into documents, drawings, models, charts or presentations.' },
  { start: 29, end: 45, label: 'Your brief', title: 'Only add what matters.', copy: 'Share the goal, files, deadline, dimensions or source data you already have. Anything irrelevant can stay blank.' },
  { start: 45, end: 56, label: 'Scope & quote', title: 'Know the plan first.', copy: 'You receive the proposed deliverables, timing and price before any paid work begins.' },
  { start: 56, end: 70, label: 'Production', title: 'Stay close to the work.', copy: 'Your reference keeps updates, questions, files, progress and revisions connected in one place.' },
  { start: 70, end: duration, label: 'Delivery', title: 'Ready-to-use results.', copy: 'Download the agreed files, review the outcome and use the support included in your scope.' },
] as const;

export default function WelcomePresentation({ locale = 'en', forceIntro = false }: { locale?: string; forceIntro?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const frameRef = useRef<number>();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const destination = `/start?lang=${encodeURIComponent(locale)}`;
  const workspaceDestination = `/dashboard?lang=${encodeURIComponent(locale)}`;

  useEffect(() => {
    if (!forceIntro && window.localStorage.getItem(INTRO_KEY) === 'seen') {
      window.location.replace(workspaceDestination);
      return;
    }
    setVisible(true);
    setChecked(true);
  }, [forceIntro, workspaceDestination]);

  useEffect(() => {
    if (!playing) return;
    const tick = () => { if (audioRef.current) setTime(audioRef.current.currentTime); frameRef.current = window.requestAnimationFrame(tick); };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => { if (frameRef.current) window.cancelAnimationFrame(frameRef.current); };
  }, [playing]);

  const active = useMemo(() => Math.max(0, scenes.findIndex((scene) => time >= scene.start && time < scene.end)), [time]);
  const scene = scenes[active === -1 ? scenes.length - 1 : active];
  const sceneProgress = Math.max(0, Math.min(1, (time - scene.start) / (scene.end - scene.start)));

  function continueToIntake() {
    window.localStorage.setItem(INTRO_KEY, 'seen');
    audioRef.current?.pause();
    setPlaying(false);
    window.location.assign(destination);
  }

  async function begin() {
    setStarted(true);
    if (!audioRef.current) return;
    await audioRef.current.play();
    setPlaying(true);
  }

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) { await audio.play(); setStarted(true); setPlaying(true); }
    else { audio.pause(); setPlaying(false); }
  }

  async function goTo(index: number) {
    if (!audioRef.current) return;
    audioRef.current.currentTime = scenes[index].start;
    setTime(scenes[index].start);
    setStarted(true);
    await audioRef.current.play();
    setPlaying(true);
  }

  if (!checked) return <div className="fixed inset-0 z-[2000] bg-[#061b1a]" aria-hidden="true" />;
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[2000] overflow-hidden bg-[#061b1a] text-white" role="dialog" aria-label="Welcome to Elx Studio">
      <audio ref={audioRef} src="/audio/elx-welcome.mp3" preload="auto" onEnded={() => { setPlaying(false); setTime(duration); continueToIntake(); }} />
      <div className="absolute inset-0 process-grid opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(221,246,92,.12),transparent_28%),linear-gradient(120deg,#061b1a_0%,#082a28_55%,#061b1a_100%)]" />

      {!started ? <IntroGate onBegin={begin} onSkip={continueToIntake} /> : (
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col px-5 py-5 md:px-10 md:py-7">
          <div className="flex items-center justify-between gap-5">
            <p className="text-xl font-black tracking-[-.06em]">Elx<span className="text-[#F06449]">.</span>Studio</p>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[.16em] text-white/50"><span>Welcome tour</span><span className="hidden h-px w-10 bg-white/20 sm:block" /><span>{formatTime(time)} / {formatTime(duration)}</span></div>
            <button type="button" onClick={continueToIntake} className="border-b border-white/30 pb-1 text-xs font-black">Skip to project intake</button>
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] items-center gap-3 py-3 lg:grid-cols-[.82fr_1.18fr] lg:grid-rows-none lg:gap-6 lg:py-5">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#DDF65C]">0{active + 1} / {scene.label}</p>
              <h1 key={scene.title} className="intro-copy-in mt-3 max-w-2xl text-[clamp(2.35rem,5.8vw,6.8rem)] font-black leading-[.82] tracking-[-.075em]">{scene.title}</h1>
              <p key={scene.copy} className="intro-copy-in mt-3 max-w-xl text-xs leading-5 text-white/60 md:mt-5 md:text-lg md:leading-8">{scene.copy}</p>
              <div className="mt-4 flex items-center gap-3 md:mt-7">
                <button type="button" onClick={toggle} className="grid h-11 w-11 place-items-center bg-[#DDF65C] font-black text-[#102321]">{playing ? 'Ⅱ' : '▶'}</button>
                <div><p className="text-xs font-black">Ryan / Your Elx Studio guide</p><p className="mt-1 text-[10px] text-white/40">Follow along or choose any chapter</p></div>
              </div>
            </div>

            <div className="relative min-h-[230px] overflow-hidden self-stretch md:min-h-[320px] lg:min-h-0">
              <SynchronizedVisual scene={active} progress={sceneProgress} />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {scenes.map((item, index) => <button type="button" key={item.label} onClick={() => goTo(index)} className="group text-left"><span className="mb-2 hidden text-[8px] font-black uppercase tracking-[.12em] text-white/35 md:block">{item.label}</span><span className="block h-1 overflow-hidden bg-white/15"><span className="block h-full bg-[#DDF65C] transition-[width] duration-100" style={{ width: index < active ? '100%' : index === active ? `${sceneProgress * 100}%` : '0%' }} /></span></button>)}
          </div>
        </div>
      )}

    </div>
  );
}

function IntroGate({ onBegin, onSkip }: { onBegin: () => void; onSkip: () => void }) {
  return <div className="relative z-10 mx-auto grid h-full max-w-[1500px] items-center gap-8 px-5 md:px-10 lg:grid-cols-[1fr_.72fr]"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#DDF65C]">Welcome to Elx Studio</p><h1 className="mt-5 max-w-4xl text-[clamp(3rem,8vw,9rem)] font-black leading-[.78] tracking-[-.085em]">Let us show you<br /><span className="text-[#DDF65C]">how it works.</span></h1><p className="mt-6 max-w-xl text-sm leading-6 text-white/60 md:mt-7 md:text-xl md:leading-8">A short guided introduction with voice, diagrams and examples. You can skip it now if you already know what you need.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={onBegin} className="bg-[#DDF65C] px-7 py-4 text-sm font-black text-[#102321]">Begin with sound ▶</button><button type="button" onClick={onSkip} className="border border-white/30 px-7 py-4 text-sm font-black">Skip to project intake</button></div><button type="button" onClick={onSkip} className="mt-5 inline-block text-xs font-black text-white/45 underline underline-offset-4">I already know what I need →</button></div><div className="hidden lg:block"><GateGraphic /></div></div>;
}

function SynchronizedVisual({ scene, progress }: { scene: number; progress: number }) {
  return <div className="absolute inset-0 grid place-items-center">{scene === 0 && <NetworkVisual p={progress} />}{scene === 1 && <CapabilitiesVisual p={progress} />}{scene === 2 && <BriefVisual p={progress} />}{scene === 3 && <QuoteVisual p={progress} />}{scene === 4 && <WorkspaceVisual p={progress} />}{scene === 5 && <DeliveryVisual p={progress} />}</div>;
}

function VisualFrame({ children, label }: { children: React.ReactNode; label: string }) { return <div className="relative h-full w-full max-w-[780px] overflow-hidden p-2 md:p-4"><div className="mb-2 flex items-center justify-between text-[8px] font-black uppercase tracking-[.18em] text-white/35"><span>Your project journey</span><span>{label}</span></div>{children}</div>; }

function NetworkVisual({ p }: { p: number }) {
  const nodes = [['STEM',18,32],['CAD',80,34],['3D',50,18],['FINANCE',76,72],['BUSINESS',24,72],['WRITING',50,82]];
  return (
    <VisualFrame label="All the support you need">
      <div className="grid h-[calc(100%-18px)] grid-cols-[.72fr_1fr] gap-3">
        <div className="grid content-center gap-2">
          {[
            ['Brief', 'goal + files'],
            ['Scope', 'price + timing'],
            ['Output', 'usable files'],
          ].map(([title, text], index) => (
            <div key={title} className="border border-white/10 bg-white/5 p-3" style={{ opacity: Math.max(.2, Math.min(1, p * 2 - index * .16)) }}>
              <p className="text-[8px] font-black uppercase tracking-[.14em] text-[#DDF65C]">{title}</p>
              <p className="mt-1 text-[11px] font-bold text-white/70">{text}</p>
            </div>
          ))}
          <svg viewBox="0 0 180 72" className="mt-1 h-20 w-full text-white" fill="none" aria-hidden="true">
            <path d="M12 60h154M12 10v50" stroke="currentColor" strokeOpacity=".18" />
            <path d="M16 48c19-24 32 2 49-19 15-18 28-5 42-15 12-8 27-4 50-8" stroke="#DDF65C" strokeWidth="4" strokeDasharray="210" strokeDashoffset={210 - p * 210} />
            {[22, 52, 82, 112, 142].map((x, i) => <rect key={x} x={x} y={62 - (i + 2) * 7} width="13" height={(i + 2) * 7 - 2} fill="white" opacity=".13" />)}
          </svg>
        </div>
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
          <g stroke="rgba(255,255,255,.18)" strokeWidth=".55">{nodes.map(([name,x,y]) => <line key={String(name)} x1="50" y1="51" x2={Number(x)} y2={Number(y)} strokeDasharray="50" strokeDashoffset={50 - p * 50} />)}</g>
          <circle cx="50" cy="51" r={7 + p * 1.8} fill="#DDF65C" />
          <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fill="#102321" fontSize="4" fontWeight="900">ELX</text>
          {nodes.map(([name,x,y],i) => <g key={String(name)} style={{ opacity: Math.max(0, Math.min(1, p * 2.2 - i * .12)), transform: `translateY(${(1-p)*2}px)`, transformOrigin: `${x}px ${y}px` }}><rect x={Number(x)-7} y={Number(y)-5} width="14" height="10" fill="#0e3d3a" stroke="#DDF65C" strokeWidth=".65"/><text x={Number(x)} y={Number(y)+.4} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="2.3" fontWeight="900">{name}</text></g>)}
        </svg>
      </div>
    </VisualFrame>
  );
}

function CapabilitiesVisual({ p }: { p: number }) { const items=['Documentation','STEM','Architecture','CAD','3D rendering','Finance','Business']; return <VisualFrame label="Choose what you need"><div className="grid h-[calc(100%-20px)] grid-cols-[1fr_1.2fr] gap-6"><div className="flex flex-col justify-center gap-2">{items.map((item,i)=><div key={item} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.08em]" style={{ opacity: Math.max(.18, Math.min(1,p*2-i*.12)) }}><span className="w-5 text-[#DDF65C]">0{i+1}</span><span>{item}</span></div>)}</div><div className="flex items-end gap-2 border-b border-l border-white/20 p-3">{[62,88,54,96,76,68,83].map((height,i)=><div key={i} className="relative flex-1 bg-[#DDF65C]" style={{ height:`${height*Math.max(0,Math.min(1,p*1.8-i*.08))}%` }}><span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-white">{height}</span></div>)}</div></div></VisualFrame>; }

function BriefVisual({ p }: { p: number }) { const fields=['Department','Specific service','Goal or problem','Deadline','Required format']; return <VisualFrame label="Flexible brief"><div className="grid h-[calc(100%-20px)] grid-cols-[1.2fr_.8fr] gap-5"><div className="bg-white p-5 text-[#102321]"><p className="text-[9px] font-black uppercase tracking-[.14em] text-[#F06449]">Project brief</p><div className="mt-4 grid gap-3">{fields.map((field,i)=><div key={field} className="border-b border-black/20 pb-2" style={{ opacity: Math.max(.2,Math.min(1,p*2-i*.16)) }}><span className="text-[8px] font-black uppercase text-black/40">{field}</span><span className="ml-3 text-[10px] font-bold">{i<2?'Selected':'Optional'}</span></div>)}</div></div><div className="flex flex-col justify-between bg-[#DDF65C] p-5 text-[#102321]"><div><p className="text-[9px] font-black uppercase">Only useful details</p><p className="mt-3 text-2xl font-black leading-none">Skip what does not apply.</p></div><div className="h-2 bg-black/15"><div className="h-full bg-[#102321]" style={{width:`${20+p*80}%`}} /></div></div></div></VisualFrame>; }

function QuoteVisual({ p }: { p: number }) { return <VisualFrame label="Your clear quote"><div className="grid h-[calc(100%-20px)] grid-cols-[1fr_.85fr] gap-5"><div className="relative flex items-center justify-between">{['YOUR BRIEF','WE REVIEW','YOUR QUOTE'].map((item,i)=><div key={item} className={`relative z-10 grid h-16 w-16 place-items-center border px-1 text-center text-[8px] font-black ${p>(i*.28)?'border-[#DDF65C] bg-[#DDF65C] text-[#102321]':'border-white/20 bg-[#082725]'}`}>{item}</div>)}<div className="absolute left-8 right-8 top-1/2 h-px bg-white/20"><div className="h-full bg-[#DDF65C]" style={{width:`${p*100}%`}} /></div></div><div className="flex flex-col justify-between bg-white p-5 text-[#102321]"><div><p className="text-[8px] font-black uppercase text-[#F06449]">What you will receive</p><p className="mt-2 text-xl font-black">Clear before commitment.</p></div>{['Final files','Delivery date','Agreed price'].map((item,i)=><div key={item} className="flex justify-between border-t border-black/10 py-2 text-[9px] font-bold"><span>{item}</span><span style={{opacity:Math.max(0,Math.min(1,p*2-i*.2))}}>CONFIRMED ✓</span></div>)}</div></div></VisualFrame>; }

function WorkspaceVisual({ p }: { p: number }) { const cols=[['UPDATES',3],['PROGRESS',5],['YOUR FILES',4]]; return <VisualFrame label="Everything in one workspace"><div className="grid h-[calc(100%-20px)] grid-cols-3 gap-3">{cols.map(([label,count],i)=><div key={label} className="bg-white/5 p-3"><p className="text-[8px] font-black tracking-[.12em] text-[#DDF65C]">{label}</p><div className="mt-4 grid gap-2">{Array.from({length:Number(count)}).map((_,j)=><div key={j} className="h-7 border border-white/10 bg-white/10" style={{opacity:Math.max(.12,Math.min(1,p*2-j*.15-i*.1)),transform:`translateY(${Math.max(0,1-p)*8}px)`}} />)}</div></div>)}</div><div className="absolute bottom-8 left-8 right-8 h-1 bg-white/15"><div className="h-full bg-[#DDF65C]" style={{width:`${p*100}%`}} /></div></VisualFrame>; }

function DeliveryVisual({ p }: { p: number }) { return <VisualFrame label="Delivery package"><div className="relative grid h-[calc(100%-20px)] place-items-center"><div className="relative h-48 w-64">{['SOURCE','REVIEW','FINAL'].map((label,i)=><div key={label} className="absolute left-1/2 top-1/2 grid h-36 w-52 place-items-center border border-[#102321] bg-white text-[#102321] shadow-xl transition" style={{transform:`translate(-50%,-50%) translate(${(i-1)*Math.max(0,p)*52}px, ${(i-1)*Math.max(0,p)*14}px) rotate(${(i-1)*Math.max(0,p)*4}deg)`,zIndex:i}}><span className="text-xs font-black">{label} FILE</span></div>)}</div><svg viewBox="0 0 44 44" className="absolute bottom-1 right-1 h-20 w-20"><circle cx="22" cy="22" r="18" fill="#DDF65C"/><path d="m13 22 6 6 13-15" fill="none" stroke="#102321" strokeWidth="3" strokeDasharray="32" strokeDashoffset={32-p*32}/></svg></div></VisualFrame>; }

function GateGraphic() { return <div className="relative mx-auto aspect-square max-w-[420px]"><div className="absolute inset-[12%] animate-[spin_28s_linear_infinite] rounded-full border border-[#DDF65C]/40"/><div className="absolute inset-[25%] animate-[spin_18s_linear_infinite_reverse] rounded-full border border-white/20"/><div className="absolute inset-[38%] grid place-items-center rounded-full bg-[#DDF65C] text-4xl font-black text-[#102321]">ELX</div>{['SUM','CAD','3D','DATA','FIN','DOC'].map((item,i)=><div key={item} className="absolute grid h-11 w-11 place-items-center border border-white/25 bg-[#082725] text-[10px] font-black" style={{left:`${50+40*Math.cos(i*Math.PI/3)}%`,top:`${50+40*Math.sin(i*Math.PI/3)}%`,transform:'translate(-50%,-50%)'}}>{item}</div>)}</div>; }

function formatTime(value: number) { const seconds=Math.max(0,Math.floor(value)); return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; }
