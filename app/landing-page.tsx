'use client';

import { useState } from 'react';
import type { TranslationDictionary } from './google-translate';
import LanguageSwitcher, { type LanguageOption } from './language-switcher';
import type { DigitalProduct, HomepageContent } from './lib/content-types';
import WelcomePresentation from './welcome-presentation';
import { serviceCategories } from './data/services';

type Mode = 'services' | 'process' | 'shop';

export default function LandingPage({ locale, languageOptions, products }: { locale: string; dictionary?: TranslationDictionary; languageOptions: readonly LanguageOption[]; homepage: HomepageContent; products: DigitalProduct[] }) {
  const [mode, setMode] = useState<Mode>('services');
  const [selectedService, setSelectedService] = useState(0);
  const service = serviceCategories[selectedService];
  return (
    <main className="no-scroll-experience h-svh overflow-hidden bg-[#F5F2E8] text-[#102321]">
      <WelcomePresentation locale={locale} />
      <header className="h-[72px] border-b border-black/10 bg-[#F5F2E8]">
        <nav className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-5 md:px-10">
          <a href={`/?lang=${locale}`} className="text-2xl font-black tracking-[-.065em]">Elx<span className="text-[#F06449]">.</span>Studio</a>
          <div className="hidden items-center gap-1 bg-white p-1 md:flex">{(['services','process','shop'] as Mode[]).map(item=><button key={item} type="button" onClick={()=>setMode(item)} className={`px-5 py-2 text-xs font-black capitalize ${mode===item?'bg-[#102321] text-white':'hover:bg-[#F5F2E8]'}`}>{item==='process'?'How it works':item}</button>)}</div>
          <div className="flex items-center gap-3"><button type="button" onClick={()=>window.dispatchEvent(new Event('elx-replay-intro'))} className="hidden text-xs font-black underline underline-offset-4 sm:block">Replay intro</button><LanguageSwitcher locale={locale} options={languageOptions} /><a href={`/start?lang=${locale}`} className="bg-[#102321] px-4 py-3 text-xs font-black text-white">Start project</a></div>
        </nav>
      </header>

      <section className="mx-auto grid h-[calc(100svh-72px)] max-w-[1600px] grid-rows-[.78fr_1.22fr] lg:grid-cols-[.82fr_1.18fr] lg:grid-rows-none">
        <div className="flex min-h-0 flex-col justify-between px-5 py-4 md:px-10 lg:py-8">
          <div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#F06449] md:text-[10px]">Technical & professional support</p><h1 className="mt-2 max-w-2xl text-[clamp(2.45rem,6vw,7rem)] font-black leading-[.8] tracking-[-.08em] lg:mt-3">Bring the hard part.<br /><span className="text-[#F06449]">We’ll make it clear.</span></h1><p className="mt-3 max-w-xl text-xs leading-5 text-black/55 md:text-sm md:leading-6 lg:mt-5 lg:text-lg lg:leading-7">Calculations, drawings, models, reports, finance and business work—scoped clearly and delivered through one accountable studio.</p><div className="mt-3 flex gap-2 lg:mt-6"><a href={`/start?lang=${locale}`} className="bg-[#DDF65C] px-4 py-3 text-xs font-black lg:px-6 lg:py-4 lg:text-sm">Send a brief →</a><button type="button" onClick={()=>setMode('process')} className="border border-black/20 px-4 py-3 text-xs font-black lg:px-6 lg:py-4 lg:text-sm">See the process</button></div></div>
          <div className="mt-5 hidden grid-cols-3 gap-px bg-black/10 md:grid"><Stat value="7" label="departments"/><Stat value="01" label="project reference"/><Stat value="Direct" label="WhatsApp support"/></div>
        </div>

        <div className="relative min-h-0 overflow-hidden bg-[#073C3E] text-white">
          <div className="noise" />
          <div className="relative flex h-full min-h-0 flex-col p-5 md:p-8">
            <div className="flex items-center justify-between"><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#DDF65C]">Interactive studio map</p><div className="flex gap-1 md:hidden">{(['services','process','shop'] as Mode[]).map(item=><button key={item} onClick={()=>setMode(item)} className={`h-2 w-8 ${mode===item?'bg-[#DDF65C]':'bg-white/20'}`} aria-label={item}/>)}</div><span className="hidden text-[9px] font-black uppercase tracking-[.14em] text-white/35 md:block">Select anything</span></div>
            <div className="min-h-0 flex-1 py-4">{mode==='services'&&<ServicesPanel selected={selectedService} setSelected={setSelectedService} locale={locale}/>} {mode==='process'&&<ProcessPanel locale={locale}/>} {mode==='shop'&&<ShopPanel products={products}/>}</div>
            <div className="flex items-end justify-between border-t border-white/15 pt-4"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-[#DDF65C]">{mode==='services'?service.eyebrow:mode==='process'?'One brief / four moves':'Digital plan shop'}</p><p className="mt-1 max-w-lg text-sm text-white/55">{mode==='services'?service.summary:mode==='process'?'Choose, brief, approve and receive—without guessing what happens next.':'Professional architectural plans ready to purchase and adapt.'}</p></div><a href={mode==='shop'?'/shop':mode==='services'?`/services/${service.slug}`:'/services'} className="ml-5 shrink-0 border-b border-white/50 pb-1 text-xs font-black">Open →</a></div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({value,label}:{value:string;label:string}) { return <div className="bg-white p-3"><strong className="text-xl font-black">{value}</strong><span className="ml-2 text-[9px] font-bold text-black/40">{label}</span></div>; }

function ServicesPanel({selected,setSelected,locale}:{selected:number;setSelected:(n:number)=>void;locale:string}) { return <div className="grid h-full min-h-0 grid-cols-4 gap-px bg-white/15 lg:grid-cols-3">{serviceCategories.map((item,i)=><button key={item.slug} type="button" onClick={()=>setSelected(i)} onDoubleClick={()=>window.location.href=`/start?lang=${locale}&service=${item.slug}`} className={`group relative flex min-h-0 flex-col justify-between p-2 text-left transition md:p-3 lg:p-4 ${selected===i?'bg-[#DDF65C] text-[#102321]':'bg-[#0a302e] hover:bg-white hover:text-[#102321]'}`}><span className="text-[7px] font-black uppercase tracking-[.1em] opacity-50">0{i+1} / {item.eyebrow}</span><div><ServiceGlyph index={i}/><strong className="mt-1 block text-[9px] leading-3 md:text-xs md:leading-4 lg:mt-2 lg:text-base">{item.title}</strong></div><span className={`absolute bottom-2 right-2 text-[9px] ${selected===i?'opacity-100':'opacity-30'}`}>↗</span></button>)}</div>; }

function ServiceGlyph({index}:{index:number}) { const data=[38,64,48,78,58,70,52]; return <div className="mt-3 flex h-8 items-end gap-1">{[.45,.75,.55,1].map((m,i)=><span key={i} className="w-1.5 bg-current opacity-40 transition-all group-hover:opacity-80" style={{height:`${data[index]*m}%`}} />)}</div>; }

function ProcessPanel({locale}:{locale:string}) { const steps=[['01','Choose','Pick the closest service.'],['02','Brief','Share only useful details.'],['03','Approve','Confirm scope and quote.'],['04','Receive','Track and review delivery.']]; return <div className="relative flex h-full min-h-0 items-center"><div className="absolute left-[12%] right-[12%] top-1/2 h-px bg-white/25"><div className="process-line h-full bg-[#DDF65C]"/></div><div className="relative z-10 grid w-full grid-cols-4 gap-2">{steps.map(([n,t,c],i)=><div key={n} className="group text-center"><div className="mx-auto grid h-14 w-14 place-items-center border border-[#DDF65C] bg-[#073C3E] text-xs font-black transition group-hover:bg-[#DDF65C] group-hover:text-[#102321]">{n}</div><strong className="mt-3 block text-sm">{t}</strong><p className="mx-auto mt-1 hidden max-w-32 text-[9px] leading-4 text-white/45 md:block">{c}</p></div>)}</div><a href={`/start?lang=${locale}`} className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#DDF65C] px-5 py-3 text-xs font-black text-[#102321]">Begin here →</a></div>; }

function ShopPanel({products}:{products:DigitalProduct[]}) { const visible=products.slice(0,3); return <div className="grid h-full min-h-0 grid-cols-3 gap-2">{visible.length?visible.map((p,i)=><a key={p.id} href={`/shop/${p.slug}`} className="group relative overflow-hidden bg-white/10"><div className="absolute inset-0 bg-cover bg-center opacity-50 transition duration-500 group-hover:scale-105 group-hover:opacity-75" style={{backgroundImage:`url(${p.cover_url||'/images/architecture-drafting.jpg'})`}}/><div className="absolute inset-0 bg-gradient-to-t from-[#061b1a] to-transparent"/><div className="absolute bottom-0 p-4"><span className="text-[8px] font-black text-[#DDF65C]">PLAN 0{i+1}</span><strong className="mt-1 block text-sm leading-4">{p.title}</strong><span className="mt-2 block text-xs font-black">{p.currency} {p.price}</span></div></a>):<div className="col-span-3 grid place-items-center border border-white/15"><p className="text-sm text-white/50">Published plans will appear here.</p></div>}</div>; }
