#!/usr/bin/env node
/**
 * import-articles-to-sanity.mjs
 *
 * Batch-imports markdown articles from docs/content/articles-v2/ to Sanity CMS.
 *
 * Usage:
 *   # Dry run (parse + validate, don't upload)
 *   node scripts/import-articles-to-sanity.mjs --dry-run
 *
 *   # Real import (uploads to Sanity)
 *   SANITY_API_TOKEN=sk_xxx node scripts/import-articles-to-sanity.mjs --apply
 *
 *   # Import only one file
 *   SANITY_API_TOKEN=sk_xxx node scripts/import-articles-to-sanity.mjs --apply --file 01-compound-chemistry...
 *
 *   # Assign one article per day at deterministic EU/US daytime random times
 *   node scripts/import-articles-to-sanity.mjs --dry-run --schedule-daily-from=2026-06-01
 *
 * Token: Create at https://sanity.io/manage → tcjl4afv → API → Tokens
 * Permissions: "Editor" or "Maintainer" (needs write access to articles).
 *
 * Markdown format:
 *   ---
 *   title: "..."
 *   slug: "..."
 *   excerpt: "..."
 *   category: "..."
 *   tags: ["...", "..."]
 *   publishedAt: "2026-..."
 *   author: "..."
 *   status: "draft" | "published"
 *   ---
 *
 *   {markdown body}
 *
 * Behavior:
 *   - Frontmatter `slug` is treated as Sanity slug.current
 *   - Articles default to status "published"; future `publishedAt` controls when
 *     the Astro site exposes them publicly, matching Leafclock-style scheduling
 *   - Use --draft to force draft imports, or --preserve-status to honor frontmatter status
 *   - If a Sanity document with the same slug already exists, it is UPDATED.
 *     Otherwise a new document is created with _id = "article-{slug}"
 *   - Markdown body (everything after frontmatter) goes into `content` as a string
 */

import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// ── Auto-load env vars from .env and .env.local (no dotenv dep) ──────────
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
    // Strip surrounding quotes if present
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
// Load .env first (lower precedence) then .env.local (higher)
loadDotEnv(path.join(ROOT, '.env'));
loadDotEnv(path.join(ROOT, '.env.local'));

const ARTICLES_DIR = path.join(ROOT, 'docs/content/articles-v2');
const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'tcjl4afv';
const DATASET = process.env.SANITY_DATASET || 'production';
const API_VERSION = '2024-01-01';

// CLI args
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
const SPECIFIC_FILE = args.find((a) => a.startsWith('--file='))?.split('=')[1]
  || (args[args.indexOf('--file') + 1] && !args[args.indexOf('--file') + 1].startsWith('--')
    ? args[args.indexOf('--file') + 1]
    : null);
const FORCE_PUBLISH = args.includes('--force-publish');
const FORCE_DRAFT = args.includes('--draft');
const PRESERVE_STATUS = args.includes('--preserve-status');
const SCHEDULE_DAILY_FROM = getArgValue('--schedule-daily-from');
const SCHEDULE_PER_DAY = Number.parseInt(getArgValue('--per-day') || '2', 10);

if (FORCE_PUBLISH && FORCE_DRAFT) {
  console.error('❌ Use either --force-publish or --draft, not both.');
  process.exit(1);
}

if (SCHEDULE_DAILY_FROM && !/^\d{4}-\d{2}-\d{2}$/.test(SCHEDULE_DAILY_FROM)) {
  console.error('❌ --schedule-daily-from must use YYYY-MM-DD format.');
  process.exit(1);
}

