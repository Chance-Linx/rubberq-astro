# 2026-05-21 Cloudflare Pages 项目统一记录

## 结论

RubberQ 当前唯一确认维护和承载主域名的 Cloudflare Pages 项目为 `rubberq-astro`。

`rubberq-site` 是历史 direct upload 项目，不再作为正式部署目标，不再通过 GitHub Actions 在每次 push 后自动更新。

## 本次查到的原因

Cloudflare 后台同时出现两个项目，是因为部署链路曾经并行存在：

- `rubberq-astro`：Cloudflare Pages Git 集成项目，连接 `Chance-Linx/rubberq-astro`，并承载 `rubberq.com`。
- `rubberq-site`：无 Git 连接，但仓库 GitHub Actions 使用 Wrangler direct upload 命令把 `dist/` 上传到了这个项目。

因此即使 `rubberq-site` 在 Cloudflare 后台显示“无 Git 连接”，它仍然会被 GitHub Actions 推送更新。

## 本次调整

- `.github/workflows/deploy.yml`：从 push 自动部署改为手动触发 `workflow_dispatch`，并且手动部署目标改为 `rubberq-astro`。
- `package.json`：`npm run deploy` 的 Pages project 从 `rubberq-site` 改为 `rubberq-astro`。
- `wrangler.toml`：项目名从 `rubberq-site` 改为 `rubberq-astro`。
- `wrangler.toml`：新增 R2 绑定 `R2_BUCKET -> rubberq-images`，用于把账号级 R2 bucket 明确绑定到 Astro 项目配置。

## R2 说明

`rubberq-images` 是 Cloudflare 账号级 R2 bucket，不是 `rubberq-site` 或 `rubberq-astro` 某个 Pages 项目私有的 bucket。

如果后台只在 `rubberq-site` 里看到 R2，而 `rubberq-astro` 里没看到，通常表示：

- bucket 本身仍然存在于 Cloudflare 账号中；
- 旧 Pages 项目曾经绑定过它；
- 新 Pages 项目尚未显式绑定它。

本次已在 `wrangler.toml` 中将 `rubberq-images` 绑定到 `rubberq-astro`，绑定名为 `R2_BUCKET`。

## 后续操作建议

- Cloudflare 后台中保留 `rubberq-astro` 作为正式项目。
- `rubberq-site` 暂时不要删除，等主域名、表单、图片、博客、sitemap 全部在 `rubberq-astro` 稳定一段时间后，再考虑删除或至少改名标注为 legacy。
- 以后如需手动部署，使用 `npm run deploy`，不要再对 `rubberq-site` 执行 Pages deploy。
