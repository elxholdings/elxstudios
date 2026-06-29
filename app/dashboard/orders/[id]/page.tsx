import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteShell } from '../../../components/site-shell';
import { requireUser } from '../../../lib/auth';
import { resolveLocale } from '../../../locale';
import OrderWorkspace, { type OrderWorkspaceData } from './order-workspace';

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ lang?: string | string[] }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const locale = await resolveLocale(query?.lang);
  const { supabase, user } = await requireUser(`/dashboard/orders/${id}`);
  const { data: order } = await supabase.from('orders').select('id, order_number, project_title, instructions, purpose, status, payment_status, quote_status, deadline, output_formats, price, currency, created_at, category:service_categories(title), service:services(title)').eq('id', id).maybeSingle();
  if (!order) notFound();
  const [{ data: files }, { data: messages }, { data: revisions }, { data: deliverables }, { data: quotes }] = await Promise.all([
    supabase.from('order_files').select('id, file_name, file_size, file_type, storage_bucket, storage_path, version, created_at').eq('order_id', id).order('created_at', { ascending: false }),
    supabase.from('order_messages').select('id, sender_id, body, created_at').eq('order_id', id).eq('scope', 'client').order('created_at'),
    supabase.from('revisions').select('id, reason, comments, status, created_at').eq('order_id', id).order('created_at', { ascending: false }),
    supabase.from('deliverables').select('id, title, storage_path, version, created_at').eq('order_id', id).order('version', { ascending: false }),
    supabase.from('quotes').select('id, version, status, total, currency, notes, valid_until').eq('order_id', id).order('version', { ascending: false }).limit(1),
  ]);
  const quote = quotes?.[0] || null;
  const { data: quoteItems } = quote ? await supabase.from('quote_items').select('id, description, quantity, unit_price, total').eq('quote_id', quote.id).order('sort_order') : { data: [] };
  const data = { order, files: files || [], messages: messages || [], revisions: revisions || [], deliverables: deliverables || [], quote, quoteItems: quoteItems || [] } as unknown as OrderWorkspaceData;
  return <SiteShell locale={locale}><section className="px-5 py-8 md:px-10 md:py-12"><div className="mx-auto max-w-[1440px]"><Link href={`/dashboard?lang=${locale}`} className="mb-5 inline-block text-sm font-black">← All projects</Link><OrderWorkspace data={data} userId={user.id} /></div></section></SiteShell>;
}
