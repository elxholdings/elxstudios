import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { getAuthContext, staffRoles } from '../../../../lib/auth';

const scopes = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
  'leads_retrieval',
  'ads_read',
  'read_insights',
  'business_management',
];

export async function GET(request: Request) {
  const { user, roles } = await getAuthContext();
  if (!user) return NextResponse.redirect(new URL('/login?next=/admin/meta', request.url));
  if (!roles.some((role) => staffRoles.includes(role as (typeof staffRoles)[number]))) return NextResponse.json({ error: 'Staff access required.' }, { status: 403 });
  const appId = process.env.META_APP_ID;
  if (!appId) return NextResponse.redirect(new URL('/admin/meta?error=missing_app_id', request.url));
  const state = randomBytes(32).toString('hex');
  const redirectUri = `${new URL(request.url).origin}/api/meta/oauth/callback`;
  const oauth = new URL('https://www.facebook.com/v25.0/dialog/oauth');
  oauth.searchParams.set('client_id', appId);
  oauth.searchParams.set('redirect_uri', redirectUri);
  oauth.searchParams.set('state', state);
  oauth.searchParams.set('scope', scopes.join(','));
  oauth.searchParams.set('response_type', 'code');
  const response = NextResponse.redirect(oauth);
  response.cookies.set('meta_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 600 });
  return response;
}
