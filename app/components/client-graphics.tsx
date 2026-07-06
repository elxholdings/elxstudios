import type { ReactNode } from 'react';

const serviceLabels: Record<string, string> = {
  'writing-documentation': 'DOC',
  'stem-technical': 'STEM',
  'architecture-design': 'PLAN',
  'cad-drafting': 'CAD',
  '3d-modeling-rendering': '3D',
  'finance-accounting': 'FIN',
  'business-professional': 'BIZ',
};

export function ServiceGlyph({ slug, className = '' }: { slug: string; className?: string }) {
  const label = serviceLabels[slug] || 'ELX';
  return (
    <span className={`grid place-items-center bg-[#DDF65C] text-[#102321] ${className}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" className="h-[74%] w-[74%]" fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2.4">
        {slug === 'writing-documentation' && (
          <>
            <path d="M14 8h15l7 7v25H14z" />
            <path d="M29 8v8h7M19 24h14M19 30h14M19 36h9" />
          </>
        )}
        {slug === 'stem-technical' && (
          <>
            <path d="M10 36h28M14 34V14M14 30c7-18 13 16 20-8" />
            <path d="M23 12h10M28 7v10" />
          </>
        )}
        {slug === 'architecture-design' && (
          <>
            <path d="M8 38h32M12 32 24 10l12 22zM19 32l5-9 5 9" />
            <path d="M18 38v-6h12v6" />
          </>
        )}
        {slug === 'cad-drafting' && (
          <>
            <path d="M10 38h28M15 34l9-24 9 24M18 25h12" />
            <path d="M24 10l4 7M24 10l-4 7" />
          </>
        )}
        {slug === '3d-modeling-rendering' && (
          <>
            <path d="m24 7 14 8v18l-14 8-14-8V15z" />
            <path d="m10 15 14 8 14-8M24 23v18" />
          </>
        )}
        {slug === 'finance-accounting' && (
          <>
            <path d="M10 37h30M14 32V20M23 32V13M32 32v-8" />
            <path d="m13 16 9-6 8 8 8-11" />
          </>
        )}
        {slug === 'business-professional' && (
          <>
            <path d="M10 12h28v19H10zM18 39h12M24 31v8" />
            <path d="M16 25h6M16 20h16M16 16h10" />
          </>
        )}
        {!serviceLabels[slug] && <text x="24" y="28" textAnchor="middle" className="fill-current text-[12px] font-black">{label}</text>}
      </svg>
    </span>
  );
}

export function MiniChart({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 86" className={className} fill="none" aria-hidden="true">
      <path d="M10 76h120M10 12v64" stroke="currentColor" strokeOpacity=".22" strokeWidth="2" />
      {[24, 46, 68, 90, 112].map((x) => <path key={x} d={`M${x} 76V12`} stroke="currentColor" strokeOpacity=".08" />)}
      <path d="M14 61c14-20 22-5 35-18s22-4 34-18 25-8 43-17" stroke="#DDF65C" strokeWidth="4" strokeLinecap="square" />
      <path d="M18 68h16V48H18zM45 68h16V35H45zM72 68h16V43H72zM99 68h16V24H99z" fill="currentColor" fillOpacity=".16" />
    </svg>
  );
}

export function PlanSketch({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 104" className={className} fill="none" aria-hidden="true">
      <path d="M14 14h132v76H14z" stroke="currentColor" strokeOpacity=".2" strokeWidth="2" />
      <path d="M36 14v76M88 14v76M36 48h110M88 66H36" stroke="currentColor" strokeWidth="2" />
      <path d="M52 31h19M105 31h24M51 79h18M106 79h20" stroke="#DDF65C" strokeWidth="3" />
      <path d="M14 96h132" stroke="currentColor" strokeOpacity=".18" />
      <path d="M22 98h18M118 98h18" stroke="#F06449" strokeWidth="2" />
    </svg>
  );
}

export function FileStack({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 132 90" className={className} fill="none" aria-hidden="true">
      <path d="M25 17h72l10 10v44H25z" fill="white" fillOpacity=".1" stroke="currentColor" strokeOpacity=".28" strokeWidth="2" />
      <path d="M34 9h72l10 10v44H34z" fill="white" fillOpacity=".12" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" />
      <path d="M43 27h42M43 39h58M43 51h35" stroke="#DDF65C" strokeWidth="3" />
      <path d="m95 9v19h21" stroke="currentColor" strokeOpacity=".35" strokeWidth="2" />
    </svg>
  );
}

function MiniCard({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <article className="min-h-0 border border-black/10 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-black tracking-[-.02em]">{title}</h3>
          <p className="mt-2 text-xs leading-5 text-black/50">{text}</p>
        </div>
        <div className="h-10 w-10 shrink-0 text-[#102321]">{children}</div>
      </div>
    </article>
  );
}

export function ClientProofStrip({ className = '' }: { className?: string }) {
  return (
    <div className={`grid gap-2 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>
      <MiniCard title="Defined scope" text="You see the deliverables, assumptions and timing before committing.">
        <FileStack className="h-full w-full" />
      </MiniCard>
      <MiniCard title="Technical clarity" text="Calculations, CAD layers, data and references are organized for review.">
        <MiniChart className="h-full w-full" />
      </MiniCard>
      <MiniCard title="Visual proof" text="Plans, renders, diagrams and presentations are shaped for real use.">
        <PlanSketch className="h-full w-full" />
      </MiniCard>
      <MiniCard title="Delivery control" text="Your reference keeps messages, revisions and final files connected.">
        <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square">
          <path d="M10 14h28v22H10z" />
          <path d="m17 25 5 5 11-13" stroke="#DDF65C" />
          <path d="M38 20h4v22H16v-6" strokeOpacity=".35" />
        </svg>
      </MiniCard>
    </div>
  );
}

export function ExpertiseBoard({ className = '' }: { className?: string }) {
  const departments = [
    ['writing-documentation', 'Documentation'],
    ['stem-technical', 'STEM'],
    ['architecture-design', 'Architecture'],
    ['cad-drafting', 'CAD'],
    ['3d-modeling-rendering', '3D'],
    ['finance-accounting', 'Finance'],
    ['business-professional', 'Business'],
  ];

  return (
    <div className={`grid gap-3 bg-[#073C3E] p-4 text-white ${className}`}>
      <div className="grid grid-cols-[1fr_.9fr] gap-3">
        <div className="border border-white/10 p-4">
          <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#DDF65C]">Capability map</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {departments.map(([slug, label]) => (
              <div key={slug} className="flex items-center gap-2 border border-white/10 bg-white/5 p-2">
                <ServiceGlyph slug={slug} className="h-8 w-8 shrink-0" />
                <span className="text-[10px] font-black uppercase tracking-[.08em] text-white/70">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          <div className="border border-white/10 p-4">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Review signal</p>
            <MiniChart className="mt-2 h-24 w-full text-white" />
          </div>
          <div className="border border-white/10 p-4">
            <p className="text-[9px] font-black uppercase tracking-[.16em] text-white/35">Plan logic</p>
            <PlanSketch className="mt-2 h-24 w-full text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
