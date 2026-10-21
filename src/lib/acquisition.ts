import registry from '@/data/acquisition-pages.json';
import { getTranslations, tRaw, locales, type Locale } from './i18n';

export interface AcquisitionSection { heading: string; body: string }
export interface AcquisitionCopy {
  label: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  sections: AcquisitionSection[];
  cta: string;
  faq: Array<{ question: string; answer: string }>;
}

export const acquisitionPages = registry;
export const acquisitionPage = (path: string) => registry.find((page) => page.url === path);

export async function acquisitionCopy(locale: string, path: string) {
  if (!locales.includes(locale as Locale)) return null;
  const page = acquisitionPage(path);
  if (!page) return null;
  const messages = await getTranslations(locale);
  return { page, messages, copy: tRaw(messages, `acquisition.pages.${page.id}`) as AcquisitionCopy };
}

// Only this bounded context is carried into the existing RFQ source tracking.
// It is not used as trusted copy, a remote URL, or a form field value.
export function inquiryPath(target: string, source: string): string {
  return `${target}?${new URLSearchParams({ source, cta: 'project-review' })}`;
}
