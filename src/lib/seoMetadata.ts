import { defaultLocale, locales, type Locale } from './i18n';

// Astro-compatible replacement for Next.js Metadata['alternates'] shape
export interface LocaleAlternates {
  canonical: string;
  languages: Record<string, string>;
}

const SITE_URL = 'https://rubberq.com';

type StaticRoutePath =
  | '/'
  | '/about'
  | '/batch-rfq'
  | '/blog'
  | '/capabilities'
  | '/case-studies'
  | '/compounding'
  | '/contact'
  | '/factory'
  | '/industries'
  | '/materials'
  | '/privacy'
  | '/products'
  | '/quality'
  | '/resources'
  | '/sample-request'
  | '/search'
  | '/standards'
  | '/testing'
  | '/terms';

function normalizePath(pathname: string): string {
  if (!pathname.startsWith('/')) {
    return `/${pathname}`;
  }

  if (pathname !== '/' && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function getLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

export function createLocaleAlternates(locale: string, pathname: string): LocaleAlternates {
  const normalizedLocale = getLocale(locale);
  const normalizedPath = normalizePath(pathname);
  const pathSuffix = normalizedPath === '/' ? '' : normalizedPath;

  const languages = Object.fromEntries(
    locales.map((lang) => [lang, `${SITE_URL}/${lang}${pathSuffix}`])
  );

  return {
    canonical: `${SITE_URL}/${normalizedLocale}${pathSuffix}`,
    languages,
  };
}

export function withStaticAlternates(locale: string, path: StaticRoutePath): LocaleAlternates {
  return createLocaleAlternates(locale, path);
}
