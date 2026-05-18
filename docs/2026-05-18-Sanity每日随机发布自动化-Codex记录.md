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

## 2026-05-18 导入状态记录

本地已将 `.env` 与 `.env.local` 合并为单一 `.env.local` 文件，`.env.local` 仍被 Git 忽略，不会提交到仓库。导入脚本能够从 `.env.local` 读取 `SANITY_API_TOKEN`，但本次执行：

```bash
node scripts/import-articles-to-sanity.mjs --apply
```

Sanity 返回：

```text
Insufficient permissions; permission "create" required
```

结论：

- 当前 token 不是可创建 Sanity 文档的写权限 token。
- 5 篇 `docs/content/articles-v2/` 排期文章尚未导入 Sanity。
- 公开 Sanity 查询已复核：这 5 个 slug 当前返回空结果。
- 需要换用具备 `create` 权限的 Sanity token 后，再重新执行 `node scripts/import-articles-to-sanity.mjs --apply`。
- 不需要把 token 放回 GitHub secret；导入只在本机或受控执行环境临时使用 token。

待导入文章排期：

| 日期 UTC | Slug |
| --- | --- |
| 2026-06-01 09:37 | `compound-chemistry-vs-molder-ev-thermal-energy-storage-seals` |
| 2026-06-02 14:12 | `hnbr-vs-fkm-ev-thermal-management-compound-guide` |
| 2026-06-03 18:46 | `what-is-in-house-rubber-compounding` |
| 2026-06-04 10:21 | `single-line-mixing-semiconductor-ffkm-contamination` |
| 2026-06-05 16:08 | `compound-traceability-ppap-10-year-reproducibility` |

## 2026-05-18 执行完成：本地 5 篇 + Sanity 旧草稿 51 篇排期

用户已在本机 `.env.local` 更新具备 Editor 权限的 `SANITY_API_TOKEN`。本轮没有输出 token，也没有把 token 写入 GitHub secret。

新增脚本：

```bash
npm run sanity:schedule-drafts -- --dry-run --schedule-daily-from=2026-06-06
npm run sanity:schedule-drafts -- --apply --schedule-daily-from=2026-06-06
```

该脚本用途：

- 读取 Sanity 中 `_type == "article" && status == "draft"` 的文章。
- 使用与本地导入脚本一致的确定性随机排期算法：每天一篇，时间落在 UTC 08:00-11:59、13:00-16:59、17:00-21:59。
- 将通过公开红线检查的旧草稿改为 `status: "published"`，并写入未来 `publishedAt`。
- 对医疗、FDA/ISO 13485、旧 robotics、旧 AI/data-center、高压 battery pack/PDU/BMS、测试占位文章保持草稿，不公开。

实际执行结果：

| 批次 | 数量 | 排期范围 |
| --- | ---: | --- |
| 本地 `docs/content/articles-v2/` 新文章 | 5 | 2026-06-01 至 2026-06-05 |
| Sanity 旧草稿转未来发布 | 51 | 2026-06-06 至 2026-07-26 |
| 保留草稿不公开 | 12 | 因公开红线或测试占位跳过 |

复核查询结果：

```text
futurePublishedCount: 56
remainingDraftCount: 12
publicNowCount: 156
nextFuture: 2026-06-01T20:57:00.000Z
lastFuture: 2026-07-26T16:46:00.000Z
```

说明：

- 这 56 篇已是 `status: "published"`，但因为 `publishedAt` 在未来，当前前台不会显示。
- 到达对应 `publishedAt` 后，Astro 前台通过 `publishedAt <= now()` 查询自然露出。
- 不需要 GitHub Actions 或 Cloudflare Cron 每天改 Sanity。

保留草稿的 12 篇：

| 标题 | 原因 |
| --- | --- |
| AI Data Center Liquid Cooling Seals: Why FKM Outperforms in 24/7 Operation | 旧 AI/data-center 定位 |
| Silicone vs. LSR: Comparing Precision and Cost in High-Volume Medical Gaskets. | 医疗方向 |
| 800V EV Architecture: Material Selection for High-Voltage Battery Pack Seals. | 未确认高压 battery pack 应用 |
| Liquid Cooling for AI Servers: Preventing Coolant Leaks with Precision HNBR Gaskets. | 旧 AI/data-center 定位 |
| Vibration Dampening in High-Density Racks: Custom Rubber Mounts for Servers. | 旧 AI/data-center 定位 |
| High-Flex Bellows for 6-Axis Robots: Material Fatigue and Cycle Life Testing. | 旧 robotics 定位 |
| Gripper Pads for Food Automation: FDA-Compliant Silicone Solutions. | FDA 公开红线 |
| Cleanroom Manufacturing: Controlling Particle Contamination in Medical Seals. | 医疗方向 |
| Molding Shrinkage: Why the Same Tool Produces Different Sizes with Different Materials. | 命中旧 AI/data-center 红线词 |
| Warping in Molded Parts: Managing Internal Stresses during Cooling. | 命中旧 AI/data-center 红线词 |
| 文章标题 | 缺 slug / 占位测试 |
| 测试文章 - Obsidian 同步功能 | 占位测试 |

## 2026-05-18 追更：改为每天两篇

用户要求从每天一篇改为每天两篇。本轮已完成：

- `scripts/import-articles-to-sanity.mjs` 增加 `--per-day` 参数，默认值改为 `2`。
- `scripts/schedule-sanity-drafts.mjs` 增加 `--per-day` 参数，默认值为 `2`。
- `scripts/schedule-sanity-drafts.mjs` 增加 `--source=future-published`，可重新排期已经写入未来 `publishedAt` 的文章。
- 每天两篇时，第一篇落在 UTC 08:00-17:00，第二篇落在 UTC 17:00-22:00，避免两篇随机到同一时间段或同一分钟。

已对 Sanity 当前 56 篇未来文章执行重新排期：

```bash
npm run sanity:schedule-drafts -- --apply --source=future-published --schedule-daily-from=2026-06-01 --per-day=2
```

复核结果：

```text
futurePublishedCount: 56
date range: 2026-06-01 to 2026-06-28
dayCount: 28
minPerDay: 2
maxPerDay: 2
firstFuture: 2026-06-01T11:24:00.000Z
lastFuture: 2026-06-28T18:03:00.000Z
```

结论：当前排期已是每天两篇，仍然依靠 `publishedAt <= now()` 自然露出，不需要每日 Cron 去修改文章。

## 2026-05-18 追更：起点改为今天

用户指出排期起点应该从今天开始。当前环境时间为 2026-05-18 18:11 CST，本轮已将 Sanity 当前 56 篇未来发布文章重新排期为：

```bash
npm run sanity:schedule-drafts -- --apply --source=future-published --schedule-daily-from=2026-05-18 --per-day=2
```

复核结果：

```text
publicNowCount: 156
futurePublishedCount: 56
remainingDraftCount: 12
date range: 2026-05-18 to 2026-06-14
dayCount: 28
minPerDay: 2
maxPerDay: 2
firstFuture: 2026-05-18T14:37:00.000Z
lastFuture: 2026-06-14T18:00:00.000Z
```

结论：当前最终排期是从今天 2026-05-18 开始，每天两篇，覆盖 28 天。5 篇本地 v2 文章的 frontmatter 也已同步到对应 Sanity 时间，并改为 `status: "published"`。
