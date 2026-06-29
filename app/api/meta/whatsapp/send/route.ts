import { NextResponse } from 'next/server';
import { getAuthContext, staffRoles } from '../../../../lib/auth';
import { logMetaAction, metaGraph, upsertMetaIntegration } from '../../../../lib/meta';

export async function POST(request: Request) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const token = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return NextResponse.json({ error: 'WhatsApp test credentials are not configured.' }, { status: 503 });
  const body = await request.json().catch(() => ({})) as { to?: string; message?: string };
  const to = String(body.to || '').replace(/\D/g, '');
  const message = String(body.message || '').trim().slice(0, 4096);
  if (!to || !message) return NextResponse.json({ error: 'Recipient and message are required.' }, { status: 400 });
  const integrationId = await upsertMetaIntegration({ product: 'whatsapp', externalAccountId: phoneId, externalBusinessId: process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID || null, displayName: 'Elx Studio WhatsApp', token, createdBy: user.id, metadata: { test_mode: !process.env.META_WHATSAPP_BUSINESS_ACCOUNT_ID } });
  try {
    const result = await metaGraph<{ messages?: Array<{ id: string }> }>(`${phoneId}/messages`, token, { method: 'POST', body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { preview_url: false, body: message } }) });
    const messageId = result.messages?.[0]?.id || null;
    await logMetaAction({ integrationId, requestedBy: user.id, action: 'whatsapp.send_text', targetId: phoneId, summary: { recipient_suffix: to.slice(-4), message_length: message.length }, resultId: messageId });
    return NextResponse.json({ ok: true, id: messageId });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'WhatsApp send failed.';
    await logMetaAction({ integrationId, requestedBy: user.id, action: 'whatsapp.send_text', targetId: phoneId, summary: { recipient_suffix: to.slice(-4), message_length: message.length }, error: reason });
    return NextResponse.json({ error: reason }, { status: 400 });
  }
}
