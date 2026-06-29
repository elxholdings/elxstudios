import Link from 'next/link';
import type { ReactNode } from 'react';
import AdminNav from './admin-nav';

export default function AdminShell({ name, email, roles, children }: { name: string; email: string; roles: string[]; children: ReactNode }) {
  return <div className="min-h-screen bg-[#EAE7DC] text-[#102321]">
    <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
      <aside className="bg-[#102321] p-5 text-white lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
        <Link href="/admin" className="text-2xl font-black tracking-[-.06em]">Elx<span className="text-[#F06449]">.</span>Ops</Link>
        <p className="mt-2 text-[10px] font-black uppercase tracking-[.16em] text-white/35">Holdings control plane</p>
        <AdminNav />
        <div className="mt-8 border-t border-white/10 pt-5"><p className="truncate text-sm font-black">{name}</p><p className="mt-1 truncate text-xs text-white/35">{email}</p><p className="mt-3 text-[10px] font-black uppercase tracking-[.1em] text-[#DDF65C]">{roles.join(' / ').replaceAll('_', ' ')}</p><div className="mt-5 flex gap-4 text-xs font-bold text-white/45"><Link href="/">Website</Link><form action="/auth/signout" method="post"><button type="submit">Sign out</button></form></div></div>
      </aside>
      <div className="min-w-0"><header className="flex min-h-16 items-center justify-between border-b border-black/10 bg-[#F5F2E8] px-5 md:px-8"><p className="text-xs font-black uppercase tracking-[.14em] text-black/35">Elx Studio / Administration</p><Link href="/start" className="text-xs font-black">Create client order ↗</Link></header><main className="p-5 md:p-8">{children}</main></div>
    </div>
  </div>;
}
