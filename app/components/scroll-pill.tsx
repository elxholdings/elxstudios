'use client';

import { useEffect, useRef } from 'react';

export default function ScrollPill() {
  const railRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let fadeTimer = 0;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rail = railRef.current; const pill = pillRef.current;
        if (!rail || !pill) return;
        const maximum = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        if (!maximum) { pill.classList.remove('is-active'); return; }
        const progress = Math.min(1, Math.max(0, window.scrollY / maximum));
        const travel = Math.max(0, rail.clientHeight - pill.offsetHeight);
        pill.style.transform = `translate3d(0, ${Math.round(progress * travel)}px, 0)`;
        pill.classList.add('is-active');
        window.clearTimeout(fadeTimer);
        fadeTimer = window.setTimeout(() => pill.classList.remove('is-active'), 700);
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { cancelAnimationFrame(frame); window.clearTimeout(fadeTimer); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);

  return <div ref={railRef} className="elx-scroll-rail" aria-hidden="true"><span ref={pillRef} className="elx-scroll-pill" /></div>;
}
