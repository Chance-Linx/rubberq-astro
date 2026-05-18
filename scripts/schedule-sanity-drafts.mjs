#!/usr/bin/env node
/**
 * Schedules existing Sanity article drafts using the same Leafclock-style
 * future publishedAt model as the local article importer.
 *
 * Usage:
 *   node scripts/schedule-sanity-drafts.mjs --dry-run --schedule-daily-from=2026-06-06
 *   node scripts/schedule-sanity-drafts.mjs --apply --schedule-daily-from=2026-06-06
 *   node scripts/schedule-sanity-drafts.mjs --apply --source=future-published --schedule-daily-from=2026-06-01 --per-day=2
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
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadDotEnv(path.join(ROOT, '.env'));
loadDotEnv(path.join(ROOT, '.env.local'));

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run') || !args.includes('--apply');
const getArgValue = (name) => {
  const inline = args.find((a) => a.startsWith(`${name}=`));
  if (inline) return inline.split('=').slice(1).join('=');
  const index = args.indexOf(name);
  if (index === -1) return null;
  const value = args[index + 1];
  return value && !value.startsWith('--') ? value : null;
};

const SCHEDULE_DAILY_FROM = getArgValue('--schedule-daily-from') || '2026-06-06';
const SCHEDULE_PER_DAY = Number.parseInt(getArgValue('--per-day') || '2', 10);
const SOURCE = getArgValue('--source') || 'drafts';
const INCLUDE_BLOCKED = args.includes('--include-blocked');

if (!/^\d{4}-\d{2}-\d{2}$/.test(SCHEDULE_DAILY_FROM)) {
  console.error('ERROR: --schedule-daily-from must use YYYY-MM-DD format.');
  process.exit(1);
}

if (!Number.isInteger(SCHEDULE_PER_DAY) || SCHEDULE_PER_DAY < 1 || SCHEDULE_PER_DAY > 12) {
  console.error('ERROR: --per-day must be an integer between 1 and 12.');
  process.exit(1);
}

if (!['drafts', 'future-published'].includes(SOURCE)) {
  console.error('ERROR: --source must be either drafts or future-published.');
  process.exit(1);
}

const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'tcjl4afv';
const DATASET = process.env.SANITY_DATASET || 'production';
const API_VERSION = '2024-01-01';
const SANITY_TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;

if (!DRY_RUN && !SANITY_TOKEN) {
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

const redlineChecks = [
  {
    label: 'missing slug',
    test: (doc) => !doc.slug,
  },
  {
    label: 'placeholder/test article',
    test: (doc) => /\u6d4b\u8bd5|\u6587\u7ae0\u6807\u9898|obsidian/i.test(`${doc.title || ''} ${doc.slug || ''}`),
  },
  {
    label: 'medical market direction is blocked',
    test: (doc) => /\bmedical\b|implant/i.test(doc.searchText),
  },
  {
    label: 'FDA/ISO 13485 is blocked',
    test: (doc) => /\bFDA\b|ISO\s*13485/i.test(doc.searchText),
  },
  {
    label: 'old robotics positioning is blocked',
    test: (doc) => /\brobotics\b|\brobotic\b/i.test(doc.searchText),
  },
  {
    label: 'old AI/data-center positioning is blocked',
    test: (doc) => /\bAI\s+(?:server|servers|hardware|infrastructure|data\s+center)\b|\bdata\s+center(?:s)?\b/i.test(doc.searchText),
  },
  {
    label: 'unconfirmed EV high-voltage examples are blocked',
    test: (doc) => /\bbattery\s+pack\b|\bPDU\b|\bBMS\b/i.test(doc.searchText),
  },
  {
    label: 'private partner name is blocked',
    test: (doc) => /\bJ&C\b|J&C \u682a\u5f0f\u4f1a\u793e/.test(doc.searchText),
  },
  {
    label: 'old founding-year/age claim is blocked',
    test: (doc) => /\bSince\s+1990\b|\b1990\b|\b35\s+years\b/i.test(doc.searchText),
  },
  {
    label: 'unscoped prototype timing is blocked',
    test: (doc) => /Prototype\s+3-5\s+days|Rapid prototyping\s*\(3-5 days\)/i.test(doc.searchText),
  },
  {
    label: 'new compound four-week promise is blocked',
    test: (doc) => /new compound from scratch in 4 weeks/i.test(doc.searchText),
  },
];

function hashToUnit(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function scheduledPublishedAt(startDate, index, slug) {
  const date = new Date(`${startDate}T00:00:00.000Z`);
  const dayOffset = Math.floor(index / SCHEDULE_PER_DAY);
  const slot = index % SCHEDULE_PER_DAY;
  date.setUTCDate(date.getUTCDate() + dayOffset);
  const day = date.toISOString().slice(0, 10);
  const window = scheduleWindowForSlot(SCHEDULE_PER_DAY, slot, `${day}:${slug}`);
  const offset = Math.floor(hashToUnit(`${day}:${slot}:${slug}:minute`) * (window.end - window.start));
  date.setUTCHours(0, window.start + offset, 0, 0);
  return date.toISOString();
}

function scheduleWindowForSlot(perDay, slot, seed) {
  if (perDay === 1) {
    const windows = [
      { start: 8 * 60, end: 12 * 60 },
      { start: 13 * 60, end: 17 * 60 },
      { start: 17 * 60, end: 22 * 60 },
    ];
    return windows[Math.floor(hashToUnit(`${seed}:window`) * windows.length)];
  }

  if (perDay === 2) {
    return slot === 0
      ? { start: 8 * 60, end: 17 * 60 }
      : { start: 17 * 60, end: 22 * 60 };
  }

  if (perDay === 3) {
    return [
      { start: 8 * 60, end: 12 * 60 },
      { start: 13 * 60, end: 17 * 60 },
      { start: 17 * 60, end: 22 * 60 },
    ][slot];
  }

  const start = 8 * 60;
  const end = 22 * 60;
  const bucket = Math.floor((end - start) / perDay);
  return {
    start: start + bucket * slot,
    end: slot === perDay - 1 ? end : start + bucket * (slot + 1),
  };
}

function classify(doc) {
  const searchText = `${doc.title || ''}\n${doc.slug || ''}\n${doc.excerpt || ''}\n${doc.content || ''}`;
  const candidate = { ...doc, searchText };
  return redlineChecks.filter((check) => check.test(candidate)).map((check) => check.label);
}

async function main() {
  console.log('===============================================');
  console.log(' RubberQ Sanity Draft Scheduler');
  console.log('===============================================');
  console.log(`Mode:           ${DRY_RUN ? 'DRY RUN (no writes)' : 'APPLY (patches Sanity)'}`);
  console.log(`Project:        ${PROJECT_ID}`);
  console.log(`Dataset:        ${DATASET}`);
  console.log(`Source:         ${SOURCE}`);
  console.log(`Daily schedule: ${SCHEDULE_DAILY_FROM} + ${SCHEDULE_PER_DAY} article(s)/day, random EU/US daytime UTC`);
  console.log(`Blocked docs:   ${INCLUDE_BLOCKED ? 'included by explicit flag' : 'skipped by public redline rules'}`);
  console.log('');

  const query = SOURCE === 'future-published'
    ? `*[_type == "article" && status == "published" && publishedAt > now()]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      content,
      publishedAt,
      status,
      _createdAt,
      _updatedAt
    } | order(publishedAt asc)`
    : `*[_type == "article" && status == "draft"]{
      _id,
      title,
      "slug": slug.current,
      excerpt,
      content,
      publishedAt,
      status,
      _createdAt,
      _updatedAt
    } | order(coalesce(publishedAt, _createdAt) asc)`;

  const docs = await sanity.fetch(query);

  const safeDocs = [];
  const skippedDocs = [];

  for (const doc of docs) {
    const reasons = classify(doc);
    if (reasons.length && !INCLUDE_BLOCKED) {
      skippedDocs.push({ ...doc, reasons });
    } else {
      safeDocs.push({ ...doc, reasons });
    }
  }

  console.log(`Found ${docs.length} ${SOURCE} article(s).`);
  console.log(`Will schedule ${safeDocs.length} article(s).`);
  console.log(`Will skip ${skippedDocs.length} article(s).`);
  console.log('');

  let okCount = 0;
  let errCount = 0;

  for (const [index, doc] of safeDocs.entries()) {
    const nextPublishedAt = scheduledPublishedAt(SCHEDULE_DAILY_FROM, index, doc.slug || doc._id);
    console.log(`Article: ${doc.title}`);
    console.log(`   _id:         ${doc._id}`);
    console.log(`   slug:        ${doc.slug || '(missing)'}`);
    console.log(`   status:      ${doc.status || 'draft'} -> published`);
    console.log(`   publishedAt: ${doc.publishedAt || '(missing)'} -> ${nextPublishedAt}`);

    if (DRY_RUN) {
      console.log('   (dry run - not patched)');
      okCount++;
    } else {
      try {
        await sanity.patch(doc._id).set({
          status: 'published',
          publishedAt: nextPublishedAt,
        }).commit();
        console.log('   patched');
        okCount++;
      } catch (err) {
        console.error(`   ERROR: ${err.message}`);
        errCount++;
      }
    }
    console.log('');
  }

  if (skippedDocs.length) {
    console.log('Skipped article(s):');
    for (const doc of skippedDocs) {
      console.log(`- ${doc.title || '(untitled)'} [${doc.slug || 'no-slug'}]: ${doc.reasons.join('; ')}`);
    }
    console.log('');
  }

  console.log('===============================================');
  console.log(` Summary: ${okCount} ok, ${errCount} error(s), ${skippedDocs.length} skipped`);
  console.log('===============================================');
  process.exit(errCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
