'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clampVolume, defaultIntroAudioMix, normalizeIntroAudioMix, type IntroAudioMixSetting } from './lib/intro-audio-config';

const INTRO_KEY = 'elx-guided-intro-v4';

const sceneTemplates = [
  { cut: 0, label: 'Start', title: 'Watch the real site.', copy: 'The intro now mirrors the actual project intake, so clients see where to click, what to type and how the shop works before they ever fill a form.' },
  { cut: 0.14, label: 'Choose', title: 'Pick the closest service.', copy: 'Hover or select a department. The exact service can be refined after the brief is reviewed.' },
  { cut: 0.32, label: 'Brief', title: 'Type only what matters.', copy: 'A title, goal, files, dimensions, software, deadline or final format is enough. Blank fields are allowed.' },
  { cut: 0.50, label: 'Files', title: 'Send the working material.', copy: 'Documents, drawings, models, data and dashboards can all become clear deliverables.' },
  { cut: 0.66, label: 'Shop', title: 'Browse architectural plans.', copy: 'The shop introduces ready plan designs, details and customization requests for architecture clients.' },
  { cut: 0.82, label: 'Holdings', title: 'One studio inside E.L.X Holdings.', copy: 'E.L.X Studio handles research, documentation and technical support while E.L.X Holdings covers the wider built-environment work.' },
] as const;

function buildScenes(duration: number) {
  const safeDuration = Math.max(10, duration || defaultIntroAudioMix.voiceDuration);
  return sceneTemplates.map((scene, index) => ({
    ...scene,
    start: scene.cut * safeDuration,
    end: index === sceneTemplates.length - 1 ? safeDuration : sceneTemplates[index + 1].cut * safeDuration,
  }));
}

