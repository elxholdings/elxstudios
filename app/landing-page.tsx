'use client';

import WelcomePresentation from './welcome-presentation';

export default function LandingPage({ locale, forceIntro = false }: { locale: string; forceIntro?: boolean }) {
  return (
    <main className="no-scroll-experience relative h-svh overflow-hidden bg-[#061b1a] text-white">
      <div className="absolute inset-0 process-grid opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_35%,rgba(221,246,92,.1),transparent_30%)]" />
      <WelcomePresentation locale={locale} forceIntro={forceIntro} />
      <div className="relative z-0 grid h-full place-items-center text-center">
        <div><p className="text-2xl font-black tracking-[-.06em]">Elx<span className="text-[#F06449]">.</span>Studio</p><p className="mt-3 text-xs font-black uppercase tracking-[.18em] text-white/35">Preparing your experience</p></div>
      </div>
    </main>
  );
}
