'use client';

import { languageCodes } from './locale-config';

function getLanguageLabel(code: string) {
  try {
    const nativeName = new Intl.DisplayNames([code], { type: 'language' }).of(code);
    const englishName = new Intl.DisplayNames(['en'], { type: 'language' }).of(code);
    if (!nativeName) return englishName || code;
    return nativeName.toLocaleLowerCase() === englishName?.toLocaleLowerCase()
      ? nativeName
      : `${nativeName} — ${englishName}`;
  } catch {
    return code;
  }
}

export const languageOptions = languageCodes.map((code) => [code, getLanguageLabel(code)] as const);

export default function LanguageSwitcher({ locale, inverted = false }: { locale: string; inverted?: boolean }) {
  function changeLocale(nextLocale: string) {
    document.cookie = `elx_locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`;
    const url = new URL(window.location.href);
    url.searchParams.set('lang', nextLocale);
    window.location.href = `${url.pathname}${url.search}${url.hash}`;
  }

  return (
    <select
      aria-label="Language"
      value={locale}
      onChange={(event) => changeLocale(event.target.value)}
      className={`max-w-32 cursor-pointer bg-transparent py-2 text-xs font-bold outline-none ${inverted ? 'text-white' : 'text-[#102321]'}`}
    >
      {languageOptions.map(([code, label]) => <option key={code} value={code} className="text-black">{label}</option>)}
    </select>
  );
}
