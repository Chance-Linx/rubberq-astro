#!/usr/bin/env python3
"""Read-only checks of local revised articles in the shared production component."""
import argparse, concurrent.futures, hashlib, json, re
from html.parser import HTMLParser
from pathlib import Path
from urllib.request import urlopen
from urllib.error import HTTPError

ROOT=Path(__file__).resolve().parents[1]
BASE=ROOT/'docs/2026-10-21-全站规划落实'
VOID={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
def norm(s): return ' '.join(s.split())
class Doc(HTMLParser):
 def __init__(self,html,body_only=False):
  super().__init__(convert_charrefs=True);self.stack=[];self.body_depth=0 if body_only else None;self.body=[];self.links=[];self.tables=[];self.h1=[];self.title=[];self.scripts=[];self.meta=[];self.canonical=[];self.images=[];self.regions=[];self.cells=[];self.capture=None;self.script=None;self.cell=None;self.anchor=None
  self.time=[];self.datetimes=[];self.feed(html)
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag not in VOID:self.stack.append(tag)
  if 'prose' in a.get('class','').split():self.body_depth=len(self.stack)
  if tag in ('h1','title','time'):self.capture=(tag,[])
  if tag=='time':self.datetimes.append(a.get('datetime'))
  if tag=='script':self.script=(a.get('type'),[])
  if tag=='meta':self.meta.append(a)
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a.get('href'))
  if tag=='img':self.images.append(a)
  if self.body_depth is not None:
   if tag=='table':self.tables.append(a)
   if tag=='div' and a.get('class')=='article-table-scroll':self.regions.append(a)
   if tag in ('td','th'):self.cell=(tag,a,[])
   if tag=='a':self.anchor=(a.get('href'),[])
 def handle_data(self,data):
  if self.capture:self.capture[1].append(data)
  if self.script:self.script[1].append(data)
  if self.body_depth is not None:
   self.body.append(data)
   if self.cell:self.cell[2].append(data)
   if self.anchor:self.anchor[1].append(data)
 def handle_endtag(self,tag):
  if self.capture and self.capture[0]==tag:
   getattr(self,tag).append(norm(''.join(self.capture[1])));self.capture=None
  if tag=='script' and self.script:
   if self.script[0]=='application/ld+json':self.scripts.append(json.loads(''.join(self.script[1])))
   self.script=None
  if tag in ('td','th') and self.cell:
   self.cells.append((self.cell[0],self.cell[1],norm(''.join(self.cell[2]))));self.cell=None
  if tag=='a' and self.anchor:self.links.append((self.anchor[0],norm(''.join(self.anchor[1]))));self.anchor=None
  if self.body_depth and len(self.stack)==self.body_depth:self.body_depth=None
  if tag in self.stack:
   i=len(self.stack)-1-self.stack[::-1].index(tag);self.stack=self.stack[:i]

def get(url):
 try:
  with urlopen(url,timeout=30) as r:return r.status,dict(r.headers),r.read().decode()
 except HTTPError as e:return e.code,dict(e.headers),e.read().decode()

def check(d):
 status,headers,html=get(args.base+d['url']);p=Doc(html);expected=Doc(d['fields']['content'],True)
 schemas=[x for x in p.scripts if x.get('@type')=='BlogPosting']
 source=metadata[d['article_id']]
 checks={
  'http_200':status==200,'h1':p.h1==[d['fields']['title']],
  'title':p.title==[d['fields']['title']+' | RubberQ'],
  'body_text_exact':norm(' '.join(p.body))==norm(' '.join(expected.body)),
  'body_links_exact':p.links==expected.links,'table_cells_exact':p.cells==expected.cells,
  'table_count':len(p.tables)==len(expected.tables),
  'table_regions':len(p.regions)==len(p.tables) and all(x.get('tabindex')=='0' and x.get('role')=='region' and x.get('aria-labelledby')=='article-title' for x in p.regions),
  'description':any(x.get('name')=='description' and x.get('content')==d['fields']['excerpt'] for x in p.meta),
  'canonical':p.canonical==['https://rubberq.com'+d['url']],
  'published_date':p.datetimes==[source['publishedAt']],
  'schema':len(schemas)==1 and schemas[0].get('headline')==d['fields']['title'] and schemas[0].get('datePublished')==source['publishedAt'],
  'no_stale_cover_meta':not any(x.get('property')=='og:image' or x.get('name')=='twitter:image' for x in p.meta) and not any(x.get('image') for x in schemas),
  'no_source_cover_image':not any('cdn.sanity.io/images/' in x.get('src','') for x in p.images),
  'private_noindex':headers.get('X-Robots-Tag',headers.get('x-robots-tag',''))=='noindex, nofollow, noarchive' and any(x.get('name')=='robots' and 'noindex' in x.get('content','') for x in p.meta),
  'no_store':headers.get('Cache-Control',headers.get('cache-control'))=='no-store',
 }
 return {'url':d['url'],'article_id':d['article_id'],'status':status,'checks':checks,'pass':all(checks.values()),'body_table_count':len(p.tables),'body_link_count':len(p.links),'html_sha256':hashlib.sha256(html.encode()).hexdigest()}

