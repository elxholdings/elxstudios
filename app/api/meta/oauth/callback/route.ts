import { NextResponse } from 'next/server';
import { getAuthContext, staffRoles } from '../../../../lib/auth';
import { metaGraph, upsertMetaIntegration } from '../../../../lib/meta';

type TokenResponse = { access_token: string; token_type: string; expires_in?: number };
type MeResponse = { id: string; name: string };
type PagesResponse = { data: Array<{ id: string; name: string; access_token: string; tasks?: string[]; instagram_business_account?: { id: string } }> };
type AdAccountsResponse = { data: Array<{ id: string; account_id: string; name: string; account_status: number; currency: string; business?: { id: string; name: string } }> };

export async function GET(request: Request) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.redirect(new URL('/login?next=/admin/meta', request.url));
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookieState = request.headers.get('cookie')?.match(/(?:^|; )meta_oauth_state=([^;]+)/)?.[1];
  if (!code || !state || !cookieState || state !== decodeURIComponent(cookieState)) return NextResponse.redirect(new URL('/admin/meta?error=invalid_state', url.origin));
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  if (!appId || !appSecret) return NextResponse.redirect(new URL('/admin/meta?error=missing_meta_config', url.origin));
  const redirectUri = `${url.origin}/api/meta/oauth/callback`;

  try {
    const tokenUrl = new URL('https://graph.facebook.com/v25.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', appId);
    tokenUrl.searchParams.set('client_secret', appSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);
    const shortResponse = await fetch(tokenUrl, { cache: 'no-store' });
    const shortToken = await shortResponse.json() as TokenResponse & { error?: { message?: string } };
    if (!shortResponse.ok || !shortToken.access_token) throw new Error(shortToken.error?.message || 'Meta did not return an access token.');

    const exchangeUrl = new URL('https://graph.facebook.com/v25.0/oauth/access_token');
    exchangeUrl.searchParams.set('grant_type', 'fb_exchange_token');
    exchangeUrl.searchParams.set('client_id', appId);
    exchangeUrl.searchParams.set('client_secret', appSecret);
    exchangeUrl.searchParams.set('fb_exchange_token', shortToken.access_token);
    const exchangeResponse = await fetch(exchangeUrl, { cache: 'no-store' });
    const longToken = await exchangeResponse.json() as TokenResponse & { error?: { message?: string } };
    if (!exchangeResponse.ok || !longToken.access_token) throw new Error(longToken.error?.message || 'Meta token exchange failed.');
    const expiresAt = longToken.expires_in ? new Date(Date.now() + longToken.expires_in * 1000).toISOString() : null;

    const [me, pages, adAccounts] = await Promise.all([
      metaGraph<MeResponse>('me?fields=id,name', longToken.access_token),
      metaGraph<PagesResponse>('me/accounts?fields=id,name,access_token,tasks,instagram_business_account', longToken.access_token),
      metaGraph<AdAccountsResponse>('me/adaccounts?fields=id,account_id,name,account_status,currency,business', longToken.access_token).catch(() => ({ data: [] })),
    ]);
    await upsertMetaIntegration({ product: 'facebook_user', externalAccountId: me.id, displayName: me.name, token: longToken.access_token, tokenExpiresAt: expiresAt, createdBy: user.id, metadata: { meta_user_id: me.id } });

    for (const page of pages.data || []) {
      await upsertMetaIntegration({ product: 'facebook_page', externalAccountId: page.id, displayName: page.name, token: page.access_token, createdBy: user.id, metadata: { tasks: page.tasks || [], meta_user_id: me.id, instagram_account_id: page.instagram_business_account?.id || null } });
      if (page.instagram_business_account?.id) {
        const ig = await metaGraph<{ id: string; username?: string; name?: string }>(`${page.instagram_business_account.id}?fields=id,username,name`, page.access_token).catch((): { id: string; username?: string; name?: string } => ({ id: page.instagram_business_account!.id }));
        await upsertMetaIntegration({ product: 'instagram', externalAccountId: ig.id, displayName: ig.username || ig.name || `Instagram ${ig.id}`, token: page.access_token, createdBy: user.id, metadata: { page_id: page.id, meta_user_id: me.id } });
      }
      await metaGraph<{ success: boolean }>(`${page.id}/subscribed_apps?subscribed_fields=feed,leadgen`, page.access_token, { method: 'POST' }).catch(() => null);
    }
    for (const account of adAccounts.data || []) {
      await upsertMetaIntegration({ product: 'marketing', externalAccountId: account.id, externalBusinessId: account.business?.id || null, displayName: account.name, token: longToken.access_token, tokenExpiresAt: expiresAt, createdBy: user.id, metadata: { account_id: account.account_id, account_status: account.account_status, currency: account.currency, business_name: account.business?.name || null, meta_user_id: me.id } });
    }
    const response = NextResponse.redirect(new URL('/admin/meta?connected=1', url.origin));
    response.cookies.delete('meta_oauth_state');
    return response;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Meta connection failed.';
    return NextResponse.redirect(new URL(`/admin/meta?error=${encodeURIComponent(reason.slice(0, 180))}`, url.origin));
  }
}
