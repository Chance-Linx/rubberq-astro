"""Offline, full-body inventory screening; does not decide semantic URL ownership."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter,defaultdict
import csv,hashlib,html,json,math,re

base=Path(__file__).resolve().parents[1]
class Text(HTMLParser):
    def __init__(self):super().__init__();self.parts=[];self.skip=0
    def handle_starttag(self,t,a):
        if t in ('script','style','svg'):self.skip+=1
        if t in ('p','h1','h2','h3','h4','li','tr','br'):self.parts.append('\n')
    def handle_endtag(self,t):
        if t in ('script','style','svg'):self.skip=max(0,self.skip-1)
    def handle_data(self,s):
        if not self.skip:self.parts.append(s)
def plain(c):
    if isinstance(c,str):
        p=Text();p.feed(c);return html.unescape(' '.join(p.parts))
    if isinstance(c,list):return '\n'.join(plain(x) for x in c)
    if isinstance(c,dict):
        if 'text' in c:return c['text']
        return plain(c.get('children',c.get('rows',c.get('cells',[]))))
    return ''
def norm(s):return ' '.join(re.findall(r'[a-z0-9]+',s.lower()))
def save(name,obj):(base/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def csvout(name,rows):
    with (base/name).open('w',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator="\n");w.writeheader();w.writerows(rows)
raw=json.loads((base/'evidence/cms-published-source.json').read_text())['result']
rows=[];bodies={};groups=defaultdict(list)
for a in raw:
    field=next((k for k in ('content','body','markdownBody') if a.get(k)),None)
    content=a.get(field) if field else ''
    text=plain(content);bodies[a['_id']]=text
    body_norm=norm(text);hash_=hashlib.sha256(body_norm.encode()).hexdigest()
    if body_norm:groups[hash_].append(a['_id'])
    source=content if isinstance(content,str) else json.dumps(content,ensure_ascii=False)
    headings=re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>',source,re.I|re.S)+re.findall(r'^#{1,6}\s+(.+)$',source,re.M)
    if isinstance(content,list):headings += [plain(b) for b in content if isinstance(b,dict) and re.match(r'^h[1-6]$',b.get('style',''))]
    template_hits=[m for m in ['Problem Statement','Material Science Analysis','Engineering Selection','Recommended Solution','Performance Validation','Executive Summary & Answer-First'] if m.lower() in text.lower()]
    internal_links=re.findall(r'(?:href=["\'](?:https://rubberq.com)?(/[^"\']*)|\]\((/[^)]*)\))',source)
    numeric=re.findall(r'\b\d+(?:\.\d+)?\s*(?:%|°\s*C|MPa|psi|ppm|ppb|nm|µm|mm|hours|cycles)\b',text,re.I)
    claim=[]
    for m in re.finditer(r'(?:RubberQ|our\s+(?:lab|test|compound|material|process|seal|in-house)).{0,180}',text,re.I):
        if re.search(r'\d',m.group()):claim.append(m.group().strip())
    published=a.get('publishedAt') or '';future=published[:10]>'2026-10-21'
    actions=[]
    if len(template_hits)>=2:actions.append('核对模板段落是否回答本页买家任务')
    if not internal_links:actions.append('补产品/材料父页及适用RFQ内链')
    if claim:actions.append('逐条关联自有数字的配方/型号/工况/原始报告')
    if len(text.split())<250:actions.append('检查信息完整性与采购下一步')
    slug=(a.get('slug') or {}).get('current','')
    rows.append(dict(id=a['_id'],revision=a['_rev'],title=a.get('title',''),url='/blog/'+slug if slug else '',published_at=published,time_state='未来日期；未验证前台可见' if future else '日期已到；未验证前台可见',body_field=field or '',word_count=len(text.split()),normalized_body_sha256=hash_,heading_count=len(headings),headings=' | '.join(re.sub('<[^>]+>','',h) for h in headings[:14]),internal_link_count=len(internal_links),template_markers=' | '.join(template_hits),numeric_expression_count=len(numeric),self_claim_examples=' | '.join(claim[:3]),same_body_ids='',screening_actions='；'.join(actions) or '保持候选；需人工按完整任务和证据决定',semantic_review='未完成人工语义验收',source='evidence/cms-published-source.json'))
for r in rows:r['same_body_ids']=';'.join(i for i in groups[r['normalized_body_sha256']] if i!=r['id'])
save('data/inventory.json',rows);csvout('data/存量正文检查表.csv',rows)
topics=json.loads((base/'data/topics.json').read_text());candidates=[]
stop={'the','and','for','with','from','what','which','rubber','seal','seals','review','parts','guide','custom','manufacturer','supplier','molding','selection','checklist','project','components','of','to','in','a','an'}
tokens={i:set(norm(t).split())-stop for i,t in bodies.items()}
freq=Counter(w for v in tokens.values() for w in v)
byid={r['id']:r for r in rows}
for t in topics:
    query=set(norm(t['primary_keyword']+' '+t['title']).split())-stop
    scores=[]
    for id_,words in tokens.items():
        overlap=query&words
        score=sum(math.log((len(rows)+1)/(freq[w]+1)) for w in overlap)
        exact=norm(t['primary_keyword']) in norm(bodies[id_])
        score+=3 if exact else 0
        if score>2 and len(overlap)>=2:
            scores.append((score,id_,overlap,exact))
    for score,id_,overlap,exact in sorted(scores,reverse=True)[:3]:
        body=bodies[id_];best=next((w for w in sorted(overlap,key=len,reverse=True) if re.search(re.escape(w),body,re.I)),None)
        m=re.search(re.escape(best),body,re.I) if best else None;start=max(0,(m.start() if m else 0)-80)
        candidates.append(dict(topic_id=t['id'],topic=t['title'],article_id=id_,article_url=byid[id_]['url'],article_title=byid[id_]['title'],body_match_terms=';'.join(sorted(overlap)),exact_phrase=exact,body_excerpt=body[start:start+430].replace('\n',' '),decision='仅正文词项匹配候选；不代表已覆盖、可合并或新URL批准'))
save('data/topic-candidates.json',candidates)
if candidates:csvout('data/话题-存量正文候选.csv',candidates)
stats=dict(cms_published_records=len(rows),future_dated=sum(r['time_state'].startswith('未来') for r in rows),date_reached=sum(r['time_state'].startswith('日期') for r in rows),no_internal_links=sum(r['internal_link_count']==0 for r in rows),template_marker_rows=sum(len(r['template_markers'].split(' | '))>=2 for r in rows),duplicate_groups=sum(len(v)>1 for v in groups.values()),duplicate_group_rows=sum(len(v) for v in groups.values() if len(v)>1),rows_with_self_claim_numeric_candidates=sum(bool(r['self_claim_examples']) for r in rows),topic_candidates=len(candidates),human_semantic_acceptance=False,cms_writes=0)
save('evidence/inventory-summary.json',stats)
save('evidence/cms-source-receipt.json',dict(captured_on='2026-10-21',method='read-only public Sanity GROQ HTTP GET',project='tcjl4afv',dataset='production',query='*[_type == "article" && status == "published"]{_id,_rev,title,slug,status,publishedAt,content,body,markdownBody,excerpt}',raw_sha256=hashlib.sha256((base/'evidence/cms-published-source.json').read_bytes()).hexdigest(),records=len(rows),paid_calls=0))
(base/'09-存量正文检查与接续.md').write_text('''# 存量正文检查与接续

目的：读取真实正文，为新IA和话题库提供可追溯的存量输入，避免仅按标题或slug重复建文。

本轮通过Sanity公开只读接口重新读取全部status=published的文章，不使用付费接口、不写CMS。原始正文见evidence/cms-published-source.json，查询与hash见evidence/cms-source-receipt.json。

## 本轮读取结果

```json
'''+json.dumps(stats,ensure_ascii=False,indent=2)+'''
```

发布日期已到仅是日期判断，未逐一验证前台路由、过滤条件、sitemap或HTTP200。未来日期文章不是本次已上线成果。

## 产物与使用

- data/存量正文检查表.csv：每篇真实正文来源字段、字数、章节、正文内链、模板线索、同正文ID、数值主张上下文和具体检查动作。
- data/话题-存量正文候选.csv：按全文词项及片段检索的前三候选，不宣称完整覆盖，不直接生成合并/301或新页结论。
- 同正文按去HTML/标点与空白归一化后的文本hash判断，原始内容与ID保留。
- 模板标记只说明出现重复骨架词，不证明整篇无用；数值主张上下文只是需核对候选，不能自动判为虚假。
- 当前63话题仍未完成人工语义归属验收，因此看板没有把它们标记为已覆盖或新稿获准。

## 接续动作

按P0产品与材料父页依次读取候选完整正文，确认具体买家任务、已有证据和查询分工。优先改现有URL与父页章节；只有独立任务和证据充分时才新建文章。每次决定留下实际正文hash、URL归属和理由，然后解除对应话题hold；不重新发布未来日期文章，不批量删除。
''')
print(json.dumps(stats,ensure_ascii=False))
