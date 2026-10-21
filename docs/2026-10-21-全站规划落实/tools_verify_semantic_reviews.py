#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify provenance/consistency. Does not substitute for the authored semantic read."""
import collections,csv,hashlib,json,re,runpy,subprocess,html
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[1]
helper=runpy.run_path(str(B/'tools_read_inventory.py'));source=helper['records']();byid={a['_id']:a for a in source}
sourcehash=hashlib.sha256(helper['SOURCE'].read_bytes()).hexdigest();plain=helper['plain'];digest=helper['digest'];norm=lambda x:' '.join(x.lower().split())
registry=json.loads((R/'src/data/acquisition-pages.json').read_text());urls={x['url'] for x in registry}
refs={x['id'] for x in json.loads((B/'reviews/primary-references.json').read_text())['references']}
rows=[]
for file in sorted((B/'reviews').glob('batch-*.json')):
 batch=json.loads(file.read_text());assert batch['source_sha256']==sourcehash;assert batch['full_body_reviews']==len(batch['rows']);assert batch['cms_writes']==0
 assert batch['reviewed_indices']==[min(x['source_index'] for x in batch['rows']),max(x['source_index'] for x in batch['rows'])]
 rows.extend(batch['rows'])
assert len(rows)==len({x['article_id'] for x in rows})
# Chart labels/numbers are part of the reviewed body; independently extract SVG text.
for x in rows:
 content=byid[x['article_id']]['content']
 if isinstance(content,str):
  for svg in re.findall(r'<svg\b.*?</svg>',content,re.S|re.I):
   for value in re.findall(r'<text\b[^>]*>(.*?)</text>',svg,re.S|re.I):
    expected=re.sub(r'\s+','',html.unescape(re.sub(r'<[^>]*>','',value)))
    assert expected in re.sub(r'\s+','',plain(content)),(x['source_index'],expected)

# Reused bodies must be completely identical; template reuse permits only one literal term.
reviewed_indices={x['source_index'] for x in rows}
methods=collections.Counter(x.get('body_read_method','full_saved_text_including_svg') for x in rows)
assert set(methods)<={'full_saved_text_including_svg','canonical_content_identity_reuse','exact_template_body_comparison'}
for x in rows:
 method=x.get('body_read_method','full_saved_text_including_svg');content=source[x['source_index']]['content']
 if method=='canonical_content_identity_reuse':
  ref=x['identical_body_reference_index'];assert ref in reviewed_indices and ref<x['source_index'];assert content==source[ref]['content'];assert digest(content)==digest(source[ref]['content']);assert x['title_and_buyer_job_checked_separately'] is True
 if method=='exact_template_body_comparison':
  ref=x['template_reference_index'];term=x['template_topic_term'];base_term=x['template_reference_term'];assert ref in reviewed_indices and ref<x['source_index'];assert content.count(term)==x['template_literal_occurrences']==4
  normalized=content.replace(term,'__RUBBERQ_TOPIC__');assert normalized==source[ref]['content'].replace(base_term,'__RUBBERQ_TOPIC__');assert hashlib.sha256(normalized.encode()).hexdigest()==x['normalized_template_sha256'];assert x['title_and_buyer_job_checked_separately'] is True

with (B/'reviews/存量正文审读与处置提案.csv').open(encoding='utf-8-sig',newline='') as f: exported=list(csv.DictReader(f))
assert len(exported)==len(rows)
for item, original in zip(exported,rows):
 assert all(original[k]==v for k,v in item.items())
for x in rows:
 a=byid[x['article_id']];assert source[x['source_index']]['_id']==a['_id'];assert x['source_revision']==a['_rev'];assert x['body_sha256']==digest(a['content']);assert x['body_field']=='content';assert x['title']==a['title'] and x['published_at']==a['publishedAt']
 assert x['url']=='/blog/'+a['slug']['current'] and x['owner_url']==x['url'];assert norm(x['body_anchor']) in norm(plain(a['content']))
 assert x['commercial_parent'] in urls;assert set(x['primary_reference_ids'])<=refs
 assert x['cms_action']=='none';assert x['proposed_action'] in ['REWRITE_EXISTING','REFERENCE_REWRITE','HOLD_SCOPE','RETAIN_OPTIMIZE']
 assert all(x[k].strip() for k in ['buyer_job','finding','rewrite_requirements','review_scope','owner_status'])
