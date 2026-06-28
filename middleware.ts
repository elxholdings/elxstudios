import { NextRequest, NextResponse } from 'next/server';
import { detectLocale } from './app/locale-config';

export function middleware(request: NextRequest) {
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
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
