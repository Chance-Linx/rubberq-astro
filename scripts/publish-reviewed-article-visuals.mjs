import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createClient} from '@sanity/client';
import {withoutSanityAssetUrls} from '../src/lib/articleVisuals.ts';
const dir=path.resolve(process.argv[2]);const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8'));const save=(n,v)=>fs.writeFileSync(path.join(dir,n),JSON.stringify(v,null,2));
const sha=x=>createHash('sha256').update(x).digest('hex');const plan=read('visual-publication-plan.json'),preview=read('visual-preview-checks.json'),review=read('visual-parent-acceptance.json');
assert.equal(preview.plan_sha256,sha(fs.readFileSync(path.join(dir,'visual-publication-plan.json'))));assert.equal(review.plan_sha256,preview.plan_sha256);assert(review.approved===true);assert(preview.checks.length===2 && preview.checks.every(x=>x.status===200&&x.body_match&&x.card_loaded&&x.card_fit==='contain'));
assert.equal(read('visual-strict-public.json').valid,true);
assert.deepEqual(Object.keys(plan.fields).sort(),['articleVisuals','content','coverImage']);
const clean=fs.readFileSync(path.join(dir,'candidate.html'),'utf8');assert.equal(sha(clean),plan.clean_text_sha256);assert.equal(plan.fields.content.replace(/\n<!-- rubberq-visual:[\w-]+:start -->[\s\S]*?<!-- rubberq-visual:[\w-]+:end -->/g,''),clean);
assert(!fs.existsSync(path.join(dir,'visual-mutation-started.json')),'Previous write attempt must be reconciled before rerunning');
const c=createClient({projectId:'tcjl4afv',dataset:'production',apiVersion:'2024-01-01',useCdn:false,token:process.env.SANITY_API_TOKEN||process.env.SANITY_TOKEN});assert(c.config().token);
const policySource=fs.readFileSync(new URL('../src/lib/sanity.ts',import.meta.url),'utf8');
const policy=policySource.match(/const blockedBlogTerms = \[([\s\S]*?)\];/);assert(policy);
const terms=policy[1].split(',').map(x=>x.trim()).filter(Boolean).map(expression=>{assert(/^'[^']*'(?:\s*\+\s*'[^']*')*$/.test(expression));return [...expression.matchAll(/'([^']*)'/g)].map(m=>m[1]).join('');});
assert(!terms.some(term=>withoutSanityAssetUrls(plan.fields.content.toLowerCase()).includes(term)),'Image markup would violate public editorial policy');
const docs=await c.fetch('*[_id in $ids]',{ids:[plan.article_id,`drafts.${plan.article_id}`]});assert.equal(docs.length,1);const before=docs[0];assert.equal(before._rev,plan.expected_source_revision);assert.equal(before.content,clean);assert.equal(before.status,'published');save('visual-before.json',before);
for(const v of plan.fields.articleVisuals){const receipt=read('visual-upload-receipts.json')[v.id];assert.equal(receipt.asset_id,v.asset._ref);assert(!receipt.uncertain);}
save('visual-mutation-started.json',{at:new Date().toISOString(),revision:before._rev});
try {save('visual-mutation-receipt.json',await c.patch(before._id).ifRevisionId(before._rev).set(plan.fields).commit({visibility:'sync'}));}
catch(e){save('visual-mutation-error.json',{message:e.message,retry_performed:false});save('visual-after-error.json',await c.getDocument(before._id));throw e;}
const after=await c.getDocument(before._id);save('visual-after.json',after);
for(const k of Object.keys(plan.fields))assert.deepEqual(after[k],plan.fields[k]);
const protectedFields=d=>Object.fromEntries(Object.entries(d).filter(([k])=>!['_rev','_updatedAt',...Object.keys(plan.fields)].includes(k)));
assert.deepEqual(protectedFields(before),protectedFields(after));save('visual-readback-checks.json',{passed:true,checked_at:new Date().toISOString(),revision:after._rev,text_preserved:true,all_other_fields_preserved:true,fields:Object.keys(plan.fields)});console.log(JSON.stringify({published:before._id,revision:after._rev,images:after.articleVisuals.length}));
