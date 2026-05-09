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

// Load translation messages for a locale
export async function getTranslations(locale: string) {
  try {
    const messages = await import(`../messages/${locale}.json`);
    return messages.default;
  } catch {
    const fallback = await import('../messages/en.json');
    return fallback.default;
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
