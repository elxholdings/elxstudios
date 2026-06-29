'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sections = [
  ['Overview', '/admin', '01'],
  ['Orders', '/admin/orders', '02'],
  ['Clients', '/admin/clients', '03'],
  ['Team', '/admin/team', '04'],
  ['Services', '/admin/services', '05'],
  ['Finance', '/admin/finance', '06'],
  ['Support', '/admin/support', '07'],
  ['Content', '/admin/content', '08'],
  ['Meta', '/admin/meta', '09'],
  ['Settings', '/admin/settings', '10'],
  ['System', '/admin/system', '11'],
] as const;

export default function AdminNav() {
  const pathname = usePathname();
  return <nav className="mt-7 grid gap-1">{sections.map(([label, href, number]) => {
    const active = href === '/admin' ? pathname === href : pathname.startsWith(href);
    return <Link key={href} href={href} className={`flex items-center justify-between px-4 py-3 text-sm font-black transition ${active ? 'bg-[#DDF65C] text-[#102321]' : 'text-white/55 hover:bg-white/5 hover:text-white'}`}><span>{label}</span><span className="text-[10px] opacity-45">{number}</span></Link>;
  })}</nav>;
}
