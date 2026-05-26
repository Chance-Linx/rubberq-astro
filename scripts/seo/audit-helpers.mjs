export const SITE_ORIGIN = 'https://rubberq.com';
export const DEFAULT_TARGET = 'http://127.0.0.1:8792';
export const LANGUAGES = ['en', 'de', 'ja', 'es', 'zh'];

export const LOCALIZED_STATIC_PATHS = [
  '/',
  '/products',
  '/case-studies',
  '/factory',
  '/about',
  '/capabilities',
  '/compounding',
  '/testing',
  '/industries',
  '/materials',
  '/quality',
  '/resources',
  '/contact',
  '/sample-request',
  '/batch-rfq',
  '/standards',
  '/privacy',
  '/terms',
];

export const PRODUCT_SLUGS = ['seals', 'gaskets', 'bellows', 'custom'];
export const MATERIAL_SLUGS = ['hnbr', 'fkm', 'ffkm', 'epdm', 'nbr', 'acm', 'aem', 'silicone', 'lsr'];
export const INDUSTRY_SLUGS = ['ev-energy-storage', 'industrial-equipment', 'semiconductor', 'automotive-tier2'];

export const normalizeTarget = (value = process.argv[2] || DEFAULT_TARGET) => value.replace(/\/+$/, '');

export const localUrl = (target, pathOrUrl) => {
  const source = new URL(pathOrUrl, SITE_ORIGIN);
  return `${target}${source.pathname}${source.search}`;
};

export const siteUrl = (path) => new URL(path, SITE_ORIGIN).toString();

export const localizedPath = (lang, basePath) => {
  if (lang === 'en') {
    return basePath;
  }
  return `/${lang}${basePath === '/' ? '' : basePath}`;
};

export const fetchText = async (url, label = url) => {
  let response;
  try {
    response = await fetch(url, { redirect: 'follow' });
  } catch (error) {
    throw new Error(`Failed to fetch ${label}: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${label}: ${response.status} ${response.statusText}`);
  }

  return {
    text: await response.text(),
    headers: response.headers,
    status: response.status,
    url: response.url,
  };
};

export const extractTags = (html, tagName) => {
  return [...html.matchAll(new RegExp(`<${tagName}\\b[^>]*>`, 'gi'))].map((match) => match[0]);
};

export const parseAttributes = (tag) => {
  const attributes = {};
  const attrPattern = /([:@\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match;

  while ((match = attrPattern.exec(tag))) {
    const [, name, doubleQuoted, singleQuoted, bare] = match;
    if (name === tag.replace(/^<\s*/, '').split(/\s|>/)[0]) {
      continue;
    }
    attributes[name.toLowerCase()] = doubleQuoted ?? singleQuoted ?? bare ?? '';
  }

  return attributes;
};

export const extractSitemapLocs = (xml) => {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
    .map((match) => match[1]?.trim())
    .filter(Boolean);
};

export const pathFromSiteUrl = (url) => {
  const parsed = new URL(url);
  return parsed.pathname.replace(/\/+$/, '') || '/';
};

export const extractJsonLd = (html) => {
  const blocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const parsed = [];
  const errors = [];

  for (const block of blocks) {
    const raw = block[1]?.trim();
    if (!raw) continue;
    try {
      parsed.push(JSON.parse(raw));
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return { parsed, errors };
};

export const schemaTypes = (node) => {
  const type = node?.['@type'];
  if (Array.isArray(type)) return type.map(String);
  return type ? [String(type)] : [];
};
