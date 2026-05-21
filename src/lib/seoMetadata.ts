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

function localizedUrl(locale: Locale, pathname: string): string {
  const normalizedPath = normalizePath(pathname);
  const pathSuffix = normalizedPath === '/' ? '' : normalizedPath;

  if (locale === defaultLocale) {
    return normalizedPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${pathSuffix}`;
  }

  return `${SITE_URL}/${locale}${pathSuffix}`;
}

export function createLocaleAlternates(locale: string, pathname: string): LocaleAlternates {
  const normalizedLocale = getLocale(locale);
  const normalizedPath = normalizePath(pathname);

  const languages = Object.fromEntries(
    locales.map((lang) => [lang, localizedUrl(lang, normalizedPath)])
  );

  return {
    canonical: localizedUrl(normalizedLocale, normalizedPath),
    languages,
  };
}

export function withStaticAlternates(locale: string, path: StaticRoutePath): LocaleAlternates {
  return createLocaleAlternates(locale, path);
}
