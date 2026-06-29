import 'server-only';

import type { LanguageOption } from './language-switcher';
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

// Generate once on the server and serialize into client boundaries. This avoids
// hydration differences between Node and browser ICU language-name catalogs.
export const languageOptions: readonly LanguageOption[] = languageCodes.map((code) => [code, getLanguageLabel(code)] as const);
