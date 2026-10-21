#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify provenance/consistency. Does not substitute for the authored semantic read."""
import collections,csv,hashlib,json,re,runpy,subprocess
from pathlib import Path
B=Path(__file__).resolve().parent;R=B.parents[1]
helper=runpy.run_path(str(B/'tools_read_inventory.py'));source=helper['records']();byid={a['_id']:a for a in source}
sourcehash=hashlib.sha256(helper['SOURCE'].read_bytes()).hexdigest();plain=helper['plain'];digest=helper['digest'];norm=lambda x:' '.join(x.lower().split())
registry=json.loads((R/'src/data/acquisition-pages.json').read_text());urls={x['url'] for x in registry}
refs={x['id'] for x in json.loads((B/'reviews/primary-references.json').read_text())['references']}
rows=[]
for file in sorted((B/'reviews').glob('batch-*.json')):
 batch=json.loads(file.read_text());assert batch['source_sha256']==sourcehash;assert batch['full_body_reviews']==len(batch['rows']);assert batch['cms_writes']==0
 rows.extend(batch['rows'])
assert len(rows)==len({x['article_id'] for x in rows})
with (B/'reviews/存量正文审读与处置提案.csv').open(encoding='utf-8-sig',newline='') as f: exported=list(csv.DictReader(f))
assert len(exported)==len(rows)
for item, original in zip(exported,rows):
 assert all(original[k]==v for k,v in item.items())
for x in rows:
 a=byid[x['article_id']];assert x['source_revision']==a['_rev'];assert x['body_sha256']==digest(a['content']);assert x['body_field']=='content'
 assert x['url']=='/blog/'+a['slug']['current'] and x['owner_url']==x['url'];assert norm(x['body_anchor']) in norm(plain(a['content']))
 assert x['commercial_parent'] in urls;assert set(x['primary_reference_ids'])<=refs
 assert x['cms_action']=='none';assert x['proposed_action'] in ['REWRITE_EXISTING','REFERENCE_REWRITE','HOLD_SCOPE','RETAIN_OPTIMIZE']
 assert all(x[k].strip() for k in ['buyer_job','finding','rewrite_requirements','review_scope','owner_status'])
drafts=json.loads((B/'content-revisions/manifest.json').read_text())
assert drafts['cms_writes']==drafts['publications']==0
for d in drafts['drafts']:
 a=byid[d['article_id']];assert d['article_id'] in {x['article_id'] for x in rows};assert d['expected_source_revision']==a['_rev'];assert d['source_body_sha256']==digest(a['content'])
 assert set(d['fields'])=={'title','excerpt','content'};assert d['cms_written'] is False and d['final_review'] is False
 assert d['url']=='/blog/'+a['slug']['current'];content=(B/d['content_file']).read_text();assert content==d['fields']['content'];assert d['content_sha256']==hashlib.sha256(content.encode()).hexdigest()
 assert not re.search(r'<(?:script|style|h1)\b',content,re.I)
 assert not any(p in content.lower() for p in ['global leader','100%','new compound from scratch in 4 weeks','medical grade','zero-delamination','as per your specifications','hnbr-x7','rubberq-7700'])
 for href in re.findall(r'href="([^"]+)"',content):
  if href.startswith('/'):assert href in urls,(d['article_id'],href)
state=json.loads((B/'execution-state.json').read_text());assert state['requirements']['inventory_semantic_ownership']['full_body_reviews_completed']==len(rows);assert state['requirements']['inventory_semantic_ownership']['completed']==0;assert state['final_review']=='not_started'
board=(R/'docs/2026-10-21-线上获客执行/map.html').read_text();embedded=json.loads(re.search(r'<script id="data" type="application/json">(.*?)</script>',board,re.S)[1]);assert embedded['article_reviews']==rows
for js in re.findall(r'<script>(.*?)</script>',board,re.S):subprocess.run(['node','--check','--input-type=commonjs'],input=js,text=True,check=True,capture_output=True)
summary={'saved_source_articles':len(source),'full_body_reviews':len(rows),'action_proposals':dict(collections.Counter(x['proposed_action'] for x in rows)),'local_existing_url_drafts':len(drafts['drafts']),'final_ownership_decisions':0,'topic_ownership_decisions':0,'cms_writes':0,'paid_calls':0,'final_project_audit':'not_started','scope':'Source/hash/revision/anchor/draft/board consistency; authored semantic findings remain proposals until full inventory reconciliation'}
(B/'evidence/semantic-review-checks.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n');print(json.dumps(summary,ensure_ascii=False))
