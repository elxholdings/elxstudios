import { NextResponse } from 'next/server';
import { decryptMetaToken, ELX_STUDIO_COMPANY_ID, getMetaIntegration, metaGraph, verifyMetaSignature } from '../../../lib/meta';
import { getSupabaseAdminClient } from '../../../lib/supabase/admin';

type LeadChange = { field?: string; value?: { leadgen_id?: string; page_id?: string; form_id?: string; ad_id?: string; created_time?: number } };
type MetaWebhook = { object?: string; entry?: Array<{ id?: string; time?: number; changes?: LeadChange[]; messaging?: unknown[] }> };

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token && token === process.env.META_WEBHOOK_VERIFY_TOKEN && challenge) return new NextResponse(challenge, { status: 200 });
  return NextResponse.json({ error: 'Webhook verification failed.' }, { status: 403 });
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyMetaSignature(raw, request.headers.get('x-hub-signature-256'))) return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  const payload = JSON.parse(raw) as MetaWebhook;
  const provider = payload.object === 'whatsapp_business_account' ? 'whatsapp' : payload.object === 'instagram' ? 'instagram' : 'facebook';
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Database access is not configured.' }, { status: 503 });
  const { data: event } = await admin.from('meta_webhook_events').insert({ company_id: ELX_STUDIO_COMPANY_ID, provider, object_type: payload.object || 'unknown', payload, processing_status: 'received' }).select('id').single();

  try {
    for (const entry of payload.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'leadgen' || !change.value?.leadgen_id || !change.value.page_id) continue;
        const integration = await getMetaIntegration('facebook_page', change.value.page_id);
        if (!integration) continue;
        const token = decryptMetaToken(integration);
        const lead = await metaGraph<{ id: string; created_time?: string; ad_id?: string; adset_id?: string; campaign_id?: string; form_id?: string; field_data?: Array<{ name: string; values: string[] }> }>(`${change.value.leadgen_id}?fields=id,created_time,ad_id,adset_id,campaign_id,form_id,field_data`, token);
        const fields = Object.fromEntries((lead.field_data || []).map((field) => [field.name, field.values.length === 1 ? field.values[0] : field.values]));
        await admin.from('meta_leads').upsert({
          company_id: ELX_STUDIO_COMPANY_ID,
          leadgen_id: lead.id,
          page_id: change.value.page_id,
          form_id: lead.form_id || change.value.form_id || null,
          ad_id: lead.ad_id || change.value.ad_id || null,
          adset_id: lead.adset_id || null,
          campaign_id: lead.campaign_id || null,
          contact_name: String(fields.full_name || fields.first_name || '').slice(0, 300) || null,
          contact_email: String(fields.email || '').slice(0, 300) || null,
          contact_phone: String(fields.phone_number || fields.phone || '').slice(0, 100) || null,
          fields,
          raw_payload: lead,
          created_time: lead.created_time || null,
        }, { onConflict: 'leadgen_id' });
      }
    }
    if (event?.id) await admin.from('meta_webhook_events').update({ processing_status: 'processed', processed_at: new Date().toISOString() }).eq('id', event.id);
  } catch (error) {
    if (event?.id) await admin.from('meta_webhook_events').update({ processing_status: 'failed', processing_error: error instanceof Error ? error.message.slice(0, 1000) : 'Unknown processing error', processed_at: new Date().toISOString() }).eq('id', event.id);
  }
  return NextResponse.json({ received: true });
}
