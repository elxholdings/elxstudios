import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { detectLocale } from './app/locale-config';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const locale = detectLocale({
    query: request.nextUrl.searchParams.get('lang'),
    saved: request.cookies.get('elx_locale')?.value,
    country: request.headers.get('x-vercel-ip-country')
      || request.headers.get('cf-ipcountry')
      || request.headers.get('x-country-code'),
    acceptLanguage: request.headers.get('accept-language'),
  });

  requestHeaders.set('x-elx-locale', locale);
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: requestHeaders } });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