drafts=json.loads((B/'content-revisions/manifest.json').read_text())
assert drafts['cms_writes']==drafts['publications']==0
valid_draft_link_urls=urls|{d['url'] for d in drafts['drafts']}
for d in drafts['drafts']:
 a=byid[d['article_id']];assert d['article_id'] in {x['article_id'] for x in rows};assert d['expected_source_revision']==a['_rev'];assert d['source_body_sha256']==digest(a['content'])
 assert set(d.get('primary_reference_ids',[]))<=refs
 assert set(d['fields'])=={'title','excerpt','content'};assert d['cms_written'] is False and d['final_review'] is False
 assert d['url']=='/blog/'+a['slug']['current'];content=(B/d['content_file']).read_text();assert content==d['fields']['content'];assert d['content_sha256']==hashlib.sha256(content.encode()).hexdigest()
 assert not re.search(r'<(?:script|style|h1)\b',content,re.I)
 assert not any(p in content.lower() for p in ['global leader','100%','new compound from scratch in 4 weeks','medical grade','zero-delamination','as per your specifications','hnbr-x7','rubberq-7700'])
 for href in re.findall(r'href="([^"]+)"',content):
  if href.startswith('/'):assert href in valid_draft_link_urls,(d['article_id'],href)
state=json.loads((B/'execution-state.json').read_text());assert state['requirements']['content_revision_drafts']['prepared']==len(drafts['drafts']);assert state['requirements']['inventory_semantic_ownership']['full_body_reviews_completed']==len(rows);assert state['final_review']=='not_started'
ownership_file=B/'ownership/topic-owners.json';owners=[]
if ownership_file.exists():
 ownership=json.loads(ownership_file.read_text());owners=ownership['decisions'];topics=json.loads((R/'docs/2026-10-21-线上获客执行/data/topics.json').read_text());topic_byid={t['id']:t for t in topics}
 assert len(owners)==len({o['topic_id'] for o in owners})==len(topics)==63
 assert {o['topic_id'] for o in owners}==set(topic_byid);assert ownership['reviewed_inventory_records']==len(rows)==len(source)==271
 assert state['requirements']['topic_ownership']['completed']==len(owners)
 baseline=json.loads(subprocess.check_output(['git','show',ownership['assignment_baseline_commit']+':src/messages/en.json'],cwd=R))['acquisition']['pages']
 byindex={o['source_index']:o for o in rows};page_byurl={o['url']:o for o in registry}
 for o in owners:
  t=topic_byid[o['topic_id']];assert o['buyer_job']==t['buyer_job'] and o['primary_keyword']==t['primary_keyword'];assert o['decision']=='ASSIGNED' and o['cms_action']=='none'
  assert o['related_articles_are_coverage'] is False and o['production_verified'] is False;assert o['coverage_verified'] is False
  src=o['owner_source']
  if o['owner_kind']=='existing_page_section':
   pg=page_byurl[o['primary_owner_url']];assert src['page_id']==pg['id'];assert digest(baseline[pg['id']])==src['page_message_sha256']
  else:
   a=byindex[src['source_index']];assert o['primary_owner_url']==a['url'];assert src['article_id']==a['article_id'] and src['revision']==a['source_revision'] and src['body_sha256']==a['body_sha256']
  assert o['topics_sharing_primary_url']==[z['topic_id'] for z in owners if z['primary_owner_url']==o['primary_owner_url']]
  assert o['decision_basis'].strip() and o['required_content_updates'].strip()
  for ref in o['related_saved_articles']:
   a=byindex[ref['source_index']];assert ref['article_id']==a['article_id'] and ref['url']==a['url'] and ref['body_sha256']==a['body_sha256']
 with (B/'ownership/话题主URL归属.csv').open(encoding='utf-8-sig',newline='') as f: exported_owners=list(csv.DictReader(f))
 assert len(exported_owners)==len(owners)
 for csvrow,owner in zip(exported_owners,owners):assert all(owner[k]==v for k,v in csvrow.items())

