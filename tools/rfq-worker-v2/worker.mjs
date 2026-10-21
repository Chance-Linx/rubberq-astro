import { normalizeRfqPayload, renderRfqEmail, toD1UpdateArgs } from './rfq-v2-contract.mjs';
import { RfqError, readJson, sha256, validateAttachment, base64 } from './attachment.mjs';
const DEFAULT_ORIGINS=['https://rubberq.com','https://www.rubberq.com','https://rubberq-astro.pages.dev'];
function allowedOrigin(origin,env) {
  if ([...DEFAULT_ORIGINS,...String(env.ALLOWED_ORIGIN||'').split(',').map(s=>s.trim()).filter(Boolean)].includes(origin)) return true;
  try { const u=new URL(origin);return u.protocol==='https:' && u.hostname.endsWith('.rubberq-astro.pages.dev'); } catch { return false; }
}
function json(request,env,body,status=200) {
  const origin=request.headers.get('Origin');const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin'};
  if (allowedOrigin(origin,env)) Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'});
  return new Response(JSON.stringify(body),{status,headers});
}
function context(row) {try{return JSON.parse(row.rfq_context_json||'{}')}catch{return {}}}
async function findSubmission(env,id) {
  return env.DB.prepare("SELECT id, rfq_context_json FROM rfqs WHERE CASE WHEN json_valid(rfq_context_json) THEN json_extract(rfq_context_json,'$.delivery.submissionId') END = ?").bind(id).first();
}
async function insertRfq(env,lead) {
  const d=toD1UpdateArgs(lead);
  const columns=['name','email','company','industry','message','fileLink','pageUrl',...d.columns];
  return env.DB.prepare(`INSERT INTO rfqs (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')})`)
    .bind(lead.name,lead.email,lead.company,lead.industry,lead.message,lead.fileLink,lead.pageUrl,...d.values).run();
}
async function setNotification(env,id,status,providerId='') {
  await env.DB.prepare("UPDATE rfqs SET rfq_context_json=json_set(rfq_context_json,'$.delivery.notificationStatus',?,'$.delivery.providerId',?) WHERE id=?").bind(status,providerId,id).run();
}
/** Administrative recovery function; no public endpoint invokes this function. */
export async function notifyStoredRfq(env,rowId) {
  const row=await env.DB.prepare('SELECT id, rfq_context_json FROM rfqs WHERE id=?').bind(rowId).first();
  if (!row) throw new RfqError('missing_record',404);
  const c=context(row),d=c.delivery;
  if (!d?.notificationPayload) throw new RfqError('missing_notification',409);
  if (d.notificationStatus==='accepted') return {id:d.providerId,alreadyAccepted:true};
  if (!env.RESEND_API_KEY) throw new RfqError('notification_unconfigured',503);
  const message={...d.notificationPayload};
  if (c.attachment?.storageKey) {
    const object=await env.RFQ_ATTACHMENTS?.get(c.attachment.storageKey);
    if (!object) throw new RfqError('missing_attachment',503);
    const bytes=new Uint8Array(await object.arrayBuffer());
    if (await sha256(bytes)!==c.attachment.sha256) throw new RfqError('attachment_integrity_failed',503);
    message.attachments=[{filename:c.attachment.name,content:base64(bytes)}];
  }
  const response=await fetch('https://api.resend.com/emails',{method:'POST',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':'rq-'+d.submissionId},body:JSON.stringify(message)});
  if (!response.ok) throw new RfqError('notification_rejected',502);
  const result=await response.json();
  if (!result?.id) throw new RfqError('notification_invalid_response',502);
  await setNotification(env,row.id,'accepted',result.id);
  return result;
}
function receipt(row) {const d=context(row).delivery;return {ok:true,receiptId:d.submissionId,recordSaved:true,attachmentSaved:!!context(row).attachment?.storageKey,notificationAccepted:d.notificationStatus==='accepted',notificationStatus:d.notificationStatus};}

export default {
 async fetch(request,env) {
  const origin=request.headers.get('Origin')||'';
  if (!allowedOrigin(origin,env)) return json(request,env,{ok:false,errorCode:'origin_not_allowed'},403);
  if (request.method==='OPTIONS') return json(request,env,null,200);
  if (request.method!=='POST') return json(request,env,{ok:false,errorCode:'method_not_allowed'},405);
  try {
    const raw=await readJson(request);
    const id=raw?.submissionId || crypto.randomUUID();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new RfqError('invalid_submission_id');
    const normalized=normalizeRfqPayload(raw,{requestId:id});
    if (!normalized.ok) return json(request,env,{...normalized,errorCode:'validation_failed'},400);
    const lead=normalized.value;
    if (JSON.stringify({...lead,attachment:null}).length>65536) throw new RfqError('fields_too_large',413);
    const file=await validateAttachment(lead.attachment);
    const {sourceTracking,fieldPriority,submittedAt,requestId,rfqContext,attachment,pageUrl,...business}=lead;
    const fingerprint=await sha256(new TextEncoder().encode(JSON.stringify({...business,fileHash:file?.sha256||'',fileName:attachment?.name||'',fileSize:attachment?.size||0})));
    const prior=await findSubmission(env,id);
    if (prior) {
      if (context(prior).delivery.fingerprint!==fingerprint) throw new RfqError('submission_conflict',409);
      return json(request,env,receipt(prior));
    }
    if (file) {
      if (!env.RFQ_ATTACHMENTS) throw new RfqError('attachment_storage_unconfigured',503);
      const key='rfq/'+id;
      const existing=await env.RFQ_ATTACHMENTS.head(key);
      if (existing && existing.customMetadata?.sha256!==file.sha256) throw new RfqError('submission_conflict',409);
      if (!existing) {
        const saved=await env.RFQ_ATTACHMENTS.put(key,file.bytes,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:file.contentType},customMetadata:{sha256:file.sha256}});
        if (!saved) { const concurrent=await env.RFQ_ATTACHMENTS.head(key);if (concurrent?.customMetadata?.sha256!==file.sha256) throw new RfqError('submission_conflict',409); }
      }
      lead.attachment.mimeType=file.contentType;
      lead.rfqContext.attachment={...lead.rfqContext.attachment,mimeType:file.contentType,storageKey:key,sha256:file.sha256};
    }
    const email=renderRfqEmail(lead);
    lead.rfqContext.delivery={submissionId:id,fingerprint,notificationStatus:'pending',providerId:'',notificationPayload:{from:env.FROM_EMAIL||'RubberQ RFQ <contact@rubberq.com>',to:env.TO_EMAIL||'contact@rubberq.com',reply_to:lead.email,...email}};
    let result;
    try { result=await insertRfq(env,lead); }
    catch (error) {
      const concurrent=await findSubmission(env,id);
      if (concurrent) {if(context(concurrent).delivery.fingerprint!==fingerprint)throw new RfqError('submission_conflict',409);return json(request,env,receipt(concurrent));}
      throw error;
    }
    const rowId=result.meta.last_row_id;
    try { await notifyStoredRfq(env,rowId); }
    catch (error) { console.error('RFQ notification pending:',id,error.code||'notification_failed');try{await setNotification(env,rowId,'failed')}catch{console.error('RFQ notification status update failed:',id)} }
    const saved=await findSubmission(env,id);
    return json(request,env,receipt(saved));
  } catch (error) {
    const status=error instanceof RfqError?error.status:500;
    console.error('RFQ request failed:',error.code||'storage_failed',error.message);
    return json(request,env,{ok:false,errorCode:error.code||'storage_failed'},status);
  }
 }
};
