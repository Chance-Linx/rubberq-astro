# RubberQ 网站事实

`rubberq-astro/` 是 RubberQ 的活跃网站实现，项目背景位于 `../AGENTS.md`。`../RubberQ-B2B-Site/`、`../RubberQ-readdy/` 和 `../rqing.com/` 是历史站点或参考资料。

## 技术与资源

- 技术栈：Astro 5、React 18 islands、Tailwind CSS 3、Sanity CMS、Cloudflare Pages 服务端渲染。
- 正式域名：<https://rubberq.com>。
- Cloudflare Pages project：`rubberq-astro`；构建产物：`dist/`。
- R2 bucket：`rubberq-images`；binding：`R2_BUCKET`；CDN：`https://images.rubberq.com`。
- KV binding：`SESSION`。
- Sanity projectId：`tcjl4afv`；dataset：`production`。
- RFQ Worker：`rubberq-rfq-api`；D1 database：`rubberq_rfq`；table：`rfqs`。

## 代码与文档位置

- UI 语言文件：`src/messages/{en,de,ja,es,zh}.json`。
- 多语言 canonical/hreflang 工具：`createLocaleAlternates()`；结构化数据组件：`JsonLd`。
- 询盘组件：`src/components/contact/`；追踪字段：`src/lib/inquiryTracking.ts`；Worker 参考源码：`tools/rfq-worker-v2/`。
- 项目文档：`docs/`；文档镜像：`../项目文档/`。
- 任务、日志和设计资料：`../全球增长系统/任务清单/任务清单.md`、`../全球增长系统/工作日志/工作日志.md`、`../全球增长系统/项目资料/Design.md`。
- 2026-10-21 获客规划：`docs/2026-10-21-线上获客执行/01-验收决策与执行口径.md`。规划行业顺序为半导体 → 液冷与储能 → EV 热管理 → 人形机器人，通用工业定制件为搜索获客主力，胶料外供和 FFKM 替代件纳入规划，付费数据与监测预算尚未确定。

## 现有命令

```bash
npm run dev
npm run build
npm run preview
npm run deploy
npm run check:public-redlines
npm run check:brand-colors
```

`build`、`preview`、`deploy` 脚本均包含文案和品牌色检查；部署脚本指定 Cloudflare Pages 项目 `rubberq-astro`。

## 资料存放规则（2026-11-14）

文档、文章、审计证据、发布回执和原始资产统一存放于项目根目录的 `全球增长系统/`。Astro 原 `docs/` 已迁至 `全球增长系统/项目文档/`；旧镜像在 `全球增长系统/历史归档/项目文档旧镜像/`。网站代码、运行所需静态资源及开发说明保留代码仓库。文章发布到 Sanity，不能把本地文稿目录重新放回 Astro。配图当前暂停，整理文件不构成恢复配图或 CMS 发布授权。
