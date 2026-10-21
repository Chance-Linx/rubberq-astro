#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Read-only implementation checks. Never posts forms, writes CMS, or deploys."""
import argparse, concurrent.futures, hashlib, json, re, sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
from urllib.request import urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ['en', 'de', 'ja', 'es', 'zh']
RETAINED = {'/blog', '/search', '/privacy', '/terms'}
SL0 = 'Japanese Formulation. Chinese Precision. Trusted Since 1995.'
SL1 = 'Compounded by Japan. Built in China. Tested in-House.'

def read(path): return json.loads((ROOT / path).read_text())
def normalize(text): return ' '.join(text.split())
def localized(locale, path): return ('' if locale == 'en' else '/' + locale) + ('' if path == '/' and locale != 'en' else path)

class Document(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.tags=[]; self.text=[]; self.h1=[]; self.title=[]; self.scripts=[]; self.fields=[]; self.options=[]
        self.stack=[]; self.capture=None; self.script=None; self.form_depth=0; self.label_depth=0; self.label_ids=set(); self.current_select=None
        self.tables=[]; self.table=None; self.row=None; self.cell=None; self.caption=None; self.elements=[]; self.open_elements=[]
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); self.tags.append((tag,a))
        if tag in ('li','a'):
            self.open_elements.append({'tag':tag,'attrs':a,'parts':[]})
        if tag=='table':self.table={'caption':'','rows':[]}
        if self.table is not None:
            if tag=='caption':self.caption=[]
            if tag=='tr':self.row=[]
            if tag in ('th','td'):self.cell={'tag':tag,'scope':a.get('scope'),'parts':[]}
        if tag in ('h1','title'): self.capture=(tag,[])
        if tag=='script' and a.get('type')=='application/ld+json': self.script=[]
        if tag=='form': self.form_depth+=1
        if tag=='label':
            self.label_depth+=1
            if a.get('for'): self.label_ids.add(a['for'])
        if self.form_depth and tag in ('input','select','textarea'):
            self.fields.append((tag,a,self.label_depth>0))
        if tag=='select': self.current_select=a.get('aria-label') or a.get('id') or ''
        if tag=='option': self.option=(a.get('value'),[],self.current_select)
    def handle_endtag(self, tag):
        if tag in ('li','a'):
            for i in range(len(self.open_elements)-1,-1,-1):
                if self.open_elements[i]['tag']==tag:
                    item=self.open_elements.pop(i);item['text']=normalize(''.join(item.pop('parts')));self.elements.append(item);break
        if self.table is not None:
            if tag=='caption' and self.caption is not None:
                self.table['caption']=normalize(''.join(self.caption));self.caption=None
            if tag in ('th','td') and self.cell is not None:
                self.cell['text']=normalize(''.join(self.cell.pop('parts')))
                if self.row is not None:self.row.append(self.cell)
                self.cell=None
            if tag=='tr' and self.row is not None:self.table['rows'].append(self.row);self.row=None
            if tag=='table':self.tables.append(self.table);self.table=None
        if self.capture and tag==self.capture[0]:
            getattr(self,self.capture[0]).append(''.join(self.capture[1]));self.capture=None
        if tag=='script' and self.script is not None:
            self.scripts.append(json.loads(''.join(self.script)));self.script=None
        if tag=='form': self.form_depth-=1
        if tag=='label': self.label_depth=max(0,self.label_depth-1)
        if tag=='select': self.current_select=None
        if tag=='option' and hasattr(self,'option'):
            value,parts,select=self.option;self.options.append({'value':value,'text':''.join(parts),'select':select});del self.option
    def handle_data(self, text):
        for item in self.open_elements:item['parts'].append(text)
        if self.caption is not None:self.caption.append(text)
        if self.cell is not None:self.cell['parts'].append(text)
        if self.capture:self.capture[1].append(text)
        if self.script is not None:self.script.append(text)
        if hasattr(self,'option'):self.option[1].append(text)
        self.text.append(text)

