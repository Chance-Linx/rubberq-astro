import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createClient } from '@sanity/client';

// Explicit, revision-conditional text-only releases. Never changes image, URL or date fields.
const args = process.argv.slice(2);
const value = (name) => { const i = args.indexOf(name); assert(i >= 0 && args[i + 1], `Missing ${name}`); return args[i + 1]; };
const bundleFile = path.resolve(value('--bundle'));
const acceptanceFile = path.resolve(value('--acceptance'));
const previewFile = path.resolve(value('--preview'));
const out = path.resolve(value('--out'));
const apply = args.includes('--apply');
const read = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const sha = (text) => createHash('sha256').update(text).digest('hex');
const bundle = read(bundleFile), acceptance = read(acceptanceFile), preview = read(previewFile);
assert(Array.isArray(bundle.drafts) && bundle.drafts.length, 'Empty release');
const ids = bundle.drafts.map(d => d.article_id);
assert.equal(new Set(ids).size, ids.length, 'Duplicate article id');
// Read the existing route policy rather than publishing content that disappears
// from the public article routes. Only the current literal-array syntax is accepted.
const sanitySource = fs.readFileSync(new URL('../src/lib/sanity.ts', import.meta.url), 'utf8');
const policy = sanitySource.match(/const blockedBlogTerms = \[([\s\S]*?)\];/);
assert(policy, 'Cannot locate public article policy');
const blockedTerms = policy[1].split(',').map(s => s.trim()).filter(Boolean).map(expression => {
  assert(/^'[^']*'(?:\s*\+\s*'[^']*')*$/.test(expression), 'Public article policy syntax changed');
  return [...expression.matchAll(/'([^']*)'/g)].map(m => m[1]).join('');
});
for (const draft of bundle.drafts) {
  const fields = draft.fields;
  assert.deepEqual(Object.keys(fields).sort(), ['content', 'excerpt', 'title']);
  for (const key of Object.keys(fields)) assert(typeof fields[key] === 'string' && fields[key].trim(), `Empty ${key}`);
  assert(!/<(?:img|figure)\b/i.test(fields.content), 'Visual work is paused; this release accepts text-only candidates');
  const hash = sha(fields.content);
  const approved = acceptance.articles.find(a => a.id === draft.article_id);
  assert(approved && approved.verdict === 'pass' && approved.candidate_sha256 === hash, 'Missing current parent acceptance');
  const reviewFile = path.resolve(approved.independent_review_file);
  const review = fs.readFileSync(reviewFile, 'utf8');
  assert.equal(sha(review), approved.independent_review_sha256, 'Independent review changed');
  assert(review.includes(hash), 'Independent review does not bind this candidate');
  for (const viewport of ['desktop', 'mobile']) {
    const proof = preview.rows.find(r => r.id === draft.article_id && r.viewport === viewport && r.candidate_sha256 === hash);
    assert(proof && proof.status === 200 && proof.body_match && proof.schema_matches && proof.h1_count === 1 && proof.page_width <= proof.viewport_width, `Missing rendered ${viewport} proof`);
    assert.equal(proof.h1, fields.title); assert.equal(proof.description, fields.excerpt);
    assert.equal(proof.canonical, `https://rubberq.com${draft.url}`);
  }
}
const client = createClient({ projectId: 'tcjl4afv', dataset: 'production', apiVersion: '2024-01-01', useCdn: false,
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_TOKEN });
assert(!apply || client.config().token, 'Missing Sanity write credential');
const before = await client.fetch('*[_id in $ids]', { ids: [...ids, ...ids.map(id => `drafts.${id}`)] });
assert(!before.some(d => d._id.startsWith('drafts.')), 'Unreconciled CMS draft exists');
assert.equal(before.length, ids.length, 'Missing source document');
for (const draft of bundle.drafts) {
  const doc = before.find(d => d._id === draft.article_id);
  assert.equal(doc._rev, draft.expected_source_revision, `Source changed: ${draft.article_id}`);
  assert.equal(`/blog/${encodeURIComponent(doc.slug.current)}`, draft.url);
  assert.equal(doc.status, 'published');
  const publicText = [draft.fields.title, doc.slug.current, draft.fields.excerpt,
    draft.fields.content, doc.category, ...(doc.tags || [])].filter(Boolean).join(' ').toLowerCase();
  assert(!blockedTerms.some(term => publicText.includes(term)), `Candidate would be hidden by the public article policy: ${draft.article_id}`);
  assert(!/<(?:img|figure)\b/i.test(typeof doc.content === 'string' ? doc.content : ''), 'Source has inline media; reconcile without removing assets');
}
fs.mkdirSync(out, { recursive: true });
assert(!fs.existsSync(path.join(out, 'before.json')), 'Release directory already used; inspect receipts before another action');
const save = (name, data) => fs.writeFileSync(path.join(out, name), JSON.stringify(data, null, 2));
save('before.json', before);
save('bundle.json', bundle);
save('acceptance.json', acceptance);
save('review-evidence.json', acceptance.articles.map(a => ({ id: a.id,
  file: a.independent_review_file, sha256: a.independent_review_sha256,
  text: fs.readFileSync(path.resolve(a.independent_review_file), 'utf8') })));
save('preview-checks.json', preview);
save('plan.json', { created_at: new Date().toISOString(), apply, bundleFile, acceptanceFile, previewFile,
  fields: ['title', 'excerpt', 'content'], articles: bundle.drafts.map(d => ({ id: d.article_id, revision: d.expected_source_revision, body_sha256: sha(d.fields.content) })) });
if (!apply) {
  console.log(JSON.stringify({ status: 'validated_dry_run', count: ids.length }));
} else {
  let tx = client.transaction();
  for (const d of bundle.drafts) tx = tx.patch(d.article_id, p => p.ifRevisionId(d.expected_source_revision).set(d.fields));
  try { save('mutation-receipt.json', await tx.commit({ visibility: 'sync' })); }
  catch (error) {
    // An uncertain commit is not retried. Persist state for a read-only reconciliation.
    save('mutation-error.json', { at: new Date().toISOString(), message: String(error.message), retry_performed: false });
    save('after-error.json', await client.fetch('*[_id in $ids]', { ids }));
    throw error;
  }
  const after = await client.fetch('*[_id in $ids]', { ids }); save('after.json', after);
  const checks = [];
  for (const d of bundle.drafts) {
    const a = after.find(x => x._id === d.article_id), b = before.find(x => x._id === d.article_id);
    assert(a);
    for (const key of ['title', 'excerpt', 'content']) assert.equal(a[key], d.fields[key], `Readback differs: ${key}`);
    const protectedFields = doc => Object.fromEntries(Object.entries(doc).filter(([k]) => !['_rev', '_updatedAt', 'title', 'excerpt', 'content'].includes(k)));
    assert.deepEqual(protectedFields(a), protectedFields(b), 'An unrequested field changed');
    checks.push({ id: a._id, source_revision: b._rev, published_revision: a._rev, candidate_sha256: sha(a.content), intended_fields_match: true, all_other_fields_preserved: true });
  }
  save('readback-checks.json', { checked_at: new Date().toISOString(), checks });
  console.log(JSON.stringify({ status: 'published_and_read_back', count: checks.length, out }));
}
