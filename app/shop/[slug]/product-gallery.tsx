'use client';

import { useState } from 'react';

type Item = { url: string; type?: 'image' | 'video'; alt?: string };
export default function ProductGallery({ title, cover, gallery, video }: { title: string; cover: string | null; gallery: Item[]; video: string | null }) {
  const items: Item[] = [...(cover ? [{ url: cover, type: 'image' as const, alt: title }] : []), ...(gallery || []), ...(video ? [{ url: video, type: 'video' as const, alt: `${title} video` }] : [])];
  const [active, setActive] = useState(0); const item = items[active];
  if (!item) return <div className="aspect-[3/2] bg-[#102321]" />;
  return <div><div className="aspect-[3/2] overflow-hidden bg-[#102321]">{item.type === 'video' ? <video src={item.url} controls className="h-full w-full object-cover" /> : <img src={item.url} alt={item.alt || title} className="h-full w-full object-cover" />}</div>{items.length > 1 && <div className="mt-2 grid grid-cols-5 gap-2">{items.map((entry, index) => <button key={`${entry.url}-${index}`} onClick={() => setActive(index)} className={`aspect-[3/2] overflow-hidden border-2 ${active === index ? 'border-[#DDF65C]' : 'border-transparent'}`}>{entry.type === 'video' ? <div className="grid h-full place-items-center bg-[#102321] text-xs font-black text-white">PLAY</div> : <img src={entry.url} alt="" className="h-full w-full object-cover" />}</button>)}</div>}</div>;
}
