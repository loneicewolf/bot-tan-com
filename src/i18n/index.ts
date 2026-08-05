import { ja } from './ja';
import { en } from './en';
import { sv } from './sv';
import { LOCALES, type Dictionary, type Lang } from './types';

export * from './types';

const dictionaries: Record<Lang, Dictionary> = { ja, en, sv };

export function useTranslations(lang: Lang): Dictionary {
  return dictionaries[lang];
}

function isLang(value: string): value is Lang {
  return (LOCALES as readonly string[]).includes(value);
}

/** Reads the locale out of the URL path. Falls back to the default locale. */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return first && isLang(first) ? first : 'ja';
}

/**
 * Builds a locale-prefixed path. `ja` is the default locale and carries no
 * prefix, matching `prefixDefaultLocale: false` in astro.config.mjs.
 */
export function localizedPath(lang: Lang, path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const segments = normalized.split('/');
  let cleanPath = normalized;
  if (segments[1] && (LOCALES as readonly string[]).includes(segments[1])) {
    cleanPath = '/' + segments.slice(2).join('/');
  }
  return lang === 'ja' ? cleanPath : `/${lang}${cleanPath === '/' ? '/' : cleanPath}`;
}

/** Display names for each supported language. */
export const langNames: Record<Lang, string> = {
  ja: '日本語',
  en: 'English',
  sv: 'Svenska',
};

/** The locale to offer as default fallback toggle in language switchers. */
export function otherLang(lang: Lang): Lang {
  return lang === 'ja' ? 'en' : 'ja';
}

/** BCP 47 tag, for `hreflang` and `Intl` formatting. */
export const bcp47: Record<Lang, string> = {
  ja: 'ja-JP',
  en: 'en-US',
  sv: 'sv-SE',
};
