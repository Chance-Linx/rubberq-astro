"""Build operational ownership and actual-link evidence; preserve research snapshots."""
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, urljoin
from urllib.request import urlopen
import csv, hashlib, io, json, re

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'docs/2026-10-21-全站规划落实'
PLAN=ROOT/'docs/2026-10-21-线上获客执行'
def read(p):return json.loads(p.read_text())
def write(p,v):p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
def normalized(v):return re.sub(r'[^a-z0-9]+',' ',v.lower()).strip()
keywords=read(PLAN/'data/keywords.json')
owners=read(BASE/'ownership/topic-owners.json')['decisions']
topic_keywords={normalized(t['primary_keyword']):t for t in owners}
pages=read(ROOT/'src/data/acquisition-pages.json')
drafts=read(BASE/'content-revisions/manifest.json')['drafts']
known={p['url'] for p in pages}|{'/blog','/search','/privacy','/terms'}|{d['url'] for d in drafts}
articles={d['url'] for d in drafts}
decisions={}
def assign(ids,status,url,reason):
    for i in ids:decisions[i]=(status,url,reason)

# Individually reviewed exceptions to the old cluster defaults; IDs preserve raw rows.
assign([15,99],'target_now','/resources/o-ring-size-guide','尺寸/AS568任务由尺寸指南承接，产品页连接报价；不新建同义页面。')
assign([86,148],'target_now',topic_keywords['o ring groove design']['primary_owner_url'],'槽设计与压缩/填充问题由已修订工程主文承接。')
assign([125,166,174,236,239,218,84,102,164,116,78,131,51,136,181,241],'target_now','/resources/material-compatibility','材料/介质比较由兼容性工程入口承接；具体胶料、温度和试验须确认。')
assign([171,238,274],'target_now','/resources/seal-failure-analysis','失效排查由工程入口承接，连接故障主文及产品评估。')
assign([175,183],'target_now',topic_keywords['compression set']['primary_owner_url'],'压缩永久变形任务进入已修订主文；区别材料试验与组件寿命。')
assign([205,245],'target_now','/testing','拉伸/老化试验由检测入口承接，方法、条件及报告逐项目确认。')
assign([177],'target_now',topic_keywords['custom rubber compounds']['primary_owner_url'],'配方开发信息任务归工程主文，双向连接配方支持与胶料外供。')
assign([172,266,267],'target_now','/sample-request','样品/原型申请归样件入口，模具与试制条件逐项目确认。')
assign([195,246,247,248,249,250,212],'target_now','/products/bellows','工业防护套/波纹管采购归波纹管页；不泛化到消费鞋靴。')
assign([96,141,142,160,268],'target_now','/products/seals','密封件及供应商采购归密封件产品页，避免泛定制页抢同一任务。')
assign([85],'context_only','/materials/fkm','Viton为第三方品牌；解释聚合物与牌号关系，不宣称品牌授权或统一等效。')
assign([41,62,145,230],'context_only','/products/ffkm-replacement-seals','第三方品牌比较/替代评估入口；须核对原牌号、工况与试验，不宣称通用等效或授权。')
assign([126,184],'context_only','/materials/ffkm','第三方FFKM品牌词仅作材料与替代评估背景，不冒充该品牌供应商。')
assign([13],'context_only','/materials/fkm','第三方品牌O圈词用于材料说明；供货牌号和品牌授权未由规划证明。')
assign([16,77,201],'context_only','/industries/liquid-cooling-energy-storage','整套液冷/CDU/快接硬件词仅作密封应用背景，不声称供应整机或连接器。')
assign([202],'target_now','/products/seals','快接O圈属于具体零件评估，要求装配、介质、连接动作与泄漏判据。')
assign([199,226,227],'context_only','/industries/humanoid-robotics','机器人整机/供应链宽词作部件应用背景，不能承诺整机供应。')
assign([59,76,92,95,97,100,104,118,119,122,123,170,197,221,225,228,229,235,282,283,292,35,38],'evidence_required',None,'特种材料/结构、专用工艺、食品饮水资质或防护等级须补具体能力/试验/文件；暂不计可执行商业承接或独立内容。')
assign([162,200,220],'evidence_required',None,'具体EV电池/氢能/燃料电池应用未确认，遵守公开红线；不能从行业规划推导供货能力。')
assign([261,262],'exclude_geography',None,'印度/越南本地厂家意图与中国工厂及已验收市场策略不符，不制作虚假本地落地页。')
assign([4,9,12,14,87,163,155],'exclude_unrelated',None,'宽泛鞋靴/汽车备件/导热垫/机器人皮肤或整机供应商意图，不作为当前独立获客任务；相关工业零件另由明确任务承接。')
assign([1,36,37,186,187],'context_only','/products/custom','原噪声标签保留；仅在工业定制部件语境使用，不把宽词搜索量视作有效需求。')
assign([20,79,243],'context_only','/products/seals','X形/四唇密封结构须按图纸确认；产品名称不证明已供所有结构。')
assign([21],'context_only','/products/diaphragms','隔膜阀整机词仅作零件应用背景，不宣称供应阀门。')
assign([25,88],'target_now','/products/diaphragms','原零售/MRO标签不直接排除工业隔膜零件需求；限定图纸与工况的制造评估。')
assign([101],'exclude_unrelated',None,'大宗冷却胶管不属于精密零件主攻范围。')
assign([124],'context_only','/products/custom','汽车宽词只保留橡胶定制部件子任务，不作为首位定位或整车售后目录。')
assign([27],'context_only','/products/gaskets','法兰垫片宽词仅限橡胶定制结构，不扩展为金属/缠绕垫片全品类供应。')

