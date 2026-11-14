import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createClient } from '@sanity/client';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
const dir=path.resolve(process.argv[2]);
const read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8'));
const save=(f,v)=>fs.writeFileSync(path.join(dir,f),JSON.stringify(v,null,2));
const sha=(v,algorithm='sha256')=>createHash(algorithm).update(v).digest('hex');
const gate=JSON.parse(fs.readFileSync(path.resolve(dir,'../../text-audit/text-gate.json'),'utf8'));assert(gate.approved===true&&gate.images_may_resume===true,'All-article text gate not passed');
const m=read('visuals.json'), source=read('visual-source.json');
const text=fs.readFileSync(path.join(dir,'candidate.html'),'utf8');
assert.equal(sha(text),m.article_sha256);
assert.equal(source.content,text);
const client=createClient({projectId:'tcjl4afv',dataset:'production',apiVersion:'2024-01-01',useCdn:false,token:process.env.SANITY_API_TOKEN||process.env.SANITY_TOKEN});
assert(client.config().token);
const docs=await client.fetch('*[_id in $ids]',{ids:[source._id,`drafts.${source._id}`]});
assert.equal(docs.length,1,'Draft or missing source');assert.equal(docs[0]._rev,source._rev);
let receipts=fs.existsSync(path.join(dir,'visual-upload-receipts.json'))?read('visual-upload-receipts.json'):{};
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
let content=text;const visuals=[];
for(const im of m.images){
 assert.match(im.id,/^[a-z0-9][a-z0-9-]*$/);assert.equal(im.status,'approved');assert(im.review_context_sha256);
 assert(['visual','factual','watermark','social'].every(k=>im.review[k]===true));
 assert.equal(content.split(im.anchor).length,2,'Anchor not unique');
 const bytes=fs.readFileSync(path.join(dir,im.asset_path));assert.equal(sha(bytes),im.asset_sha256);
 // Reconcile remote content hash before any upload; never repeat an uncertain write blindly.
 const digest=sha(bytes,'sha1');
 let asset=await client.fetch('*[_type == "sanity.imageAsset" && sha1hash == $hash][0]',{hash:digest});
 if(!asset){
  if(receipts[im.id]?.uncertain) throw new Error('Uncertain upload requires explicit reconciliation');
  receipts[im.id]={sha256:im.asset_sha256,uncertain:true,started_at:new Date().toISOString()};save('visual-upload-receipts.json',receipts);
  asset=await client.assets.upload('image',bytes,{filename:path.basename(im.asset_path),contentType:'image/webp'});
 }
 assert.equal(asset.sha1hash,digest);assert.equal(asset.metadata.dimensions.width,im.width);assert.equal(asset.metadata.dimensions.height,im.height);
 const publicUrl=asset.url+'?fm=webp&q=100';
 const response=await fetch(publicUrl);assert.equal(response.status,200);assert.match(response.headers.get('content-type'),/^image\/webp/);assert(!/noindex|noimageindex/i.test(response.headers.get('x-robots-tag')||''));
 const served=Buffer.from(await response.arrayBuffer());fs.writeFileSync(path.join(dir,'assets',im.id+'-cdn.webp'),served);
 const servedSha=sha(served);
 receipts[im.id]={sha256:im.asset_sha256,asset_id:asset._id,url:publicUrl,served_sha256:servedSha,content_type:response.headers.get('content-type'),x_robots_tag:response.headers.get('x-robots-tag'),uncertain:false,verified_at:new Date().toISOString()};save('visual-upload-receipts.json',receipts);
 im.public_url=publicUrl;
 visuals.push({_key:im.id,id:im.id,alt:im.alt,width:im.width,height:im.height,asset:{_type:'reference',_ref:asset._id}});
 const block=`\n<!-- rubberq-visual:${im.id}:start -->\n<figure data-visual-id="${im.id}"><a href="${escape(publicUrl)}" aria-label="${escape('View full-size image: '+im.alt)}"><img src="${escape(publicUrl)}" alt="${escape(im.alt)}" width="${im.width}" height="${im.height}" loading="lazy" decoding="async" style="width:100%;height:auto"></a></figure>\n<!-- rubberq-visual:${im.id}:end -->`;
 content=content.replace(im.anchor,im.anchor+block);
}
assert.equal(content.replace(/\n<!-- rubberq-visual:[\w-]+:start -->[\s\S]*?<!-- rubberq-visual:[\w-]+:end -->/g,''),text);
const selected=visuals.find(im=>im.id===m.card_image.image_id);assert(selected);
const fields={content,coverImage:{_type:'image',asset:selected.asset,alt:selected.alt,preserveAspectRatio:true},articleVisuals:visuals};
m.card_image.public_url=m.images.find(im=>im.id===m.card_image.image_id).public_url;
save('visuals.json',m);
const validation=JSON.parse(execFileSync('python3',[path.join(homedir(),'.agents/skills/ggs-article-visuals/scripts/visual_assets.py'),'validate','--manifest',path.join(dir,'visuals.json'),'--strict'],{encoding:'utf8'}));assert(validation.valid);save('visual-strict-public.json',validation);
save('visual-publication-plan.json',{article_id:source._id,expected_source_revision:source._rev,clean_text_sha256:sha(text),fields});
fs.writeFileSync(path.join(dir,'candidate-public-illustrated.html'),content);
save('visual-review-bundle.json',{drafts:[{article_id:source._id,expected_source_revision:source._rev,url:'/blog/'+source.slug.current,fields:{title:source.title,excerpt:source.excerpt,...fields}}],sources:[source]});
console.log(JSON.stringify({prepared:source._id,images:visuals.length,public_urls_verified:true,cms_written:false}));
