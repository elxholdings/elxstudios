'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ServiceGlyph } from './components/client-graphics';
import { serviceCategories, type ServiceCategory } from './data/services';
import { clampVolume, defaultIntroAudioMix, normalizeIntroAudioMix, type IntroAudioMixSetting } from './lib/intro-audio-config';

const INTRO_KEY = 'elx-guided-intro-v5';
const wizardSteps = ['Service', 'Project brief', 'Delivery', 'Contact & review'];

const sceneTemplates = [
  { cut: 0, label: 'Welcome', title: 'Skip, or watch the real flow.', copy: 'Martha Wrench walks through the actual interface clients use, with the skip button always visible.' },
  { cut: 0.16, label: 'Start', title: 'Open Start Project.', copy: 'The intake has the brief on the left and the four-step form on the right. No payment is collected here.' },
  { cut: 0.25, label: 'Service', title: 'Choose the closest service.', copy: 'Hover a department to reveal exact services. Click one, double-click the department, or skip the step.' },
  { cut: 0.38, label: 'Brief', title: 'Add only useful details.', copy: 'Every brief field is optional. A short title and a few instructions are enough to start a manual quote.' },
  { cut: 0.49, label: 'Delivery', title: 'Set files and formats.', copy: 'Choose deadlines and formats only when they matter, then point us to source files by private link or WhatsApp.' },
  { cut: 0.66, label: 'Review', title: 'Send for scope review.', copy: 'WhatsApp or email lets the team return the quote. The summary confirms what the client selected.' },
  { cut: 0.76, label: 'Shop', title: 'Browse architectural plans.', copy: 'The shop uses filters, compact plan cards, details, and customization requests for house designs.' },
  { cut: 0.87, label: 'Holdings', title: 'One studio inside Elx Holdings.', copy: 'Elx Studio handles research and documentation while Elx Holdings covers wider built-environment work.' },
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
  }, [introAudio, playing, duration]);

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
      <div className="absolute inset-0 intro-energy-field opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_34%,rgba(221,246,92,.11),transparent_26%),linear-gradient(120deg,#061b1a_0%,#082a28_54%,#061b1a_100%)]" />

      {!started ? (
        <IntroGate onBegin={begin} onSkip={continueToIntake} />
      ) : (
        <div className="relative z-10 mx-auto flex h-full max-w-[1640px] flex-col px-5 py-5 md:px-10 md:py-7">
          <div className="flex items-center justify-between gap-5">
            <p className="text-xl font-black tracking-[-.06em]">Elx<span className="text-[#F06449]">.</span>Studio</p>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[.16em] text-white/50">
              <span>Real interface tour</span>
              <span className="hidden h-px w-10 bg-white/20 sm:block" />
              <span>{formatTime(time)} / {formatTime(duration)}</span>
            </div>
            <button type="button" onClick={continueToIntake} className="border-b border-white/30 pb-1 text-xs font-black">Skip to project intake</button>
          </div>

          <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] items-center gap-3 py-3 lg:grid-cols-[.78fr_1.22fr] lg:grid-rows-none lg:gap-6 lg:py-5">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#DDF65C]">0{active + 1} / {scene.label}</p>
              <h1 key={scene.title} className="intro-copy-in mt-3 max-w-2xl text-[clamp(2.25rem,5.3vw,6.3rem)] font-black leading-[.84] tracking-[-.075em]">{scene.title}</h1>
              <p key={scene.copy} className="intro-copy-in mt-3 max-w-xl text-xs leading-5 text-white/60 md:mt-5 md:text-lg md:leading-8">{scene.copy}</p>
              <div className="mt-4 flex items-center gap-3 md:mt-7">
                <button type="button" onClick={toggle} className="min-w-14 bg-[#DDF65C] px-4 py-3 text-xs font-black text-[#102321]">{playing ? 'Pause' : 'Play'}</button>
                <div>
                  <p className="text-xs font-black">{introAudio.guideName} / Your Elx Studio guide</p>
                  <p className="mt-1 text-[10px] text-white/40">Follow along, skip, or choose a chapter</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[260px] overflow-hidden self-stretch md:min-h-[350px] lg:min-h-0">
              <SynchronizedVisual scene={active} progress={sceneProgress} />
            </div>
          </div>

          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${scenes.length}, minmax(0, 1fr))` }}>
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
    <div className="relative z-10 mx-auto grid h-full max-w-[1500px] items-center gap-8 px-5 md:px-10 lg:grid-cols-[1fr_.78fr]">
      <div>
        <p className="text-xs font-black uppercase tracking-[.2em] text-[#DDF65C]">Welcome to Elx Studio</p>
        <h1 className="mt-5 max-w-4xl text-[clamp(3rem,8vw,9rem)] font-black leading-[.78] tracking-[-.085em]">Watch the real<br /><span className="text-[#DDF65C]">order flow.</span></h1>
        <p className="mt-6 max-w-xl text-sm leading-6 text-white/60 md:mt-7 md:text-xl md:leading-8">Martha Wrench gives a short walkthrough of the actual Start Project page, the optional fields, the file handoff, and the architectural plan shop.</p>
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

function TutorialMirror({ scene, p }: { scene: number; p: number }) {
  const titles = ['elxholdings.com/start', 'Start project intake', 'Select a department', 'Describe the outcome', 'Delivery requirements', 'Contact and review', 'Architectural plan shop', 'Elx Holdings'];
  return (
    <div className="relative h-full w-full max-w-[940px]">
      <div className="absolute inset-4 rotate-[-1.2deg] bg-[#DDF65C]/20 blur-2xl" />
      <div className="relative h-full overflow-hidden border border-white/15 bg-[#F5F2E8] text-[#102321] shadow-2xl">
        <div className="flex h-9 items-center justify-between border-b border-black/10 bg-white px-4 text-[9px] font-black uppercase tracking-[.12em]">
          <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#F06449]" /><span className="h-2 w-2 rounded-full bg-[#DDF65C]" /><span className="h-2 w-2 rounded-full bg-[#073C3E]" /></div>
          <span>{titles[scene] || titles[0]}</span>
          <span>{Math.round(p * 100)}%</span>
        </div>
        <div className="relative h-[calc(100%-36px)] overflow-hidden">
          <KineticBackdrop scene={scene} p={p} />
          <div className="relative z-10 h-full">
            {scene === 0 && <StartProjectPageDemo p={p} step={0} intro />}
            {scene === 1 && <StartProjectPageDemo p={p} step={0} focused />}
            {scene === 2 && <StartProjectPageDemo p={p} step={0} serviceFocus />}
            {scene === 3 && <StartProjectPageDemo p={p} step={1} />}
            {scene === 4 && <StartProjectPageDemo p={p} step={2} />}
            {scene === 5 && <StartProjectPageDemo p={p} step={3} />}
            {scene === 6 && <ShopDemo p={p} />}
            {scene === 7 && <HoldingsDemo p={p} />}
          </div>
          <SceneSignal scene={scene} p={p} />
          <Pointer p={p} scene={scene} />
        </div>
      </div>
    </div>
  );
}

function StartProjectPageDemo({ p, step, intro = false, focused = false, serviceFocus = false }: { p: number; step: number; intro?: boolean; focused?: boolean; serviceFocus?: boolean }) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr] overflow-hidden bg-[#F8F7F2]">
      <MiniSiteHeader active="Start project" />
      <div className="grid min-h-0 grid-cols-[.5fr_1fr] gap-4 p-4">
        <IntakeSidebar p={p} focused={focused || intro} />
        <WizardPanel step={step} p={p}>
          {step === 0 && <ServiceStepDemo p={p} serviceFocus={serviceFocus || focused || intro} />}
          {step === 1 && <BriefStepDemo p={p} />}
          {step === 2 && <DeliveryStepDemo p={p} />}
          {step === 3 && <ReviewStepDemo p={p} />}
        </WizardPanel>
      </div>
    </div>
  );
}

function MiniSiteHeader({ active = '' }: { active?: string }) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-black/10 bg-[#F5F2E8] px-4 text-[10px] font-black">
      <span className="text-xl tracking-[-.06em]">Elx<span className="text-[#F06449]">.</span>Studio</span>
      <span className="hidden items-center gap-5 text-black/60 md:flex">
        {['Services', 'Pricing', 'Shop', 'About'].map((item) => <span key={item} className={active === item ? 'text-[#F06449]' : ''}>{item}</span>)}
      </span>
      <span className="bg-[#102321] px-4 py-2 text-white">{active || 'Start project'}</span>
    </div>
  );
}

function IntakeSidebar({ p, focused }: { p: number; focused: boolean }) {
  return (
    <div className="grid content-start pt-2">
      <p className="text-[8px] font-black uppercase tracking-[.16em] text-[#F06449]">Project intake</p>
      <h3 className="mt-2 text-[clamp(2rem,4.8vw,4.4rem)] font-black leading-[.84] tracking-[-.075em]">Build a clear brief.</h3>
      <p className="mt-3 max-w-[18rem] text-[11px] leading-5 text-black/55">Start with the details you have. Your quote confirms deliverables, timing and price before paid work begins.</p>
      <div className="mt-4 max-w-[18rem] border-t border-black/15 pt-3 text-[10px] leading-5 text-black/50">No payment is collected here.<br />Files can be shared by private link or WhatsApp.<br />Academic-use confirmation is required.</div>
      <div className="mt-4 grid max-w-[15rem] grid-cols-3 gap-px bg-black/10 text-center text-[8px] font-black uppercase tracking-[.1em] text-black/45">
        {['Scope', 'Files', 'Quote'].map((item, i) => <span key={item} className="bg-white p-2" style={{ opacity: Math.max(0.35, Math.min(1, p * 2 - i * 0.12)) }}>{item}</span>)}
      </div>
      <button className={`mt-4 w-max px-4 py-3 text-[10px] font-black ${focused ? 'bg-[#DDF65C] text-[#102321]' : 'bg-[#102321] text-white'}`}>Start project →</button>
    </div>
  );
}

function WizardPanel({ step, p, children }: { step: number; p: number; children: ReactNode }) {
  return (
    <div className="grid min-h-0 grid-rows-[auto_auto_1fr] overflow-hidden bg-white shadow-sm">
      <div className="bg-[#DDF65C] px-4 py-2 text-[10px] font-bold">Want this project saved online? <span className="underline">Sign in</span> or <span className="underline">create an account</span> before submitting.</div>
      <div className="grid grid-cols-4 bg-[#102321] text-white">
        {wizardSteps.map((label, index) => (
          <div key={label} className={`min-h-12 px-3 py-2 text-left text-[9px] font-black uppercase tracking-[.1em] ${index === step ? 'bg-[#DDF65C] text-[#102321]' : index < step ? 'text-white' : 'text-white/35'}`} style={{ opacity: Math.max(0.5, Math.min(1, p * 1.7 - index * 0.06)) }}>
            <span className="block text-[8px] opacity-55">0{index + 1}</span>{label}
          </div>
        ))}
      </div>
      <div className="min-h-0 overflow-hidden p-4">{children}</div>
    </div>
  );
}

function StepMiniTitle({ number, title, text }: { number: string; title: string; text: string }) {
  return <div><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#F06449]">Step {number}</p><h3 className="mt-1 text-[clamp(1.35rem,2.5vw,2.35rem)] font-black leading-none tracking-[-.05em]">{title}</h3><p className="mt-2 max-w-2xl text-[11px] leading-5 text-black/55">{text}</p></div>;
}

function ServiceStepDemo({ p, serviceFocus }: { p: number; serviceFocus: boolean }) {
  const activeIndex = serviceFocus ? 2 : Math.min(6, Math.floor(p * 7));
  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto]">
      <StepMiniTitle number="01" title="What kind of support do you need?" text="Hover over a department to see the exact services. Choose the closest match now, or skip if you want us to classify the project from your brief." />
      <div className="mt-3 grid min-h-0 gap-2 sm:grid-cols-2">
        {serviceCategories.map((service, index) => <ServiceMiniCard key={service.slug} service={service} active={index === activeIndex} p={p} index={index} />)}
      </div>
      <WizardFooter primary={serviceFocus ? 'Continue →' : 'Skip for now →'} muted="Selected: Architecture & design / Floor plans" />
    </div>
  );
}

function ServiceMiniCard({ service, active, p, index }: { service: ServiceCategory; active: boolean; p: number; index: number }) {
  return (
    <div className={`relative min-h-[4.2rem] overflow-hidden ${active ? 'bg-[#DDF65C]' : 'bg-[#F5F2E8]'}`} style={{ opacity: Math.max(0.4, Math.min(1, p * 2.2 - index * 0.08)) }}>
      <div className="flex items-start gap-2 px-3 py-2">
        <ServiceGlyph slug={service.slug} className="h-7 w-7 shrink-0" />
        <div className="min-w-0">
          <p className="text-[8px] font-black uppercase tracking-[.11em] text-black/45">{service.eyebrow}</p>
          <p className="mt-0.5 truncate text-[13px] font-black">{service.title}</p>
          <p className="mt-0.5 hidden truncate text-[9px] leading-4 text-black/45 xl:block">{service.summary}</p>
        </div>
        <span className="ml-auto text-xs font-black">+</span>
      </div>
      {active && (
        <div className="grid grid-cols-2 gap-px bg-[#102321] p-px text-[9px] font-bold leading-3">
          {service.subservices.slice(0, 4).map((item, i) => <span key={item} className={`${i === 0 ? 'bg-[#DDF65C]' : 'bg-white'} px-2 py-1.5`}>{item}</span>)}
        </div>
      )}
    </div>
  );
}

function BriefStepDemo({ p }: { p: number }) {
  const typed = 'Three-bedroom floor plan revision'.slice(0, Math.floor(p * 34));
  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto]">
      <StepMiniTitle number="02" title="Describe the outcome." text="Add only what is useful. Every field on this step is optional; more context simply helps us quote more accurately." />
      <div className="mt-4 grid min-h-0 gap-3">
        <MiniField label="Project title (optional)"><div className="border-b border-black/25 py-2 text-[15px] font-bold text-black/70">{typed}<span className="animate-pulse">|</span></div></MiniField>
        <MiniField label="Purpose"><div className="grid grid-cols-2 gap-2">{['Professional', 'Academic support'].map((purpose, i) => <span key={purpose} className={`p-3 text-xs font-black ${i === 0 ? 'bg-[#DDF65C]' : 'bg-[#F5F2E8]'}`}>{purpose}</span>)}</div></MiniField>
        <MiniField label="Instructions (optional)"><div className="h-20 bg-[#F5F2E8] p-3 text-[11px] leading-5 text-black/50">Goal, dimensions, source material, software, references, standards and what a successful final file should contain...</div></MiniField>
      </div>
      <WizardFooter primary="Continue →" muted="Optional fields can stay blank" />
    </div>
  );
}

function DeliveryStepDemo({ p }: { p: number }) {
  const formats = ['PDF', 'DWG', 'PPTX', 'XLSX', 'Revit', 'Power BI'];
  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto]">
      <StepMiniTitle number="03" title="Set the delivery requirements." text="Everything here is optional. Add what matters to your project and leave the rest for our scope conversation." />
      <div className="mt-4 grid min-h-0 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <MiniField label="Deadline"><div className="bg-[#F5F2E8] px-3 py-3 text-[11px] text-black/45">Only if time matters</div></MiniField>
          <MiniField label="Primary output format"><div className="bg-[#F5F2E8] px-3 py-3 text-[11px] font-bold">{formats[Math.min(formats.length - 1, Math.floor(p * formats.length))]}</div></MiniField>
        </div>
        <MiniField label="Optional add-ons"><div className="grid grid-cols-2 gap-2">{['Editable source files', 'Priority scheduling', 'Presentation-ready formatting', 'Additional revision round'].map((item, i) => <span key={item} className="bg-[#F5F2E8] px-3 py-2 text-[10px] font-bold" style={{ opacity: Math.max(0.25, Math.min(1, p * 2 - i * 0.18)) }}>□ {item}</span>)}</div></MiniField>
        <MiniField label="Supporting file link (optional)"><div className="grid grid-cols-[1fr_auto] items-center bg-[#F5F2E8] px-3 py-2"><span className="truncate text-[11px] text-black/45">Drive, Dropbox, OneDrive or WeTransfer link</span><span className="text-[10px] font-black text-[#F06449]">{Math.round(p * 8)} files</span></div></MiniField>
        <div className="grid grid-cols-6 gap-1">
          {formats.map((item, i) => <FormatPill key={item} name={item} active={p > i * 0.11} />)}
        </div>
      </div>
      <WizardFooter primary="Continue →" muted="Files can be sent later by link or WhatsApp" />
    </div>
  );
}

function ReviewStepDemo({ p }: { p: number }) {
  return (
    <div className="grid h-full grid-rows-[auto_1fr_auto]">
      <StepMiniTitle number="04" title="Review and send the brief." text="Use either WhatsApp or email so we can return the quote. The other project fields may remain blank." />
      <div className="mt-4 grid min-h-0 gap-3">
        <div className="grid grid-cols-2 gap-3">
          <MiniField label="Full name (optional)"><div className="border-b border-black/20 py-2 text-[12px] text-black/35">Optional</div></MiniField>
          <MiniField label="WhatsApp number"><div className="border-b border-black/20 py-2 text-[12px] font-bold">0110008034</div></MiniField>
        </div>
        <MiniField label="Email"><div className="border-b border-black/20 py-2 text-[12px] text-black/45">Required only when WhatsApp is blank</div></MiniField>
        <div className="bg-[#F5F2E8] p-4 text-xs leading-5"><p className="font-black">Brief summary</p><p className="mt-1 text-black/60">Architecture & design / Floor plans<br />Three-bedroom floor plan revision<br />Due Flexible / PDF + DWG</p></div>
        <div className="bg-[#FFF4E8] p-3 text-[10px] leading-4 text-black/60"><span className="font-black">{p > 0.45 ? '☑' : '□'}</span> I confirm responsible use and accept the Academic Integrity Policy.</div>
      </div>
      <WizardFooter primary="Submit for manual quote →" muted="Manual quote before paid work begins" />
    </div>
  );
}

function MiniField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-black">{label}</span>{children}</label>;
}

function WizardFooter({ primary, muted }: { primary: string; muted: string }) {
  return (
    <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-3 text-xs font-black">
      <span className="text-black/35">← Back</span>
      <span className="hidden text-[10px] text-black/35 sm:block">{muted}</span>
      <span className="bg-[#102321] px-4 py-2 text-white">{primary}</span>
    </div>
  );
}

function FormatPill({ name, active }: { name: string; active: boolean }) {
  return <span className={`grid min-h-10 place-items-center text-[9px] font-black transition ${active ? 'bg-[#DDF65C] text-[#102321]' : 'bg-[#F5F2E8] text-black/35'}`}>{name}</span>;
}

function ShopDemo({ p }: { p: number }) {
  const products = [
    ['ELX-PLN-001', 'Modern Maisonette', '$65', '3', '2', '184'],
    ['ELX-PLN-014', 'Compact Bungalow', '$42', '2', '1', '96'],
    ['ELX-PLN-022', 'Courtyard House', '$88', '4', '2', '238'],
    ['ELX-PLN-031', 'Narrow Plot Plan', '$55', '3', '1', '121'],
  ];
  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr] overflow-hidden bg-[#F8F7F2]">
      <MiniSiteHeader active="Shop" />
      <div className="grid grid-cols-[.86fr_1.14fr] items-end gap-3 bg-[#073C3E] px-4 py-4 text-white">
        <div><p className="text-[8px] font-black uppercase tracking-[.16em] text-[#DDF65C]">Elx Studio / House plans</p><h3 className="mt-1 text-4xl font-black leading-none tracking-[-.06em]">Architectural plan shop.</h3></div>
        <p className="text-[11px] leading-5 text-white/60">Compare bedrooms, floors, area and file packages. Open a plan, then request customization before use.</p>
      </div>
      <div className="grid min-h-0 grid-rows-[auto_auto_1fr]">
        <div className="grid grid-cols-[auto_1fr_repeat(4,.7fr)_auto] gap-1 border-b border-black/10 bg-[#F8F7F2]/95 px-4 py-2 text-[9px] font-black">
          <span className="grid h-8 place-items-center bg-[#102321] px-3 text-white">Home</span>
          {['Search', 'Beds', 'Floors', 'Type', 'Sort'].map((item, i) => <span key={item} className="bg-white px-2 py-1.5" style={{ opacity: Math.max(0.45, Math.min(1, p * 2 - i * 0.09)) }}><small className="block text-[7px] uppercase text-black/35">{item}</small>{i === 0 ? 'Style, bedroom...' : i === 1 ? 'Any' : i === 2 ? 'Two' : i === 3 ? 'All' : 'Featured'}</span>)}
          <span className="grid place-items-center border border-black/15 px-2">24 plans</span>
        </div>
        <div className="flex justify-between px-4 py-2 text-[8px] font-black uppercase tracking-[.14em] text-black/40"><span>Product slide 01 / 03</span><span>8 shown here</span></div>
        <div className="grid min-h-0 grid-cols-4 gap-2 px-4 pb-4">
          {products.map((product, i) => <PlanCard key={product[0]} product={product} p={p} index={i} />)}
        </div>
      </div>
    </div>
  );
}

function PlanCard({ product, p, index }: { product: string[]; p: number; index: number }) {
  const [sku, title, price, beds, floors, sqm] = product;
  return (
    <article className="overflow-hidden border border-black/10 bg-white" style={{ transform: `translateY(${Math.sin((p + index * 0.13) * Math.PI) * -4}px)`, opacity: Math.max(0.35, Math.min(1, p * 2 - index * 0.12)) }}>
      <div className="relative h-20 bg-[#102321] p-2 text-[#DDF65C]">
        <svg viewBox="0 0 120 70" className="h-full w-full" fill="none" aria-hidden="true"><path d="M10 60h100M22 60V25l38-16 38 16v35M36 60V37h18v23M66 60V34h22v26" stroke="currentColor" strokeWidth="4" strokeDasharray="230" strokeDashoffset={230 - p * 230} /></svg>
        <span className="absolute left-2 top-2 bg-[#DDF65C] px-1.5 py-1 text-[7px] font-black text-[#102321]">{index === 0 ? 'Best' : 'Digital'}</span>
      </div>
      <div className="p-2">
        <p className="truncate text-[7px] font-black uppercase tracking-[.1em] text-[#F06449]">{sku}</p>
        <p className="mt-1 line-clamp-2 text-sm font-black leading-none">{title}</p>
        <div className="mt-2 grid grid-cols-3 border-y border-black/10 py-1 text-center text-[8px]"><span><b>{beds}</b><br />Beds</span><span><b>{floors}</b><br />Floors</span><span><b>{sqm}</b><br />sqm</span></div>
        <div className="mt-2 flex justify-between text-[9px]"><strong>{price}</strong><span className="font-black underline decoration-[#DDF65C] decoration-4 underline-offset-2">Open</span></div>
      </div>
    </article>
  );
}

function HoldingsDemo({ p }: { p: number }) {
  const departments = ['Architecture', 'Electrical', 'Construction', 'Installations & fittings', 'Networking', 'Server rooms'];
  return (
    <div className="grid h-full grid-cols-[.8fr_1.2fr] gap-4 bg-[#F8F7F2] p-5">
      <div className="grid place-items-center bg-[#102321] p-5 text-white"><div className="text-center"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#DDF65C]">Elx Holdings</p><p className="mt-3 text-5xl font-black tracking-[-.08em]">Studio</p><p className="mt-3 text-xs text-white/50">Research, documentation and technical project support.</p></div></div>
      <div className="grid content-center gap-2">
        <p className="text-xs font-black uppercase tracking-[.14em] text-[#F06449]">Wider company work</p>
        {departments.map((item, i) => <div key={item} className="flex items-center justify-between bg-white p-3 text-sm font-black" style={{ opacity: Math.max(0.25, Math.min(1, p * 2 - i * 0.12)), transform: `translateX(${Math.max(0, 1 - p) * (i % 2 ? 12 : -12)}px)` }}><span>{item}</span><span>→</span></div>)}
      </div>
    </div>
  );
}

function KineticBackdrop({ scene, p }: { scene: number; p: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 opacity-55">
      <div className="absolute -right-14 top-5 h-36 w-36 rounded-full bg-[#DDF65C]/15 blur-3xl" style={{ transform: `scale(${0.7 + p * 0.3}) translateX(${Math.sin(p * Math.PI * 2) * 12}px)` }} />
      <div className="absolute -left-10 bottom-0 h-28 w-28 rounded-full bg-[#F06449]/10 blur-2xl" />
      {[18, 43, 68].map((top, index) => <span key={top} className="absolute left-0 h-px bg-[#102321]/10" style={{ top: `${top}%`, width: `${36 + ((scene + index) % 3) * 18}%`, transform: `translateX(${(p * 90 + index * 18) % 64}px)` }} />)}
    </div>
  );
}

function SceneSignal({ scene, p }: { scene: number; p: number }) {
  const signals = ['intro', 'start', 'hover', 'type', 'files', 'review', 'shop', 'deliver'];
  return (
    <div className="pointer-events-none absolute bottom-3 left-4 right-4 z-10 flex items-center gap-2">
      <span className="h-1.5 flex-1 overflow-hidden bg-[#102321]/10"><span className="block h-full bg-[#DDF65C]" style={{ width: `${Math.max(12, p * 100)}%` }} /></span>
      <span className="bg-[#102321] px-2 py-1 text-[8px] font-black uppercase tracking-[.12em] text-[#DDF65C]">{signals[scene]}</span>
    </div>
  );
}

function Pointer({ p, scene }: { p: number; scene: number }) {
  const positions = [
    [76, 88], [29, 63], [70, 36], [47, 37], [66, 57], [76, 82], [78, 76], [62, 48],
  ];
  const [left, top] = positions[scene] || positions[0];
  return <div className="pointer-events-none absolute z-20 transition-all duration-300" style={{ left: `${left}%`, top: `${top}%`, transform: `translate(${Math.sin(p * Math.PI * 2) * 7}px, ${Math.cos(p * Math.PI * 2) * 4}px)` }}><div className="relative"><div className="absolute -inset-3 rounded-full border-2 border-[#DDF65C] opacity-70" /><svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 3l18 12-8 2-4 8L4 3Z" fill="#DDF65C" stroke="#102321" strokeWidth="2" /></svg></div></div>;
}

function GateGraphic() {
  return (
    <div className="relative mx-auto aspect-square max-w-[420px]">
      <div className="absolute inset-[10%] animate-[spin_24s_linear_infinite] border border-[#DDF65C]/35" />
      <div className="absolute inset-[22%] animate-[spin_16s_linear_infinite_reverse] border border-white/20" />
      <div className="absolute inset-[35%] grid place-items-center bg-[#DDF65C] text-4xl font-black text-[#102321]">Elx</div>
      {['START', 'CAD', 'PDF', 'SHOP', 'QUOTE', 'FILES'].map((item, i) => (
        <div key={item} className="absolute grid h-12 w-16 place-items-center border border-white/25 bg-[#082725] text-[9px] font-black" style={{ left: `${50 + 40 * Math.cos(i * Math.PI / 3)}%`, top: `${50 + 40 * Math.sin(i * Math.PI / 3)}%`, transform: 'translate(-50%,-50%)' }}>
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
