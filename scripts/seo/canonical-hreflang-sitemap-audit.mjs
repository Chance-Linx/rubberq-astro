#!/usr/bin/env node
import {
  INDUSTRY_SLUGS,
  LANGUAGES,
  LOCALIZED_STATIC_PATHS,
  MATERIAL_SLUGS,
  PRODUCT_SLUGS,
  SITE_ORIGIN,
  extractSitemapLocs,
  extractTags,
  fetchText,
  localUrl,
  localizedPath,
  normalizeTarget,
  parseAttributes,
  pathFromSiteUrl,
  siteUrl,
} from './audit-helpers.mjs';

const target = normalizeTarget();
const failures = [];

const ensure = (condition, message) => {
  if (!condition) failures.push(message);
};

const { text: sitemapXml } = await fetchText(localUrl(target, '/sitemap.xml'), '/sitemap.xml');
const sitemapLocs = extractSitemapLocs(sitemapXml);
const sitemapPaths = new Set(sitemapLocs.map(pathFromSiteUrl));
const duplicateLocs = sitemapLocs.filter((loc, index) => sitemapLocs.indexOf(loc) !== index);

ensure(sitemapLocs.length > 0, 'Sitemap must contain URLs.');
ensure(duplicateLocs.length === 0, `Sitemap must not contain duplicate loc values: ${duplicateLocs.join(', ')}`);
ensure(sitemapLocs.every((loc) => loc.startsWith(`${SITE_ORIGIN}/`)), `Sitemap URLs must use ${SITE_ORIGIN}.`);
ensure(!sitemapPaths.has('/en'), 'Sitemap must not include legacy /en homepage.');
ensure(!sitemapPaths.has('/en/blog'), 'Sitemap must not include legacy /en/blog.');
ensure(sitemapPaths.has('/'), 'Sitemap must include root English homepage.');
ensure(sitemapPaths.has('/blog'), 'Sitemap must include canonical /blog.');

for (const basePath of LOCALIZED_STATIC_PATHS) {
  for (const lang of LANGUAGES) {
    ensure(sitemapPaths.has(localizedPath(lang, basePath)), `Sitemap must include ${localizedPath(lang, basePath)}.`);
  }
}

for (const lang of LANGUAGES) {
  for (const slug of PRODUCT_SLUGS) {
    const path = localizedPath(lang, `/products/${slug}`);
    ensure(sitemapPaths.has(path), `Sitemap must include ${path}.`);
  }
  for (const slug of MATERIAL_SLUGS) {
    const path = localizedPath(lang, `/materials/${slug}`);
    ensure(sitemapPaths.has(path), `Sitemap must include ${path}.`);
  }
  for (const slug of INDUSTRY_SLUGS) {
    const path = localizedPath(lang, `/industries/${slug}`);
    ensure(sitemapPaths.has(path), `Sitemap must include ${path}.`);
  }
}

for (const basePath of LOCALIZED_STATIC_PATHS) {
  for (const lang of LANGUAGES) {
    const path = localizedPath(lang, basePath);
    const { text: html } = await fetchText(localUrl(target, path), path);
    const linkTags = extractTags(html, 'link').map(parseAttributes);
    const canonical = linkTags.find((attrs) => attrs.rel === 'canonical')?.href;
    const alternates = linkTags.filter((attrs) => attrs.rel === 'alternate' && attrs.hreflang);
    const alternateMap = new Map(alternates.map((attrs) => [attrs.hreflang, attrs.href]));

    ensure(canonical === siteUrl(path), `${path} canonical must be ${siteUrl(path)}, got ${canonical || 'missing'}.`);
    for (const expectedLang of LANGUAGES) {
      const expectedPath = localizedPath(expectedLang, basePath);
      ensure(
        alternateMap.get(expectedLang) === siteUrl(expectedPath),
        `${path} hreflang ${expectedLang} must be ${siteUrl(expectedPath)}, got ${alternateMap.get(expectedLang) || 'missing'}.`,
      );
    }
    ensure(alternateMap.get('x-default') === siteUrl(localizedPath('en', basePath)), `${path} x-default must point to English canonical.`);
  }
}

const { text: blogHtml } = await fetchText(localUrl(target, '/blog'), '/blog');
const blogLinks = extractTags(blogHtml, 'link').map(parseAttributes);
const blogCanonical = blogLinks.find((attrs) => attrs.rel === 'canonical')?.href;
const blogAlternates = new Map(
  blogLinks
    .filter((attrs) => attrs.rel === 'alternate' && attrs.hreflang)
    .map((attrs) => [attrs.hreflang, attrs.href]),
);
ensure(blogCanonical === siteUrl('/blog'), `/blog canonical must be ${siteUrl('/blog')}.`);
ensure(blogAlternates.get('en') === siteUrl('/blog'), '/blog must include self hreflang=en.');
ensure(blogAlternates.get('x-default') === siteUrl('/blog'), '/blog x-default must point to /blog.');

if (failures.length > 0) {
  console.error('Canonical / hreflang / sitemap audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Canonical / hreflang / sitemap audit passed for ${sitemapLocs.length} sitemap URLs at ${target}.`);
