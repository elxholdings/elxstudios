import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../lib/supabase/admin';
import { getSupabaseServerClient } from '../../lib/supabase/server';

type IntakePayload = {
  name?: string;
  whatsapp?: string;
  email?: string;
  service?: string;
  deadline?: string;
  budget?: string;
  filesLink?: string;
  brief?: string;
  title?: string;
  purpose?: string;
  outputFormat?: string;
  addOns?: string;
  attachmentNames?: string;
  categorySlug?: string;
  subservice?: string;
  integrityConfirmed?: boolean | string;
};

function clean(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, 3000);
}

function createOrderId() {
  const date = new Date();
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ELX-${y}${m}${d}-${random}`;
}

async function saveIntake(record: Record<string, string>, clientId?: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.from('intake_requests').insert({ ...record, client_id: clientId || null }).select('id').single();
  if (error) throw error;
  return data.id as string;
}

async function createCloudOrder(input: {
  intakeId: string;
  clientId: string;
  orderNumber: string;
  categorySlug: string;
  subservice: string;
  title: string;
  brief: string;
  purpose: string;
  deadline: string;
  outputFormat: string;
  addOns: string;
  name: string;
  whatsapp: string;
  email: string;
}) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data: category } = await supabase.from('service_categories').select('id').eq('slug', input.categorySlug).maybeSingle();
  const { data: service } = category
    ? await supabase.from('services').select('id').eq('category_id', category.id).ilike('title', input.subservice).maybeSingle()
    : { data: null };
  const { data: order, error } = await supabase.from('orders').insert({
    order_number: input.orderNumber,
    company_id: '00000000-0000-4000-8000-000000000002',
    client_id: input.clientId,
    intake_request_id: input.intakeId,
    category_id: category?.id || null,
    service_id: service?.id || null,
    project_title: input.title,
    instructions: input.brief,
    purpose: input.purpose,
    deadline: input.deadline,
    output_formats: input.outputFormat ? [input.outputFormat] : [],
    add_ons: input.addOns ? input.addOns.split(',').map((item) => item.trim()).filter(Boolean) : [],
    guest_contact: { name: input.name, whatsapp: input.whatsapp, email: input.email },
    status: 'submitted',
    payment_status: 'unpaid',
    quote_status: 'draft',
  }).select('id').single();
  if (error) throw error;
  await supabase.from('intake_requests').update({ converted_order_id: order.id, status: 'converted' }).eq('id', input.intakeId);
  return order.id as string;
}

async function sendEmail(record: Record<string, string>) {
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ELX_ADMIN_EMAIL;
  if (!resendKey || !adminEmail) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL || 'Elx Studio <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `New Elx Studio request: ${record.order_id}`,
      text: `New project request\n\nOrder ID: ${record.order_id}\nName: ${record.name}\nWhatsApp: ${record.whatsapp}\nEmail: ${record.email}\nService: ${record.service}\nDeadline: ${record.deadline}\nBudget: ${record.budget}\nFiles: ${record.files_link}\n\nBrief:\n${record.brief}`,
    }),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IntakePayload;
    const authClient = await getSupabaseServerClient();
    const authResult = authClient ? await authClient.auth.getUser() : null;
    const user = authResult?.data.user || null;

    const structuredBrief = [
      clean(body.brief),
      clean(body.title) && `Project title: ${clean(body.title)}`,
      clean(body.purpose) && `Purpose: ${clean(body.purpose)}`,
      clean(body.outputFormat) && `Output format: ${clean(body.outputFormat)}`,
      clean(body.addOns) && `Add-ons: ${clean(body.addOns)}`,
      clean(body.attachmentNames) && `File checklist: ${clean(body.attachmentNames)}`,
    ].filter(Boolean).join('\n\n');

    const record = {
      order_id: createOrderId(),
      name: clean(body.name),
      whatsapp: clean(body.whatsapp),
      email: clean(body.email),
      service: clean(body.service),
      deadline: clean(body.deadline),
      budget: clean(body.budget),
      files_link: clean(body.filesLink),
      brief: clean(structuredBrief),
      status: 'new',
      created_at: new Date().toISOString(),
    };

    const integrityConfirmed = body.integrityConfirmed === true || body.integrityConfirmed === 'true';
    if (!record.name || !record.whatsapp || !record.service || !record.deadline || !record.brief || !integrityConfirmed) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const intakeId = await saveIntake(record, user?.id);
    let cloudOrderId: string | null = null;
    if (user) {
      cloudOrderId = await createCloudOrder({
        intakeId,
        clientId: user.id,
        orderNumber: record.order_id,
        categorySlug: clean(body.categorySlug),
        subservice: clean(body.subservice),
        title: clean(body.title) || 'Untitled project',
        brief: clean(body.brief),
        purpose: clean(body.purpose),
        deadline: clean(body.deadline),
        outputFormat: clean(body.outputFormat),
        addOns: clean(body.addOns),
        name: record.name,
        whatsapp: record.whatsapp,
        email: record.email,
      });
    }
    await Promise.allSettled([sendEmail(record)]);

    const businessNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '254700000000').replace(/\D/g, '');
    const message = `Hello Elx Studio, I submitted a project brief.\n\nOrder ID: ${record.order_id}\nName: ${record.name}\nService: ${record.service}\nDeadline: ${record.deadline}\nBudget: ${record.budget || 'Not specified'}\nFiles: ${record.files_link || 'Will send on WhatsApp'}\n\nBrief: ${record.brief}`;
    const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent(message)}`;

    return NextResponse.json({ orderId: record.order_id, cloudOrderId, cloudOrder: Boolean(cloudOrderId), whatsappUrl, message });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 });
  }
}
