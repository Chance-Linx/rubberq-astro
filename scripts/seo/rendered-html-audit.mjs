#!/usr/bin/env node
import {
  extractJsonLd,
  extractTags,
  fetchText,
  localUrl,
  normalizeTarget,
  parseAttributes,
  schemaTypes,
  siteUrl,
} from './audit-helpers.mjs';

const target = normalizeTarget();
const failures = [];

const ensure = (condition, message) => {
  if (!condition) failures.push(message);
};

const page = async (path) => {
  const { text: html } = await fetchText(localUrl(target, path), path);
  const linkTags = extractTags(html, 'link').map(parseAttributes);
  const metaTags = extractTags(html, 'meta').map(parseAttributes);
  const { parsed, errors } = extractJsonLd(html);
  const types = parsed.flatMap(schemaTypes);
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  const description = metaTags.find((attrs) => attrs.name === 'description')?.content || '';
  const canonical = linkTags.find((attrs) => attrs.rel === 'canonical')?.href || '';
  return { html, title, description, canonical, jsonLdErrors: errors, schemaTypes: types };
};

const home = await page('/');
ensure(home.title.includes('Japanese Formulation'), '/ title must keep the v2 positioning.');
ensure(home.description.includes('Sino-Japanese'), '/ meta description must explain the Sino-Japanese factory position.');
ensure(home.canonical === siteUrl('/'), `/ canonical must be ${siteUrl('/')}.`);
ensure(home.schemaTypes.includes('Organization'), '/ must output Organization JSON-LD.');

const staleTerms = [
  'Robotics',
  'AI Infrastructure',
  'AI liquid cooling',
  'Prototype 3-5 days',
  'AUTOMOTIVE-GRADE EXCELLENCE',
];
for (const term of staleTerms) {
  ensure(!home.html.includes(term), `/ must not contain stale positioning term: ${term}`);
}

const jaCompounding = await page('/ja/compounding');
ensure(!/Compounding &amp; R&amp;D|Compounding & R&D/.test(jaCompounding.title), '/ja/compounding must not fall back to English metadata.');
ensure(jaCompounding.description.includes('日本') || jaCompounding.description.includes('社内'), '/ja/compounding must have localized metadata.');

const esEv = await page('/es/industries/ev-energy-storage');
ensure(!/^EV &amp; Energy Storage/.test(esEv.title), '/es/industries/ev-energy-storage must not fall back to English metadata.');
ensure(esEv.description.includes('carga') || esEv.description.includes('energía'), '/es EV industry page must have localized metadata.');

const blog = await page('/blog');
ensure(blog.canonical === siteUrl('/blog'), `/blog canonical must be ${siteUrl('/blog')}.`);
ensure(blog.schemaTypes.includes('Organization'), '/blog must output Organization JSON-LD.');
ensure(blog.html.includes('property="og:title"'), '/blog must output Open Graph title.');

if (failures.length > 0) {
  console.error('Rendered SEO audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Rendered SEO audit passed at ${target}.`);
