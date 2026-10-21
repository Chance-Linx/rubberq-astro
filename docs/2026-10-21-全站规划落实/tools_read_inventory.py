#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Read saved source bodies without executing the structural-audit writer."""
import argparse,hashlib,json,re
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'docs/2026-10-21-线上获客执行/evidence/cms-published-source.json'
class BodyText(HTMLParser):
 def __init__(self):super().__init__(convert_charrefs=True);self.parts=[];self.skip=0
 def handle_starttag(self,tag,attrs):
  if tag in ('script','style'):self.skip+=1
  if tag in ('p','h1','h2','h3','h4','h5','h6','li','tr','br','div','section','text','tspan'):self.parts.append('\n')
  if tag in ('td','th'):self.parts.append(' | ')
  if tag=='a':self.parts.append(' [link='+dict(attrs).get('href','')+'] ')
 def handle_endtag(self,tag):
  if tag in ('script','style'):self.skip=max(0,self.skip-1)
 def handle_data(self,text):
  if not self.skip:self.parts.append(text)
def plain(content):
 if isinstance(content,str):
  p=BodyText();p.feed(content);return '\n'.join(' '.join(line.split()) for line in ''.join(p.parts).splitlines() if line.strip())
 if isinstance(content,list):return '\n'.join(plain(x) for x in content)
 if isinstance(content,dict):
  if 'text' in content:return content['text']
  return plain(content.get('children',content.get('rows',content.get('cells',[]))))
 return ''
def digest(content):return hashlib.sha256(json.dumps(content,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def records():return json.loads(SOURCE.read_text())['result']
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--start',type=int,default=0);p.add_argument('--end',type=int,default=10);p.add_argument('--id');a=p.parse_args()
 r=records();selected=[(i,x) for i,x in enumerate(r) if x['_id']==a.id] if a.id else list(enumerate(r))[a.start:a.end]
 for i,x in selected:
  c=x.get('content');print(f"\n=== {i} | {x['_id']} | {x['title']} | {x['publishedAt']} ===\nURL /blog/{x['slug']['current']}\ncontent-sha256 {digest(c)}\n{plain(c)}\n=== END {i} ===")
