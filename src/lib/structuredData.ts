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
    foundingDate: '1995-06',
    foundingLocation: {
      '@type': 'Place',
      name: 'Fuzhou, Fujian, China',
    },
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    slogan: 'Japanese Formulation. Chinese Precision. Trusted Since 1995.',
    description:
      'Sino-Japanese joint venture established in June 1995. RubberQ engineers custom rubber compounds in collaboration with Japanese formulation engineers since 1995, and precision-manufactures small-to-medium batch components for EV/energy storage, industrial equipment, semiconductor, and Tier 2 automotive applications. We operate a single dedicated A-mixing line for batch-to-batch compound consistency, with in-house testing laboratory validating every formulation to ASTM/ISO standards. IATF 16949 / ISO 9001 / ISO 14001 certified.',
    sameAs: [
      'https://www.linkedin.com/company/rubberq',
    ],
    email: 'contact@rubberq.com',
    areaServed: ['Europe', 'North America', 'Japan', 'Southeast Asia'],
    knowsAbout: [
      'In-house rubber compounding',
      'Custom elastomer formulation',
      'Japanese-developed master compounds',
      'Sino-Japanese rubber engineering',
      'FKM',
      'FFKM',
      'HNBR',
      'NBR',
      'EPDM',
      'ACM',
      'AEM',
      'Silicone (HCR)',
      'LSR (Liquid Silicone Rubber)',
      'Precision rubber seals',
      'Custom rubber gaskets',
      'EV battery thermal management seals',
      'EV charging infrastructure seals',
      'BESS (Battery Energy Storage System) sealing',
      'Semiconductor process seals (FFKM)',
      'Industrial hydraulic and pneumatic seals',
      'Pump and valve seals',
      'Automotive Tier 2 components',
      'Compound traceability',
      'Single-line mixing for compound consistency',
      'Cross-contamination control',
      'IATF 16949 quality management',
      'Compound development partnership',
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
