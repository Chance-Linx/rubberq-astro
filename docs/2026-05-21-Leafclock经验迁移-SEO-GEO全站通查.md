# 2026-05-21 Leafclock 经验迁移：RubberQ SEO / GEO 全站通查

## 本次通查范围

- 对照 Leafclock Astro 项目的 SEO/GEO 审计方式，检查 RubberQ 当前 Astro 站点。
- 覆盖 robots.txt、llms.txt、sitemap.xml、canonical、hreflang、博客规范入口、多语言 metadata、公开页面旧定位词、Cloudflare Pages 本地预览行为。
- 本次只修改 `rubberq-astro/`，旧 Next.js 目录仅作为历史参考。

## 已修复

1. sitemap 博客入口统一为规范路径 `/en/blog`
   - 之前 sitemap 仍包含 `https://rubberq.com/blog`。
   - 当前已改为 `https://rubberq.com/en/blog`。
   - 复测 sitemap 共 324 条，无重复 URL。

2. sitemap 输出增强
   - 增加 XML 转义。
   - 增加 `Cache-Control: public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400`。

3. robots / llms 增强
   - robots 增加 AI 搜索爬虫入口说明：OAI-SearchBot、ChatGPT-User、PerplexityBot、Claude-SearchBot。
   - robots 对训练型爬虫增加拒绝：GPTBot、Google-Extended、CCBot。
   - robots 增加 llms.txt 指引。
   - llms.txt 的博客入口从 `/blog` 改为 `/en/blog`。
   - 新增 `_headers`，为 robots.txt / llms.txt 设置 Cloudflare 边缘缓存。

4. Blog SEO 元信息补强
   - BlogLayout 增加 `/en/blog` 规范 canonical 处理。
   - 增加 `hreflang=en` 与 `x-default`。
   - 增加 `og:site_name`、`og:url`。
   - Blog 列表页增加 Open Graph / Twitter 基础标签。
   - Blog 文章页增加 Twitter card 标签。
   - Blog 页面增加 Organization JSON-LD。

5. 多语言 metadata 补齐
   - 德语、日语、西语、中文补齐 `compounding`、`testing`、`industries` 及四个行业详情页 metadata。
   - 复测所有 locale 的 `metadata` key 与英文基准一致，无缺失。

6. 旧定位词清理
   - 清理多语言可见文案中残留的 robotics / AI Infrastructure / Prototype 3-5 days / automotive-grade 首位定位等旧口径。
   - 当前本地红线扫描通过。

7. 增加可重复 SEO 审计脚本
   - `npm run audit:canonical`
   - `npm run audit:crawler-access`
   - `npm run audit:rendered-seo`
   - `npm run audit:seo`

## 验证结果

本地验证命令：

```bash
npm run build
npx wrangler pages dev dist --port 8792
npm run audit:seo -- http://127.0.0.1:8792
```

通过结果：

- `check:public-redlines` passed
- `check:brand-colors` passed
- `npm run build` passed
- `Canonical / hreflang / sitemap audit passed for 324 sitemap URLs`
- `Crawler access audit passed`
- `Rendered SEO audit passed`
- `Technical SEO audit suite passed`

抽查确认：

- `/sitemap.xml` 包含 `/en/blog`，不再包含旧 `/blog`
- `/ja/compounding` 使用日语 metadata，不再回退英文
- `/es/industries/ev-energy-storage` 使用西语 metadata，不再回退英文
- `/en/blog` 输出 canonical、hreflang、Organization JSON-LD 与 Open Graph 标签
- `/robots.txt`、`/llms.txt`、`/sitemap.xml` 均有缓存头

## 线上发现

截至 2026-05-21，本地与 Pages 预览已是新版本，但主域名 `https://rubberq.com` 仍在返回旧 Next.js 版本：

- 首页仍有旧口径：Robotics、AI Infrastructure、Automotive-grade first positioning。
- `/robots.txt` 与 `/sitemap.xml` 在主域名下返回 404。
- `/en/blog` 在主域名下仍 308 到 `/blog`，与 Astro 当前规范相反。

这不是当前 Astro 代码问题，而是主域名尚未切换到 `rubberq-site` / `rubberq-astro` 这一版。正式迁移主域名前，应再次执行线上 URL 批量检查。

## 后续 P0

1. 主域名切换到当前 Astro Pages 项目。
2. 切换后立刻验证：
   - `https://rubberq.com/robots.txt`
   - `https://rubberq.com/sitemap.xml`
   - `https://rubberq.com/llms.txt`
   - `https://rubberq.com/blog -> /en/blog`
   - `https://rubberq.com/en/blog` 200
3. 在 Google Search Console 重新提交 `https://rubberq.com/sitemap.xml`。
4. 观察 404、Page with redirect、Duplicate without user-selected canonical、Alternate page with proper canonical tag。

---

## 2026-05-21 后续决策：英文默认站改为根路径

用户确认后，URL 规范从“默认英文带 `/en`”调整为“英文默认站直接使用根路径”：

- 英文首页规范 URL：`https://rubberq.com/`
- 英文普通页面规范 URL：`https://rubberq.com/products`、`https://rubberq.com/materials`、`https://rubberq.com/quality` 等
- 英文 Blog 规范 URL：`https://rubberq.com/blog`
- 德语、日语、西语、中文继续保留语言前缀：`/de`、`/ja`、`/es`、`/zh`
- 旧 `/en/*` 统一做 301 到英文无前缀路径，例如 `/en/products -> /products`
- 多语言 `/de/blog`、`/ja/blog`、`/es/blog`、`/zh/blog` 统一 301 到英文 `/blog`

执行口径：后续 sitemap、canonical、hreflang、llms.txt、站内导航和 SEO 审计脚本均以这个结构为准。上方记录中的 `/en/blog` 方案为阶段性方案，已被本节决策覆盖。

技术落地补充：

- Astro 自动 i18n 路由不再作为 URL 规范来源，避免框架自动把 `/`、`/blog`、`/en/*` 做成与当前商业决策相反的跳转。
- 英文根路径页面通过显式根首页与 middleware 内部 rewrite 渲染；对外只暴露无前缀英文 URL。
- 内部 rewrite 请求会携带私有 header，用于区分“内部渲染 `/en/*`”与“用户直接访问旧 `/en/*`”；只有后者返回 301。