fallback={'o-rings':'/products/seals','gaskets':'/products/gaskets','molding':'/products/custom','flexible':'/products/bellows','silicone':'/materials/silicone'}
rows=[]
for k in keywords:
    n=int(k['id'].split('-')[-1]); t=topic_keywords.get(normalized(k['keyword']))
    if n in decisions:status,url,reason=decisions[n]
    elif t:status,url,reason='target_now',t['primary_owner_url'],'与已审读话题任务一致，采用其唯一主URL；归属不代表已通过覆盖验收。'
    elif k['planned_owner']:status,url,reason='target_now',k['planned_owner'],'沿用已审查产品/材料/工艺任务入口，限定实际橡胶零件与项目评估；不新增同义URL。'
    elif k['tag']=='retail_mro':status,url,reason='context_only',fallback.get(k['cluster'],'/products/custom'),'保留宽词，但仅承接工业制造/定制子意图；不把零售/MRO全量当作采购需求。'
    else:raise ValueError('Unreviewed raw row '+k['id'])
    assert url is None or url in known,(k['id'],url)
    priority='P0' if status=='target_now' and (k['tier'] in ['采购词','商业词'] or re.search(r'manufactur|supplier|custom|company|factory|compounder',k['keyword'])) else 'P1' if status=='target_now' else 'context' if status=='context_only' else 'hold'
    rows.append({'keyword_id':k['id'],'keyword':k['keyword'],'cluster':k['cluster'],'raw_tag':k['tag'],'raw_planned_owner':k['planned_owner'],'status':status,'primary_owner_url':url,'owner_changed':url!=(k['planned_owner'] or None),'priority':priority,'reason':reason,'exact_topic_id':t['topic_id'] if t else None,'implementation_state':'local_owner_exists_final_review_pending' if url else 'no_commercial_owner_assigned','coverage_verified':False,'production_verified':False,'source':'2026-10-21 existing research; no new collection'})
