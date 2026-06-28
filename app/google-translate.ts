import { unstable_cache } from 'next/cache';
import { SITE_STRINGS } from './site-strings';

export type TranslationDictionary = Record<string, string>;

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

async function requestTranslations(locale: string): Promise<TranslationDictionary> {
  if (locale === 'en' || locale === 'zh') return {};

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) return {};

  const dictionary: TranslationDictionary = {};
  const phrases = Array.from(new Set<string>(SITE_STRINGS));
  const chunks: string[][] = [];

  for (let index = 0; index < phrases.length; index += 60) {
    chunks.push(phrases.slice(index, index + 60));
  }

  for (const chunk of chunks) {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: chunk, source: 'en', target: locale, format: 'text' }),
    });

    if (!response.ok) throw new Error(`Translation provider returned ${response.status}.`);

    const payload = (await response.json()) as {
      data?: { translations?: Array<{ translatedText?: string }> };
    };
    const translations = payload.data?.translations;
    if (!translations || translations.length !== chunk.length) {
      throw new Error('Translation provider returned an incomplete response.');
    }

    chunk.forEach((source, index) => {
      dictionary[source] = decodeHtmlEntities(translations[index]?.translatedText || source);
    });
  }

  return dictionary;
}

const getCachedSiteTranslations = unstable_cache(
  requestTranslations,
  ['elx-site-translations-v1'],
  { revalidate: 60 * 60 * 24 * 30 },
);

export async function getSiteTranslations(locale: string) {
  try {
    return await getCachedSiteTranslations(locale);
  } catch {
    return {};
  }
}
