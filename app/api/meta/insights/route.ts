import { NextResponse } from 'next/server';
import { getAuthContext, staffRoles } from '../../../lib/auth';
import { decryptMetaToken, getMetaIntegration, metaGraph } from '../../../lib/meta';

export async function GET(request: Request) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const url = new URL(request.url);
  const product = url.searchParams.get('product');
  const accountId = url.searchParams.get('accountId') || '';
  if (!['facebook_page', 'instagram', 'marketing'].includes(product || '') || !accountId) return NextResponse.json({ error: 'Product and account are required.' }, { status: 400 });
  const integration = await getMetaIntegration(product as 'facebook_page' | 'instagram' | 'marketing', accountId);
  if (!integration) return NextResponse.json({ error: 'Account is not connected.' }, { status: 404 });
  const token = decryptMetaToken(integration);
  try {
    if (product === 'marketing') {
      const data = await metaGraph<Record<string, unknown>>(`${accountId}/insights?fields=campaign_id,campaign_name,impressions,reach,clicks,spend,cpc,ctr,actions&date_preset=last_30d&level=campaign&limit=100`, token);
      return NextResponse.json(data);
    }
    if (product === 'instagram') {
      const data = await metaGraph<Record<string, unknown>>(`${accountId}/insights?metric=reach,profile_views,follower_count&period=day&metric_type=total_value`, token);
      return NextResponse.json(data);
    }
    const data = await metaGraph<Record<string, unknown>>(`${accountId}/insights?metric=page_impressions,page_post_engagements,page_fans&period=day`, token);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Insights request failed.' }, { status: 400 });
  }
}