export default function WelcomePresentation({
  locale = 'en',
  forceIntro = false,
  audioMix = defaultIntroAudioMix,
}: {
  locale?: string;
  forceIntro?: boolean;
  audioMix?: IntroAudioMixSetting;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const frameRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const introAudio = useMemo(() => normalizeIntroAudioMix(audioMix), [audioMix]);
  const duration = introAudio.voiceDuration || defaultIntroAudioMix.voiceDuration;
  const scenes = useMemo(() => buildScenes(duration), [duration]);
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
    const tick = () => {
      const audio = audioRef.current;
      const music = musicRef.current;
      if (audio) {
        setTime(audio.currentTime);
        audio.volume = clampVolume(introAudio.voiceVolume);
        if (music && introAudio.musicUrl && !audio.paused) {
          keepMusicInWindow(music, introAudio);
          music.volume = getMusicVolume(audio.currentTime, duration, introAudio);
        }
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [introAudio, playing]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = clampVolume(introAudio.voiceVolume);
    if (musicRef.current) musicRef.current.volume = clampVolume(introAudio.musicVolume);
  }, [introAudio]);

  const active = useMemo(() => {
    const index = scenes.findIndex((scene) => time >= scene.start && time < scene.end);
    return index === -1 ? scenes.length - 1 : Math.max(0, index);
  }, [scenes, time]);
  const scene = scenes[active];
  const sceneProgress = Math.max(0, Math.min(1, (time - scene.start) / Math.max(0.1, scene.end - scene.start)));

  function continueToIntake() {
    window.localStorage.setItem(INTRO_KEY, 'seen');
    audioRef.current?.pause();
    musicRef.current?.pause();
    setPlaying(false);
    window.location.assign(destination);
  }

  async function begin() {
    setStarted(true);
    await playPair();
  }

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setStarted(true);
      await playPair();
    } else {
      audio.pause();
      musicRef.current?.pause();
      setPlaying(false);
    }
  }

  async function goTo(index: number) {
    if (!audioRef.current) return;
    const sceneTime = scenes[index].start;
    audioRef.current.currentTime = sceneTime;
    syncMusicToVoice(sceneTime);
    setTime(sceneTime);
    setStarted(true);
    await playPair();
  }

  async function playPair() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = clampVolume(introAudio.voiceVolume);
    if (musicRef.current && introAudio.musicUrl) {
      syncMusicToVoice(audio.currentTime);
      musicRef.current.volume = getMusicVolume(audio.currentTime, duration, introAudio);
      void musicRef.current.play().catch(() => undefined);
    }
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  function syncMusicToVoice(voiceTime: number) {
    const music = musicRef.current;
    if (!music || !introAudio.musicUrl) return;
    const windowLength = Math.max(0, introAudio.musicEnd - introAudio.musicStart);
    if (windowLength <= 0) {
      music.currentTime = introAudio.musicStart;
      return;
    }
    const offset = introAudio.musicLoop ? voiceTime % windowLength : Math.min(voiceTime, Math.max(0, windowLength - 0.05));
    music.currentTime = introAudio.musicStart + offset;
  }

  if (!checked) return <div className="fixed inset-0 z-[2000] bg-[#061b1a]" aria-hidden="true" />;
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[2000] overflow-hidden bg-[#061b1a] text-white" role="dialog" aria-label="Welcome to E L X Studio">
      <audio ref={audioRef} src={introAudio.voiceUrl} preload="auto" onEnded={() => { setPlaying(false); setTime(duration); musicRef.current?.pause(); continueToIntake(); }} />
      {introAudio.musicUrl && <audio ref={musicRef} src={introAudio.musicUrl} preload="metadata" loop={introAudio.musicLoop} />}
      <div className="absolute inset-0 process-grid opacity-25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(221,246,92,.12),transparent_28%),linear-gradient(120deg,#061b1a_0%,#082a28_55%,#061b1a_100%)]" />

      {!started ? (
        <IntroGate onBegin={begin} onSkip={continueToIntake} />
      ) : (
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col px-5 py-5 md:px-10 md:py-7">
          <div className="flex items-center justify-between gap-5">
            <p className="text-xl font-black tracking-[-.06em]">E.L.X<span className="text-[#F06449]">.</span>Studio</p>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[.16em] text-white/50">
              <span>Welcome tour</span>
              <span className="hidden h-px w-10 bg-white/20 sm:block" />
              <span>{formatTime(time)} / {formatTime(duration)}</span>
            </div>
            <button type="button" onClick={continueToIntake} className="border-b border-white/30 pb-1 text-xs font-black">Skip to project intake</button>
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] items-center gap-3 py-3 lg:grid-cols-[.82fr_1.18fr] lg:grid-rows-none lg:gap-6 lg:py-5">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#DDF65C]">0{active + 1} / {scene.label}</p>
              <h1 key={scene.title} className="intro-copy-in mt-3 max-w-2xl text-[clamp(2.35rem,5.8vw,6.8rem)] font-black leading-[.82] tracking-[-.075em]">{scene.title}</h1>
              <p key={scene.copy} className="intro-copy-in mt-3 max-w-xl text-xs leading-5 text-white/60 md:mt-5 md:text-lg md:leading-8">{scene.copy}</p>
              <div className="mt-4 flex items-center gap-3 md:mt-7">
                <button type="button" onClick={toggle} className="min-w-14 bg-[#DDF65C] px-4 py-3 text-xs font-black text-[#102321]">{playing ? 'Pause' : 'Play'}</button>
                <div>
                  <p className="text-xs font-black">{introAudio.guideName} / Your E. L. X. Studio guide</p>
                  <p className="mt-1 text-[10px] text-white/40">Follow along, skip, or choose any chapter</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[230px] overflow-hidden self-stretch md:min-h-[320px] lg:min-h-0">
              <SynchronizedVisual scene={active} progress={sceneProgress} />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-1">
            {scenes.map((item, index) => (
              <button type="button" key={item.label} onClick={() => void goTo(index)} className="group text-left">
                <span className="mb-2 hidden text-[8px] font-black uppercase tracking-[.12em] text-white/35 md:block">{item.label}</span>
                <span className="block h-1 overflow-hidden bg-white/15">
                  <span className="block h-full bg-[#DDF65C] transition-[width] duration-100" style={{ width: index < active ? '100%' : index === active ? `${sceneProgress * 100}%` : '0%' }} />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IntroGate({ onBegin, onSkip }: { onBegin: () => void; onSkip: () => void }) {
  return (
    <div className="relative z-10 mx-auto grid h-full max-w-[1500px] items-center gap-8 px-5 md:px-10 lg:grid-cols-[1fr_.72fr]">
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#DDF65C]">Welcome to E. L. X. Studio</p>
        <h1 className="mt-5 max-w-4xl text-[clamp(3rem,8vw,9rem)] font-black leading-[.78] tracking-[-.085em]">Let us show you<br /><span className="text-[#DDF65C]">how it works.</span></h1>
        <p className="mt-6 max-w-xl text-sm leading-6 text-white/60 md:mt-7 md:text-xl md:leading-8">A short guided walkthrough that mirrors the real start-project page, file handoff and architectural plan shop. You can skip it right after the opening if you already know what you need.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onBegin} className="bg-[#DDF65C] px-7 py-4 text-sm font-black text-[#102321]">Begin with sound</button>
          <button type="button" onClick={onSkip} className="border border-white/30 px-7 py-4 text-sm font-black">Skip to project intake</button>
        </div>
        <button type="button" onClick={onSkip} className="mt-5 inline-block text-xs font-black text-white/45 underline underline-offset-4">I already know what I need →</button>
      </div>
      <div className="hidden lg:block"><GateGraphic /></div>
    </div>
  );
}

function SynchronizedVisual({ scene, progress }: { scene: number; progress: number }) {
  return <div className="absolute inset-0 grid place-items-center"><TutorialMirror scene={scene} p={progress} /></div>;
}

function VisualFrame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="relative h-full w-full max-w-[780px] overflow-hidden p-2 md:p-4">
      <div className="mb-2 flex items-center justify-between text-[8px] font-black uppercase tracking-[.18em] text-white/35">
        <span>Your project journey</span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

function TutorialMirror({ scene, p }: { scene: number; p: number }) {
  const titles = ['elxholdings.com/start', 'Select a department', 'Describe the outcome', 'Files and formats', 'Architectural plan shop', 'E.L.X Holdings'];
  return (
    <div className="relative h-full w-full max-w-[860px]">
      <div className="absolute inset-4 rotate-[-1.5deg] bg-[#DDF65C]/20 blur-2xl" />
      <div className="relative h-full overflow-hidden border border-white/15 bg-[#F5F2E8] text-[#102321] shadow-2xl">
        <div className="flex h-9 items-center justify-between border-b border-black/10 bg-white px-4 text-[9px] font-black uppercase tracking-[.12em]">
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F06449]" /><span className="h-2 w-2 rounded-full bg-[#DDF65C]" /><span className="h-2 w-2 rounded-full bg-[#073C3E]" /></div>
          <span>{titles[scene] || titles[0]}</span>
          <span>{Math.round(p * 100)}%</span>
        </div>
        <div className="relative h-[calc(100%-36px)] p-4 md:p-5">
          {scene === 0 && <StartProjectDemo p={p} />}
          {scene === 1 && <ServiceSelectDemo p={p} />}
          {scene === 2 && <BriefTypingDemo p={p} />}
          {scene === 3 && <FilesFormatsDemo p={p} />}
          {scene === 4 && <ShopDemo p={p} />}
          {scene === 5 && <HoldingsDemo p={p} />}
          <Pointer p={p} scene={scene} />
        </div>
      </div>
    </div>
  );
}

function StartProjectDemo({ p }: { p: number }) {
  return (
    <div className="grid h-full grid-cols-[.72fr_1.28fr] gap-4">
      <div className="grid content-center">
        <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#F06449]">Project intake</p>
        <h3 className="mt-2 text-5xl font-black leading-[.82] tracking-[-.07em]">Build a clear brief.</h3>
        <p className="mt-4 text-xs leading-5 text-black/55">A guided form, not a test. Clients can skip anything they are unsure about.</p>
        <button className="mt-5 w-max bg-[#102321] px-5 py-3 text-xs font-black text-white">Start project →</button>
      </div>
      <div className="grid content-center gap-2">
        {['01 Service', '02 Project brief', '03 Delivery', '04 Contact & review'].map((item, i) => <div key={item} className={`p-4 text-xs font-black ${i === 0 ? 'bg-[#DDF65C]' : 'bg-[#102321] text-white'}`} style={{ opacity: Math.max(0.35, Math.min(1, p * 2 - i * 0.12)) }}>{item}</div>)}
      </div>
    </div>
  );
}

function ServiceSelectDemo({ p }: { p: number }) {
  const cards = [
    ['Clarity', 'Writing & documentation', ['Reports', 'Proposals', 'Editing']],
    ['Reasoning', 'STEM & technical support', ['Calculations', 'Lab support', 'Data analysis']],
    ['Precision', 'CAD & technical drawing', ['AutoCAD drafting', 'Revit support', '2D to 3D']],
    ['Visualize', '3D modeling & rendering', ['Models', 'Renderings', 'Boards']],
  ];
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-3">
      <div><p className="text-[9px] font-black uppercase tracking-[.14em] text-[#F06449]">Step 01</p><h3 className="text-2xl font-black tracking-[-.04em]">What kind of support do you need?</h3></div>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map(([eyebrow, title, subs], i) => (
          <div key={title as string} className={`relative border border-black/10 p-4 ${i === 2 ? 'bg-[#DDF65C]' : 'bg-white'}`} style={{ transform: i === 2 ? `scale(${1 + p * 0.025})` : undefined }}>
            <p className="text-[9px] font-black uppercase tracking-[.14em] text-black/45">{eyebrow}</p>
            <p className="mt-2 text-lg font-black">{title}</p>
            {i === 2 && <div className="mt-3 grid gap-1">{(subs as string[]).map((sub) => <span key={sub} className="bg-[#102321] px-2 py-1 text-[10px] font-black text-white">Click: {sub}</span>)}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function BriefTypingDemo({ p }: { p: number }) {
  const typed = 'Three-bedroom floor plan revision'.slice(0, Math.floor(p * 34));
  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto] gap-4 bg-white p-5">
      <div><p className="text-[9px] font-black uppercase tracking-[.14em] text-[#F06449]">Step 02</p><h3 className="text-3xl font-black tracking-[-.05em]">Describe the outcome.</h3></div>
      <div className="grid gap-4">
        <label className="text-xs font-black">Project title<div className="mt-2 border-b border-black/25 py-3 text-lg font-bold text-black/70">{typed}<span className="animate-pulse">|</span></div></label>
        <label className="text-xs font-black">Instructions<textarea readOnly className="mt-2 h-28 w-full resize-none bg-[#F5F2E8] p-4 text-sm outline-none" value={'Need clean dimensions, revised room layout, PDF sheets and editable CAD files if possible.'} /></label>
      </div>
      <div className="flex justify-between border-t border-black/10 pt-3 text-xs font-black"><span>Optional fields can stay blank</span><button className="bg-[#102321] px-4 py-2 text-white">Continue →</button></div>
    </div>
  );
}

function FilesFormatsDemo({ p }: { p: number }) {
  const badges = [
    ['PDF', '#E53935'], ['PPTX', '#D24726'], ['Adobe', '#FF0000'], ['AutoCAD', '#C62828'], ['Power BI', '#F2C811'], ['DWG', '#073C3E'], ['XLSX', '#217346'], ['Revit', '#186BFF'],
  ];
  return (
    <div className="grid h-full grid-cols-[1fr_.85fr] gap-4">
      <div className="grid content-center">
        <p className="text-[9px] font-black uppercase tracking-[.14em] text-[#F06449]">Formats</p>
        <h3 className="text-4xl font-black leading-none tracking-[-.06em]">Send what you already have.</h3>
        <p className="mt-4 text-xs leading-5 text-black/55">Sketches, tables, dashboards, drawings and references can all become organized project material.</p>
      </div>
      <div className="grid grid-cols-2 content-center gap-2">
        {badges.map(([name, color], i) => <BrandBadge key={name} name={name} color={color} show={p > i * 0.08} />)}
      </div>
    </div>
  );
}

function BrandBadge({ name, color, show }: { name: string; color: string; show: boolean }) {
  return (
    <div className="grid h-16 grid-cols-[2.5rem_1fr] items-center gap-2 border border-black/10 bg-white px-2 text-xs font-black shadow-sm transition" style={{ opacity: show ? 1 : 0.15, transform: show ? 'translateY(0)' : 'translateY(8px)' }}>
      <span className="grid h-10 w-10 place-items-center bg-[#F5F2E8]" style={{ color }}><FormatGlyph name={name} /></span>
      <span className="leading-none">{name}</span>
    </div>
  );
}

function FormatGlyph({ name }: { name: string }) {
  if (name === 'Power BI') {
    return <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none"><rect x="6" y="16" width="4" height="10" fill="currentColor" /><rect x="14" y="9" width="4" height="17" fill="currentColor" /><rect x="22" y="5" width="4" height="21" fill="currentColor" /></svg>;
  }
  if (name === 'AutoCAD' || name === 'DWG') {
    return <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none"><path d="M16 4 27 27h-5l-2-5h-8l-2 5H5L16 4Z" stroke="currentColor" strokeWidth="2.5" /><path d="M13 17h6" stroke="currentColor" strokeWidth="2.5" /></svg>;
  }
  if (name === 'PPTX') {
    return <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none"><rect x="6" y="7" width="20" height="18" stroke="currentColor" strokeWidth="2.5" /><path d="M11 13h10M11 18h7" stroke="currentColor" strokeWidth="2.5" /></svg>;
  }
  if (name === 'XLSX') {
    return <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none"><rect x="6" y="7" width="20" height="18" stroke="currentColor" strokeWidth="2.5" /><path d="M11 12h10M11 17h10M11 22h10M16 8v17" stroke="currentColor" strokeWidth="1.8" /></svg>;
  }
  return <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none"><path d="M9 4h10l5 5v19H9V4Z" stroke="currentColor" strokeWidth="2.5" /><path d="M19 4v6h6M12 18h8M12 23h6" stroke="currentColor" strokeWidth="2" /></svg>;
}

function ShopDemo({ p }: { p: number }) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-3">
      <div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.14em] text-[#F06449]">Shop</p><h3 className="text-3xl font-black tracking-[-.05em]">Architectural plans.</h3></div><button className="bg-[#102321] px-4 py-2 text-xs font-black text-white">Home</button></div>
      <div className="grid grid-cols-[.55fr_1fr_1fr] gap-3">
        <aside className="bg-white p-3 text-[10px] font-black"><p>FILTERS</p>{['Bedrooms', 'Floors', 'Style', 'Budget'].map((item) => <div key={item} className="mt-3 border-t border-black/10 pt-2 text-black/45">{item}</div>)}</aside>
        {[['Modern Maisonette', '3 bed / 2 floors'], ['Compact Bungalow', '2 bed / 1 floor']].map(([title, meta], i) => <article key={title} className="overflow-hidden bg-white"><div className="h-28 bg-[#102321] p-3 text-[#DDF65C]"><svg viewBox="0 0 120 70" className="h-full w-full" fill="none"><path d="M10 60h100M22 60V25l38-16 38 16v35M36 60V37h18v23M66 60V34h22v26" stroke="currentColor" strokeWidth="4" /></svg></div><div className="p-3"><p className="font-black">{title}</p><p className="mt-1 text-xs text-black/45">{meta}</p><button className={`mt-3 w-full px-3 py-2 text-xs font-black ${p > 0.55 || i === 0 ? 'bg-[#DDF65C]' : 'bg-[#F5F2E8]'}`}>View plan</button></div></article>)}
      </div>
    </div>
  );
}

function HoldingsDemo({ p }: { p: number }) {
  const departments = ['Architecture', 'Electrical', 'Construction', 'Installations & fittings', 'Networking', 'Server rooms'];
  return (
    <div className="grid h-full grid-cols-[.8fr_1.2fr] gap-4">
      <div className="grid place-items-center bg-[#102321] p-5 text-white"><div className="text-center"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#DDF65C]">E.L.X Holdings</p><p className="mt-3 text-5xl font-black tracking-[-.08em]">Studio</p><p className="mt-3 text-xs text-white/50">Research, documentation and technical project support.</p></div></div>
      <div className="grid content-center gap-2">
        <p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Wider company work</p>
        {departments.map((item, i) => <div key={item} className="flex items-center justify-between bg-white p-3 text-sm font-black" style={{ opacity: Math.max(0.25, Math.min(1, p * 2 - i * 0.12)) }}><span>{item}</span><span>→</span></div>)}
      </div>
    </div>
  );
}

function Pointer({ p, scene }: { p: number; scene: number }) {
  const positions = [
    [67, 63], [66, 53], [42, 33], [70, 61], [71, 72], [58, 49],
  ];
  const [left, top] = positions[scene] || positions[0];
  return <div className="pointer-events-none absolute z-20 transition-all duration-300" style={{ left: `${left}%`, top: `${top}%`, transform: `translate(${Math.sin(p * Math.PI * 2) * 8}px, ${Math.cos(p * Math.PI * 2) * 4}px)` }}><div className="relative"><div className="absolute -inset-3 rounded-full border-2 border-[#DDF65C] opacity-70" /><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 3l18 12-8 2-4 8L4 3Z" fill="#DDF65C" stroke="#102321" strokeWidth="2" /></svg></div></div>;
}

function NetworkVisual({ p }: { p: number }) {
  const nodes: Array<[string, number, number]> = [['STEM', 18, 32], ['CAD', 80, 34], ['3D', 50, 18], ['FINANCE', 76, 72], ['BUSINESS', 24, 72], ['WRITING', 50, 82]];
  return (
    <VisualFrame label="All the support you need">
      <div className="grid h-[calc(100%-18px)] grid-cols-[.72fr_1fr] gap-3">
        <div className="grid content-center gap-2">
          {[
            ['Brief', 'goal + files'],
            ['Scope', 'price + timing'],
            ['Output', 'usable files'],
          ].map(([title, text], index) => (
            <div key={title} className="border border-white/10 bg-white/5 p-3" style={{ opacity: Math.max(0.2, Math.min(1, p * 2 - index * 0.16)) }}>
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
          <g stroke="rgba(255,255,255,.18)" strokeWidth=".55">
            {nodes.map(([name, x, y]) => <line key={name} x1="50" y1="51" x2={x} y2={y} strokeDasharray="50" strokeDashoffset={50 - p * 50} />)}
          </g>
          <circle cx="50" cy="51" r={7 + p * 1.8} fill="#DDF65C" />
          <text x="50" y="52" textAnchor="middle" dominantBaseline="middle" fill="#102321" fontSize="3.6" fontWeight="900">E.L.X</text>
          {nodes.map(([name, x, y], i) => (
            <g key={name} style={{ opacity: Math.max(0, Math.min(1, p * 2.2 - i * 0.12)), transform: `translateY(${(1 - p) * 2}px)`, transformOrigin: `${x}px ${y}px` }}>
              <rect x={x - 7} y={y - 5} width="14" height="10" fill="#0e3d3a" stroke="#DDF65C" strokeWidth=".65" />
              <text x={x} y={y + 0.4} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="2.3" fontWeight="900">{name}</text>
            </g>
          ))}
        </svg>
      </div>
    </VisualFrame>
  );
}

function CapabilitiesVisual({ p }: { p: number }) {
  const items = ['Documentation', 'STEM', 'Architecture', 'CAD', '3D rendering', 'Finance', 'Business'];
  return (
    <VisualFrame label="Choose what you need">
      <div className="grid h-[calc(100%-20px)] grid-cols-[1fr_1.2fr] gap-6">
        <div className="flex flex-col justify-center gap-2">
          {items.map((item, i) => (
            <div key={item} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.08em]" style={{ opacity: Math.max(0.18, Math.min(1, p * 2 - i * 0.12)) }}>
              <span className="w-5 text-[#DDF65C]">0{i + 1}</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="flex items-end gap-2 border-b border-l border-white/20 p-3">
          {[62, 88, 54, 96, 76, 68, 83].map((height, i) => (
            <div key={i} className="relative flex-1 bg-[#DDF65C]" style={{ height: `${height * Math.max(0, Math.min(1, p * 1.8 - i * 0.08))}%` }}>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-white">{height}</span>
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

function BriefVisual({ p }: { p: number }) {
  const fields = ['Department', 'Specific service', 'Goal or problem', 'Deadline', 'Required format'];
  return (
    <VisualFrame label="Flexible brief">
      <div className="grid h-[calc(100%-20px)] grid-cols-[1.2fr_.8fr] gap-5">
        <div className="bg-white p-5 text-[#102321]">
          <p className="text-[9px] font-black uppercase tracking-[.14em] text-[#F06449]">Project brief</p>
          <div className="mt-4 grid gap-3">
            {fields.map((field, i) => (
              <div key={field} className="border-b border-black/20 pb-2" style={{ opacity: Math.max(0.2, Math.min(1, p * 2 - i * 0.16)) }}>
                <span className="text-[8px] font-black uppercase text-black/40">{field}</span>
                <span className="ml-3 text-[10px] font-bold">{i < 2 ? 'Selected' : 'Optional'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col justify-between bg-[#DDF65C] p-5 text-[#102321]">
          <div>
            <p className="text-[9px] font-black uppercase">Only useful details</p>
            <p className="mt-3 text-2xl font-black leading-none">Skip what does not apply.</p>
          </div>
          <div className="h-2 bg-black/15"><div className="h-full bg-[#102321]" style={{ width: `${20 + p * 80}%` }} /></div>
        </div>
      </div>
    </VisualFrame>
  );
}

function QuoteVisual({ p }: { p: number }) {
  return (
    <VisualFrame label="Your clear quote">
      <div className="grid h-[calc(100%-20px)] grid-cols-[1fr_.85fr] gap-5">
        <div className="relative flex items-center justify-between">
          {['YOUR BRIEF', 'WE REVIEW', 'YOUR QUOTE'].map((item, i) => (
            <div key={item} className={`relative z-10 grid h-16 w-16 place-items-center border px-1 text-center text-[8px] font-black ${p > (i * 0.28) ? 'border-[#DDF65C] bg-[#DDF65C] text-[#102321]' : 'border-white/20 bg-[#082725]'}`}>{item}</div>
          ))}
          <div className="absolute left-8 right-8 top-1/2 h-px bg-white/20"><div className="h-full bg-[#DDF65C]" style={{ width: `${p * 100}%` }} /></div>
        </div>
        <div className="flex flex-col justify-between bg-white p-5 text-[#102321]">
          <div>
            <p className="text-[8px] font-black uppercase text-[#F06449]">What you will receive</p>
            <p className="mt-2 text-xl font-black">Clear before commitment.</p>
          </div>
          {['Final files', 'Delivery date', 'Agreed price'].map((item, i) => (
            <div key={item} className="flex justify-between border-t border-black/10 py-2 text-[9px] font-bold">
              <span>{item}</span>
              <span style={{ opacity: Math.max(0, Math.min(1, p * 2 - i * 0.2)) }}>CONFIRMED ✓</span>
            </div>
          ))}
        </div>
      </div>
    </VisualFrame>
  );
}

function WorkspaceVisual({ p }: { p: number }) {
  const cols: Array<[string, number]> = [['UPDATES', 3], ['PROGRESS', 5], ['YOUR FILES', 4]];
  return (
    <VisualFrame label="Everything in one workspace">
      <div className="grid h-[calc(100%-20px)] grid-cols-3 gap-3">
        {cols.map(([label, count], i) => (
          <div key={label} className="bg-white/5 p-3">
            <p className="text-[8px] font-black tracking-[.12em] text-[#DDF65C]">{label}</p>
            <div className="mt-4 grid gap-2">
              {Array.from({ length: count }).map((_, j) => (
                <div key={j} className="h-7 border border-white/10 bg-white/10" style={{ opacity: Math.max(0.12, Math.min(1, p * 2 - j * 0.15 - i * 0.1)), transform: `translateY(${Math.max(0, 1 - p) * 8}px)` }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute bottom-8 left-8 right-8 h-1 bg-white/15"><div className="h-full bg-[#DDF65C]" style={{ width: `${p * 100}%` }} /></div>
    </VisualFrame>
  );
}

function DeliveryVisual({ p }: { p: number }) {
  return (
    <VisualFrame label="Delivery package">
      <div className="relative grid h-[calc(100%-20px)] place-items-center">
        <div className="relative h-48 w-64">
          {['SOURCE', 'REVIEW', 'FINAL'].map((label, i) => (
            <div key={label} className="absolute left-1/2 top-1/2 grid h-36 w-52 place-items-center border border-[#102321] bg-white text-[#102321] shadow-xl transition" style={{ transform: `translate(-50%,-50%) translate(${(i - 1) * Math.max(0, p) * 52}px, ${(i - 1) * Math.max(0, p) * 14}px) rotate(${(i - 1) * Math.max(0, p) * 4}deg)`, zIndex: i }}>
              <span className="text-xs font-black">{label} FILE</span>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 44 44" className="absolute bottom-1 right-1 h-20 w-20">
          <circle cx="22" cy="22" r="18" fill="#DDF65C" />
          <path d="m13 22 6 6 13-15" fill="none" stroke="#102321" strokeWidth="3" strokeDasharray="32" strokeDashoffset={32 - p * 32} />
        </svg>
      </div>
    </VisualFrame>
  );
}

function GateGraphic() {
  return (
    <div className="relative mx-auto aspect-square max-w-[420px]">
      <div className="absolute inset-[12%] animate-[spin_28s_linear_infinite] rounded-full border border-[#DDF65C]/40" />
      <div className="absolute inset-[25%] animate-[spin_18s_linear_infinite_reverse] rounded-full border border-white/20" />
      <div className="absolute inset-[38%] grid place-items-center rounded-full bg-[#DDF65C] text-4xl font-black text-[#102321]">E.L.X</div>
      {['SUM', 'CAD', '3D', 'DATA', 'FIN', 'DOC'].map((item, i) => (
        <div key={item} className="absolute grid h-11 w-11 place-items-center border border-white/25 bg-[#082725] text-[10px] font-black" style={{ left: `${50 + 40 * Math.cos(i * Math.PI / 3)}%`, top: `${50 + 40 * Math.sin(i * Math.PI / 3)}%`, transform: 'translate(-50%,-50%)' }}>
          {item}
        </div>
      ))}
    </div>
  );
}

function keepMusicInWindow(music: HTMLAudioElement, mix: IntroAudioMixSetting) {
  if (!mix.musicUrl) return;
  const hasWindow = mix.musicEnd > mix.musicStart;
  if (music.currentTime < mix.musicStart) music.currentTime = mix.musicStart;
  if (hasWindow && music.currentTime >= mix.musicEnd) {
    if (mix.musicLoop) music.currentTime = mix.musicStart;
    else music.pause();
  }
}

function getMusicVolume(voiceTime: number, voiceDuration: number, mix: IntroAudioMixSetting) {
  let fade = 1;
  const segmentLength = mix.musicEnd > mix.musicStart ? mix.musicEnd - mix.musicStart : voiceDuration;
  const effectiveEnd = mix.musicLoop ? voiceDuration : Math.min(voiceDuration, segmentLength || voiceDuration);
  if (mix.musicFadeIn > 0) fade = Math.min(fade, Math.max(0, voiceTime / mix.musicFadeIn));
  if (mix.musicFadeOut > 0) fade = Math.min(fade, Math.max(0, (effectiveEnd - voiceTime) / mix.musicFadeOut));
  return clampVolume(mix.musicVolume) * fade;
}

function formatTime(value: number) {
  const seconds = Math.max(0, Math.floor(value));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
