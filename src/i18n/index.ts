import { ja } from './ja';
import { en } from './en';
import { LOCALES, type Dictionary, type Lang } from './types';

export * from './types';

const dictionaries: Record<Lang, Dictionary> = { ja, en };

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
  return lang === 'ja' ? normalized : `/en${normalized === '/' ? '/' : normalized}`;
}

/** The locale to offer in the language switcher. */
export function otherLang(lang: Lang): Lang {
  return lang === 'ja' ? 'en' : 'ja';
}

/** BCP 47 tag, for `hreflang` and `Intl` formatting. */
export const bcp47: Record<Lang, string> = {
  ja: 'ja-JP',
  en: 'en-US',
};
