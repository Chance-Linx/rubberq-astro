# 2026-05-18 Next 到 Astro 链接迁移与 301 检查记录

## 背景

本次检查目标：确认 `RubberQ-B2B-Site/` Next.js 旧站迁移到 `rubberq-astro/` 后，旧页面 URL 不会因为路由结构变化出现 404。

当前执行原则：

- `rubberq-astro/` 是唯一活跃维护版本。
- `RubberQ-B2B-Site/` 只作为旧路由、旧内容来源和迁移参考。
- 旧页面若当前仍有等价页面，应保留原路径或 301 到新规范路径。
- 旧内容若不再适合公开展示，应 301 到相关上级入口，避免 404。

## 发现的问题

1. 旧 Next 站使用 `/:locale/blog` 与 `/:locale/blog/:slug`。
2. Astro 当前构建虽然有顶层 `/blog` 路由产物，但在 Cloudflare Pages SSR + 当前 i18n 配置下，本地 Pages 预览实际返回 404。
3. Footer / Navbar 曾直接链接 `/blog`，会把用户带到 404。
4. 旧 WordPress 文章共有 205 个 slug；当前 Sanity 公开可访问文章为 137 个。对比后，有 83 个旧文章 slug 当前没有公开等价文章，需要兜底 301。
5. 旧的 `/:locale/sitemap.xml`、`/:locale/robots.txt` 不再是规范系统文件地址，应跳转到根路径系统文件。
6. 无语言前缀旧路径，例如 `/about`、`/products/seals`、`/materials/fkm`，应跳转到默认英文路径。

## 已实施

代码变更：

- 新增 `src/middleware.ts`，集中处理迁移期 301。
- 新增 `src/pages/en/blog/index.astro`，让 `/en/blog` 成为英文博客规范入口。
- 新增 `src/pages/en/blog/[slug].astro`，让 `/en/blog/:slug` 成为英文博客详情规范入口。
- 更新 `src/components/Navbar.astro` 与 `src/components/Footer.astro`，站内 Blog 链接直连 `/en/blog`。
- 更新 `src/lib/sanity.ts`，`getBlogUrl()` 输出 `/en/blog/:slug`。
- 博客详情页在 Sanity 查询失败或文章不存在时，不再直接输出 404，而是临时跳转到 `/en/blog`。

当前 301 规则：

- `/` -> `/en`
- `/blog` -> `/en/blog`
- `/blog/:slug` -> `/en/blog/:slug`，若属于无公开等价内容的旧 WP slug，则 -> `/en/blog`
- `/:locale/blog` -> `/en/blog`，其中非英文 locale 统一合并到英文博客入口
- `/:locale/blog/:slug` -> `/en/blog/:slug`，若属于无公开等价内容的旧 WP slug，则 -> `/en/blog`
- `/en/blog/:slug` 查询不到可公开文章时 -> `/en/blog`（302，避免把临时 CMS 失败固化成永久跳转）
- `/:locale/sitemap.xml` -> `/sitemap.xml`
- `/:locale/robots.txt` -> `/robots.txt`
- `/about`、`/products/...`、`/materials/...` 等无语言前缀页面 -> `/en/...`
- 非资源路径的尾斜杠统一去除，例如 `/en/contact/` -> `/en/contact`

## 验证结果

本地验证方式：

```bash
npm run check:public-redlines
npm run check:brand-colors
npx astro check
npm run build
npx wrangler pages dev dist --port 8791
```

验证结论：

- `check:public-redlines` 通过。
- `check:brand-colors` 通过。
- `astro check` 0 errors；剩余为既有 warning / hint。
- `npm run build` 通过。
- 批量检查 130 个旧 Next-style 静态、产品、材料 URL：无 404 或断裂跳转。
- 初次高并发批量检查 205 个旧 WordPress 文章 URL 时发现：Sanity CDN 可能返回临时内部错误，旧代码会把这类错误变成文章 404。
- 已将文章详情兜底改为 302 到 `/en/blog`，避免迁移期旧文章链接出现硬 404。
- 降低并发后复测 205 个旧 WordPress 文章 URL：
  - 122 个当前可公开文章返回 200。
  - 83 个无公开等价内容的旧 slug 返回跳转兜底。
  - 无 404 或断裂跳转。

## 后续建议

上线后在 Cloudflare Pages 部署环境再做一次同样的 URL 批量检查，并在 Google Search Console 观察：

- `Not found (404)`
- `Page with redirect`
- `Duplicate without user-selected canonical`
- `Alternate page with proper canonical tag`

如果后续将某个旧 WP slug 重新迁移为 Sanity 公开文章，需要从 `src/middleware.ts` 的旧文章兜底集合中移除对应 slug，让它恢复为 `/en/blog/:slug` 详情页。
