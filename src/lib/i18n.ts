export const locales = ['en', 'de', 'ja', 'es', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';
export const blogLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  ja: '日本語',
  es: 'Español',
  zh: '中文'
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  de: '🇩🇪',
  ja: '🇯🇵',
  es: '🇪🇸',
  zh: '🇨🇳'
};

type Messages = Record<string, any>;

function isPlainObject(value: unknown): value is Messages {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeWithFallback(fallback: unknown, override: unknown): unknown {
  if (!isPlainObject(fallback) || !isPlainObject(override)) {
    return override ?? fallback;
  }

  const merged: Messages = { ...fallback };

  for (const [key, value] of Object.entries(override)) {
    merged[key] = key in merged ? mergeWithFallback(merged[key], value) : value;
  }

  return merged;
}

// Load translation messages for a locale, using English as a deep fallback.
export async function getTranslations(locale: string) {
  const fallback = (await import('../messages/en.json')).default;

  if (locale === defaultLocale) {
    return fallback;
  }

  try {
    const messages = await import(`../messages/${locale}.json`);
    return mergeWithFallback(fallback, messages.default);
  } catch {
    return fallback;
  }
}

// Get nested translation key (e.g. "metadata.home.title")
export function t(messages: any, key: string, fallback = ''): string {
  const keys = key.split('.');
  let value = messages;
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return fallback;
    }
  }
  return typeof value === 'string' ? value : fallback;
}

// Get raw value for any type (string, array, object)
export function tRaw(messages: any, key: string, fallback: any = null): any {
  const keys = key.split('.');
  let value = messages;
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return fallback;
    }
  }
  return value ?? fallback;
}
