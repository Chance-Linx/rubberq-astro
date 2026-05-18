#!/usr/bin/env node
/**
 * Publishes one reviewed Sanity article per day at a deterministic random
 * daytime slot for Europe / North America.
 *
 * The GitHub Action may run many times per day. This script decides whether
 * today's random slot has passed, then atomically creates a Sanity log document
 * and flips one article from status=draft to status=published.
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
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const PLAN_ONLY = args.includes('--plan');
const NOW_ARG = args.find((arg) => arg.startsWith('--now='))?.split('=')[1];
const DATE_ARG = args.find((arg) => arg.startsWith('--date='))?.split('=')[1];

const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'tcjl4afv';
const DATASET = process.env.SANITY_DATASET || 'production';
const API_VERSION = process.env.SANITY_API_VERSION || '2024-01-01';
const TOKEN = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;
const SITE_URL = process.env.SITE_URL || 'https://rubberq.com';
const SCHEDULE_SALT = process.env.SANITY_DAILY_PUBLISH_SALT || `${PROJECT_ID}:${DATASET}:rubberq`;

const WINDOWS = [
  {
    id: 'eu-morning',
    label: 'Europe business morning',
    startUtcMinute: 8 * 60,
    endUtcMinute: 11 * 60 + 59,
  },
  {
    id: 'eu-us-overlap',
    label: 'Europe / US East overlap',
    startUtcMinute: 13 * 60,
    endUtcMinute: 16 * 60 + 59,
  },
  {
    id: 'north-america-daytime',
    label: 'North America daytime',
    startUtcMinute: 17 * 60,
    endUtcMinute: 21 * 60 + 59,
  },
];

const blockedBlogTerms = [
  'f' + 'da',
  'iso-' + '13485',
  'iso ' + '13485',
  'med' + 'ical',
  'bio' + 'compatibility',
  'usp-class',
  'robot' + 'ic',
  'robot' + 'ics',
  'robot' + 's',
  'ai-server',
  'ai-and-automation',
  'data-center',
  'battery-pack',
  'p' + 'du',
  'b' + 'ms',
  'pharma' + 'ceutical',
  'sterile',
];

function usage() {
  return [
    'Usage:',
    '  node scripts/daily-publish-sanity.mjs --plan',
    '  node scripts/daily-publish-sanity.mjs --dry-run',
    '  node scripts/daily-publish-sanity.mjs --force',
    '',
    'Options:',
    '  --plan          Print today\'s deterministic random schedule only.',
    '  --dry-run       Query candidates and show what would happen, no write.',
    '  --force         Publish one eligible draft now, still one per day.',
    '  --now=<ISO>     Test with a fixed current time.',
    '  --date=<YYYY-MM-DD>  Test or inspect a fixed UTC schedule day.',
  ].join('\n');
}

function fail(message) {
  console.error(`Fatal: ${message}`);
  process.exit(1);
}

function hashToUnit(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function toUtcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function buildUtcDate(dayKey, minuteOfDay) {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const date = new Date(`${dayKey}T00:00:00.000Z`);
  date.setUTCHours(hour, minute, 0, 0);
  return date;
}

function buildSchedule(dayKey) {
  const windowIndex = Math.floor(hashToUnit(`${SCHEDULE_SALT}:${dayKey}:window`) * WINDOWS.length);
  const window = WINDOWS[Math.min(windowIndex, WINDOWS.length - 1)];
  const spanMinutes = window.endUtcMinute - window.startUtcMinute + 1;
  const offset = Math.floor(hashToUnit(`${SCHEDULE_SALT}:${dayKey}:minute`) * spanMinutes);
  const targetMinute = window.startUtcMinute + offset;
  const targetAt = buildUtcDate(dayKey, targetMinute);

  return {
    dayKey,
    targetAt,
    targetAtIso: targetAt.toISOString(),
    windowId: window.id,
    windowLabel: window.label,
    windowUtc: `${formatMinute(window.startUtcMinute)}-${formatMinute(window.endUtcMinute)} UTC`,
  };
}

function formatMinute(minuteOfDay) {
  const hour = String(Math.floor(minuteOfDay / 60)).padStart(2, '0');
  const minute = String(minuteOfDay % 60).padStart(2, '0');
  return `${hour}:${minute}`;
}

function getRunContext() {
  const now = NOW_ARG ? new Date(NOW_ARG) : new Date();
  if (Number.isNaN(now.getTime())) fail(`Invalid --now value: ${NOW_ARG}`);
  const dayKey = DATE_ARG || toUtcDateKey(now);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dayKey)) fail(`Invalid --date value: ${DATE_ARG}`);
  return { now, dayKey, schedule: buildSchedule(dayKey) };
}

function sourceText(post) {
  return [
    post.title,
    post.slug,
    post.excerpt,
    post.content,
    post.category,
    ...(post.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function findBlockedTerm(post) {
  const source = sourceText(post);
  return blockedBlogTerms.find((term) => source.includes(term)) || null;
}

function getMissingFields(post) {
  const missing = [];
  for (const field of ['title', 'slug', 'excerpt', 'content']) {
    if (!post[field]) missing.push(field);
  }
  return missing;
}

function getArticleUrl(slug) {
  return `${SITE_URL.replace(/\/$/, '')}/en/blog/${encodeURIComponent(slug)}`;
}

async function getMarker(client, markerId) {
  return client.fetch('*[_id == $id][0]{_id, dayKey, articleId, slug, publishedAt}', { id: markerId });
}

async function getDraftCandidates(client) {
  return client.fetch(`*[
    _type == "article"
    && status == "draft"
    && !defined(noAutoPublish)
    && !defined(holdPublish)
  ] | order(coalesce(publishedAt, _createdAt) asc)[0...50] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    "slug": slug.current,
    excerpt,
    content,
    publishedAt,
    category,
    tags,
    status
  }`);
}

function pickEligibleCandidate(candidates) {
  const skipped = [];
  for (const post of candidates) {
    const missing = getMissingFields(post);
    if (missing.length) {
      skipped.push({
        _id: post._id,
        slug: post.slug || null,
        title: post.title || null,
        reason: `missing:${missing.join(',')}`,
      });
      continue;
    }

    const blockedTerm = findBlockedTerm(post);
    if (blockedTerm) {
      skipped.push({
        _id: post._id,
        slug: post.slug,
        title: post.title,
        reason: `blocked-term:${blockedTerm}`,
      });
      continue;
    }

    return { post, skipped };
  }

  return { post: null, skipped };
}

async function publishPost(client, post, context, markerId, skippedDrafts) {
  const publishedAt = context.now.toISOString();
  const marker = {
    _id: markerId,
    _type: 'dailyPublishLog',
    dayKey: context.dayKey,
    schedule: {
      targetAt: context.schedule.targetAtIso,
      windowId: context.schedule.windowId,
      windowLabel: context.schedule.windowLabel,
      windowUtc: context.schedule.windowUtc,
    },
    article: { _type: 'reference', _ref: post._id },
    articleId: post._id,
    slug: post.slug,
    title: post.title,
    url: getArticleUrl(post.slug),
    publishedAt,
    source: 'scripts/daily-publish-sanity.mjs',
    skippedDrafts,
    createdAt: publishedAt,
  };

  return client
    .transaction()
    .create(marker)
    .patch(post._id, (patch) => patch.set({
      status: 'published',
      publishedAt,
      autoPublishedAt: publishedAt,
      autoPublishSource: 'daily-random-window',
    }))
    .commit();
}

async function main() {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(usage());
    return;
  }

  const context = getRunContext();
  const markerId = `rubberq-daily-publish-${context.dayKey}`;

  console.log('RubberQ Sanity Daily Publish');
  console.log(`Project:    ${PROJECT_ID}`);
  console.log(`Dataset:    ${DATASET}`);
  console.log(`Mode:       ${PLAN_ONLY ? 'plan' : DRY_RUN ? 'dry-run' : FORCE ? 'force' : 'scheduled'}`);
  console.log(`Now:        ${context.now.toISOString()}`);
  console.log(`Day key:    ${context.dayKey}`);
  console.log(`Target:     ${context.schedule.targetAtIso}`);
  console.log(`Window:     ${context.schedule.windowLabel} (${context.schedule.windowUtc})`);

  if (PLAN_ONLY) return;

  if (!TOKEN) fail('SANITY_API_TOKEN or SANITY_TOKEN is required.');

  const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: API_VERSION,
    token: TOKEN,
    useCdn: false,
  });

  const marker = await getMarker(client, markerId);
  if (marker) {
    console.log(`Skip: ${context.dayKey} already published ${marker.slug || marker.articleId}.`);
    return;
  }

  if (!FORCE && context.now < context.schedule.targetAt) {
    console.log('Skip: today\'s random publishing slot has not arrived yet.');
    return;
  }

  const candidates = await getDraftCandidates(client);
  const { post, skipped } = pickEligibleCandidate(candidates);
  console.log(`Draft candidates checked: ${candidates.length}`);
  if (skipped.length) {
    console.log(`Skipped ineligible drafts: ${skipped.length}`);
    skipped.slice(0, 10).forEach((item) => {
      console.log(`- ${item.slug || item._id}: ${item.reason}`);
    });
  }

  if (!post) {
    console.log('Skip: no eligible draft article found.');
    return;
  }

  console.log(`Selected: ${post.title}`);
  console.log(`Slug:     ${post.slug}`);
  console.log(`URL:      ${getArticleUrl(post.slug)}`);

  if (DRY_RUN) {
    console.log('Dry run: no Sanity mutation was written.');
    return;
  }

  try {
    await publishPost(client, post, context, markerId, skipped.slice(0, 25));
    console.log(`Published: ${post.slug}`);
  } catch (error) {
    if (String(error.message || '').includes('already exists')) {
      console.log(`Skip: ${context.dayKey} was published by another run.`);
      return;
    }
    throw error;
  }
}

main().catch((error) => {
  console.error('Fatal:', error);
  process.exit(1);
});
