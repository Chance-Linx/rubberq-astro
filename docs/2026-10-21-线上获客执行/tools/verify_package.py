"""Check source fidelity and publishing-state separation for this delivery."""
from pathlib import Path
import csv, hashlib, json, re, urllib.request

base=Path(__file__).resolve().parents[1]
root=base.parents[2]
checks=[]
def check(name, ok):
    checks.append({'check':name,'pass':bool(ok)})
def read(name):return json.loads((base/name).read_text())
pages=read('data/pages.json');keywords=read('data/keywords.json');topics=read('data/topics.json');graph=read('data/graph.json')
urls={p['url'] for p in pages}
check('唯一页面URL及编号',len(urls)==len(pages)==len({p['id'] for p in pages})==49)
check('12个规划新页与37个现有入口',sum(p['new'] for p in pages)==12)
check('47份客户文案及2份法律页保留',sum(bool(p['copy']) for p in pages)==47 and all(not p['copy'] for p in pages if p['url'] in ('/privacy','/terms')))
check('全部非法律页SEO长度',all(len(p['title'])<=60 and 120<=len(p['meta'])<=160 for p in pages if p['url'] not in ('/privacy','/terms')))
check('页面稿文件与规划内链存在',all((base/p['artifact']).is_file() and set(p['links'])<=urls and p['cta_url'] in urls for p in pages))
check('主页原Slogan完整保留',pages[0]['h1']=='Japanese Formulation. Chinese Precision. Trusted Since 1995.')
check('第二句Slogan完整保留',any('Compounded by Japan. Built in China. Tested in-House.' in p['copy'] for p in pages))
check('英文URL无en前缀',all(not p['url'].startswith('/en') for p in pages))
source=list(csv.DictReader((root/'全球增长系统/市场情报/2026-10-21-从零获客调研/data/kw_us_classified_2026-10-21.csv').open(encoding='utf-8-sig')))
mapping={'keyword':'keyword','us_vol':'us_volume','kd':'kd','cpc':'cpc_usd','intent':'intent','tier':'tier','tag':'tag','cluster':'source_cluster','trend':'trend','uk':'uk','ca':'ca','au':'au','india':'india','sg':'sg','my':'my'}
check('292行原值逐字段保真',len(source)==len(keywords)==292 and all(all((a.get(k) or None)==(b.get(v) or None) for k,v in mapping.items()) for a,b in zip(source,keywords)))
check('B2B唯一规划URL与噪声隔离',all((k['planned_owner'] in urls) if k['tag']=='b2b' else not k['planned_owner'] for k in keywords))
check('话题63项且无虚构已覆盖',len(topics)==63 and all(t['coverage']=='待全文归属核对' and t['planned_url'] is None for t in topics))
byid={k['id']:k for k in keywords}
check('话题volume只从exact词表复用',all(t['observed_volume'] is None if not t['source_keyword_ids'] else any(byid[k]['keyword'].lower()==t['primary_keyword'].lower() and byid[k]['us_volume']==t['observed_volume'] for k in t['source_keyword_ids'].split(';')) for t in topics))
check('话题需求排除noise和retail_mro数值',all(not t['source_keyword_ids'] or all(byid[k]['tag']=='b2b' for k in t['source_keyword_ids'].split(';')) for t in topics))
known=urls|{t['id'] for t in topics}
check('组织关系全部指向本轮实体',all(e['source'] in known and e['target'] in known for e in graph['edges']))
content=read('data/content.json')
check('策划未伪装发布或覆盖',not content['done'] and not content['covered'] and not content['packages'] and content['counters']=={'completed_items':0,'new_urls':0,'updated_urls':0})
decs=read('growth-board/decisions.json')['items']
check('四项已决与费用待定',sum(d['status']=='已决' for d in decs)==4 and decs[4]['result']=='待定，先不花费')
check('无已外发工厂请求',all(x['status']=='未发出' for x in read('growth-board/external-requests.json')['items']))
metrics=read('growth-board/kpi-snapshots/2026-10-21.json')['metrics']
check('真实需求与合格询盘及CTR口径',metrics['inquiry_total']['value']==1 and metrics['inquiry_qualified']['value'] is None and abs(metrics['gsc_ctr']['value']-100*10/901)<1e-9)
manifest=read('evidence/source-manifest.json')
check('输入hash与当前源一致',all((root/p['path']).is_file() and hashlib.sha256((root/p['path']).read_bytes()).hexdigest()==p['sha256'] for p in manifest['sources']))
text='\n'.join(p['copy'] for p in pages)
forbidden=['new compound from scratch in 4 weeks','global leader','medical grade','zero-defect','100%','ISO Class 5','TML <','UL94 V-0','J&C','battery pack','IP68','IP69K']
check('客户稿无禁用或无来源性能宣传',not any(t.lower() in text.lower() for t in forbidden))
html=(base/'map.html').read_text()
embedded=json.loads(re.search(r'<script id="data" type="application/json">(.*?)</script>',html,re.S)[1])
check('HTML和业务数据同步',embedded['pages']==pages and embedded['topics']==topics and embedded['keywords']==keywords)
inventory=read('data/inventory.json')
check('存量正文271项完整且未来日期30项',len(inventory)==271 and len({a['id'] for a in inventory})==271 and sum(a['time_state'].startswith('未来') for a in inventory)==30)
check('正文检查不是语义验收或覆盖',all(a['semantic_review']=='未完成人工语义验收' for a in inventory) and embedded['inventory']==inventory)
check('交互视图无外部脚本依赖',not re.search(r'<script[^>]+src=',html))
try:
    growth=json.load(urllib.request.urlopen('http://127.0.0.1:8797/api/growth',timeout=10))
    (base/'evidence/growth-snapshot.json').write_text(json.dumps(growth,ensure_ascii=False,indent=2))
    check('增长API全部已配置部分有效',all(s['state']!='invalid' for s in growth['sections'].values()))
    check('增长目标和决策已接入',all(growth['sections'][k]['state']=='ready' for k in ['goals','snapshots','work_items','decisions','external_requests','cadence','topics']))
    snap=json.load(urllib.request.urlopen('http://127.0.0.1:8797/api/content',timeout=10))
    (base/'evidence/content-snapshot.json').write_text(json.dumps(snap,ensure_ascii=False,indent=2))
    check('内容API待核对语义一致',not snap['warnings'] and snap['pool_rows']==63 and snap['completed_ids']==0 and snap['coverage_reconciled_count']==0)
except Exception as exc:
    check('本地服务可读取',False);checks.append({'error':str(exc)})
result={'date':'2026-10-21','checks':checks,'passed':sum(x.get('pass',False) for x in checks),'total':sum('pass' in x for x in checks),'paid_calls':0,'cms_writes':0,'deployments':0}
(base/'evidence/package-validation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(result,ensure_ascii=False,indent=2))
if result['passed']!=result['total']:raise SystemExit(1)
