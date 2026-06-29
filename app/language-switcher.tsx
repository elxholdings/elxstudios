'use client';

export type LanguageOption = readonly [string, string];

export default function LanguageSwitcher({ locale, options, inverted = false }: { locale: string; options: readonly LanguageOption[]; inverted?: boolean }) {
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
      {options.map(([code, label]) => <option key={code} value={code} className="text-black">{label}</option>)}
    </select>
  );
}
