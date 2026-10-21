import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { collectSourceTracking, trackGaEvent } from '../src/lib/inquiryTracking.ts';
import { normalizeRfqPayload, renderRfqEmail, toD1ColumnValues } from '../tools/rfq-worker-v2/rfq-v2-contract.mjs';
const source=fs.readFileSync(new URL('../src/layouts/BaseLayout.astro',import.meta.url),'utf8');
const script=source.slice(source.indexOf('      (function () {'),source.indexOf('      })();')+'      })();'.length);
function storage(initial={},blocked=false){const data=new Map(Object.entries(initial));return {data,getItem(key){if(blocked)throw Error('blocked');return data.get(key)??null},setItem(key,value){if(blocked)throw Error('blocked');data.set(key,value)},removeItem(key){if(blocked)throw Error('blocked');data.delete(key)}}}
function browser({choice,blocked=false}={}){
 const local=storage(choice===undefined?{}:{'rubberq-cookie-preferences':typeof choice==='string'?choice:JSON.stringify({analytics:choice})},blocked),session=storage({},blocked),scripts=[],events={},cookies=[];
 const window={localStorage:local,sessionStorage:session,location:new URL('https://rubberq.com/materials/ffkm?utm_source=search&email=not-for-analytics'),addEventListener(name,callback){(events[name]??=[]).push(callback)}};
 const document={referrer:'https://search.example/results?q=private',head:{appendChild(s){scripts.push(s)}},createElement(){return {}},get cookie(){return '_ga=old; _ga_LOCAL=old; essential=keep'},set cookie(v){cookies.push(v)}};
 vm.runInNewContext(script,{window,document,gaMeasurementId:'G-LOCAL',URL});
 return {window,document,local,session,scripts,events,cookies,choose(value){events['rubberq-cookie-consent-updated'][0]({detail:{analytics:value}})}};
}
test('no choice, invalid data and denied analytics do not load Google or retain first-touch storage',()=>{
 for(const choice of [undefined,false,'{bad','{"analytics":"yes"}']){const b=browser({choice});assert.equal(b.scripts.length,0);assert.equal(b.window['ga-disable-G-LOCAL'],true);assert.equal(b.session.data.size,0);assert.equal(typeof b.window.gtag,'undefined')}
});
test('opt-in loads once, uses clean analytics URLs and preserves the consented entry record',()=>{
 const b=browser({choice:true});assert.equal(b.scripts.length,1);assert.equal(b.window['ga-disable-G-LOCAL'],false);
 const config=Array.from(b.window.dataLayer.find(a=>a[0]==='config'))[2];assert.equal(config.page_location,'https://rubberq.com/materials/ffkm');assert.equal(config.page_referrer,'https://search.example/results');assert.equal(config.allow_google_signals,false);
 assert.equal(b.session.getItem('rubberq-first-touch-url'),b.window.location.href);b.choose(true);assert.equal(b.scripts.length,1);
});
test('withdrawal stops event queueing, clears optional records and deletes only analytics cookies',()=>{
 const b=browser({choice:true});b.choose(false);assert.equal(b.window['ga-disable-G-LOCAL'],true);assert.equal(b.session.data.size,0);
 const count=b.window.dataLayer.length;b.window.gtag('event','must_not_queue');assert.equal(b.window.dataLayer.length,count);
 assert.ok(b.cookies.some(v=>v.startsWith('_ga=;')));assert.ok(b.cookies.some(v=>v.startsWith('_ga_LOCAL=;')));assert.ok(!b.cookies.some(v=>v.startsWith('essential=')));
 b.choose(true);assert.equal(b.scripts.length,1);b.window.gtag('event','new_choice');assert.equal(b.window.dataLayer.at(-1)[1],'new_choice');
});
test('a storage change in another tab applies the latest denied choice',()=>{
 const b=browser({choice:true});b.local.setItem('rubberq-cookie-preferences','{"analytics":false}');b.events.storage[0]({key:'rubberq-cookie-preferences'});assert.equal(b.window['ga-disable-G-LOCAL'],true);
});
test('blocked browser storage cannot crash the loader',()=>{const b=browser({blocked:true});assert.equal(b.scripts.length,0);b.choose(true);assert.equal(b.scripts.length,1);b.choose(false);assert.equal(b.window['ga-disable-G-LOCAL'],true)});
function inquiryContext(choice,referrer,fn,blocked=false){const prior={window:globalThis.window,document:globalThis.document};globalThis.window={localStorage:storage(choice===undefined?{}:{'rubberq-cookie-preferences':JSON.stringify({analytics:choice})},blocked),sessionStorage:storage({},blocked)};globalThis.document={referrer};try{return fn(globalThis.window)}finally{if(prior.window===undefined)delete globalThis.window;else globalThis.window=prior.window;if(prior.document===undefined)delete globalThis.document;else globalThis.document=prior.document}}
test('an inquiry retains current source/CTA without writing optional storage when analytics is denied',()=>{
 inquiryContext(false,'https://rubberq.com/blog/guide',w=>{const p=collectSourceTracking('https://rubberq.com/contact?utm_source=search&source=%2Fmaterials%2Fffkm&cta=project-review');assert.equal(p.sourcePage,'/materials/ffkm');assert.equal(p.cta,'project-review');assert.equal(p.utmSource,'search');assert.equal(p.attributionMode,'submission_context');assert.equal(p.firstTouchUrl,'');assert.equal(w.sessionStorage.data.size,0)});
});
test('direct article links retain a same-site referring page; external referral is not invented as a source page',()=>{
 inquiryContext(undefined,'https://rubberq.com/blog/guide',()=>assert.equal(collectSourceTracking('https://rubberq.com/contact').sourcePage,'/blog/guide'));
 inquiryContext(undefined,'https://external.example/path',()=>assert.equal(collectSourceTracking('https://rubberq.com/contact?source=https://bad.example').sourcePage,''));
});
test('consented entry attribution is preserved and blocked storage still allows an inquiry',()=>{
 inquiryContext(true,'https://search.example/',w=>{w.sessionStorage.setItem('rubberq-first-touch-url','https://rubberq.com/compounds');assert.equal(collectSourceTracking('https://rubberq.com/contact').firstTouchUrl,'https://rubberq.com/compounds')});
 inquiryContext(undefined,'',()=>assert.equal(collectSourceTracking('https://rubberq.com/contact').attributionMode,'submission_context'),true);
});
test('source context survives the existing Worker/D1 JSON contract and appears in the notification body',()=>{
 const sourceTracking={sourcePage:'/materials/ffkm',cta:'project-review',attributionMode:'submission_context'};
 const result=normalizeRfqPayload({name:'Local test',email:'local@example.invalid',message:'Local verification',sourceTracking});assert.equal(result.ok,true);assert.deepEqual(result.value.sourceTracking,sourceTracking);assert.deepEqual(JSON.parse(toD1ColumnValues(result.value).source_tracking_json),sourceTracking);const email=renderRfqEmail(result.value);assert.match(email.text,/Source page: \/materials\/ffkm/);assert.match(email.text,/CTA: project-review/);
});