# Integrity checks for the authored cross-inventory decisions; not a semantic audit.
disposition_data=json.loads((B/'ownership/article-dispositions.json').read_text());dispositions=disposition_data['decisions'];db={d['source_index']:d for d in dispositions}
assert len(dispositions)==len(db)==len(source)==271
assert set(db)==set(range(len(source)))
assert state['requirements']['inventory_semantic_ownership']['completed']==len(dispositions)
kept_kinds={'PRIMARY_TOPIC_ARTICLE','SUPPORTING_TECHNICAL_ARTICLE'}
kept={d['source_index']:d for d in dispositions if d['editorial_decision'] in kept_kinds};kept_urls={d['primary_owner_url'] for d in kept.values()}
assert {o['primary_owner_url'] for o in owners if o['owner_kind']=='existing_article'}<=kept_urls
prepared_ids={d['article_id'] for d in drafts['drafts']}
assert prepared_ids<={d['article_id'] for d in kept.values()}
assert disposition_data['summary']['retained_article_local_drafts']==len(prepared_ids)
assert disposition_data['summary']['retained_article_revisions_required']==len(kept)-len(prepared_ids)
for d in kept.values():assert d['revision_state']==('local_draft_prepared' if d['article_id'] in prepared_ids else 'revision_required')
baseline=json.loads(subprocess.check_output(['git','show',disposition_data['baseline_commit']+':src/messages/en.json'],cwd=R))['acquisition']['pages']
for d in dispositions:
 r=rows[d['source_index']]
 for dk,rk in [('article_id','article_id'),('source_revision','source_revision'),('source_url','url'),('source_title','title'),('source_body_sha256','body_sha256'),('source_published_at','published_at'),('buyer_job','buyer_job'),('review_finding','finding'),('content_requirements','rewrite_requirements')]:assert d[dk]==r[rk]
 assert d['decision_status']=='decided' and d['content_implemented'] is False and d['coverage_verified'] is False
 assert d['cms_action']==d['production_action']=='none' and d['decision_reason'].strip()
 assert d['editorial_decision'] in kept_kinds|{'CONSOLIDATE_INTO_PAGE','CONSOLIDATE_INTO_ARTICLE','EXCLUDE_FROM_CURRENT_PLAN'}
 if d['editorial_decision']=='EXCLUDE_FROM_CURRENT_PLAN':assert d['primary_owner_url'] is None and d['owner_source'] is None
 elif d['editorial_decision']=='CONSOLIDATE_INTO_PAGE':
  p=next(x for x in registry if x['url']==d['primary_owner_url']);assert d['owner_source']['page_id']==p['id'];assert digest(baseline[p['id']])==d['owner_source']['page_message_sha256']
 else:
  o=d['owner_source'];target=db[o['source_index']];assert target['source_index'] in kept;assert d['primary_owner_url']==target['source_url'];assert o['article_id']==target['article_id'] and o['revision']==target['source_revision'] and o['body_sha256']==target['source_body_sha256']
  if d['editorial_decision'] in kept_kinds:assert d['primary_owner_url']==d['source_url']
 expected=[x['source_index'] for x in dispositions if x['primary_owner_url']==d['primary_owner_url']] if d['primary_owner_url'] else []
 assert d['sources_sharing_owner']==expected
 assert d['linked_topic_ids']==[o['topic_id'] for o in owners if o['primary_owner_url']==d['primary_owner_url']]
with (B/'ownership/存量文章最终内容分工.csv').open(encoding='utf-8-sig',newline='') as f: csv_decisions=list(csv.DictReader(f))
assert len(csv_decisions)==len(dispositions)
for c,d in zip(csv_decisions,dispositions):assert all((str(d[k])==v if d[k] is not None else v=='') for k,v in c.items())
queue=json.loads((B/'ownership/content-implementation-queue.json').read_text())['targets'];queued={q['target_url']:q for q in queue};assert len(queued)==len(queue)
assert set(queued)=={d['primary_owner_url'] for d in dispositions if d['primary_owner_url']}|{o['primary_owner_url'] for o in owners}
for url,q in queued.items():
 assert q['coverage_verified'] is False
 assert q['contributing_source_indices']==[d['source_index'] for d in dispositions if d['primary_owner_url']==url]
 assert q['topic_ids']==[o['topic_id'] for o in owners if o['primary_owner_url']==url]
 assert {x['source_index'] for x in q['buyer_jobs']}==set(q['contributing_source_indices'])
 assert {x['topic_id'] for x in q['topic_requirements']}==set(q['topic_ids'])
 for x in q['buyer_jobs']:assert x['required_updates']==rows[x['source_index']]['rewrite_requirements']

