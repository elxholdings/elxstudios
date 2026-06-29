import { NextResponse } from 'next/server';
import { getAuthContext, staffRoles } from '../../../../lib/auth';
import { decryptMetaToken, getMetaIntegration, logMetaAction, metaGraph } from '../../../../lib/meta';

export async function POST(request: Request) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { pageId?: string; message?: string; link?: string };
  const message = String(body.message || '').trim().slice(0, 10000);
  if (!body.pageId || !message) return NextResponse.json({ error: 'Page and message are required.' }, { status: 400 });
  const integration = await getMetaIntegration('facebook_page', body.pageId);
  if (!integration) return NextResponse.json({ error: 'Facebook Page is not connected.' }, { status: 404 });
  const payload: Record<string, string> = { message };
  if (body.link) {
    try { payload.link = new URL(body.link).toString(); } catch { return NextResponse.json({ error: 'The link is not valid.' }, { status: 400 }); }
  }
  try {
    const result = await metaGraph<{ id: string }>(`${body.pageId}/feed`, decryptMetaToken(integration), { method: 'POST', body: JSON.stringify(payload) });
    await logMetaAction({ integrationId: integration.id, requestedBy: user.id, action: 'facebook.publish_post', targetId: body.pageId, summary: { message_length: message.length, has_link: Boolean(payload.link) }, resultId: result.id });
    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Facebook publishing failed.';
    await logMetaAction({ integrationId: integration.id, requestedBy: user.id, action: 'facebook.publish_post', targetId: body.pageId, summary: { message_length: message.length }, error: reason });
    return NextResponse.json({ error: reason }, { status: 400 });
  }
}
