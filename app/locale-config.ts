export type ResolvedLocale = string;

// Cloud Translation NMT catalog. Keep this explicit so the picker works before
// an API request and so unsupported locale strings cannot be sent upstream.
export const languageCodes = [
  'ab', 'ace', 'ach', 'af', 'sq', 'alz', 'am', 'ar', 'hy', 'as', 'awa', 'ay',
  'az', 'ban', 'bm', 'ba', 'eu', 'btx', 'bts', 'bbc', 'be', 'bem', 'bn', 'bew',
  'bho', 'bik', 'bs', 'br', 'bg', 'bua', 'yue', 'ca', 'ceb', 'ny', 'zh', 'zh-TW',
  'cv', 'co', 'crh', 'hr', 'cs', 'da', 'din', 'dv', 'doi', 'dov', 'nl', 'dz',
  'en', 'eo', 'et', 'ee', 'fj', 'fil', 'fi', 'fr', 'fy', 'ff', 'gaa', 'gl', 'lg',
  'ka', 'de', 'el', 'gn', 'gu', 'ht', 'cnh', 'ha', 'haw', 'he', 'hil', 'hi',
  'hmn', 'hu', 'hrx', 'is', 'ig', 'ilo', 'id', 'ga', 'it', 'ja', 'jv', 'kn',
  'pam', 'kk', 'km', 'cgg', 'rw', 'ktu', 'gom', 'ko', 'kri', 'ku', 'ckb', 'ky',
  'lo', 'ltg', 'la', 'lv', 'lij', 'li', 'ln', 'lt', 'lmo', 'luo', 'lb', 'mk',
  'mai', 'mak', 'mg', 'ms', 'ms-Arab', 'ml', 'mt', 'mi', 'mr', 'chm', 'mni-Mtei',
  'min', 'lus', 'mn', 'my', 'nr', 'new', 'ne', 'nso', 'no', 'nus', 'oc', 'or',
  'om', 'pag', 'pap', 'ps', 'fa', 'pl', 'pt', 'pa', 'pa-Arab', 'qu', 'rom', 'ro',
  'rn', 'ru', 'sm', 'sg', 'sa', 'gd', 'sr', 'st', 'crs', 'shn', 'sn', 'scn',
  'szl', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'ss', 'sv', 'tg', 'ta',
  'tt', 'te', 'tet', 'th', 'ti', 'ts', 'tn', 'tr', 'tk', 'ak', 'uk', 'ur', 'ug',
  'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'yua', 'zu',
] as const;

export const supportedLocales = new Set<string>(languageCodes);
const canonicalLocales = new Map(languageCodes.map((code) => [code.toLowerCase(), code]));

export const countryLocales: Record<string, string> = {
  CN: 'zh', TW: 'zh-TW', HK: 'zh-TW', MO: 'zh-TW', RU: 'ru', UA: 'uk', BY: 'be',
  FR: 'fr', DE: 'de', ES: 'es', IT: 'it', PT: 'pt', NL: 'nl', PL: 'pl', CZ: 'cs',
  SK: 'sk', SI: 'sl', HR: 'hr', RS: 'sr', BA: 'bs', BG: 'bg', RO: 'ro', HU: 'hu',
  GR: 'el', CY: 'el', TR: 'tr', SE: 'sv', NO: 'no', DK: 'da', FI: 'fi', IS: 'is',
  EE: 'et', LV: 'lv', LT: 'lt', AL: 'sq', XK: 'sq', MK: 'mk', AD: 'ca', MT: 'mt',
  AT: 'de', LI: 'de', CH: 'de', BE: 'nl', LU: 'fr', MC: 'fr', MD: 'ro', ME: 'sr',
  SM: 'it', VA: 'it', IE: 'en', GB: 'en', US: 'en', CA: 'en', AU: 'en', NZ: 'en',
  JP: 'ja', KR: 'ko', SA: 'ar', AE: 'ar', QA: 'ar', KW: 'ar', EG: 'ar', IL: 'he',
  IR: 'fa', IN: 'hi', BD: 'bn', PK: 'ur', ID: 'id', MY: 'ms', TH: 'th', VN: 'vi',
  KE: 'en', TZ: 'sw', UG: 'en', ZA: 'en', MX: 'es', AR: 'es', CL: 'es', CO: 'es',
  PE: 'es', BR: 'pt', AO: 'pt', MZ: 'pt',
};

export function normalizeLocale(value?: string | null): ResolvedLocale | null {
  if (!value) return null;
  const locale = value.trim().replace('_', '-');
  const lower = locale.toLowerCase();
  if (lower === 'zh' || lower === 'zh-cn' || lower === 'zh-hans' || lower === 'zh-sg') return 'zh';
  if (lower === 'zh-tw' || lower === 'zh-hk' || lower === 'zh-hant') return 'zh-TW';
  if (lower === 'nb' || lower === 'nn') return 'no';
  if (lower === 'iw') return 'he';
  if (lower === 'tl') return 'fil';
  if (lower === 'jw') return 'jv';
  const canonical = canonicalLocales.get(lower);
  if (canonical) return canonical;
  const base = lower.split('-')[0];
  const canonicalBase = canonicalLocales.get(base);
  if (canonicalBase) return canonicalBase;
  return null;
}

function localeForCountry(country?: string | null) {
  const normalizedCountry = (country || '').toUpperCase();
  if (!normalizedCountry) return null;
  if (countryLocales[normalizedCountry]) return countryLocales[normalizedCountry];

  try {
    return normalizeLocale(new Intl.Locale(`und-${normalizedCountry}`).maximize().language);
  } catch {
    return null;
  }
}

export function detectLocale({
  query,
  saved,
  country,
  acceptLanguage,
}: {
  query?: string | null;
  saved?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
}): ResolvedLocale {
  const browserLocale = acceptLanguage
    ?.split(',')
    .map((entry) => normalizeLocale(entry.split(';')[0]))
    .find((entry): entry is string => Boolean(entry)) || null;

  return normalizeLocale(query)
    || normalizeLocale(saved)
    || localeForCountry(country)
    || browserLocale
    || 'en';
}

export function isRtlLocale(locale: string) {
  const lower = locale.toLowerCase();
  return lower.endsWith('-arab') || ['ar', 'ckb', 'dv', 'fa', 'he', 'ps', 'sd', 'ug', 'ur', 'yi'].includes(lower);
}
