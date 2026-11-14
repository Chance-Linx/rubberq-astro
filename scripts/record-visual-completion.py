"""Record a human/agent visual inspection only after real local and live checks exist."""
import argparse,json,datetime,hashlib,importlib.util
from pathlib import Path
from argparse import Namespace
p=argparse.ArgumentParser();p.add_argument('article');p.add_argument('--observations',required=True);p.add_argument('--visually-reviewed',action='store_true',required=True);a=p.parse_args();article=Path(a.article).resolve();base=article.parent.parent
read=lambda name:json.loads((article/name).read_text())
m=read('visuals.json');plan=read('visual-publication-plan.json');parent=read('visual-parent-acceptance.json');live=read('visual-live-checks.json');back=read('visual-readback-checks.json')
sha=hashlib.sha256((article/'visual-publication-plan.json').read_bytes()).hexdigest();assert parent['approved'] and parent['plan_sha256']==live['plan_sha256']==sha
assert back['passed'] and back['text_preserved'] and back['all_other_fields_preserved']
assert len(live['checks'])==2 and {x['viewport'] for x in live['checks']}=={'desktop','mobile'}
for x in live['checks']:assert x['status']==200 and x['body_match'] and x['width']<=x['viewport_width'] and x['card_loaded'] and x['card_fit']=='contain' and x['no_captions'] and x['imageobject_count']==len(m['images']) and x['blogposting_count']==1
assert a.observations.strip()
receipt={'visual_approved':True,'cms_readback':True,'live_article':True,'live_card':True,'schema':True,'card_image_id':m['card_image']['image_id'],'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commit':json.loads((base/'visual-deployment/active.json').read_text())['commit'],'reviewer':'Codex parent','evidence':['visual-parent-acceptance.json','visual-readback-checks.json','visual-live-checks.json'],'observations':a.observations}
r=article/'visual-completion-receipt.json';r.write_text(json.dumps(receipt,indent=2))
q=base/'visual-queue.json';row=next(x for x in json.loads(q.read_text())['articles'] if x['id']==plan['article_id']);spec=importlib.util.spec_from_file_location('h','/Users/LINLAN/.agents/skills/ggs-content-autopilot/scripts/visual-backfill.py');h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
h.cmd_complete(Namespace(queue=str(q),id=row['id'],token=row['lease_token'],receipt=str(r)))
result=read('visual-result.json');result.setdefault('local_delivery_status',result.get('status'));result.setdefault('local_pending_at_handoff',result.get('pending',result.get('remaining',[])));result.update(status='published_and_live_accepted',public_urls_verified=True,cms_written=True,page_preview_passed=True,schema_status='published_and_verified',pending=[],remaining=[]);result['parent_publication']={'status':'published_and_live_accepted','receipt':r.name,'revision':back['revision'],'images':len(m['images']),'checked_at':receipt['checked_at']};(article/'visual-result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
rows=json.loads(q.read_text())['articles'];complete=[x for x in rows if x['status']=='complete'];count=sum(len(json.loads((base/'articles'/x['canonical'].rsplit('/',1)[1]/'visuals.json').read_text())['images']) for x in complete)
summary={'updated_at':receipt['checked_at'],'total_articles':len(rows),'live_accepted_articles':len(complete),'live_accepted_images':count,'remaining_articles':len(rows)-len(complete),'next':'Continue current queue; local assets are not counted as accepted articles.'};(base/'visual-progress-summary.json').write_text(json.dumps(summary,indent=2));print(json.dumps(summary))
board=base.parent/'2026-10-21-线上获客执行/growth-board/work-items.json'
data=json.loads(board.read_text());items=data.get('items',data.get('work_items',[]));item=next(x for x in items if x['id']=='RQ-20261114-VISUALS');item['status']='进行中' if len(complete)<len(rows) else 'done';item['title']='全站文章配图与正式页面验收';item['note']=f"207篇文字总门槛已通过。当前正式验收{len(complete)}/{len(rows)}篇、{count}张配图；剩余{len(rows)-len(complete)}篇。仅正式文章、卡片、图片与Schema全部验收后计数。";item['next_step']='继续按visual-queue.json领取，保持正文逐字节不变并逐篇版本保护发布；08:00汇报实际进度。';board.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