report={'scope':'Operational task/URL decisions; raw labels and metrics remain unchanged in original snapshot. No rank/coverage/revenue claim.','rows':rows,'counts':dict(Counter(x['status'] for x in rows)),'owner_changes':sum(x['owner_changed'] for x in rows),'source_sha256':hashlib.sha256((PLAN/'data/keywords.json').read_bytes()).hexdigest(),'paid_calls':0}
write(BASE/'ownership/keyword-owners.json',report)
with (BASE/'ownership/关键词当前归属.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator="\n");w.writeheader();w.writerows(rows)

class MainLinks(HTMLParser):
    def __init__(self):super().__init__();self.main=False;self.href=None;self.text=[];self.links=[];self.all_hrefs=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='a' and a.get('href'):self.all_hrefs.append(a['href'])
        if tag=='main':self.main=True
        if self.main and tag=='a':self.href=a.get('href');self.text=[]
    def handle_data(self,data):
        if self.href is not None:self.text.append(data)
    def handle_endtag(self,tag):
        if tag=='a' and self.href is not None:self.links.append((self.href,' '.join(''.join(self.text).split())));self.href=None
        if tag=='main':self.main=False
def fetch(url):
    with urlopen('http://127.0.0.1:4398'+url,timeout=30) as response:html=response.read().decode()
    p=MainLinks();p.feed(html);return url,html,p.links,p.all_hrefs
edge_map={};nodes=[];unresolved=[];all_hrefs={}
with ThreadPoolExecutor(max_workers=6) as pool:
    for source,html,links,hrefs in pool.map(fetch,sorted(known)):
        all_hrefs[source]=hrefs
        nodes.append({'url':source,'kind':'article' if source in articles else 'page','rendered_html_sha256':hashlib.sha256(html.encode()).hexdigest()})
        for href,anchor in links:
            u=urlsplit(urljoin('http://127.0.0.1:4398'+source,href))
            if u.scheme not in ['http','https'] or u.netloc not in ['127.0.0.1:4398','rubberq.com','www.rubberq.com']:continue
            target=u.path.rstrip('/') or '/'
            if target==source:continue
            if target not in known:unresolved.append({'source':source,'target':target,'anchor':anchor});continue
            key=(source,target)
            if key not in edge_map:edge_map[key]={'source':source,'target':target,'type':('article' if source in articles else 'page')+'_to_'+('article' if target in articles else 'page'),'anchors':[],'local_render_verified':True,'production_verified':False}
            if anchor not in edge_map[key]['anchors']:edge_map[key]['anchors'].append(anchor)
assert not unresolved,unresolved
planned=[]
for e in read(PLAN/'data/graph.json')['edges']:
    if e['type']=='话题归属候选':continue
    observed=(e['source'],e['target']) in edge_map
    if observed:resolution='observed_main_hyperlink';reason='主内容实际存在。'
    elif e['target'] in all_hrefs[e['source']]:resolution='common_navigation_only';reason='实际公共导航/页脚可到达；不冒充正文内链。'
    elif e['source'] in ['/privacy','/terms'] and 'mailto:contact@rubberq.com' in all_hrefs[e['source']]:resolution='legal_contact_email';reason='法律页使用真实联系邮箱；保留该交互，不为补规划数量插入销售表单CTA。'
    else:raise ValueError('Unresolved planned relation '+str(e))
    planned.append({**e,'observed_in_current_english_main':observed,'operational_resolution':resolution,'resolution_reason':reason})
graph={'scope':'Current English main-body hyperlinks observed on isolated local candidate; assignment relations are separate from hyperlinks. Original planning graph retained.','nodes':nodes,'edges':list(edge_map.values()),'topic_assignments':[{'source':t['topic_id'],'target':t['primary_owner_url'],'type':'editorial_assignment','coverage_verified':False,'production_verified':False} for t in owners],'planned_link_observations':planned,'summary':{'nodes':len(nodes),'actual_unique_links':len(edge_map),'edge_types':dict(Counter(e['type'] for e in edge_map.values())),'planned_links_observed':sum(e['observed_in_current_english_main'] for e in planned),'planned_links_total':len(planned),'unresolved_internal_targets':len(unresolved),'paid_calls':0,'production_deployments':0}}
write(BASE/'ownership/operational-graph.json',graph)
print(json.dumps({'keywords':len(rows),'keyword_statuses':report['counts'],'owner_changes':report['owner_changes'],'graph':graph['summary']},ensure_ascii=False))
