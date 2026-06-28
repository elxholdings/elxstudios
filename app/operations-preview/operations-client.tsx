'use client';

import { useEffect, useState } from 'react';
import { LocalOrder, OrderStatus, orderStatuses, readLocalOrders, updateLocalOrderStatus } from '../lib/local-orders';

export default function OperationsClient() {
  const [orders, setOrders] = useState<LocalOrder[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => { setOrders(readLocalOrders()); setReady(true); }, []);

  function changeStatus(id: string, status: OrderStatus) {
    setOrders(updateLocalOrderStatus(id, status));
  }

  if (!ready) return <div className="bg-white p-8">Loading operations preview…</div>;
  return (
    <div>
      <div className="bg-[#102321] p-7 text-white md:p-10"><p className="text-xs font-black uppercase tracking-[.16em] text-[#DDF65C]">Local prototype / not production admin</p><h1 className="mt-4 text-5xl font-black tracking-[-0.06em] md:text-7xl">Operations board</h1><p className="mt-5 max-w-2xl leading-7 text-white/55">This validates the staff workflow without exposing real client data. Authentication, database permissions and audit logs are required before a production admin portal can launch.</p></div>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{[['Orders', orders.length], ['Awaiting quote', orders.filter((item) => item.status === 'Awaiting quote' || item.status === 'Submitted').length], ['In production', orders.filter((item) => ['Assigned', 'In progress', 'Quality review'].includes(item.status)).length], ['Delivered', orders.filter((item) => ['Delivered', 'Completed'].includes(item.status)).length]].map(([label, value]) => <div key={label} className="bg-white p-5"><p className="text-3xl font-black">{value}</p><p className="mt-2 text-xs font-bold uppercase tracking-[.1em] text-black/40">{label}</p></div>)}</div>
      <section className="mt-5 bg-white p-6 md:p-8"><div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-black">Incoming orders</h2><span className="text-xs font-bold text-black/40">Browser-local data</span></div>{orders.length === 0 ? <p className="mt-8 bg-[#F5F2E8] p-6 text-black/55">No order has been submitted on this device. Create a project brief first to test the operations flow.</p> : <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead><tr className="border-b border-black/15 text-xs uppercase tracking-[.1em] text-black/40"><th className="py-3">Reference</th><th>Project</th><th>Service</th><th>Deadline</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-black/10"><td className="py-5 font-black">{order.id}</td><td className="font-bold">{order.title}</td><td>{order.subservice}</td><td>{new Date(order.deadline).toLocaleDateString()}</td><td><select value={order.status} onChange={(event) => changeStatus(order.id, event.target.value as OrderStatus)} className="bg-[#F5F2E8] px-3 py-2 font-bold">{orderStatuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>}</section>
    </div>
  );
}
