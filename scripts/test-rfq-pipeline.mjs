import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import {createRfqRuntime} from '../tools/rfq-review/runtime.mjs';
const cases=[];const t=await createRfqRuntime();
const pdf=Buffer.from('%PDF-1.4\nLocal RFQ fixture\n%%EOF');
const attachment={name:'试样_図面.pdf',mimeType:'application/pdf',size:pdf.length,dataBase64:pdf.toString('base64')};
const base={name:'Local RFQ',email:'rfq-local@example.invalid',company:'Local test only',message:'Controlled local test',sourceTracking:{sourcePage:'/materials/ffkm',cta:'project-review',attributionMode:'submission_context'}};
const make=(extra={})=>({...base,submissionId:crypto.randomUUID(),...extra});
async function send(payload,options={}){const response=await t.mf.dispatchFetch('https://rubberq.com/api/',{method:'POST',headers:{Origin:options.origin||'https://rubberq.com','Content-Type':'application/json'},body:JSON.stringify(payload)});return {status:response.status,data:await response.json()}}
async function check(name,fn){await fn();cases.push({name,pass:true})}
try{
 await check('contact upload is stored byte-for-byte and sent as an actual attachment',async()=>{
  const payload=make({attachment});const r=await send(payload);assert.equal(r.status,200);assert.equal(r.data.recordSaved,true);assert.equal(r.data.attachmentSaved,true);assert.equal(r.data.notificationAccepted,true);assert.equal(r.data.emailDelivered,undefined);
  const row=await t.db.prepare('SELECT * FROM rfqs WHERE email=?').bind(base.email).first();const c=JSON.parse(row.rfq_context_json);const file=await t.bucket.get(c.attachment.storageKey);assert.equal(file.dataBase64,attachment.dataBase64);assert.equal(file.size,pdf.length);assert.equal(c.attachment.sha256,crypto.createHash('sha256').update(pdf).digest('hex'));
  const mail=t.mail.messages.at(-1).message;assert.equal(mail.attachments[0].content,attachment.dataBase64);assert.equal(mail.attachments[0].filename,attachment.name);assert.equal(JSON.parse(row.source_tracking_json).sourcePage,'/materials/ffkm');assert.equal(c.delivery.notificationStatus,'accepted');
  const before=t.mail.messages.length;const retry=await send(payload);assert.equal(retry.data.receiptId,payload.submissionId);assert.equal(t.mail.messages.length,before);assert.equal((await t.db.prepare('SELECT count(*) AS n FROM rfqs').first()).n,1);
  const contextRetry=await send({...payload,pageUrl:'https://rubberq.com/contact?cta=changed',sourceTracking:{submittedAt:'later'}});assert.equal(contextRetry.data.receiptId,payload.submissionId);assert.equal(t.mail.messages.length,before);
  assert.equal((await send({...payload,message:'Different business request'})).status,409);
 });
 await check('sample and batch inquiries preserve required details and unknown quantity',async()=>{
  for(const kind of ['sample_request','batch_rfq']){const p=make({inquiryType:kind,country:'Local destination',productType:'Seals',selectedProducts:['seals'],quantity:'',annualVolume:'',fileLink:'https://example.invalid/drawing'});assert.equal((await send(p)).data.ok,true)}
  const row=await t.db.prepare("SELECT * FROM rfqs WHERE inquiry_type='sample_request'").first();assert.equal(row.sample_quantity,'');assert.equal(row.fileLink,'https://example.invalid/drawing');
 });
 await check('email rejection preserves the record/file and administrative recovery reads the saved file',async()=>{
  t.mail.mode='reject';const p=make({attachment});const r=await send(p);assert.equal(r.data.ok,true);assert.equal(r.data.notificationAccepted,false);const row=await t.db.prepare('SELECT * FROM rfqs WHERE id=(SELECT MAX(id) FROM rfqs)').first();const c=JSON.parse(row.rfq_context_json);assert.equal(c.delivery.notificationStatus,'failed');assert.equal((await t.bucket.get(c.attachment.storageKey)).dataBase64,attachment.dataBase64);
  t.mail.mode='accept';const recovered=await t.admin('retry',{id:row.id});assert.ok(recovered.id);assert.equal(t.mail.messages.at(-1).message.attachments[0].content,attachment.dataBase64);
  const count=t.mail.messages.length;await t.admin('retry',{id:row.id});assert.equal(t.mail.messages.length,count);
 });
 await check('database failure returns an error and retry reuses the saved file without losing its bytes',async()=>{
  await t.db.prepare("CREATE TRIGGER fail_insert BEFORE INSERT ON rfqs BEGIN SELECT RAISE(ABORT,'local test database failure'); END").run();const p=make({attachment});const r=await send(p);assert.equal(r.status,500);assert.equal(r.data.ok,false);await t.db.prepare('DROP TRIGGER fail_insert').run();assert.equal((await send(p)).data.ok,true);assert.equal((await t.bucket.get('rfq/'+p.submissionId)).dataBase64,attachment.dataBase64);
 });
 await check('concurrent duplicate requests create one row and one notification',async()=>{
  const p=make({attachment});const before=t.mail.messages.length;const results=await Promise.all([send(p),send(p)]);assert.ok(results.every(x=>x.data.ok));assert.equal(t.mail.messages.length,before+1);const row=await t.db.prepare("SELECT count(*) AS n FROM rfqs WHERE json_extract(rfq_context_json,'$.delivery.submissionId')=?").bind(p.submissionId).first();assert.equal(row.n,1);
 });
 await check('invalid origin and invalid payloads never add a record or send mail',async()=>{
  const before=(await t.db.prepare('SELECT count(*) AS n FROM rfqs').first()).n;const mail=t.mail.messages.length;
  assert.equal((await send(make(),{origin:'https://unrelated.example'})).status,403);
  const bad=[make({email:'invalid'}),make({attachment:{...attachment,name:'bad.exe'}}),make({attachment:{...attachment,dataBase64:'not-base64'}}),make({attachment:{...attachment,size:5*1024*1024+1}}),make({attachment:{...attachment,size:pdf.length-1}}),make({attachment:{...attachment,name:'../file.pdf'}}),make({attachment:{...attachment,dataBase64:Buffer.from('not pdf').toString('base64'),size:7}})];for(const p of bad)assert.equal((await send(p)).data.ok,false);
  assert.equal((await t.db.prepare('SELECT count(*) AS n FROM rfqs').first()).n,before);assert.equal(t.mail.messages.length,mail);
 });
 await check('the full advertised 5 MiB PDF boundary is stored and attached intact',async()=>{
  const bytes=Buffer.alloc(5*1024*1024,65);bytes.write('%PDF-1.4\n');const a={...attachment,size:bytes.length,dataBase64:bytes.toString('base64')};const r=await send(make({attachment:a}));assert.equal(r.data.ok,true);const delivered=t.mail.messages.at(-1).message.attachments[0].content;assert.equal(crypto.createHash('sha256').update(Buffer.from(delivered,'base64')).digest('hex'),crypto.createHash('sha256').update(bytes).digest('hex'));
 });
 await check('oversized streaming JSON and malformed JSON are rejected before persistence',async()=>{
  for(const body of ['{bad',JSON.stringify({x:'x'.repeat(8*1024*1024)})]){const r=await t.mf.dispatchFetch('https://rubberq.com/api/',{method:'POST',headers:{Origin:'https://rubberq.com','Content-Type':'application/json'},body});assert.ok([400,413].includes(r.status));}
 });
 const noBucket=await createRfqRuntime({withBucket:false});try{const r=await noBucket.mf.dispatchFetch('https://rubberq.com/api/',{method:'POST',headers:{Origin:'https://rubberq.com','Content-Type':'application/json'},body:JSON.stringify(make({attachment}))});assert.equal(r.status,503);assert.equal((await noBucket.db.prepare('SELECT count(*) AS n FROM rfqs').first()).n,0);cases.push({name:'missing private storage fails closed for a file inquiry',pass:true})}finally{await noBucket.mf.dispose()}
 const report={scope:'Actual local workerd/D1 SQLite/R2 and captured Resend request; no cloud resource, production database or mailbox delivery. Browser form checks recorded separately.',cases,passed:cases.length,localRecords:(await t.db.prepare('SELECT count(*) AS n FROM rfqs').first()).n,simulatedAcceptedNotifications:t.mail.accepted.size,productionSubmissions:0,realEmails:0,paidCalls:0};await fs.writeFile(new URL('../docs/2026-10-21-全站规划落实/evidence/rfq-pipeline-integration.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}finally{await t.mf.dispose()}