if (!Number.isInteger(SCHEDULE_PER_DAY) || SCHEDULE_PER_DAY < 1 || SCHEDULE_PER_DAY > 12) {
  console.error('❌ --per-day must be an integer between 1 and 12.');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════');
console.log(' RubberQ Article Import to Sanity');
console.log('═══════════════════════════════════════════════');
console.log(`Mode:           ${DRY_RUN ? 'DRY RUN (no writes)' : 'APPLY (uploads to Sanity)'}`);
console.log(`Articles dir:   ${ARTICLES_DIR}`);
console.log(`Project:        ${PROJECT_ID}`);
console.log(`Dataset:        ${DATASET}`);
console.log(`Status mode:    ${FORCE_DRAFT ? 'draft' : PRESERVE_STATUS ? 'frontmatter' : 'published'}`);
console.log('Scheduling:     publishedAt controls public visibility');
if (SCHEDULE_DAILY_FROM) console.log(`Daily schedule: ${SCHEDULE_DAILY_FROM} + ${SCHEDULE_PER_DAY} article(s)/day, random EU/US daytime UTC`);
if (SPECIFIC_FILE) console.log(`Specific file:  ${SPECIFIC_FILE}`);
console.log('');

// Get token
const SANITY_TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;
if (!DRY_RUN && !SANITY_TOKEN) {
  console.error('❌ SANITY_API_TOKEN env var required when using --apply');
  console.error('   Generate at: https://sanity.io/manage → tcjl4afv → API → Tokens');
  process.exit(1);
}

// Sanity client (only used in apply mode)
const sanity = !DRY_RUN
  ? createClient({
      projectId: PROJECT_ID,
      dataset: DATASET,
      apiVersion: API_VERSION,
      token: SANITY_TOKEN,
      useCdn: false,
    })
  : null;

// ── Frontmatter parser (no external deps) ──────────────────────────────────

function parseFrontmatter(rawContent) {
  const match = rawContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) throw new Error('No frontmatter found');

  const [, frontmatterStr, body] = match;
  const fm = {};
  let currentKey = null;
  let inArray = false;
  let arrayBuffer = [];

  for (const line of frontmatterStr.split('\n')) {
    if (!line.trim()) continue;

    // Array item
    if (line.startsWith('  - ') || line.startsWith('  -')) {
      if (currentKey && inArray) {
        arrayBuffer.push(line.replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, ''));
      }
      continue;
    }

    // Close pending array
    if (inArray && currentKey) {
      fm[currentKey] = arrayBuffer;
      inArray = false;
      arrayBuffer = [];
    }

    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, value] = kv;
    currentKey = key;

    if (value.startsWith('[') && value.endsWith(']')) {
      // Inline array
      fm[key] = value.slice(1, -1).split(',').map((s) =>
        s.trim().replace(/^["']|["']$/g, '')
      ).filter(Boolean);
    } else if (value === '' || value === undefined) {
      // Multi-line array follows
      inArray = true;
      arrayBuffer = [];
    } else {
      // Scalar
      fm[key] = value.replace(/^["']|["']$/g, '');
    }
  }
  // Close trailing array
  if (inArray && currentKey) fm[currentKey] = arrayBuffer;

  return { frontmatter: fm, body: body.trim() };
}

// ── Validate parsed article ────────────────────────────────────────────────

function validate(fm, filename) {
  const required = ['title', 'slug', 'excerpt', 'category'];
  const errors = [];
  for (const key of required) {
    if (!fm[key]) errors.push(`Missing required field: ${key}`);
  }
  if (!SCHEDULE_DAILY_FROM && !fm.publishedAt) {
    errors.push('Missing required field: publishedAt');
  }
  if (fm.status && !['draft', 'published', 'archived'].includes(fm.status)) {
    errors.push(`Invalid status: ${fm.status}`);
  }
  if (errors.length) {
    console.error(`❌ ${filename}: ${errors.join('; ')}`);
    return false;
  }
  return true;
}

// ── Build Sanity document ──────────────────────────────────────────────────

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

function buildDocument(fm, body, scheduleIndex) {
  const status = FORCE_PUBLISH
    ? 'published'
    : FORCE_DRAFT
      ? 'draft'
      : PRESERVE_STATUS
        ? (fm.status || 'published')
        : 'published';
  const publishedAt = SCHEDULE_DAILY_FROM
    ? scheduledPublishedAt(SCHEDULE_DAILY_FROM, scheduleIndex, fm.slug)
    : fm.publishedAt;
  return {
    _id: `article-${fm.slug}`,
    _type: 'article',
    title: fm.title,
    slug: { _type: 'slug', current: fm.slug },
    excerpt: fm.excerpt,
    content: body,
    publishedAt,
    author: fm.author || 'RubberQ Engineering Team',
    category: fm.category,
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    status,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.error(`❌ Articles directory not found: ${ARTICLES_DIR}`);
    process.exit(1);
  }

  let files = fs.readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('README'))
    .sort();

  if (SPECIFIC_FILE) {
    files = files.filter((f) => f.includes(SPECIFIC_FILE));
    if (!files.length) {
      console.error(`❌ No file matched filter: ${SPECIFIC_FILE}`);
      process.exit(1);
    }
  }

  console.log(`Found ${files.length} article file(s):`);
  files.forEach((f) => console.log(`  - ${f}`));
  console.log('');

  let okCount = 0;
  let errCount = 0;

  for (const [scheduleIndex, file] of files.entries()) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf8');

    try {
      const { frontmatter, body } = parseFrontmatter(raw);
      if (!validate(frontmatter, file)) {
        errCount++;
        continue;
      }
      const doc = buildDocument(frontmatter, body, scheduleIndex);

      console.log(`📄 ${file}`);
      console.log(`   _id:          ${doc._id}`);
      console.log(`   title:        ${doc.title.slice(0, 70)}${doc.title.length > 70 ? '...' : ''}`);
      console.log(`   slug:         ${doc.slug.current}`);
      console.log(`   category:     ${doc.category}`);
      console.log(`   publishedAt:  ${doc.publishedAt}`);
      console.log(`   tags:         ${doc.tags.join(', ')}`);
      console.log(`   status:       ${doc.status}`);
      console.log(`   body length:  ${doc.content.length} chars (${doc.content.split(/\s+/).length} words)`);

      if (DRY_RUN) {
        console.log('   ⏸  (dry run — not uploaded)');
        okCount++;
      } else {
        // Upsert: createIfNotExists then patch
        try {
          await sanity.createIfNotExists(doc);
          // Always patch to update content if it already exists
          await sanity.patch(doc._id)
            .set({
              title: doc.title,
              slug: doc.slug,
              excerpt: doc.excerpt,
              content: doc.content,
              publishedAt: doc.publishedAt,
              author: doc.author,
              category: doc.category,
              tags: doc.tags,
              status: doc.status,
            })
            .commit();
          console.log(`   ✅ Uploaded`);
          okCount++;
        } catch (err) {
          console.error(`   ❌ Upload error: ${err.message}`);
          errCount++;
        }
      }
      console.log('');
    } catch (err) {
      console.error(`❌ ${file}: ${err.message}`);
      errCount++;
    }
  }

  console.log('═══════════════════════════════════════════════');
  console.log(` Summary: ${okCount} ok, ${errCount} error(s)`);
  console.log('═══════════════════════════════════════════════');
  if (DRY_RUN && okCount > 0) {
    console.log('Next step: re-run with --apply (requires SANITY_API_TOKEN env)');
  }
  process.exit(errCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
