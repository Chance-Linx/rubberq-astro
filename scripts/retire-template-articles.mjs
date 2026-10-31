#!/usr/bin/env node
/**
 * 2026-10-31 template-article retirement.
 * Archives "Engineering Selection" template articles that carry unsupported
 * performance tables. Live URLs are 301-redirected by src/middleware.ts
 * (src/data/retired-article-redirects.json) to the owner pages fixed in the
 * 10-21 disposition table; queued items never went live.
 *
 *   node scripts/retire-template-articles.mjs --batch queued            # dry run
 *   node scripts/retire-template-articles.mjs --batch queued --apply
 *   node scripts/retire-template-articles.mjs --batch live --apply       # only after the redirect deploy
 *
 * Each patch is conditional on the document revision read in the same run.
 * A JSON backup of the prior status/_rev is written to docs/2026-10-31-模板文章清理/.
 */
import { createClient } from '@sanity/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const f of ['.env', '.env.local']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  for (const raw of fs.readFileSync(p, 'utf-8').split('\n')) {
    const line = raw.trim(); if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('='); if (eq === -1) continue;
    const k = line.slice(0, eq).trim(); let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const batch = args[args.indexOf('--batch') + 1];
if (!['queued', 'live'].includes(batch)) { console.error('--batch queued|live required'); process.exit(1); }
const token = process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN;
if (APPLY && !token) { console.error('SANITY_API_TOKEN required'); process.exit(1); }
const sanity = createClient({ projectId: 'tcjl4afv', dataset: 'production', apiVersion: '2024-01-01', token, useCdn: false });

const ids = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/retire-template-articles.ids.json'), 'utf-8'))[batch];
const docs = await sanity.fetch('*[_id in $ids]{_id,_rev,status,publishedAt,"slug":slug.current,"tmpl":content match "*Plasma Radical Weight Loss*" || content match "*Flagship Engineering*"}', { ids: ids.map((x) => x[0]) });
const byId = new Map(docs.map((d) => [d._id, d]));
const now = Date.now();
let problems = 0;
for (const [id, slug] of ids) {
  const d = byId.get(id);
  if (!d) { console.log(`MISSING ${id}`); problems++; continue; }
  const queued = new Date(d.publishedAt).getTime() > now;
  if (d.slug !== slug) { console.log(`SLUG MISMATCH ${id} ${d.slug}`); problems++; }
  if (batch === 'queued' && !queued) { console.log(`NOT QUEUED ${slug}`); problems++; }
  if (batch === 'live' && queued) { console.log(`NOT LIVE ${slug}`); problems++; }
}
console.log(`batch=${batch} expected=${ids.length} found=${docs.length} problems=${problems} mode=${APPLY ? 'APPLY' : 'DRY'}`);
if (problems) process.exit(2);
if (!APPLY) { for (const d of docs) console.log(`- ${d.status}\t${d.publishedAt}\t${d.slug}`); process.exit(0); }

const outDir = path.join(ROOT, 'docs/2026-10-31-模板文章清理');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, `backup-${batch}-${Date.now()}.json`), JSON.stringify(docs, null, 2));
let ok = 0;
for (const d of docs) {
  if (d.status === 'archived') { ok++; continue; }
  let done = false;
  for (let attempt = 1; attempt <= 5 && !done; attempt++) {
    try {
      await sanity.patch(d._id).ifRevisionId(d._rev).set({ status: 'archived' }).commit();
      done = true;
    } catch (e) {
      const cur = await sanity.fetch('*[_id==$id][0]{status}', { id: d._id }).catch(() => null);
      if (cur?.status === 'archived') { done = true; break; }
      console.log(`retry ${attempt} ${d.slug}: ${e.code || e.statusCode || e.message}`);
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  if (done) ok++; else console.log(`FAILED ${d.slug}`);
}
const after = await sanity.fetch('*[_id in $ids]{_id,status}', { ids: docs.map((d) => d._id) });
const archived = after.filter((d) => d.status === 'archived').length;
console.log(`patched=${ok} readback_archived=${archived}/${docs.length}`);
fs.writeFileSync(path.join(outDir, `readback-${batch}.json`), JSON.stringify(after, null, 2));
if (archived !== docs.length) process.exit(3);
