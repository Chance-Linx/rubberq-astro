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
 *   - Frontmatter `status` defaults to "draft" so articles are not published until
 *     manually toggled in Sanity Studio (safe default for review)
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
const SPECIFIC_FILE = args.find((a) => a.startsWith('--file='))?.split('=')[1]
  || (args[args.indexOf('--file') + 1] && !args[args.indexOf('--file') + 1].startsWith('--')
    ? args[args.indexOf('--file') + 1]
    : null);
const FORCE_PUBLISH = args.includes('--force-publish');

console.log('═══════════════════════════════════════════════');
console.log(' RubberQ Article Import to Sanity');
console.log('═══════════════════════════════════════════════');
console.log(`Mode:           ${DRY_RUN ? 'DRY RUN (no writes)' : 'APPLY (uploads to Sanity)'}`);
console.log(`Articles dir:   ${ARTICLES_DIR}`);
console.log(`Project:        ${PROJECT_ID}`);
console.log(`Dataset:        ${DATASET}`);
console.log(`Force publish:  ${FORCE_PUBLISH}`);
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
  const required = ['title', 'slug', 'excerpt', 'category', 'publishedAt'];
  const errors = [];
  for (const key of required) {
    if (!fm[key]) errors.push(`Missing required field: ${key}`);
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

function buildDocument(fm, body) {
  const status = FORCE_PUBLISH ? 'published' : (fm.status || 'draft');
  return {
    _id: `article-${fm.slug}`,
    _type: 'article',
    title: fm.title,
    slug: { _type: 'slug', current: fm.slug },
    excerpt: fm.excerpt,
    content: body,
    publishedAt: fm.publishedAt,
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

  for (const file of files) {
    const fullPath = path.join(ARTICLES_DIR, file);
    const raw = fs.readFileSync(fullPath, 'utf8');

    try {
      const { frontmatter, body } = parseFrontmatter(raw);
      if (!validate(frontmatter, file)) {
        errCount++;
        continue;
      }
      const doc = buildDocument(frontmatter, body);

      console.log(`📄 ${file}`);
      console.log(`   _id:          ${doc._id}`);
      console.log(`   title:        ${doc.title.slice(0, 70)}${doc.title.length > 70 ? '...' : ''}`);
      console.log(`   slug:         ${doc.slug.current}`);
      console.log(`   category:     ${doc.category}`);
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
