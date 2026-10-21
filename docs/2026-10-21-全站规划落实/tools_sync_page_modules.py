#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Reconcile authored page modules from current messages and completed local checks.
Writes only local operational receipts. Never writes CMS or accepts coverage.
"""
import argparse, hashlib, json
from pathlib import Path

BASE=Path(__file__).resolve().parent
ROOT=BASE.parents[1]
LOCALES=['en','de','ja','es','zh']
STAGE='local_modules_render_checks_passed_final_review_pending'
def read(path):return json.loads(path.read_text())
def write(path,value):path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def main():
 parser=argparse.ArgumentParser();parser.add_argument('--implement',nargs='*',default=[]);args=parser.parse_args()
 queue=read(BASE/'ownership/content-implementation-queue.json')
 targets={t['target_url']:t for t in queue['targets'] if t['target_kind']=='existing_page'}
 if not set(args.implement)<=set(targets):raise SystemExit('Only existing page targets in the agreed queue may be marked implemented.')
 selected={u for u,t in targets.items() if t['implementation_status']==STAGE}|set(args.implement)
 registry={p['url']:p for p in read(ROOT/'src/data/acquisition-pages.json')}
 article_titles={d['url']:d['fields']['title'] for d in read(BASE/'content-revisions/manifest.json')['drafts']}
 checks=read(BASE/'evidence/five-locale-implementation-checks.json')
 if checks['source_errors'] or not all(r['pass'] for r in checks['page_results']):raise SystemExit('Local route checks have failures.')
 sources={s['locale']:s for s in checks['source_checks']}
 messages={}
 for loc in LOCALES:
  path=ROOT/f'src/messages/{loc}.json'
  if not sources[loc]['pass'] or sources[loc]['file_sha256']!=sha(path):raise SystemExit('Stale source checks for '+loc)
  messages[loc]=read(path)
 responses={(r['locale'],r['path']):r for r in checks['page_results']}
 records=[];edges=[]
 for url in sorted(selected):
  page=registry[url];entry={'url':url,'page_id':page['id'],'topic_ids':targets[url]['topic_ids'],'stage':STAGE,'coverage_verified':False,'locales':{}}
  for loc in LOCALES:
   copy=messages[loc]['acquisition']['pages'][page['id']];sections=copy['sections'];path=('' if loc=='en' else '/'+loc)+url
   response=responses.get((loc,path))
   if not response or not response['pass']:raise SystemExit('Missing route evidence: '+path)
   table_count=sum('table' in s for s in sections);link_count=sum(len(s.get('links',[])) for s in sections)
   if response['rich_tables']!=table_count or response['contextual_links']!=link_count:raise SystemExit('Stale rendered-module counters: '+path)
   entry['locales'][loc]={'sections':len(sections),'tables':table_count,'contextual_links':link_count,'copy_sha256':hashlib.sha256(json.dumps(copy,ensure_ascii=False,sort_keys=True).encode()).hexdigest(),'rendered_html_sha256':response['html_sha256']}
   for i,section in enumerate(sections):
    for j,link in enumerate(section.get('links',[])):
     blog=link['url'].startswith('/blog/');external=link['url'].startswith('https://');english=blog or external
     edges.append({'source':url,'source_locale':loc,'source_path':path,'source_field':f"acquisition.pages.{page['id']}.sections.{i}.links.{j}",'target':link['url'],'target_path':link['url'] if english or loc=='en' else '/'+loc+link['url'],'target_language':'en' if english else loc,'kind':'manufacturer_reference' if external else 'page_to_article' if blog else 'page_to_page','label':link['label'],'local_render_verified':True,'production_verified':False})
     if blog:edges[-1]['target_draft_title']=article_titles[link['url']]
  records.append(entry)
 summary={'rendered_routes':len(selected)*len(LOCALES),'table_placements':sum(v['tables'] for p in records for v in p['locales'].values()),'contextual_link_placements':len(edges),'page_to_article_link_placements':sum(e['kind']=='page_to_article' for e in edges),'canonical_page_to_article_links':len({(e['source'],e['target']) for e in edges if e['kind']=='page_to_article'}),'manufacturer_reference_placements':sum(e['kind']=='manufacturer_reference' for e in edges),'accepted_topic_coverage':0,'cms_writes':0,'production_deployments':0}
 report={'scope':'Actual source modules and rendered local text/tables/links; not accepted topic coverage or production publication. Revised article targets remain local drafts. External links are checked manufacturer references, not RubberQ authorization.','required_pages':len(targets),'implemented_pages':len(selected),'remaining_pages':len(targets)-len(selected),'locales':LOCALES,'pages':records,'edges':edges,'summary':summary}
 for url in selected:
  targets[url]['implementation_status']=STAGE;targets[url]['implementation_evidence']='ownership/page-content-modules.json';targets[url]['coverage_verified']=False
 write(BASE/'ownership/page-content-modules.json',report);write(BASE/'ownership/content-implementation-queue.json',queue)
 state=read(BASE/'execution-state.json');state['requirements']['page_content_modules']={'required':len(targets),'implemented_local':len(selected),'remaining':len(targets)-len(selected),'locales':LOCALES,'rendered_routes_checked':summary['rendered_routes'],'accepted_topic_coverage':0,'artifact':'ownership/page-content-modules.json'}
 remaining=len(targets)-len(selected)
 backlink_stage='page_modules_implemented' if remaining==0 else 'partially_implemented'
 state['requirements']['content_revision_drafts']['page_backlinks']=f'{backlink_stage}_{len(selected)}_of_{len(targets)}_pages_local_only_final_review_pending'
 state['requirements']['dashboard_reconciliation']=f'Editorial ownership reconciled; {len(selected)}/{len(targets)} page modules and source links implemented, operational keyword/graph reconciliation remains pending.'
 state['next_action']=(f"Continue the remaining {remaining} page-owner modules in five locales, then " if remaining else "Complete ")+"article assets/production layout, metadata repairs, keyword/graph reconciliation, specialized pages/mobile/RFQ, then one consolidated final review."
 write(BASE/'execution-state.json',state)
 evolution=read(BASE/'evidence/source-evolution.json');record=next(x for x in evolution['changes'] if x['path']=='rubberq-astro/src/messages/en.json');record['current_sha256']=sha(ROOT/'src/messages/en.json');record['reason']='Approved acquisition implementation and task-specific five-locale page content; original planning input retained in baseline Git object';write(BASE/'evidence/source-evolution.json',evolution)
 print(json.dumps({'implemented_pages':len(selected),'remaining_pages':len(targets)-len(selected),**summary},ensure_ascii=False))
if __name__=='__main__':main()