def key_paths(value,prefix=''):
    if isinstance(value,dict):
        out=set()
        for key,v in value.items():out|=key_paths(v,prefix+'.'+key)
        return out
    if isinstance(value,list):
        out={prefix+'[]'}
        for v in value:out|=key_paths(v,prefix+'[]')
        return out
    return {prefix}

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--base',default='http://127.0.0.1:4397');parser.add_argument('--source-only',action='store_true');args=parser.parse_args()
    pages=read('src/data/acquisition-pages.json'); nav=read('src/data/acquisition-navigation.json')
    messages={loc:read(f'src/messages/{loc}.json') for loc in LOCALES}
    errors=[]; sources=[]
    ids={p['id'] for p in pages}; urls={p['url'] for p in pages}
    drafts=read('docs/2026-10-21-全站规划落实/content-revisions/manifest.json')
    article_urls={x['url'] for x in drafts['drafts']}
    reference=key_paths(messages['en']['acquisition'])
    for locale,m in messages.items():
        acq=m['acquisition']; localerrors=[]
        if set(acq['pages'])!=ids:localerrors.append('page ID coverage')
        if key_paths(acq)!=reference:localerrors.append('message key parity')
        if acq['brand']!={'slogan':SL0,'tagline':SL1}:localerrors.append('immutable brand strings')
        for p in pages:
            c=acq['pages'].get(p['id'],{})
            if not all(c.get(k) for k in ('label','title','description','h1','intro','cta')):localerrors.append(p['id']+' required fields')
            if p['url'] not in RETAINED and len(c.get('sections',[]))!=len(messages['en']['acquisition']['pages'][p['id']]['sections']):localerrors.append(p['id']+' missing sections')
            if len(c.get('faq',[]))!=len(messages['en']['acquisition']['pages'][p['id']]['faq']):localerrors.append(p['id']+' missing FAQ')
            if locale!='en' and p['url'] not in RETAINED:
                en=messages['en']['acquisition']['pages'][p['id']]
                if c['intro']==en['intro'] or c['description']==en['description']:localerrors.append(p['id']+' English fallback')
                if c['title']==en['title']:localerrors.append(p['id']+' untranslated title')
            if any(s['body']=='' for s in c.get('sections',[])):localerrors.append(p['id']+' empty section')
            for i,section in enumerate(c.get('sections',[])):
                label=f"{p['id']} section {i+1}"
                ensection=messages['en']['acquisition']['pages'][p['id']]['sections'][i]
                if locale!='en' and section['body']==ensection['body']:localerrors.append(label+' English body fallback')
                for field in ('items','links'):
                    if len(section.get(field,[]))!=len(ensection.get(field,[])):localerrors.append(label+' '+field+' parity')
                if 'items' in section and (not section['items'] or not all(isinstance(x,str) and x.strip() for x in section['items'])):localerrors.append(label+' empty list')
                for link in section.get('links',[]):
                    if not link.get('label') or link.get('url') not in urls|article_urls:localerrors.append(label+' invalid contextual link')
                if 'table' in section:
                    table=section['table'];columns=table.get('columns',[]);rows=table.get('rows',[])
                    if not table.get('caption') or len(columns)<2 or not rows or not all(len(row)==len(columns) for row in rows):localerrors.append(label+' table shape')
                    if not all(isinstance(x,str) and x.strip() for x in columns+[cell for row in rows for cell in row]):localerrors.append(label+' empty table cell')
                    entable=ensection.get('table',{})
                    if len(columns)!=len(entable.get('columns',[])) or len(rows)!=len(entable.get('rows',[])):localerrors.append(label+' table parity')
        sources.append({'locale':locale,'page_count':len(acq['pages']),'pass':not localerrors,'issues':localerrors,'file_sha256':hashlib.sha256((ROOT/f'src/messages/{locale}.json').read_bytes()).hexdigest()})
        errors.extend(f'{locale}: {x}' for x in localerrors)
    for p in pages:
        if any(x not in urls for x in p['links']+[p['cta_url']]):errors.append(p['id']+' missing link destination')
    industry=next(g for g in nav if g['url']=='/industries')['children']
    if industry[:4]!=['/industries/semiconductor','/industries/liquid-cooling-energy-storage','/industries/ev-energy-storage','/industries/humanoid-robotics']:errors.append('industry priority order')
    evidence=ROOT/'docs/2026-10-21-全站规划落实/evidence';evidence.mkdir(exist_ok=True)
    (evidence/'locale-source-checks.json').write_text(json.dumps({'sources':sources,'errors':errors},ensure_ascii=False,indent=2)+'\n')
    if args.source_only:
        print(json.dumps({'sources':len(sources),'passed':sum(s['pass'] for s in sources),'errors':errors},ensure_ascii=False));return bool(errors)
    def verify(task):
        locale,p=task;path=localized(locale,p['url']);c=messages[locale]['acquisition']['pages'][p['id']];issues=[]
        try:
            with urlopen(args.base+path,timeout=60) as r:html=r.read().decode();status=r.status
            doc=Document(html);plain=normalize(' '.join(doc.text))
            if status!=200:issues.append('HTTP status')
            if doc.h1!=[c['h1']]:issues.append('H1')
            if doc.title!=[c['title']]:issues.append('title')
            tags=doc.tags
            def attrs(tag,key,value):return [a for t,a in tags if t==tag and a.get(key)==value]
            if [a.get('href') for a in attrs('link','rel','canonical')]!=['https://rubberq.com'+path]:issues.append('canonical')
            if [a.get('content') for a in attrs('meta','name','description')]!=[c['description']]:issues.append('description')
            if [a.get('lang') for t,a in tags if t=='html']!=[locale]:issues.append('html language')
            hreflang={a.get('hreflang'):a.get('href') for a in attrs('link','rel','alternate')}
            expected={l:'https://rubberq.com'+localized(l,p['url']) for l in LOCALES};expected['x-default']=expected['en']
            if hreflang!=expected:issues.append('hreflang')
            for s in c['sections']:
                if normalize(s['heading']) not in plain or normalize(s['body']) not in plain:issues.append('missing section '+s['heading'])
                for item in s.get('items',[]):
                    if not any(e['tag']=='li' and e['text']==normalize(item) for e in doc.elements):issues.append('missing list item '+s['heading'])
                for link in s.get('links',[]):
                    blog=link['url'].startswith('/blog/');href=link['url'] if blog else localized(locale,link['url'])
                    if not any(e['tag']=='a' and e['attrs'].get('href')==href and e['attrs'].get('hreflang')==('en' if blog else locale) and e['text']==normalize(link['label']+' ↗') for e in doc.elements):issues.append('contextual link '+link['url'])
                if 'table' in s:
                    table=s['table'];matches=[t for t in doc.tables if t['caption']==normalize(table['caption'])]
                    expected_rows=[table['columns']]+table['rows']
                    if len(matches)!=1 or [[cell['text'] for cell in row] for row in matches[0]['rows']]!=[[normalize(v) for v in row] for row in expected_rows]:issues.append('table content '+table['caption'])
                    elif any(cell['tag']!=('th' if r==0 or j==0 else 'td') or cell['scope']!=('col' if r==0 else 'row' if j==0 else None) for r,row in enumerate(matches[0]['rows']) for j,cell in enumerate(row)):issues.append('table headers '+table['caption'])
                    if not any(a.get('role')=='region' and a.get('aria-label')==table['caption'] and a.get('tabindex')=='0' for tag,a in tags):issues.append('table keyboard region '+table['caption'])
            for f in c['faq']:
                if normalize(f['question']) not in plain or normalize(f['answer']) not in plain:issues.append('missing FAQ')
            if not doc.scripts:issues.append('JSON-LD missing')
            faq=[s for s in doc.scripts if s.get('@type')=='FAQPage']
            if c['faq'] and (len(faq)!=1 or len(faq[0]['mainEntity'])!=len(c['faq'])):issues.append('FAQ schema')
            if p['url']=='/':
                org=[s for s in doc.scripts if s.get('@type')=='Organization']
                if len(org)!=1 or org[0].get('legalName')!='Fuzhou RongQing Rubber Co., Ltd.':issues.append('Organization legal entity')
                if org and ('sameAs' in org[0] or 'logo' in org[0]):issues.append('unverified Organization reference')
            formcount=sum(t=='form' for t,a in tags)
            if formcount != (1 if p['url'] in ['/contact','/sample-request','/batch-rfq'] else 0):issues.append('form count')
            for tag,a,wrapped in doc.fields:
                if a.get('type') in ('hidden','submit'):continue
                if not (wrapped or a.get('aria-label') or a.get('id') in doc.label_ids):issues.append('unnamed form field '+str(a.get('name') or a.get('type') or tag))
            if locale!='en' and p['url'] in ['/sample-request','/batch-rfq']:
                for op in doc.options:
                    if op['text'] in ['Seals & O-Rings','Sample evaluation','Feasibility study','Tooling estimate','Testing / validation']:issues.append('English option '+op['text'])
            return {'locale':locale,'path':path,'status':status,'pass':not issues,'issues':issues,'rich_tables':sum('table' in s for s in c['sections']),'contextual_links':sum(len(s.get('links',[])) for s in c['sections']),'forms':formcount,'form_options':doc.options if formcount else [],'html_sha256':hashlib.sha256(html.encode()).hexdigest()}
        except Exception as e:return {'locale':locale,'path':path,'pass':False,'issues':[str(e)]}
    tasks=[(l,p) for l in LOCALES for p in pages if p['url'] not in RETAINED]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(verify,tasks))
    guards=[]
    for path in ['/fr/compounds','/de/products/does-not-exist','/ja/materials/does-not-exist','/industries/does-not-exist']:
        try:
            with urlopen(args.base+path,timeout=30) as r:status=r.status
        except HTTPError as e:status=e.code
        guards.append({'path':path,'status':status,'pass':status==404})
    report={'base':args.base,'scope':'Implementation verification only; not final whole-project acceptance, visual review, CMS ownership, form delivery, publication or ranking proof','source_errors':errors,'source_checks':sources,'page_results':results,'unknown_routes':guards,'summary':{'routes':len(results),'passed':sum(r['pass'] for r in results),'guards_passed':sum(g['pass'] for g in guards),'failed':[r for r in results if not r['pass']]}}
    (evidence/'five-locale-implementation-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'summary':report['summary'],'source_errors':errors,'unknown_routes':guards},ensure_ascii=False))
    return bool(errors or not all(r['pass'] for r in results) or not all(g['pass'] for g in guards))
if __name__=='__main__':sys.exit(main())
