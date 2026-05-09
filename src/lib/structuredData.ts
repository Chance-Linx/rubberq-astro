import { defaultLocale, locales, type Locale } from './i18n';

const SITE_URL = 'https://rubberq.com';

function normalizeLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

function localeBaseUrl(locale: string): string {
  return `${SITE_URL}/${normalizeLocale(locale)}`;
}

type Question = {
  question: string;
  answer: string;
};

type ProductProperty = {
  name: string;
  value: string;
};

type CaseStudySchemaItem = {
  id: number;
  title: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
};

export function createOrganizationSchema(locale: string) {
  const baseUrl = localeBaseUrl(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'RubberQ',
    legalName: 'Fuzhou RubberQ Rubber Co., Ltd.',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'RubberQ is an IATF 16949 certified manufacturer of precision rubber components for automotive and industrial applications.',
    sameAs: [
      'https://www.linkedin.com/company/rubberq',
    ],
    email: 'contact@rubberq.com',
    areaServed: ['Europe', 'Japan', 'North America', 'Southeast Asia'],
    knowsAbout: ['FKM', 'EPDM', 'NBR', 'precision seals', 'custom gaskets', 'automotive-grade rubber parts'],
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Quality Management',
      name: 'IATF 16949',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'contact@rubberq.com',
      availableLanguage: ['en', 'de', 'ja', 'es', 'zh'],
      areaServed: ['Global'],
    },
    mainEntityOfPage: baseUrl,
  };
}

export function createFaqSchema(locale: string, questions: Question[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${localeBaseUrl(locale)}/resources#faq`,
    mainEntity: questions.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function createProductSchema(locale: string, product: {
  slug: string;
  name: string;
  description: string;
  sku: string;
  image: string;
  properties: ProductProperty[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${localeBaseUrl(locale)}/products/${product.slug}#product`,
    name: product.name,
    description: product.description,
    sku: product.sku,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: 'RubberQ',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'RubberQ',
    },
    additionalProperty: product.properties.map((spec) => ({
      '@type': 'PropertyValue',
      name: spec.name,
      value: spec.value,
    })),
  };
}

export function createCaseStudiesSchema(locale: string, studies: CaseStudySchemaItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${localeBaseUrl(locale)}/case-studies#list`,
    name: 'Customer Case Studies',
    itemListElement: studies.map((study, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${localeBaseUrl(locale)}/case-studies?case=${study.id}`,
      item: {
        '@type': 'Article',
        headline: study.title,
        about: study.industry,
        description: `${study.challenge} ${study.solution}`.trim(),
        keywords: study.results,
        publisher: {
          '@type': 'Organization',
          name: 'RubberQ',
        },
      },
    })),
  };
}
