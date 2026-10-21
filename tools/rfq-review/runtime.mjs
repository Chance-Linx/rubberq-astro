import { Miniflare } from 'miniflare';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
export async function createRfqRuntime({port=0,trace=()=>{},withBucket=true,withEmail=true}={}) {
  const mail={mode:'accept',messages:[],accepted:new Map()};
  const mf=new Miniflare({host:'127.0.0.1',port,modules:true,modulesRoot:root,scriptPath:path.join(root,'tools/rfq-review/entry.mjs'),compatibilityDate:'2025-10-08',
    d1Databases:['DB'],r2Buckets:withBucket?['RFQ_ATTACHMENTS']:[],
    bindings:{RESEND_API_KEY:withEmail?'local-test-key':'',FROM_EMAIL:'RubberQ Local Test <sender@example.invalid>',TO_EMAIL:'receiver@example.invalid',ALLOWED_ORIGIN:'http://127.0.0.1:4398,https://rubberq.com'},
    outboundService:async request=>{
      const url=new URL(request.url);
      if(url.hostname==='local-mail.invalid'){if(request.method==='POST'){const choice=await request.json();if(['accept','reject'].includes(choice.mode))mail.mode=choice.mode;}return Response.json({mode:mail.mode,messages:mail.messages,acceptedCount:mail.accepted.size});}
      if(url.hostname!=='api.resend.com'||url.pathname!=='/emails')throw Error('All external network is blocked in this test runtime');
      const message=await request.json();const key=request.headers.get('Idempotency-Key');mail.messages.push({key,message,mode:mail.mode});
      if(mail.mode==='reject')return new Response(JSON.stringify({message:'Controlled local rejection'}),{status:503});
      const id=mail.accepted.get(key)||'local-mail-'+(mail.accepted.size+1);mail.accepted.set(key,id);
      return new Response(JSON.stringify({id}),{headers:{'Content-Type':'application/json'}});
    }});
  const ready=await mf.ready;trace('runtime_ready');
  async function admin(endpoint,data){
    const response=await fetch(new URL('/__local/'+endpoint,ready),{method:'POST',headers:{'Content-Type':'application/json','X-RQ-Local-Test':'local-only'},body:JSON.stringify(data)});
    if(!response.ok)throw Error('Local admin request failed: '+response.status+' '+await response.text());return response.json();
  }
  const db={prepare(sql){let params=[];const query={bind(...values){params=values;return query},run(){return admin('sql',{sql,params})},all(){return admin('sql',{sql,params})},async first(){const data=await admin('sql',{sql,params});return data.results[0]||null}};return query}};
  const bucket={list(){return admin('object',{action:'list'})},get(key){return admin('object',{key})}};
  await db.prepare('CREATE TABLE rfqs (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,email TEXT,company TEXT,industry TEXT,message TEXT,fileLink TEXT,pageUrl TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP)').run();
  trace('base_schema_ready');
  for(const file of ['2026-05-18-rfq-v2-fields.sql','2026-10-21-rfq-idempotency.sql']){
    const sql=(await fs.readFile(path.join(root,'tools/rfq-worker-v2/migrations',file),'utf8')).replace(/--[^\n]*/g,'');
    for(const statement of sql.split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(statement).run();
  }
  trace('migrations_ready');
  return {mf,db,bucket,mail,admin};
}
