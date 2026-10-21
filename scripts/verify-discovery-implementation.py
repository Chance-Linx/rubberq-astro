#!/usr/bin/env python3
"""Read-only local checks for blog discovery, five-locale search and legal-page presentation."""
import argparse, concurrent.futures, hashlib, importlib.util, json
from pathlib import Path
from urllib.parse import quote, urlencode
from urllib.request import urlopen

ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'docs/2026-10-21-全站规划落实'
spec=importlib.util.spec_from_file_location('acquisition_checks',ROOT/'scripts/verify-acquisition-implementation.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
Document=module.Document;norm=module.normalize
class DiscoveryDocument(Document):
 def __init__(self,html):self.articles=[];self.article=None;self.inline_scripts=[];self.inline_script=None;super().__init__(html)
 def handle_starttag(self,tag,attrs):
  super().handle_starttag(tag,attrs);a=dict(attrs)
  if tag=='script':self.inline_script=[]
  if tag=='article':self.article={'attrs':a,'links':[],'text':[]}
  if self.article is not None and tag=='a':self.article['links'].append(a.get('href'))
 def handle_data(self,data):
  super().handle_data(data)
  if self.inline_script is not None:self.inline_script.append(data)
  if self.article is not None:self.article['text'].append(data)
 def handle_endtag(self,tag):
  super().handle_endtag(tag)
  if tag=='script' and self.inline_script is not None:self.inline_scripts.append(''.join(self.inline_script));self.inline_script=None
  if tag=='article' and self.article is not None:self.articles.append(self.article);self.article=None

def get(base,path):
 with urlopen(base+path,timeout=30) as r:return r.status,dict(r.headers),r.read().decode()
def attrs(doc,tag,key,value):return [a for t,a in doc.tags if t==tag and a.get(key)==value]
def read(path):return json.loads(path.read_text())
def local(loc,path):return ('' if loc=='en' else '/'+loc)+path
def strings(value):
 if isinstance(value,str):return [value]
 if isinstance(value,list):return [s for v in value for s in strings(v)]
 if isinstance(value,dict):return [s for v in value.values() for s in strings(v)]
 return []

def metadata_check(item):
 loc,path=item;status,headers,html=get(args.normal,local(loc,path));doc=DiscoveryDocument(html);m=messages[loc];copy=m['acquisition']['pages'][registry[path]['id']]
 name=path[1:];title=copy['title'] if name=='search' else m['metadata'][name]['title'];description=copy['description'] if name=='search' else m['metadata'][name]['description']
 expected_h1=copy['h1'] if name=='search' else m[name+'Page']['title']
 canonical='https://rubberq.com'+local(loc,path);expected_alternates={l:'https://rubberq.com'+local(l,path) for l in messages};expected_alternates['x-default']=expected_alternates['en']
 checks={'status':status==200,'h1':doc.h1==[expected_h1],'title':doc.title==[title],
  'description':[x.get('content') for x in attrs(doc,'meta','name','description')]==[description],
  'canonical':[x.get('href') for x in attrs(doc,'link','rel','canonical')]==[canonical],
  'hreflang':{x.get('hreflang'):x.get('href') for x in attrs(doc,'link','rel','alternate')}==expected_alternates,
  'og_title':[x.get('content') for x in attrs(doc,'meta','property','og:title')]==[title],
  'og_description':[x.get('content') for x in attrs(doc,'meta','property','og:description')]==[description],
  'og_url':[x.get('content') for x in attrs(doc,'meta','property','og:url')]==[canonical],
  'twitter_description':[x.get('content') for x in attrs(doc,'meta','name','twitter:description')]==[description],
  'schema':any(x.get('@type')==('SearchResultsPage' if name=='search' else 'WebPage') and x.get('url')==canonical and x.get('inLanguage')==loc for x in doc.scripts)}
 if name=='search':checks['noindex']=any(x.get('content')=='noindex,follow' for x in attrs(doc,'meta','name','robots'));checks['form_label']=any(a.get('id')=='rq-site-query' and a.get('name')=='q' and a.get('maxlength')=='160' for t,a in doc.tags) and 'rq-site-query' in doc.label_ids
 else:
  checks['legal_source_body_retained']=m[name+'Page']==legal_baseline[loc][name+'Page']
  checks['legal_body_strings_rendered']=all(norm(value) in norm(' '.join(doc.text)) for value in strings(m[name+'Page']))
  checks['localized_title']=loc=='en' or title!='Terms of Service | RubberQ'
 return {'path':local(loc,path),'checks':checks,'pass':all(checks.values()),'html_sha256':hashlib.sha256(html.encode()).hexdigest()}

parser=argparse.ArgumentParser();parser.add_argument('--normal',default='http://127.0.0.1:4397');parser.add_argument('--candidate',default='http://127.0.0.1:4398');args=parser.parse_args();assert all(x.startswith('http://127.0.0.1:') for x in [args.normal,args.candidate])
messages={loc:read(ROOT/f'src/messages/{loc}.json') for loc in ['en','de','ja','es','zh']};registry={p['url']:p for p in read(ROOT/'src/data/acquisition-pages.json')};legal_baseline=read(BASE/'evidence/legal-body-baseline.json')
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:metadata=list(pool.map(metadata_check,[(l,p) for l in messages for p in ['/search','/privacy','/terms']]))
# Traverse candidate list, whose content is an explicit local revision set, not the live CMS corpus.
manifest=read(BASE/'content-revisions/manifest.json');expected_ids={d['article_id'] for d in manifest['drafts']};source={r['_id']:r for r in read(BASE/'evidence/article-metadata-current.json')['result']};blog=[];all_ids=[]
for page in [1,2,3]:
 path='/blog'+('?' + urlencode({'page':page}) if page>1 else '');status,headers,html=get(args.candidate,path);doc=DiscoveryDocument(html);ids=[a['attrs'].get('data-article-id') for a in doc.articles];all_ids+=ids
 schemas=[s for s in doc.scripts if s.get('@type')=='CollectionPage'];checks={'status':status==200,'page_size':len(ids)==(12 if page<3 else 3),'only_expected':set(ids)<=expected_ids,'canonical':[a.get('href') for a in attrs(doc,'link','rel','canonical')]==['https://rubberq.com'+path],'no_source_cover_images':not any('cdn.sanity.io/images/' in a.get('src','') for t,a in doc.tags if t=='img'),'private_noindex':headers.get('X-Robots-Tag',headers.get('x-robots-tag'))=='noindex, nofollow, noarchive','schema_items':len(schemas)==1 and len(schemas[0]['mainEntity']['itemListElement'])==len(ids)}
 blog.append({'path':path,'ids':ids,'checks':checks,'pass':all(checks.values())})
assert len(all_ids)==len(set(all_ids))==27 and set(all_ids)==expected_ids
for category in sorted({r['category'] for r in source.values() if r.get('category')})+['Unknown-category-rq-20261021']:
 path='/blog?'+urlencode({'category':category});_,_,html=get(args.candidate,path);doc=DiscoveryDocument(html);ids=[a['attrs'].get('data-article-id') for a in doc.articles];expected={id for id,r in source.items() if r.get('category')==category};checks={'exact_category_subset':set(ids)==expected,'noindex':any('noindex' in a.get('content','') for a in attrs(doc,'meta','name','robots'))};blog.append({'path':path,'ids':ids,'checks':checks,'pass':all(checks.values())})
# Ordinary blog remains a CMS reader; it must share layout without importing local revisions.
_,normal_headers,normal_html=get(args.normal,'/blog');normal_doc=DiscoveryDocument(normal_html);normal_blog={'path':'/blog','checks':{'pagination':len(normal_doc.articles)<=12,'ordinary_no_private_header':not normal_headers.get('X-Robots-Tag'),'canonical':[a.get('href') for a in attrs(normal_doc,'link','rel','canonical')]==['https://rubberq.com/blog'],'schema':any(s.get('@type')=='CollectionPage' for s in normal_doc.scripts)}};normal_blog['pass']=all(normal_blog['checks'].values())
normal_copy=messages['en']['acquisition']['pages'][registry['/blog']['id']]
normal_blog['checks'].update({'has_public_articles':len(normal_doc.articles)>0,'h1':normal_doc.h1==[normal_copy['h1']],'title':normal_doc.title==[normal_copy['title']],'description':[a.get('content') for a in attrs(normal_doc,'meta','name','description')]==[normal_copy['description']],'og_description':[a.get('content') for a in attrs(normal_doc,'meta','property','og:description')]==[normal_copy['description']]});normal_blog['pass']=all(normal_blog['checks'].values())
search=[]
for loc in messages:
 path=local(loc,'/search')+'?q=FFKM';_,_,html=get(args.candidate,path);doc=DiscoveryDocument(html);links=[h for a in doc.articles for h in a['links']];checks={'localized_ffkm_page':local(loc,'/materials/ffkm') in links,'localized_replacement_page':local(loc,'/products/ffkm-replacement-seals') in links,'revised_english_article':'/blog/high-vacuum-ffkm-seals-plasma-etching-semiconductor' in links,'retained_input':any(a.get('value')=='FFKM' for t,a in doc.tags if a.get('id')=='rq-site-query'),'no_browser_cms_query':'/data/query/production?' not in html};search.append({'path':path,'links':links,'checks':checks,'pass':all(checks.values())})
for query in ['rqzznomatch20261021','<script>alert(1)</script>','"><script>alert(1)</script>','" autofocus onfocus=alert(1) x="','x'*161]:
 path='/search?'+urlencode({'q':query});_,_,html=get(args.candidate,path);doc=DiscoveryDocument(html);inputs=[a for t,a in doc.tags if a.get('id')=='rq-site-query'];checks={'no_results':not doc.articles,'no_injected_script_node':not any('alert(1)' in script for script in doc.inline_scripts),'input_value_roundtrip':len(inputs)==1 and inputs[0].get('value')==query,'no_injected_event_handler':not any(k.lower().startswith('on') for a in inputs for k in a),'accessible_feedback':any(a.get('role')==('alert' if len(query)>160 else 'status') for t,a in doc.tags)};search.append({'path':path,'checks':checks,'pass':all(checks.values())})
for page in [1,2]:
 path='/search?'+urlencode({'q':'rubber','page':page});_,_,html=get(args.candidate,path);doc=DiscoveryDocument(html);links=[h for a in doc.articles for h in a['links']];checks={'full_page':len(links)==12,'query_retained_in_pagination':all('q=rubber' in a.get('href','') for t,a in doc.tags if t=='a' and a.get('rel') in ['prev','next'])};search.append({'path':path,'links':links,'checks':checks,'pass':all(checks.values())})
assert not set(search[-1]['links'])&set(search[-2]['links'])
paths=['src/lib/contentDiscovery.ts','src/components/blog/BlogIndex.astro','src/layouts/BlogLayout.astro','src/pages/blog/index.astro','src/pages/en/blog/index.astro','src/pages/[locale]/search.astro','src/pages/[locale]/privacy.astro','src/pages/[locale]/terms.astro']+[f'src/messages/{loc}.json' for loc in messages]
rows=metadata+blog+search+[normal_blog];report={'scope':'Local SSR body/function/metadata checks only. Legal source bodies retained; operational/legal assertions are separately pending, not legal approval. Candidate articles are local revisions, ordinary blog/search still read CMS.','metadata':metadata,'candidate_blog':blog,'ordinary_blog':normal_blog,'candidate_search':search,'source_sha256':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in paths},'summary':{'checks':len(rows),'passed':sum(r['pass'] for r in rows),'metadata_routes':len(metadata),'candidate_articles_traversed':len(all_ids),'legal_body_fields_preserved':10,'cms_writes':0,'paid_calls':0,'production_deployments':0}}
(BASE/'evidence/discovery-implementation-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report['summary']))
for row in rows:
 if not row['pass']:print(row['path'],[key for key,value in row['checks'].items() if not value])
assert all(row['pass'] for row in rows)
