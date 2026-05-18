# 2026-05-18 Sanity 每日随机发布自动化记录

## 背景

用户要求：让 Sanity 每天在欧美时区的白天随机时间发布一篇文章。

当前项目唯一活跃站点为 `rubberq-astro/`。博客内容源为 Sanity `_type == "article"`，前台只渲染 `status == "published"` 的文章。

## 实施文件

- `scripts/daily-publish-sanity.mjs`
- `.github/workflows/sanity-daily-publish.yml`
- `package.json` 新增 `sanity:daily-publish`

## 运行逻辑

GitHub Actions 每 30 分钟触发一次，UTC 08:00-23:59 覆盖欧洲与北美白天时段。脚本内部根据当天日期与 salt 生成一个稳定随机发布时间，只有当前时间超过该随机时间后才会尝试发布。

随机窗口分为三段：

- Europe business morning：08:00-11:59 UTC
- Europe / US East overlap：13:00-16:59 UTC
- North America daytime：17:00-21:59 UTC

每天只发布一篇。脚本会先查 Sanity 日志文档 `rubberq-daily-publish-YYYY-MM-DD`，如果当天已经发布，则跳过。发布时使用 Sanity transaction 同时创建日志文档并把文章 `status` 改为 `published`，避免重复发布。

## 选稿规则

只从 Sanity 中选择：

- `_type == "article"`
- `status == "draft"`
- 未设置 `noAutoPublish`
- 未设置 `holdPublish`

按 `publishedAt` / `_createdAt` 从早到晚选择第一篇合格文章。

脚本会跳过缺少 `title` / `slug` / `excerpt` / `content` 的草稿，也会跳过命中公开口径红线词的草稿，例如 medical、ISO 13485、FDA、robotics、battery-pack、PDU、BMS、data-center 等。

## 必要配置

GitHub 仓库需要配置：

- Secret：`SANITY_API_TOKEN`
- 可选 Secret：`SANITY_DAILY_PUBLISH_SALT`
- 可选 Variables：`SANITY_PROJECT_ID`，默认 `tcjl4afv`
- 可选 Variables：`SANITY_DATASET`，默认 `production`

`SANITY_API_TOKEN` 需要具备读取 draft 与写入 article 的权限，建议使用 Sanity Editor 或 Maintainer 级别 token。

## 手动命令

在 `rubberq-astro/` 目录下：

```bash
npm run sanity:daily-publish -- --plan
npm run sanity:daily-publish -- --dry-run
npm run sanity:daily-publish -- --force
```

- `--plan`：只查看今天随机发布时间，不访问 Sanity。
- `--dry-run`：查询候选草稿但不写入。
- `--force`：立即发布一篇，但仍遵守当天只发布一次的 Sanity 日志限制。

## 注意事项

- 这不是 Sanity 内置 Scheduled Publishing，而是 GitHub Actions + Sanity API 的发布自动化。
- 如果没有合格 draft，任务会正常跳过，不会发布旧方向或红线内容。
- 如果要临时暂停某篇文章自动发布，在 Sanity 文档上加 `holdPublish: true` 或 `noAutoPublish: true`。
- 前台文章 URL 为 `/en/blog/:slug`，脚本日志中的 URL 使用 `https://rubberq.com/en/blog/:slug`。

## 2026-05-18 修订：改为 Leafclock-style future `publishedAt`

基于 Leafclock 项目的实现复盘，RubberQ 不再使用 GitHub Actions 每日写入 Sanity 的发布器，也不再要求 GitHub 保存 `SANITY_API_TOKEN` 来定时修改文章状态。

新的发布逻辑：

- Sanity 文章导入时默认写入 `status: "published"`。
- `publishedAt` 可以设置为未来时间。
- Astro 前台查询统一要求 `status == "published" && publishedAt <= now()`。
- 到达 `publishedAt` 之后，文章在前台自然可见；发布时不会再有脚本去更新 Sanity 文档。
- 前台 Sanity client 改为公开读取，不再读取 `SANITY_API_TOKEN`。
- 为避免按时间露出的文章被旧 CDN 查询结果挡住，前台读取关闭 Sanity CDN。

已废弃并删除：

- `.github/workflows/sanity-daily-publish.yml`
- `scripts/daily-publish-sanity.mjs`
- `package.json` 中的 `sanity:daily-publish`
- GitHub Actions secret `SANITY_API_TOKEN` 已从 `Chance-Linx/rubberq-astro` 删除。

保留的写入场景：

- 只有本地批量导入或人工维护 Sanity 内容时才需要 `SANITY_API_TOKEN`。
- token 应放在本机环境变量、临时 shell、密码管理器或执行机器的 secret 中；不再放入 GitHub Actions secret 作为每日发布器使用。

导入脚本的新参数约定：

```bash
node scripts/import-articles-to-sanity.mjs --dry-run
SANITY_API_TOKEN=sk_xxx node scripts/import-articles-to-sanity.mjs --apply
SANITY_API_TOKEN=sk_xxx node scripts/import-articles-to-sanity.mjs --apply --draft
SANITY_API_TOKEN=sk_xxx node scripts/import-articles-to-sanity.mjs --apply --preserve-status
```

- 默认：导入为 `published`，由 `publishedAt` 控制前台什么时候显示。
- `--draft`：强制导入为草稿。
- `--preserve-status`：保留 Markdown frontmatter 里的 `status`。

## 2026-05-18 补充：每日随机白天时间

为了延续“每天在欧美白天随机露出一篇”的目标，导入脚本补充了 `--schedule-daily-from=YYYY-MM-DD` 参数：

```bash
node scripts/import-articles-to-sanity.mjs --dry-run --schedule-daily-from=2026-06-01
SANITY_API_TOKEN=sk_xxx node scripts/import-articles-to-sanity.mjs --apply --schedule-daily-from=2026-06-01
```

该参数会按文件排序生成一天一篇的 `publishedAt`，时间落在 UTC 08:00-11:59、13:00-16:59、17:00-21:59 三个窗口之一，对应欧洲白天、欧美重叠时段、北美白天。随机值是确定性的：同一日期与 slug 会得到同一时间，便于 dry run 后再 apply。

当前 5 篇 `docs/content/articles-v2/` 文章的 frontmatter 也已改为 2026-06-01 至 2026-06-05 每天一篇，并使用随机白天时间。
