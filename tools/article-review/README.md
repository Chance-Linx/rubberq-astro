# RubberQ 本地文章候选预览

目的：把27篇本地英文修订稿放入生产路由同用的 `ArticlePage.astro`，核对真实布局、元数据和内链。CMS保持原状；这不是发布入口。

```bash
npm run review:articles
```

- 入口：<http://127.0.0.1:4398/__review>。
- `/blog/<原slug>` 在此专用端口显示本地修订稿；文章间链接继续使用原URL。核心页面仍使用真实网站组件。
- 正常 `npm run dev` 与生产配置不注入这些路由。专用配置只接受 `dev` 与127.0.0.1；响应禁止索引并禁止缓存。
- 正文来自 `docs/2026-10-21-全站规划落实/content-revisions/manifest.json`，日期/状态/原封面引用来自只读 `evidence/article-metadata-current.json`。版本号必须一致；不一致时先核对来源，不自动覆盖旧证据。
- 原图对照可用 `?covers=1` 至 `?covers=5`。19张旧封面经逐图检查在候选呈现层隐藏，CMS引用保留；8篇原本无封面。具体决定见 `evidence/article-cover-decisions.json`。
- 生产与本地候选共用可滚动表格、封面选择及相关卡片。未知/替换后的封面不沿用旧图片决定。

只读验证（普通开发服务器需同时运行在4397）：

```bash
python3 scripts/verify-article-review.py
node --test scripts/test-article-content.mjs scripts/test-article-presentation.mjs
```

以上检查不计作全项目集中审核、文章覆盖验收、CMS写入或上线。博客列表等专用页的进一步落实单列在执行台账。


## 博客列表与搜索接续

专用端口的 `/blog` 使用同一个 `BlogIndex.astro` 展示27篇本地稿，支持真实分类和每页12篇的分页；`/__review` 仍是逐图对照与文章入口。五语种 `/search` 在此端口将本地稿与真实页面内容一起检索。普通开发/生产配置继续从CMS读取文章，不会导入本地修订稿。

```bash
python3 scripts/verify-discovery-implementation.py
node --test scripts/test-content-discovery.mjs
```
