from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys,datetime,hashlib,re,subprocess
p=Path(sys.argv[1]);origin=sys.argv[2] if len(sys.argv)>2 else 'https://rubberq.com';live=origin.startswith('https://rubberq.com');bundle=json.loads((p/'visual-review-bundle.json').read_text());d=bundle['drafts'][0];out=p/('visual-live' if live else 'visual-preview');out.mkdir(exist_ok=True);rows=[];cardpath='/blog'
if live:
 ordered=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import fs from 'node:fs';let r=JSON.parse(fs.readFileSync('../全球增长系统/项目文档/2026-11-14-持续优化/text-audit/final-cms-snapshot.json')).articles;r.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a._id.localeCompare(b._id));console.log(JSON.stringify(r.map(x=>x._id)))"]))
 cardpath='/blog?page='+str(ordered.index(d['article_id'])//12+1)
with sync_playwright() as pw:
 b=pw.chromium.launch(headless=True,channel='chrome');page=b.new_page()
 for name,w,h in [('desktop',1440,1000),('mobile',390,844)]:
  page.set_viewport_size({'width':w,'height':h});r=page.goto(origin+d['url'],wait_until='networkidle',timeout=60000);page.locator('.article-body').wait_for()
  consent=page.get_by_role('button',name=re.compile('necessary only',re.I))
  if consent.count() and consent.is_visible():consent.click()
  for img in page.locator('.article-body img').all():img.scroll_into_view_if_needed()
  page.wait_for_function('Array.from(document.querySelectorAll(".article-body img")).every(i=>i.complete&&i.naturalWidth>0)')
  images=page.locator('.article-body img').evaluate_all('(els)=>els.map(i=>({src:i.src,alt:i.alt,width:i.naturalWidth,height:i.naturalHeight}))');nodes=[]
  for raw in page.locator('script[type="application/ld+json"]').all_text_contents():
   obj=json.loads(raw);nodes.extend(obj.get('@graph',[obj]))
  blogs=[n for n in nodes if n.get('@type')=='BlogPosting'];igs=[n for n in nodes if n.get('@type')=='ImageObject']
  actual=page.locator('.article-body').evaluate('(e)=>e.textContent.replace(/\\s+/g," ").trim()');expected=page.evaluate('(s)=>{let e=document.createElement("div");e.innerHTML=s;return e.textContent.replace(/\\s+/g," ").trim()}',d['fields']['content'])
  row={'viewport':name,'status':r.status,'width':page.evaluate('document.documentElement.scrollWidth'),'viewport_width':w,'images':images,'body_match':actual==expected,'blogposting_count':len(blogs),'imageobject_count':len(igs),'no_captions':page.locator('.article-body figcaption').count()==0}
  assert r.status==200 and row['width']<=w and row['body_match'] and len(blogs)==1 and len(igs)==len(images)==len(d['fields']['articleVisuals']),row
  assert {i['src'] for i in images}=={i['contentUrl'] for i in igs};assert {i['@id'] for i in igs}=={i['@id'] for i in blogs[0]['image']}
  assert page.locator('link[rel=canonical]').get_attribute('href')=='https://rubberq.com'+d['url']
  assert page.locator('meta[property="og:image:alt"]').get_attribute('content')==d['fields']['coverImage']['alt']
  for im in d['fields']['articleVisuals']:
   found=next(i for i in images if i['alt']==im['alt']);assert found['width']==im['width'] and found['height']==im['height'];page.locator('[data-visual-id="'+im['id']+'"]').scroll_into_view_if_needed();page.wait_for_timeout(1500);page.locator('[data-visual-id="'+im['id']+'"]').screenshot(path=str(out/(name+'-'+im['id']+'.png')))
  page.screenshot(path=str(out/(name+'-article.png')),full_page=True)
  page.goto(origin+cardpath,wait_until='networkidle',timeout=60000);card=page.locator('[data-article-id="'+d['article_id']+'"]');card.scroll_into_view_if_needed();page.wait_for_function('(id)=>{const i=document.querySelector(`[data-article-id="${id}"] img`);return i?.complete&&i.naturalWidth>0}',arg=d['article_id']);card.screenshot(path=str(out/(name+'-card.png')));row['card_loaded']=True;row['card_fit']=card.locator('img').evaluate('(i)=>getComputedStyle(i).objectFit');assert row['card_fit']=='contain';rows.append(row)
 b.close()
(p/('visual-live-checks.json' if live else 'visual-preview-checks.json')).write_text(json.dumps({'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'origin':origin,'plan_sha256':hashlib.sha256((p/'visual-publication-plan.json').read_bytes()).hexdigest(),'checks':rows},indent=2));print(json.dumps({'passed':True,'article':p.name,'checks':len(rows)}))
