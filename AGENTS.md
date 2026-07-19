# AGENTS.md

本文件是 `rubberq-astro/` 活跃站点实现的工作入口。更上层项目说明见根目录 `../AGENTS.md`，本文件只记录当前 Astro 仓库的执行规则。

## 当前定位

`rubberq-astro/` 是 RubberQ 唯一活跃维护的网站实现。不要在 `../RubberQ-B2B-Site/`、`../RubberQ-readdy/` 或 `../rqing.com/` 中开发新功能或部署生产站。

## 常用命令

```bash
npm run dev
npm run build
npm run preview
npm run deploy
```

部署目标必须是 Cloudflare Pages project `rubberq-astro`。

## 关键资源

- Production domain: `https://rubberq.com`
- Cloudflare Pages project: `rubberq-astro`
- R2 bucket: `rubberq-images`
- R2 binding: `R2_BUCKET`
- KV binding: `SESSION`
- Sanity projectId: `tcjl4afv`
- Sanity dataset: `production`
- RFQ Worker: `rubberq-rfq-api`
- D1 database: `rubberq_rfq`
- D1 table: `rfqs`

## 文档规则

主文档目录是 `docs/`。根目录 `../项目文档/` 是镜像，不作为主编辑位置。

更新任务清单、项目日志或规范文档时：

```bash
rsync -a docs/ ../项目文档/
```

既有 `.md` 管理文档遵守追加式记录：只在文末追加，不删除、不覆盖旧记录。

## 公开文案规则

客户可见文案必须是工厂专业、客户可理解的表达。不要把后台讨论口吻、审核措辞、内部合规审稿语言或占位说明放到前台页面。

默认表达方向：

- 材料和配方支持
- 工艺能力
- 检测验证
- 追溯体系
- 项目配合方式
- 客户下一步需要提供的信息

## 硬性红线

1. 不公开披露日方合作伙伴公司名。
2. 不在页面枚举未确认的 EV 高压具体应用。
3. 不承诺不真实的开发周期。
4. 不宣传医疗资质。
5. 不把“汽车级”作为首位定位。
6. Industries 顺序保持 EV -> Industrial -> Semiconductor -> Automotive Tier 2。

## 代码规则

- UI 文案走 `src/messages/{en,de,ja,es,zh}.json`。
- 多语言页面用 `createLocaleAlternates()` 生成 canonical/hreflang。
- 新页面按需注入 `JsonLd`。
- 表单字段变更必须同步 `src/lib/inquiryTracking.ts`、RFQ Worker 入参、D1 字段。
- 修改前先读现有组件和数据结构，优先沿用本仓库模式。

## 验证规则

前端或内容规则变更后默认运行：

```bash
npm run build
```

只改 Markdown 文档时，可不跑构建，但需要检查文件同步和 git 状态。

## Git 规则

- 提交备注用中文。
- 不回滚用户未要求回滚的改动。
- 推送前确认只包含本次任务相关文件。
