#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build private static body previews; never writes site source or Sanity."""
from pathlib import Path
import json,re,html,hashlib,runpy
B=Path(__file__).resolve().parent
m=json.loads((B/'content-revisions/manifest.json').read_text());helper=runpy.run_path(str(B/'tools_read_inventory.py'));records=helper['records']();source={a['_id']:(i,a) for i,a in enumerate(records)}
O=B/'article-previews';O.mkdir(exist_ok=True)
files={d['url']:'p-%03d.html'%source[d['article_id']][0] for d in m['drafts']}
style='''*{box-sizing:border-box}body{margin:0;background:#FFFFFF;color:#0A0A0A;font:16px/1.7 Inter,system-ui,-apple-system,'PingFang SC','Hiragino Sans Gothic','Noto Sans CJK SC','Microsoft YaHei',sans-serif}header{background:#0A0A0A;color:#FFFFFF;padding:18px max(20px,calc((100vw - 900px)/2))}header a{color:#FFFFFF}main{max-width:900px;margin:auto;padding:32px 24px 64px}h1{font-size:clamp(34px,5vw,54px);line-height:1.1;letter-spacing:-.03em;font-weight:800;margin:24px 0 30px}h2{text-transform:uppercase;font-weight:800;font-size:28px;line-height:1.25;letter-spacing:-.02em;margin:42px 0 18px;padding-top:22px;border-top:1px solid #E5E5E5}p{margin:16px 0}a{color:inherit;text-decoration-color:#EA580C;text-underline-offset:4px;overflow-wrap:anywhere}a:focus-visible,summary:focus-visible,[tabindex]:focus-visible{outline:2px solid #F97316;outline-offset:4px}.notice{font-size:13px;background:#FAFAFA;border-left:2px solid #525252;padding:14px 18px}.meta{font:12px/1.7 'JetBrains Mono',ui-monospace,monospace;overflow-wrap:anywhere;color:#525252}.table-wrap{overflow-x:auto;margin:24px 0}table{width:100%;border-collapse:collapse;font-size:14px;min-width:520px}th,td{vertical-align:top;padding:12px;text-align:left;border-bottom:1px solid #E5E5E5}th{background:#FAFAFA;font-weight:700}details{border-top:1px solid #E5E5E5;padding-top:18px;margin:26px 0}summary{cursor:pointer}ul.index{list-style:none;padding:0}ul.index li{padding:20px 0;border-bottom:1px solid #E5E5E5}small{color:#525252}.excerpt{font-size:18px;line-height:1.6}footer{border-top:1px solid #E5E5E5;margin-top:40px;padding-top:18px;font-size:13px;color:#525252}@media(max-width:540px){main{padding:24px 18px 48px}h2{font-size:24px}table{font-size:13px}}'''
def shell(title,body):return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+html.escape(title)+' | RubberQ local preview</title><style>'+style+'</style></head><body><header><strong>RubberQ</strong> / <a href="index.html">Article draft previews</a></header><main>'+body+'</main></body></html>'
manifest=[]
for d in sorted(m['drafts'],key=lambda x:source[x['article_id']][0]):
 i,a=source[d['article_id']];body=d['fields']['content']
 def link(match):
  path=match[1]
  target=files.get(path,'http://127.0.0.1:4397'+path)
  return 'href="'+html.escape(target,quote=True)+'"'
 rendered=re.sub(r'href="(/[^"\s]*)"',link,body)
 rendered=re.sub(r'(<table\b.*?</table>)',r'<div class="table-wrap" tabindex="0" role="region" aria-label="Technical table">\1</div>',rendered,flags=re.S)
 notice='<aside class="notice" lang="zh-CN">内部正文预览。保留原URL、发布日期与封面；本稿尚未写CMS或上线。本文未加载原封面，不能据此验收图片或正式博客布局。文章链接在此预览中指向同批本地稿；页面链接指向本地Astro站点。</aside>'
 title='<h1>'+html.escape(d['fields']['title'])+'</h1>'
 meta='<details lang="zh-CN"><summary>查看原记录与修订稿信息</summary><div class="meta">Source index: '+str(i)+'<br>Original URL: '+html.escape(d['url'])+'<br>Original publishedAt: '+html.escape(a['publishedAt'])+'<br>Expected revision: '+html.escape(d['expected_source_revision'])+'<br>Draft SHA-256: '+d['content_sha256']+'</div></details>'
 content=shell(d['fields']['title'],notice+title+'<article lang="en">'+rendered+'</article>'+meta+'<footer><a href="index.html">Back to all local article drafts</a></footer>')
 file=files[d['url']];(O/file).write_text(content,encoding='utf-8')
 manifest.append({'source_index':i,'article_id':d['article_id'],'original_url':d['url'],'title':d['fields']['title'],'file':file,'source_content_sha256':d['content_sha256'],'preview_sha256':hashlib.sha256(content.encode()).hexdigest(),'cms_written':False})
items=''.join('<li><div class="meta">SOURCE '+str(x['source_index'])+'</div><a href="'+x['file']+'"><strong>'+html.escape(x['title'])+'</strong></a><div class="meta">'+html.escape(x['original_url'])+'</div></li>' for x in manifest)
index=shell('Article drafts','<aside class="notice" lang="zh-CN">27篇保留文章的本地正文稿。供完整规划的统一审核使用；非生产发布，页面反向内链和正式文章布局/图片检查仍待实施。</aside><h1>Technical article drafts</h1><p>Read the complete revised bodies and follow the linked drafts in the same local preview set.</p><ul class="index">'+items+'</ul>')
(O/'index.html').write_text(index,encoding='utf-8');(O/'manifest.json').write_text(json.dumps({'scope':'Private standalone body preview, not production BlogPostLayout or image acceptance','articles':manifest},ensure_ascii=False,indent=2)+'\n')
print('Built',len(manifest),'private article body previews')
