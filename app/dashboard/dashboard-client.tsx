'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { LocalOrder, orderStatuses, readLocalOrders } from '../lib/local-orders';

export default function DashboardClient({ locale = 'en' }: { locale?: string }) {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readLocalOrders();
    setOrders(stored);
    setSelectedId(stored[0]?.id || '');
    setReady(true);
  }, []);

  const selected = useMemo(() => orders.find((order) => order.id === selectedId), [orders, selectedId]);
  const active = orders.filter((order) => !['Completed', 'Delivered'].includes(order.status)).length;
  const completed = orders.filter((order) => ['Completed', 'Delivered'].includes(order.status)).length;

  if (!ready) return <div className="min-h-[440px] bg-white p-8">Loading workspace…</div>;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="bg-[#102321] p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#DDF65C]">Client workspace</p>
        <nav className="mt-10 grid gap-2 text-sm font-bold">
          {['Overview', 'My orders', 'Messages', 'Files', 'Invoices', 'Support', 'Profile'].map((item, index) => <span key={item} className={`px-3 py-3 ${index === 0 ? 'bg-white text-[#102321]' : 'text-white/55'}`}>{item}{index > 1 && <span className="float-right text-[10px] uppercase opacity-50">Soon</span>}</span>)}
        </nav>
        <p className="mt-12 text-xs leading-5 text-white/45">This free workspace is stored only in this browser. Secure login and cloud sync will replace it when backend infrastructure is connected.</p>
      </aside>

      <div>
        <div className="flex flex-col gap-5 bg-white p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#F06449]">Overview</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">Your projects</h1></div>
          <Link href={`/start?lang=${locale}`} className="bg-[#102321] px-5 py-4 text-center text-sm font-black text-white">+ New project</Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[['Total orders', orders.length], ['Active', active], ['Delivered', completed]].map(([label, value]) => <div key={label} className="bg-white p-5"><p className="text-3xl font-black">{value}</p><p className="mt-2 text-xs font-bold uppercase tracking-[.1em] text-black/45">{label}</p></div>)}
        </div>

        {orders.length === 0 ? (
          <section className="mt-5 bg-[#DDF65C] p-8 md:p-12">
            <p className="text-sm font-black uppercase tracking-[.16em]">No projects on this device</p>
            <h2 className="mt-5 max-w-2xl text-5xl font-black leading-[.92] tracking-[-0.06em]">Your first order reference will appear here.</h2>
            <p className="mt-5 max-w-xl leading-7 text-black/60">Create a structured brief to begin the quote process. No payment is required to submit.</p>
            <Link href={`/start?lang=${locale}`} className="mt-8 inline-flex bg-[#102321] px-6 py-4 text-sm font-black text-white">Start a project →</Link>
          </section>
        ) : (
          <div className="mt-5 grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
            <section className="bg-white p-6">
              <div className="flex items-center justify-between"><h2 className="text-xl font-black">Orders</h2><span className="text-xs font-bold text-black/40">This device</span></div>
              <div className="mt-5 grid gap-2">
                {orders.map((order) => (
                  <button key={order.id} onClick={() => setSelectedId(order.id)} className={`p-4 text-left ${selectedId === order.id ? 'bg-[#DDF65C]' : 'bg-[#F5F2E8]'}`}>
                    <span className="block text-xs font-black uppercase tracking-[.1em] text-black/45">{order.id}</span>
                    <span className="mt-2 block font-black">{order.title}</span>
                    <span className="mt-2 block text-xs text-black/50">{order.status} · Due {new Date(order.deadline).toLocaleDateString()}</span>
                  </button>
                ))}
              </div>
            </section>

            {selected && <OrderDetail order={selected} />}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDetail({ order }: { order: LocalOrder }) {
  const stage = Math.max(0, orderStatuses.indexOf(order.status));
  return (
    <section className="bg-white p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.12em] text-[#F06449]">{order.id}</p><h2 className="mt-2 text-3xl font-black tracking-[-0.04em]">{order.title}</h2></div><span className="bg-[#E8F3E7] px-3 py-2 text-xs font-black text-[#164F22]">{order.status}</span></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2"><Detail label="Service" value={`${order.category} / ${order.subservice}`} /><Detail label="Deadline" value={new Date(order.deadline).toLocaleString()} /><Detail label="Payment" value={order.paymentStatus} /><Detail label="Output" value={order.outputFormat} /></div>
      <div className="mt-8"><p className="text-xs font-black uppercase tracking-[.12em] text-black/40">Progress</p><div className="mt-3 h-2 bg-[#E8E4D8]"><div className="h-full bg-[#F06449]" style={{ width: `${Math.max(6, ((stage + 1) / orderStatuses.length) * 100)}%` }} /></div><div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-[.08em] text-black/40"><span>Submitted</span><span>In progress</span><span>Delivered</span></div></div>
      <div className="mt-8 border-t border-black/10 pt-6"><p className="text-xs font-black uppercase tracking-[.12em] text-black/40">Brief</p><p className="mt-3 whitespace-pre-wrap leading-7 text-black/60">{order.brief}</p></div>
      {order.files.length > 0 && <div className="mt-7"><p className="text-xs font-black uppercase tracking-[.12em] text-black/40">File checklist</p><div className="mt-3 flex flex-wrap gap-2">{order.files.map((file) => <span key={file} className="bg-[#F5F2E8] px-3 py-2 text-xs font-bold">{file}</span>)}</div></div>}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="bg-[#F5F2E8] p-4"><p className="text-[10px] font-black uppercase tracking-[.12em] text-black/40">{label}</p><p className="mt-2 text-sm font-bold">{value}</p></div>;
}
