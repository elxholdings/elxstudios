import { NextResponse } from 'next/server';
import { adminEmail } from '../../lib/auth';
import { ELX_STUDIO_COMPANY_ID } from '../../lib/meta';
import { getSupabaseAdminClient } from '../../lib/supabase/admin';
import { getSupabaseServerClient } from '../../lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const requestedNext = url.searchParams.get('next') || '/dashboard';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/dashboard';
  const supabase = await getSupabaseServerClient();
  if (code && supabase) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const providers = data.user.app_metadata.providers;
      const hasGoogleIdentity = data.user.app_metadata.provider === 'google'
        || (Array.isArray(providers) && providers.includes('google'))
        || Boolean(data.user.identities?.some((identity) => identity.provider === 'google'));
      const isGoogleAdmin = data.user.email?.trim().toLowerCase() === adminEmail
        && hasGoogleIdentity
        && Boolean(data.session?.provider_token);

      if (isGoogleAdmin) {
        const admin = getSupabaseAdminClient();
        if (!admin) {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL('/login?next=/admin&error=configuration', url.origin));
        }
        const { error: roleError } = await admin.from('user_roles').upsert({
          user_id: data.user.id,
          company_id: ELX_STUDIO_COMPANY_ID,
          role: 'super_admin',
        }, { onConflict: 'user_id,company_id,role' });
        if (roleError) {
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL('/login?next=/admin&error=configuration', url.origin));
        }
        return NextResponse.redirect(new URL('/admin', url.origin));
      }

      if (next.startsWith('/admin')) {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login?next=/admin&error=admin_access', url.origin));
      }
      return NextResponse.redirect(new URL(next, url.origin));
    }
  }
  return NextResponse.redirect(new URL('/login?error=callback', url.origin));
}
