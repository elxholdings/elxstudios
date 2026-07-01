import Link from 'next/link';
import type { ReactNode } from 'react';
import LanguageSwitcher from '../language-switcher';
import { languageOptions } from '../language-options';
import AuthNav from './auth-nav';

const navItems = [
  ['Services', '/services'],
  ['Pricing', '/pricing'],
  ['Shop', '/shop'],
  ['About', '/about'],
] as const;

export function SiteHeader({ locale = 'en' }: { locale?: string }) {
  const withLocale = (href: string) => `${href}?lang=${encodeURIComponent(locale)}`;

  return (
    <header className="sticky top-0 z-50 bg-[#F5F2E8] text-[#102321]">
      <div className="bg-[#102321] px-5 py-2 text-center text-[11px] font-bold uppercase tracking-[.18em] text-white/70">
        Elx Holdings / Elx Studio
      </div>
      <nav className="mx-auto flex min-h-20 max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-10">
        <Link href={withLocale('/')} className="text-2xl font-black tracking-[-0.06em]">Elx<span className="text-[#F06449]">.</span>Studio</Link>
        <div className="order-3 flex w-full items-center justify-between gap-5 overflow-x-auto text-sm font-semibold md:order-none md:w-auto md:justify-start">
          {navItems.map(([label, href]) => <Link key={href} href={withLocale(href)} className="whitespace-nowrap transition hover:opacity-55">{label}</Link>)}
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} options={languageOptions} />
          <AuthNav locale={locale} />
          <Link href={withLocale('/start')} className="bg-[#102321] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#F06449]">Start project</Link>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter({ locale = 'en' }: { locale?: string }) {
  const withLocale = (href: string) => `${href}?lang=${encodeURIComponent(locale)}`;
  return (
    <footer className="bg-[#102321] px-5 py-8 text-white md:px-10">
      <div className="mx-auto grid max-w-[1440px] gap-7 md:grid-cols-[1.35fr_.8fr_1.2fr] md:items-start">
        <div>
          <p className="text-2xl font-black tracking-[-0.06em]">Elx<span className="text-[#F06449]">.</span>Studio</p>
          <p className="mt-2 max-w-md text-xs leading-5 text-white/50">Professional and technical project support. One brief, a clear scope and accountable delivery.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 text-xs text-white/60 md:grid-cols-1 md:gap-2">
          <p className="col-span-full mb-1 text-[9px] font-black uppercase tracking-[.14em] text-white">Explore</p>
          <Link href={withLocale('/services')}>Services</Link>
          <Link href={withLocale('/pricing')}>Pricing</Link>
          <Link href={withLocale('/contact')}>Contact</Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-xs text-white/60 md:grid-cols-3">
          <p className="col-span-full mb-1 text-[9px] font-black uppercase tracking-[.14em] text-white">Policies</p>
          <Link href={withLocale('/terms')}>Terms</Link>
          <Link href={withLocale('/privacy')}>Privacy</Link>
          <Link href={withLocale('/academic-integrity')}>Academic integrity</Link>
          <Link href={withLocale('/refund-policy')}>Refund policy</Link>
          <Link href={withLocale('/revision-policy')}>Revision policy</Link>
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-[1440px] border-t border-white/10 pt-4 text-[10px] text-white/35">© {new Date().getFullYear()} Elx Holdings. All rights reserved.</div>
    </footer>
  );
}

export function SiteShell({ locale = 'en', children, showFooter = true, showHeader = true }: { locale?: string; children: ReactNode; showFooter?: boolean; showHeader?: boolean }) {
  return (
    <div className="site-shell min-h-screen bg-[#F5F2E8] text-[#102321]">
      {showHeader && <SiteHeader locale={locale} />}
      {children}
      {showFooter && <SiteFooter locale={locale} />}
    </div>
  );
}

export function PageIntro({ eyebrow, title, intro }: { eyebrow: string; title: string; intro: string }) {
  return (
    <section className="bg-[#073C3E] px-5 py-20 text-white md:px-10 md:py-28">
      <div className="mx-auto max-w-[1440px]">
        <p className="text-sm font-black uppercase tracking-[.18em] text-[#DDF65C]">{eyebrow}</p>
        <h1 className="mt-6 max-w-5xl text-6xl font-black leading-[.86] tracking-[-0.075em] md:text-8xl">{title}</h1>
        <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65 md:text-xl">{intro}</p>
      </div>
    </section>
  );
}
