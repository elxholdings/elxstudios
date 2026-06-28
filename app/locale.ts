import { cookies, headers } from 'next/headers';
import { detectLocale, type ResolvedLocale } from './locale-config';

export type { ResolvedLocale } from './locale-config';

export async function resolveLocale(lang?: string | string[]): Promise<ResolvedLocale> {
  const queryValue = Array.isArray(lang) ? lang[0] : lang;
  const cookieStore = await cookies();
  const requestHeaders = await headers();

  return detectLocale({
    query: queryValue,
    saved: cookieStore.get('elx_locale')?.value,
    country: requestHeaders.get('x-vercel-ip-country')
      || requestHeaders.get('cf-ipcountry')
      || requestHeaders.get('x-country-code'),
    acceptLanguage: requestHeaders.get('accept-language'),
  });
}