# Independently parse links and private rendered bodies, preserving original copy.
from html.parser import HTMLParser
class DraftLinks(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.open_anchor=None
 def handle_starttag(self,tag,attrs):
  if tag=='a':
   assert self.open_anchor is None,'nested link';self.open_anchor={'href':dict(attrs).get('href'),'parts':[]}
 def handle_data(self,data):
  if self.open_anchor is not None:self.open_anchor['parts'].append(data)
 def handle_endtag(self,tag):
  if tag=='a':
   assert self.open_anchor is not None;self.links.append({'href':self.open_anchor['href'],'anchor':' '.join(self.open_anchor['parts'])});self.open_anchor=None
network=json.loads((B/'ownership/draft-content-links.json').read_text());draft_byurl={d['url']:d for d in drafts['drafts']};page_byurl={p['url']:p for p in registry};actual_edges=[]
for d in drafts['drafts']:
 parser=DraftLinks();parser.feed(d['fields']['content']);assert parser.open_anchor is None
 for link in parser.links:
  if not link['href'].startswith('/'):continue
  target=draft_byurl.get(link['href']) or page_byurl[link['href']]
  actual_edges.append({'source_article_id':d['article_id'],'source_url':d['url'],'source_content_sha256':d['content_sha256'],'target_url':link['href'],'target_kind':'local_article_draft' if link['href'] in draft_byurl else 'local_page','target_id':target['article_id'] if link['href'] in draft_byurl else target['id'],'anchor':link['anchor'],'implemented_in':'local_body_draft','production_verified':False})
assert network['edges']==actual_edges;assert network['article_count']==len(drafts['drafts']) and network['page_backlinks_implemented'] is False
assert network['article_links']==sum(e['target_kind']=='local_article_draft' for e in actual_edges);assert network['page_links']==sum(e['target_kind']=='local_page' for e in actual_edges)
class VisibleBody(HTMLParser):
 def __init__(self):super().__init__();self.parts=[]
 def handle_data(self,data):self.parts.append(data)
def visible_body(value):
 parser=VisibleBody();parser.feed(value);return norm(' '.join(parser.parts))
previews=json.loads((B/'article-previews/manifest.json').read_text())['articles'];assert len(previews)==len(drafts['drafts']);preview_byurl={p['original_url']:p for p in previews}
for p in previews:
 d=draft_byurl[p['original_url']];assert p['source_content_sha256']==d['content_sha256'];body=(B/'article-previews'/p['file']).read_text();assert hashlib.sha256(body.encode()).hexdigest()==p['preview_sha256']
 article=re.search(r'<article lang="en">(.*?)</article>',body,re.S)[1];assert visible_body(article)==visible_body(d['fields']['content'])
 original=DraftLinks();original.feed(d['fields']['content']);rendered=DraftLinks();rendered.feed(article);assert len(original.links)==len(rendered.links)
 for a,z in zip(original.links,rendered.links):
  expected=preview_byurl[a['href']]['file'] if a['href'] in preview_byurl else 'http://127.0.0.1:4397'+a['href'] if a['href'].startswith('/') else a['href'];assert z['href']==expected and z['anchor']==a['anchor']

board=(R/'docs/2026-10-21-线上获客执行/map.html').read_text();embedded=json.loads(re.search(r'<script id="data" type="application/json">(.*?)</script>',board,re.S)[1]);assert embedded['article_reviews']==rows;assert embedded['implementation']==state;assert embedded['topic_ownership']==owners;assert embedded['article_dispositions']==dispositions
for js in re.findall(r'<script>(.*?)</script>',board,re.S):subprocess.run(['node','--check','--input-type=commonjs'],input=js,text=True,check=True,capture_output=True)
summary={'saved_source_articles':len(source),'full_body_reviews':len(rows),'body_review_methods':dict(methods),'action_proposals':dict(collections.Counter(x['proposed_action'] for x in rows)),'local_existing_url_drafts':len(drafts['drafts']),'final_ownership_decisions':len(dispositions),'article_disposition_counts':dict(collections.Counter(d['editorial_decision'] for d in dispositions)),'content_target_count':len(queue),'retained_article_owners':len(kept),'private_body_previews':len(previews),'draft_article_links':network['article_links'],'draft_page_links':network['page_links'],'topic_ownership_decisions':len(owners),'cms_writes':0,'paid_calls':0,'final_project_audit':'not_started','scope':'Complete saved-body or exact full-body/template comparison provenance, metadata, draft and board consistency; editorial dispositions are decided; content implementation, coverage and public URL actions remain pending'}
(B/'evidence/semantic-review-checks.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n');print(json.dumps(summary,ensure_ascii=False))