parser=argparse.ArgumentParser();parser.add_argument('--base',default='http://127.0.0.1:4398');parser.add_argument('--normal-base',default='http://127.0.0.1:4397');args=parser.parse_args()
assert args.base.startswith('http://127.0.0.1:') and args.normal_base.startswith('http://127.0.0.1:')
manifest=json.loads((BASE/'content-revisions/manifest.json').read_text());metadata={x['_id']:x for x in json.loads((BASE/'evidence/article-metadata-current.json').read_text())['result']}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(check,manifest['drafts']))
isolation=[]
for p in ['/__review','/__review/articles/'+metadata[manifest['drafts'][0]['article_id']]['slug']['current']]:
 status,_,_=get(args.normal_base+p);isolation.append({'path':p,'status':status,'pass':status==404})
status,_,_=get(args.base+'/blog/unknown-local-review-article');isolation.append({'path':'review:/blog/unknown-local-review-article','status':status,'pass':status==404})
before_html=(BASE/'evidence/article-production-before-refactor.html').read_text();before=Doc(before_html)
normal_url=args.normal_base+manifest['drafts'][0]['url'];normal_status,_,normal_html=get(normal_url);normal=Doc(normal_html)
regression_checks={'status':normal_status==200,'body_text_unchanged':norm(' '.join(before.body))==norm(' '.join(normal.body)),'body_links_unchanged':before.links==normal.links,'table_cells_unchanged':before.cells==normal.cells,'title_unchanged':before.title==normal.title,'h1_unchanged':before.h1==normal.h1,'date_text_unchanged':before.time==normal.time,'date_value_unchanged':before.datetimes==normal.datetimes,'canonical_unchanged':before.canonical==normal.canonical,'description_unchanged':[x.get('content') for x in before.meta if x.get('name')=='description']==[x.get('content') for x in normal.meta if x.get('name')=='description'],'no_private_robots':not any(x.get('name')=='robots' for x in normal.meta)}
regression={'scope':'Existing CMS article on ordinary local server before/after shared presentation. Rendering/debug source attributes are not date values. Reviewed cover omission is intentional; no production deployment.','url':normal_url,'before_sha256':hashlib.sha256(before_html.encode()).hexdigest(),'after_sha256':hashlib.sha256(normal_html.encode()).hexdigest(),'checks':regression_checks,'pass':all(regression_checks.values())}
(BASE/'evidence/article-existing-layout-regression.json').write_text(json.dumps(regression,ensure_ascii=False,indent=2)+'\n')
paths=['src/components/blog/ArticlePage.astro','src/layouts/BlogLayout.astro','src/pages/blog/[slug].astro','src/middleware.ts','src/lib/articlePresentation.ts','src/data/article-media.json','tools/article-review/astro.config.mjs','tools/article-review/records.ts','tools/article-review/middleware.ts','tools/article-review/article.astro','tools/article-review/index.astro']
report={'scope':'27 local revised bodies rendered through shared production presentation; not CMS write, publication, topic acceptance or final audit.','results':results,'isolation_checks':isolation,'source_sha256':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in paths},'summary':{'articles':len(results),'passed':sum(r['pass'] for r in results),'tables':sum(r['body_table_count'] for r in results),'body_links':sum(r['body_link_count'] for r in results),'isolation_passed':sum(r['pass'] for r in isolation),'cms_writes':0,'production_deployments':0}}
(BASE/'evidence/article-layout-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report['summary']));
for r in results:
 if not r['pass']:print(r['url'],[k for k,v in r['checks'].items() if not v])
assert all(r['pass'] for r in results+isolation+[regression]),regression_checks
