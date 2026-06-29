import Link from 'next/link';

export type DashboardOrder = {
  id: string;
  order_number: string;
  project_title: string;
  status: string;
  payment_status: string;
  quote_status: string;
  deadline: string | null;
  created_at: string;
  category: { title: string } | null;
  service: { title: string } | null;
};

const completeStatuses = ['delivered', 'completed'];

export default function DashboardClient({ orders, name, locale = 'en', unread = 0 }: { orders: DashboardOrder[]; name: string; locale?: string; unread?: number }) {
  const active = orders.filter((order) => !completeStatuses.includes(order.status) && order.status !== 'cancelled').length;
  const completed = orders.filter((order) => completeStatuses.includes(order.status)).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="bg-[#102321] p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#DDF65C]">Client workspace</p>
        <p className="mt-4 text-xl font-black">{name}</p>
        <nav className="mt-10 grid gap-2 text-sm font-bold">
          <span className="bg-white px-3 py-3 text-[#102321]">Overview</span>
          <span className="px-3 py-3 text-white/55">Orders <span className="float-right">{orders.length}</span></span>
          <span className="px-3 py-3 text-white/55">Unread updates <span className="float-right">{unread}</span></span>
          <Link href="/start" className="px-3 py-3 text-white/55">New project</Link>
        </nav>
        <p className="mt-12 text-xs leading-5 text-white/45">Your data is synced securely through Supabase. Each project is only visible to you and the Elx team members assigned to delivery.</p>
      </aside>

      <div>
        <div className="flex flex-col gap-5 bg-white p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
          <div><p className="text-xs font-black uppercase tracking-[.16em] text-[#F06449]">Overview</p><h1 className="mt-2 text-4xl font-black tracking-[-0.05em]">Your projects</h1></div>
          <Link href={`/start?lang=${locale}`} className="bg-[#102321] px-5 py-4 text-center text-sm font-black text-white">+ New project</Link>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {([['Total orders', orders.length], ['Active', active], ['Delivered', completed]] as const).map(([label, value]) => <div key={label} className="bg-white p-5"><p className="text-3xl font-black">{value}</p><p className="mt-2 text-xs font-bold uppercase tracking-[.1em] text-black/45">{label}</p></div>)}
        </div>

        {orders.length === 0 ? (
          <section className="mt-5 bg-[#DDF65C] p-8 md:p-12">
            <p className="text-sm font-black uppercase tracking-[.16em]">No projects yet</p>
            <h2 className="mt-5 max-w-2xl text-5xl font-black leading-[.92] tracking-[-0.06em]">Your first secure order will appear here.</h2>
            <p className="mt-5 max-w-xl leading-7 text-black/60">Create a structured brief to begin the quote process. No payment is required to submit.</p>
            <Link href={`/start?lang=${locale}`} className="mt-8 inline-flex bg-[#102321] px-6 py-4 text-sm font-black text-white">Start a project →</Link>
          </section>
        ) : (
          <section className="mt-5 bg-white p-6 md:p-8">
            <div className="flex items-end justify-between gap-5"><div><p className="text-xs font-black uppercase tracking-[.14em] text-black/40">Cloud orders</p><h2 className="mt-2 text-2xl font-black">Latest activity</h2></div><span className="text-xs font-bold text-[#164F22]">Secure sync active</span></div>
            <div className="mt-6 grid gap-2">
              {orders.map((order) => (
                <Link key={order.id} href={`/dashboard/orders/${order.id}?lang=${locale}`} className="grid gap-3 bg-[#F5F2E8] p-5 transition hover:bg-[#DDF65C] md:grid-cols-[1fr_160px_150px] md:items-center">
                  <div><span className="text-[10px] font-black uppercase tracking-[.12em] text-black/40">{order.order_number}</span><h3 className="mt-1 font-black">{order.project_title}</h3><p className="mt-1 text-xs text-black/45">{order.category?.title || 'Project'} / {order.service?.title || 'Custom service'}</p></div>
                  <div><p className="text-[10px] font-black uppercase tracking-[.1em] text-black/35">Deadline</p><p className="mt-1 text-sm font-bold">{order.deadline ? new Date(order.deadline).toLocaleDateString() : 'To be confirmed'}</p></div>
                  <span className="bg-white px-3 py-2 text-center text-xs font-black capitalize">{order.status.replaceAll('_', ' ')}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
