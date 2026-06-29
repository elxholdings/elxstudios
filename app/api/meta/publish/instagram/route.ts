import { NextResponse } from 'next/server';
import { getAuthContext, staffRoles } from '../../../../lib/auth';
import { decryptMetaToken, getMetaIntegration, logMetaAction, metaGraph } from '../../../../lib/meta';

export async function POST(request: Request) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const body = await request.json().catch(() => ({})) as { instagramId?: string; imageUrl?: string; caption?: string };
  const caption = String(body.caption || '').trim().slice(0, 2200);
  let imageUrl: string;
  try {
    const parsed = new URL(String(body.imageUrl || ''));
    if (parsed.protocol !== 'https:') throw new Error();
    imageUrl = parsed.toString();
  } catch {
    return NextResponse.json({ error: 'A public HTTPS image URL is required.' }, { status: 400 });
  }
  if (!body.instagramId) return NextResponse.json({ error: 'Instagram account is required.' }, { status: 400 });
  const integration = await getMetaIntegration('instagram', body.instagramId);
  if (!integration) return NextResponse.json({ error: 'Instagram account is not connected.' }, { status: 404 });
  try {
    const token = decryptMetaToken(integration);
    const container = await metaGraph<{ id: string }>(`${body.instagramId}/media`, token, { method: 'POST', body: JSON.stringify({ image_url: imageUrl, caption }) });
    const result = await metaGraph<{ id: string }>(`${body.instagramId}/media_publish`, token, { method: 'POST', body: JSON.stringify({ creation_id: container.id }) });
    await logMetaAction({ integrationId: integration.id, requestedBy: user.id, action: 'instagram.publish_image', targetId: body.instagramId, summary: { caption_length: caption.length, image_host: new URL(imageUrl).host }, resultId: result.id });
    return NextResponse.json({ ok: true, id: result.id });
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Instagram publishing failed.';
    await logMetaAction({ integrationId: integration.id, requestedBy: user.id, action: 'instagram.publish_image', targetId: body.instagramId, summary: { caption_length: caption.length }, error: reason });
    return NextResponse.json({ error: reason }, { status: 400 });
  }
}
