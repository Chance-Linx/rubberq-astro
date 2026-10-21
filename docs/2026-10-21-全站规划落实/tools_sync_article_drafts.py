#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sync local HTML into the bounded draft bundle and extract actual internal links."""
from pathlib import Path
from html.parser import HTMLParser
import json,hashlib
B=Path(__file__).resolve().parent;R=B.parents[1]
class Body(HTMLParser):
 def __init__(self):super().__init__();self.text=[];self.links=[];self.anchor=None
 def handle_starttag(self,tag,attrs):
  if tag=='a':
   assert self.anchor is None,'Nested anchor';self.anchor={'href':dict(attrs).get('href'),'text':[]}
 def handle_data(self,data):
  self.text.append(data)
  if self.anchor is not None:self.anchor['text'].append(data)
 def handle_endtag(self,tag):
  if tag=='a':
   assert self.anchor is not None;self.links.append({'href':self.anchor['href'],'anchor':' '.join(self.anchor['text'])});self.anchor=None
p=B/'content-revisions/manifest.json';m=json.loads(p.read_text());drafts={d['url']:d for d in m['drafts']};pages={x['url']:x for x in json.loads((R/'src/data/acquisition-pages.json').read_text())};edges=[]
for d in m['drafts']:
 content=(B/d['content_file']).read_text();reader=Body();reader.feed(content);assert reader.anchor is None
 assert set(d['fields'])=={'title','excerpt','content'} and d['cms_written'] is False and d['final_review'] is False
 d['fields']['content']=content;d['content_sha256']=hashlib.sha256(content.encode()).hexdigest();d['word_count']=len(' '.join(reader.text).split())
 for link in reader.links:
  href=link['href']
  if not href.startswith('/'):continue
  assert href in drafts or href in pages,(d['url'],href)
  article=href in drafts;target=drafts[href] if article else pages[href]
  edges.append({'source_article_id':d['article_id'],'source_url':d['url'],'source_content_sha256':d['content_sha256'],'target_url':href,'target_kind':'local_article_draft' if article else 'local_page','target_id':target['article_id'] if article else target['id'],'anchor':link['anchor'],'implemented_in':'local_body_draft','production_verified':False})
 if any(e['source_article_id']==d['article_id'] and e['target_kind']=='local_article_draft' for e in edges):
  dep='Linked article drafts included in the same reviewed release plan'
  if dep not in d['release_dependencies']:d['release_dependencies'].insert(1,dep)
p.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n')
network={'scope':'Actual links present in local article HTML, not live or covered content. Page-to-article incoming links remain pending.','article_count':len(drafts),'article_links':sum(e['target_kind']=='local_article_draft' for e in edges),'page_links':sum(e['target_kind']=='local_page' for e in edges),'page_backlinks_implemented':False,'edges':edges}
(B/'ownership/draft-content-links.json').write_text(json.dumps(network,ensure_ascii=False,indent=2)+'\n')
p=B/'execution-state.json';s=json.loads(p.read_text());s['requirements']['content_revision_drafts'].update({'prepared':len(drafts),'article_to_article_links':network['article_links'],'article_to_page_links':network['page_links']});p.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n')
print('Synced',len(drafts),'local drafts;',network['article_links'],'article links;',network['page_links'],'page links')
