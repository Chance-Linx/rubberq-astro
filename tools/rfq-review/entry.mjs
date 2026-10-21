import worker, {notifyStoredRfq} from '../rfq-worker-v2/worker.mjs';
import {base64} from '../rfq-worker-v2/attachment.mjs';
export default {
 async fetch(request,env,ctx) {
  const url=new URL(request.url);
  if(url.pathname.startsWith('/__local/')){
   if(url.hostname!=='127.0.0.1'||request.headers.get('X-RQ-Local-Test')!=='local-only'||request.method!=='POST')return new Response(null,{status:403});
   const data=await request.json();
   if(url.pathname==='/__local/mail')return fetch('https://local-mail.invalid/state',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
   if(url.pathname==='/__local/sql'){
    const result=await env.DB.prepare(data.sql).bind(...(data.params||[])).all();return Response.json(result);
   }
   if(url.pathname==='/__local/object'){
    if(data.action==='list')return Response.json(await env.RFQ_ATTACHMENTS.list());
    const file=await env.RFQ_ATTACHMENTS.get(data.key);return Response.json(file?{key:file.key,size:file.size,metadata:file.customMetadata,dataBase64:base64(new Uint8Array(await file.arrayBuffer()))}:null);
   }
   if(url.pathname==='/__local/retry'){
    return Response.json(await notifyStoredRfq(env,data.id));
   }
   return new Response(null,{status:404});
  }
  return worker.fetch(request,env,ctx);
 }
};
