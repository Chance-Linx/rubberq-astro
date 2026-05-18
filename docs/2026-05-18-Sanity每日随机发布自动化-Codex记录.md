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
