import assert from 'node:assert/strict';
import test from 'node:test';
import { pageSearchEntries, articleSearchEntries, publicArticles, searchEntries, paginate, discoveryUrl } from '../src/lib/contentDiscovery.ts';
import en from '../src/messages/en.json' with {type:'json'};
import de from '../src/messages/de.json' with {type:'json'};
import ja from '../src/messages/ja.json' with {type:'json'};
import es from '../src/messages/es.json' with {type:'json'};
import zh from '../src/messages/zh.json' with {type:'json'};
import registry from '../src/data/acquisition-pages.json' with {type:'json'};

const article=(id,extra={})=>({_id:id,title:'A rubber engineering guide',slug:id,excerpt:'Report conditions',publishedAt:'2026-01-01T00:00:00Z',status:'published',...extra});
test('all five search indexes use real localized page titles and cover new acquisition routes',()=>{
  for(const [locale,messages] of Object.entries({en,de,ja,es,zh})){
    const entries=pageSearchEntries(registry,messages.acquisition.pages,locale,'page');
    assert.equal(entries.length,45);
    for(const path of ['/materials/ffkm','/compounds','/industries/humanoid-robotics','/industries/liquid-cooling-energy-storage']){
      const entry=entries.find(e=>e.href===(locale==='en'?'':'/'+locale)+path);
      const spec=registry.find(p=>p.url===path);
      assert.equal(entry.title,messages.acquisition.pages[spec.id].h1);
      assert.equal(entry.description,messages.acquisition.pages[spec.id].description);
    }
    assert.ok(searchEntries(entries,'FFKM').length>0);
    assert.ok(searchEntries(entries,locale==='zh'?'液冷':locale==='ja'?'液冷':'liquid cooling').length>0);
  }
});
test('search distinguishes FKM from FFKM and supports exact CJK substrings',()=>{
  const entries=[{title:'FFKM seals',description:'',searchText:'FFKM seals',href:'/ffkm',category:'page'},{title:'FKM seals',description:'',searchText:'FKM seals',href:'/fkm',category:'page'},{title:'液冷系统密封',description:'',searchText:'液冷系统密封',href:'/cooling',category:'page'}];
  assert.deepEqual(searchEntries(entries,'fkm').map(e=>e.href),['/fkm']);
  assert.deepEqual(searchEntries(entries,'ＦＦＫＭ').map(e=>e.href),['/ffkm']);
  assert.deepEqual(searchEntries(entries,'液冷').map(e=>e.href),['/cooling']);
  assert.deepEqual(searchEntries(entries,'no_such_term'),[]);
});
test('article indexes exclude draft, archived, future and invalid dates',()=>{
  const posts=[article('ready'),article('draft',{status:'draft'}),article('archive',{status:'archived'}),article('future',{publishedAt:'2099-01-01'}),article('invalid',{publishedAt:'invalid'})];
  assert.deepEqual(publicArticles(posts).map(p=>p._id),['ready']);
  assert.deepEqual(articleSearchEntries(posts,'article').map(e=>e.href),['/blog/ready']);
});
test('pagination traverses each entry once and query URLs preserve filters safely',()=>{
  const entries=Array.from({length:27},(_,i)=>i);const pages=[1,2,3].flatMap(page=>paginate(entries,String(page)).items);
  assert.deepEqual(pages,entries);assert.equal(paginate(entries,'999').page,3);
  for(const raw of ['0','-1','1e2','NaN','9007199254740993'])assert.equal(paginate(entries,raw).page,1);
  const url=new URL(discoveryUrl('/de/search',{query:'FKM & Öl',page:2}),'https://rubberq.com');
  assert.equal(url.searchParams.get('q'),'FKM & Öl');assert.equal(url.searchParams.get('page'),'2');
  assert.equal(paginate([],null).total,0);
});
