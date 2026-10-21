import { defaultLocale, locales, type Locale } from './i18n';

const SITE_URL = 'https://rubberq.com';

function normalizeLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
}

function localeBaseUrl(locale: string): string {
  const normalizedLocale = normalizeLocale(locale);
  return normalizedLocale === defaultLocale ? SITE_URL : `${SITE_URL}/${normalizedLocale}`;
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

type BlogPostSchemaItem = {
  slug: string;
  title: string;
  excerpt?: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  image?: string | null;
};

function latestIsoDate(...values: Array<string | undefined>): string | undefined {
  const dates = values
    .filter(Boolean)
    .map((value) => new Date(value as string))
    .filter((date) => !Number.isNaN(date.getTime()));

  if (!dates.length) return undefined;
  return new Date(Math.max(...dates.map((date) => date.getTime()))).toISOString();
}

export function createOrganizationSchema(locale: string, description?: string) {
  const baseUrl = localeBaseUrl(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'RubberQ',
    legalName: 'Fuzhou RongQing Rubber Co., Ltd.',
    foundingDate: '1995',
    foundingLocation: {
      '@type': 'Place',
      name: 'Fuzhou, Fujian, China',
    },
    url: SITE_URL,
    slogan: 'Japanese Formulation. Chinese Precision. Trusted Since 1995.',
    description: description || 'RubberQ is a Sino-Japanese joint venture founded in Fuzhou in 1995. Japanese formulation support connects with rubber compounding, precision molding, in-house testing and ERP production traceability in China.',
    areaServed: ['North America', 'Europe', 'Japan', 'Southeast Asia'],
    knowsAbout: [
      'Rubber compounding', 'Precision rubber molding', 'Custom rubber components',
      'Material selection', 'In-house testing', 'Production traceability',
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Quality Management',
        name: 'IATF 16949:2016',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Quality Management',
        name: 'ISO 9001:2015',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Environmental Management',
        name: 'ISO 14001:2015',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: `${baseUrl}/contact`,
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
      url: `${localeBaseUrl(locale)}/case-studies#case-${study.id}`,
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

export function createBlogPostingSchema(post: BlogPostSchemaItem) {
  const url = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#blogposting`,
    mainEntityOfPage: url,
    headline: post.title,
    description: post.excerpt || post.title,
    datePublished: post.publishedAt,
    dateModified: latestIsoDate(post.updatedAt, post.publishedAt) || post.publishedAt,
    author: {
      '@type': 'Organization',
      name: post.author || 'RubberQ Engineering Team',
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'RubberQ',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    ...(post.image ? { image: post.image } : {}),
  };
}
