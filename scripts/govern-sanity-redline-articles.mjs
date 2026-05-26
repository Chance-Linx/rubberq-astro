#!/usr/bin/env node
/**
 * Archives published Sanity articles that violate RubberQ public-positioning rules.
 *
 * Default mode is a dry run. Use --apply to patch matching articles to
 * status="archived". This script does not delete content and does not create
 * redirects; URL handling remains content-led in the Astro site.
 */

import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const raw of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadDotEnv(path.join(ROOT, '.env'));
loadDotEnv(path.join(ROOT, '.env.local'));

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'tcjl4afv';
const DATASET = process.env.SANITY_DATASET || 'production';
const API_VERSION = '2024-01-01';
const SANITY_TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;

if (APPLY && !SANITY_TOKEN) {
  console.error('ERROR: SANITY_API_TOKEN env var is required when using --apply.');
  process.exit(1);
}

const sanity = createClient({
  projectId: PROJECT_ID,
  dataset: DATASET,
  apiVersion: API_VERSION,
  token: SANITY_TOKEN,
  useCdn: false,
});

const rules = [
  {
    label: 'medical market direction',
    terms: ['medical', 'implant', 'biocompatibility', 'iso 10993', 'iso-10993', 'usp-class'],
  },
  {
    label: 'FDA / ISO 13485 / regulated food or pharma direction',
    terms: ['fda', 'iso-13485', 'iso 13485', 'pharmaceutical', 'sterile'],
  },
  {
    label: 'old robotics positioning',
    terms: ['robotic', 'robotics', 'robots'],
  },
  {
    label: 'old AI server / data center positioning',
    terms: ['ai-server', 'ai-and-automation', 'data-center'],
  },
  {
    label: 'unconfirmed EV high-voltage component examples',
    terms: ['battery-pack', 'pdu', 'bms'],
  },
  {
    label: 'private partner name',
    terms: ['j&c', 'j&c kabushiki'],
  },
  {
    label: 'old founding or speed claim',
    terms: ['since 1990', '35 years', 'new compound from scratch in 4 weeks', 'prototype 3-5 days'],
  },
];

const rewriteCandidates = new Set([
  'post-curing-processes-why-its-critical-for-fda-grade-silicone-gaskets',
  'silica-fillers-in-silicone-enhancing-mechanical-strength-without-sacrificing-cla',
  'compression-set-in-vmq-optimizing-cure-systems-for-ai-server-cooling',
  'how-iatf-16949-standards-influence-rubber-component-quality-for-robotics',
  'full-traceability-in-rubber-manufacturing-barcode-erp-from-raw-material-to-shipm',
  'robotic-joint-bellows-material-selection-for-million-cycle-flex-life',
  'cryogenic-deflashing-vs-manual-trimming-when-precision-demands-sub-zero',
  'ppap-for-rubber-parts-what-oem-buyers-should-expect-from-their-supplier',
]);

function textOf(value) {
  if (!value) return '';
  if (Array.isArray(value)) return value.map(textOf).join(' ');
  if (typeof value === 'object') return Object.values(value).map(textOf).join(' ');
  return String(value);
}

function classifyArticle(article) {
  const source = [
    article.title,
    article.slug,
    article.excerpt,
    article.category,
    ...(article.tags || []),
    textOf(article.content),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/\s+/g, ' ');

  return rules
    .filter((rule) => rule.terms.some((term) => source.includes(term)))
    .map((rule) => rule.label);
}

const articles = await sanity.fetch(`*[_type == "article" && status == "published"] | order(publishedAt desc) {
  _id,
  _rev,
  title,
  "slug": slug.current,
  excerpt,
  content,
  publishedAt,
  category,
  tags
}`);

const now = Date.now();
const blocked = articles
  .map((article) => ({
    ...article,
    redlineLabels: classifyArticle(article),
    scheduled: article.publishedAt ? new Date(article.publishedAt).getTime() > now : false,
  }))
  .filter((article) => article.redlineLabels.length > 0);

console.log('RubberQ Sanity redline article governance');
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);
console.log(`Project: ${PROJECT_ID}`);
console.log(`Dataset: ${DATASET}`);
console.log(`Published articles scanned: ${articles.length}`);
console.log(`Blocked published articles: ${blocked.length}`);
console.log(`Rewrite candidates: ${blocked.filter((article) => rewriteCandidates.has(article.slug)).length}`);
console.log(`Archive-only articles: ${blocked.filter((article) => !rewriteCandidates.has(article.slug)).length}`);
console.log('');

for (const article of blocked) {
  const action = rewriteCandidates.has(article.slug) ? 'archive + rewrite queue' : 'archive only';
  const timing = article.scheduled ? 'scheduled' : 'current';
  console.log(`- ${action} | ${timing} | ${article.slug}`);
  console.log(`  ${article.redlineLabels.join('; ')}`);
}

if (!APPLY) {
  console.log('');
  console.log('No writes performed. Re-run with --apply to archive matching articles.');
  process.exit(0);
}

for (const article of blocked) {
  await sanity
    .patch(article._id)
    .ifRevisionId(article._rev)
    .set({ status: 'archived' })
    .commit({ autoGenerateArrayKeys: true });
}

const remaining = await sanity.fetch(`count(*[_type == "article" && status == "published"])`);

console.log('');
console.log(`Archived articles: ${blocked.length}`);
console.log(`Remaining published articles: ${remaining}`);
