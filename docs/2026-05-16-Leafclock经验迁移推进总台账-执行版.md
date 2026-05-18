# 2026-05-16 Leafclock经验迁移推进总台账（执行版）

> 本文件用于把 RubberQ 从“已完成 Astro v2 改版骨架”推进到“可持续获客的全球增长系统”。  
> 规范位置：`rubberq-astro/docs/`。根目录 `项目文档/` 为镜像。  
> 执行原则：所有新功能、页面、部署只进入 `rubberq-astro/`；`RubberQ-B2B-Site/`、`RubberQ-readdy/`、`rqing.com/` 只作为历史参考与素材来源。

---

## 1. 本轮读取范围

本轮读取对象覆盖整个项目，而不是只读 Astro：

| 来源 | 读取结论 | 后续用途 |
| --- | --- | --- |
| 根目录 `AGENTS.md` / `CLAUDE.md` | 已锁定活跃实现为 `rubberq-astro/`，v2 画像与对外红线明确 | 项目工作边界 |
| 根目录 `Claude 讨论.md` | 解释了 A 炼、配方实验室、产能 re-framing、医疗放弃、EV/工业/半导体优先级 | 判断为什么要改，不只看改什么 |
| `rubberq-astro/docs/` | v2 权威文档、wireframe、媒体资产位、关键词、文章/白皮书均已形成 | 当前执行依据 |
| 根目录 `项目文档/` | 与 `rubberq-astro/docs/` 基本一致，为镜像 | 只同步，不作为主编辑位置 |
| `RubberQ-B2B-Site/docs/` | 保留旧 Next.js 阶段的 RFQ、i18n、AIO、图片、周报、任务日志经验 | 迁移经验，不再直接开发 |
| `RubberQ-B2B-Site/.codebuddy/plans/` | Phase 1-7 记录了从研究、IA、AIO 文案到 Next.js 实现的完整阶段逻辑 | 作为 RubberQ 早期方法论来源 |
| `RubberQ-B2B-Site/tools/` | 有旧 WordPress 批量产文、R2 上传、图片生成脚本 | 迁移到 Sanity 内容链路时参考 |
| `RubberQ-readdy/README.md` | 只有基础 Next.js 启动说明 | 视觉参考，不承担执行 |
| `rqing.com/` | 老站素材与历史 SEO 参考，无 Markdown 规划文件 | 图片/历史页面参考 |
| `全球增长系统复用/` | 包含 Leafclock/global-growth-system、SEO-GEO 内容系统、B2B lead ops、proof assets 等模板 | RubberQ 长期增长系统母版 |

未纳入业务判断的对象：`node_modules/`、`.open-next/`、`.wrangler/`、`dist/`、`.astro/`、泛用 API 参考手册。

---

## 2. Leafclock经验如何迁移到 RubberQ

Leafclock 的关键经验不是“多写几个页面”，而是：

1. 先做证据资产，让网站上的权威性、专业性、可信度有真实材料支撑。
2. 再做页面任务，把证据资产放到能转化的页面位置。
3. 再做线索承接，让 Inquiry 到样品 / 技术评估 / 报价的路径可控。
4. 再做内容和外部渠道，用证据与页面支撑搜索、社媒、冷启动开发。

迁移到 RubberQ 后，优先级变为：

| 层级 | RubberQ 对应动作 | 原因 |
| --- | --- | --- |
| 证据资产 | A 炼线、实验室设备、测试报告、配方库边界、真实样品、质量记录 | RubberQ 的核心稀缺性是“配方 + A 炼 + 自有验证”，必须可见 |
| 页面任务 | Compounding、Testing、Industries、Materials、Quality、Capabilities、Home/About | v2 页面骨架已建立，但仍有占位图和多语言缺口 |
| 线索承接 | RFQ v2 字段、来源追踪、字段优先级、Worker/D1/邮件格式、S/A/B/C 分级 | 高价值询盘是开发型项目，不是普通表单留言 |
| 内容系统 | P0 5 篇文章、EV 白皮书、Sanity 导入、内链矩阵、发布台账 | 内容要服务 compounding / EV / FFKM 高意向搜索 |
| 外部开发 | EV/储能客户清单、冷邮件、LinkedIn、展会/主动开发证明包 | 第 5 步不应脱离证据资产和 RFQ 筛选规则 |

---

## 3. 当前状态判断

### 已完成或基本完成

| 模块 | 状态 | 依据 |
| --- | --- | --- |
| 活跃站点选型 | 已锁定 Astro | `AGENTS.md` / `CLAUDE.md` |
| v2 战略画像 | 已锁定 | `rubberq-info.md` 末节 |
| v2 wireframe | 已完成 | `2026-05-12-wireframe-v2.md` |
| Compounding & R&D 页面 | 已建骨架 | `src/pages/[locale]/compounding.astro` |
| Testing & Validation 页面 | 已建骨架 | `src/pages/[locale]/testing.astro` |
| Industries 总览 + 4 详情页 | 已建骨架 | `src/pages/[locale]/industries/` |
| Organization JsonLd | 已按 v2 重写 | `src/lib/structuredData.ts` |
| 品牌配色守卫 | 已加入构建前检查 | `scripts/check-brand-colors.mjs` + `npm run check:brand-colors` |
| P0 文章源稿 | 已有 5 篇 | `docs/content/articles-v2/` |
| EV 热管理白皮书源稿 | 已有 | `docs/content/whitepapers/2026-06-compound-selection-guide-ev-thermal-management.md` |
| 媒体资产位清单 | 已有 | `2026-05-12-媒体资产位清单.md` |

### 当前关键缺口

| 优先级 | 缺口 | 影响 |
| --- | --- | --- |
| P0 | RFQ v2 前端字段、Worker 入参、D1 字段、邮件模板未闭环 | 开发型询盘不能被可靠分流 |
| P0 | 多语言新增 v2 keys 仍主要集中在 `en.json`，de/ja/es/zh 不完整 | 多语言 SEO/meta 与页面质量不足 |
| P0 | 约 52 个媒体占位为刻意保留状态，等待用户后续替换真实素材 | 当前不作为代码缺陷处理；需要维护素材位映射、拍摄清单和公开等级 |
| P0 | `sourceTracking` / `fieldPriority` 在实际 contact 表单中曾为 stub | 线索归因与字段分层失效；本轮已先修复前端调用 |
| P1 | 旧内容源在 WordPress/旧脚本，新内容源在 Sanity 的切换流程未形成操作台账 | 内容生产容易散 |
| P1 | 证据资产没有公开等级与调用位置台账 | 容易出现可公开/不可公开混用 |
| P1 | EV/储能客户清单尚未与 Good Fit / Quote Gate 联动 | 主动开发可能吸引低质量项目 |
| P2 | 旧 `项目任务清单.md` 仍混有 2026-02 任务口径 | 执行人员容易误判当前优先级 |

---

## 4. P0 执行批次

### P0-A：询盘链路先闭环

| 任务 | 文件 / 系统 | 验收方式 | 状态 |
| --- | --- | --- | --- |
| 恢复实际表单的来源追踪和字段优先级 payload | `src/components/contact/*Form.tsx` | 提交 payload 含 `sourceTracking` 与 `fieldPriority` 非空对象 | 已完成前端修复 |
| Contact/RFQ 表单增加 v2 字段 | `ContactForm.tsx` + `contact.astro` + messages | 字段含 Project Type / Annual Volume / Quote Components / Project Stage | 待做 |
| Worker 入参 schema 接收 v2 字段与附件 | `rubberq-rfq-api` Worker | 本地/远端测试提交成功，旧字段兼容 | 待做 |
| D1 表结构增加 v2 字段 | Cloudflare D1 migration | 旧数据不丢，新增字段可查询 | 待做 |
| Resend 邮件模板结构化输出 | Worker 邮件模板 | 邮件能按项目类型、年用量、报价组件分区 | 待做 |
| GA4 / 转化事件恢复 | Astro head 或专用组件 | `quote_request`、`form_submit`、`download` 可观测 | 待做 |

### P0-B：证据资产先维护素材位，真实素材由用户后续替换

说明：占位图片是前一轮改版时刻意保留的，不要在未拿到真实素材前擅自替换。当前执行目标是把每个素材位对应到要拍/要整理的证据资产、公开等级和页面位置，方便后续用户更新图片时逐项替换。

| 资产编号 | 资产名称 | 类型 | 公开等级 | 对应页面 | 当前动作 |
| --- | --- | --- | --- | --- | --- |
| E-001 | A 炼密炼机正面图 / 工作视频 | 制造能力 | 可公开 | Home / Compounding / Capabilities | 必拍 |
| E-002 | A 炼控制面板 / 称重系统 | 制造能力 | 可公开或匿名公开 | Compounding | 必拍 |
| E-003 | 实验室全景 | 验证能力 | 可公开 | Testing / Quality / About | 必拍 |
| E-004 | 拉力机、老化箱、流变仪/门尼、硬度计等设备 | 验证能力 | 可公开 | Testing / Quality / Compounding | 必拍 |
| E-005 | 脱敏测试报告样本 | Validation Note | 可匿名公开 | Testing / Sales follow-up | 必做 PDF |
| E-006 | 9 材料样品板或样品盒 | 参数与销售证明 | 可公开 | Materials / Sample Request / Sales | 必拍 |
| E-007 | EV/储能可公开样品图 | 应用证明 | 可公开或匿名公开 | Home / Industries EV | 必拍 |
| E-008 | FKM / FFKM 高纯度样品特写 | 材料证明 | 可公开 | Materials / Semiconductor | 必拍 |
| E-009 | 质量证书扫描件 | 质量与合规 | 可公开 | Quality / Footer / Sales | 需确认最新版 |
| E-010 | 工厂/团队真实照片 | 团队与制造可信度 | 可公开 | About / Factory | 需补齐 |

### P0-C：多语言与 SEO 最小上线质量

| 任务 | 文件 | 验收方式 | 状态 |
| --- | --- | --- | --- |
| 对齐 5 语种 key 结构 | `src/messages/*.json` | key diff 为 0 | 待做 |
| 至少补齐 de/ja/es/zh 的 metadata/title/description | `src/messages/{de,ja,es,zh}.json` | 新页面 meta 不回退英文 | 待做 |
| sitemap / hreflang / canonical 回归 | `src/pages/sitemap.xml.ts` + 页面 head | 5 语种 URL 可枚举，无本地 dev URL | 待做 |
| JsonLd forbidden claims 检查 | `src/lib/structuredData.ts` | 无价格、评分、虚假认证、未确认数值 | 待做 |

---

## 5. P1 执行批次

### P1-A：Sanity 内容系统落地

| 任务 | 来源 | 输出 |
| --- | --- | --- |
| 把 5 篇 P0 文章导入 Sanity | `docs/content/articles-v2/` | `article` 文档，status=published |
| 把 EV 白皮书转为下载资产与资源页入口 | `docs/content/whitepapers/` | PDF / landing CTA / download tracking |
| 建立发布台账 | 参考 `SEO-GEO-Content-System-Starter` | 记录 slug、关键词、内链、状态、图片 |
| 建立配图 brief | 每篇文章 + 白皮书 | R2 或 Sanity image 字段 |
| 验证博客页渲染 | `/blog` + `/blog/[slug]` | 文章可读、CTA 指向 /contact 或 /compounding |

### P1-B：销售与技术承接包

| 资料 | 用途 | 格式 |
| --- | --- | --- |
| RubberQ Compounding Capability Sheet | 研发工程师/采购内部转发 | PDF |
| Sample Test Report（脱敏） | 验证 RubberQ 自有测试能力 | PDF |
| EV Thermal Management Compound Selection Guide | EV/储能开发型询盘跟进 | PDF / Blog |
| FFKM / Semiconductor Short Note | 半导体询盘初筛 | PDF / 页面模块 |
| Quote Input Checklist | 避免盲报与低质量报价 | 表单 + PDF |
| Good Fit / Not Fit One-pager | 销售拒绝低匹配项目时使用 | PDF |

### P1-C：主动开发与第 5 步

| 任务 | 规则 |
| --- | --- |
| EV/储能客户清单 | 只找可能有 10K-5M 年用量、材料瓶颈、验证需求的 Tier 1/Tier 2/设备公司 |
| 冷邮件模板 | 不说低价，不承诺未确认 EV 高压应用，不披露日方公司名 |
| LinkedIn 内容 | 用 A 炼、测试、材料选择、报价输入清单做工程型内容 |
| 跟进材料 | 每封邮件只配 1 个证明材料，避免一次塞满 |

---

## 6. P2 执行批次

| 任务 | 说明 |
| --- | --- |
| 整理旧任务清单为 v2 执行版本 | 旧 `项目任务清单.md` 很有历史价值，但当前执行应单独看 v2 台账 |
| 建立证据资产公开等级审核表 | 每个资产先标 public / public-anonymized / internal-only |
| 建立周报实际运行模板 | 继承旧周报模板，但增加 Compounding / RFQ v2 / Proof Asset 指标 |
| 建立 30 篇 SERP 主题生产节奏 | 先围绕 compounding、EV thermal、FFKM、traceability |
| 老站高价值 URL 与素材映射 | 从 rqing.com 和旧 Next.js 迁移可用素材，不迁移旧叙事 |

---

## 7. 线索分级与报价门槛（RubberQ 初版）

| 等级 | 定义 | 下一步 |
| --- | --- | --- |
| S | 目标行业，年用量 100K-5M，材料或验证问题明确，有图纸/规格/项目阶段 | 24h 内销售 + 技术共同响应 |
| A | 目标行业，应用明确，参数部分完整，可能进入样品/验证 | 48h 内要求补齐关键参数并安排技术判断 |
| B | 行业或用量基本可行，但信息不足或只是早期探索 | 发送参数清单 / 资料包，进入 nurture |
| C | 大宗低价、千万件级单 SKU、医疗植入、纯价格比较、无明确应用 | 低成本回复或 No-Go |

报价前必须至少拿到：

- 应用行业与使用环境
- 年用量范围
- 材料或性能目标
- 图纸 / 规格 / 样品目标中的至少一项
- 项目阶段
- 需要报价的组成：配方开发、模具、单价、样品、NDA

---

## 8. 立即执行顺序

1. 修复现有表单 payload 空对象问题。  
   状态：已在本轮完成前端修复，待构建验证。
2. 建立本台账并同步到 `项目文档/`。  
   状态：本文件即为交付物。
3. 跑 `npm run check:brand-colors` 与构建检查。  
   状态：待验证。
4. 下一批代码：RFQ v2 前端字段 + Worker/D1/邮件入参兼容。
5. 同步 5 语种新增 key，先保证 metadata，再补页面正文。
6. 按 `2026-05-12-媒体资产位清单.md` 组织真实素材拍摄与替换。
   说明：占位图片保持现状，待用户提供或亲自替换真实素材。
7. 把 P0 文章和 EV 白皮书走 Sanity 内容发布链路。

---

## 9. 执行边界

- 不改 `RubberQ-B2B-Site/` 的生产配置。
- 不在公开页面披露 J&C 株式会社名称。
- 不在公开页面写未确认 EV 高压 Pack 内部密封、PDU、BMS 等具体应用。
- 不承诺 ground-up 新配方 4 周完成。
- 不写 ISO 13485 / FDA implant。
- 不把汽车放在 Industries 首位。
- 不用假价格、假 rating、假 review、假客户名做 schema 或页面证明。

---

## 10. 2026-05-18 Codex 推进记录

本轮已完成：

| 模块 | 状态 | 说明 |
| --- | --- | --- |
| 公开红线门禁 | 已完成 | 新增 `scripts/check-public-redlines.mjs`，并接入 `npm run build` / `preview` / `deploy` |
| RFQ v2 前端字段 | 已完成 | Contact / Batch RFQ / Sample Request 已加入 Project Type、Annual Volume、Quote Components、Project Stage 等字段，并随 payload 提交 |
| SEO/GEO 技术骨架 | 已完成 | `LocaleLayout` 统一输出 canonical / hreflang；`BaseLayout` 支持 lang；sitemap 补齐产品、材料、行业详情页 |
| Materials 结构 | 已完成 | 新增 `src/lib/materials.ts`，覆盖 HNBR / FKM / FFKM / EPDM / NBR / ACM / AEM / Silicone / LSR |
| Case Studies 结构 | 已完成 | 改为 EV / Industrial / Semiconductor / Automotive Tier 2 四类匿名工程案例，保留占位图片提示 |
| Quality 证据页 | 已完成 | 视频客户见证改为 Proof Asset Slots；证书下载与签发方改为待官方扫描确认 |
| Sanity 旧博客过滤 | 已完成 | 在 `src/lib/sanity.ts` 增加公开博客过滤，阻断旧方向文章进入 blog 列表、详情、相关内容和 sitemap |
| `llms.txt` | 已完成 | 更新为 v2 定位、材料、行业顺序与 Best Fit 口径 |
| 内容草稿红线 | 已完成 | 清理 `docs/content` 中旧 EV 高压、医疗、FDA 等公开草稿风险词 |

验证结果：

```bash
npm run check:public-redlines  # passed
npm run check:brand-colors     # passed
npx astro check                # passed, 0 errors
npm run build                  # passed
```

Wrangler 本地预览抽查：

- `/en/contact` 200，RFQ v2 字段正常渲染。
- `/en/materials/ffkm` 200，canonical / hreflang / JSON-LD 正常输出。
- `/en/industries/ev-energy-storage` 200。
- `/en/case-studies` 200，CTA 已改为 v2 判断式询盘口径。
- `/sitemap.xml` 已包含材料详情、行业详情、产品详情；旧方向 Sanity 博客 URL 已被过滤。

下一步建议只剩两类：

1. **后端询盘链路升级**：Worker 入参 schema、D1 migration、Resend 邮件模板、GA4 payload 与 RFQ v2 字段对齐。
2. **真实证据素材替换**：按图片/视频资产清单补工厂、混炼、实验室、证书扫描、匿名案例材料；当前占位图片按用户要求保留。

---

## 11. 2026-05-18 RFQ v2 后端联动推进记录

本轮先做了 Worker 源码定位：在本仓库、活跃 `rubberq-astro/`、历史 `RubberQ-B2B-Site/`、根目录文档镜像，以及用户目录内的常见项目路径中，均未找到可维护的 `rubberq-rfq-api` Worker 源码。当前能确认的是：Astro 前端继续 POST 到 `https://rubberq-rfq-api.midnightblue-lin.workers.dev`，历史文档记录该 Worker 负责 D1 落库与 Resend 邮件提醒。

因此本轮没有直接改动线上 Worker，而是在活跃 Astro 项目中补齐可复制到 Worker 的后端合同包：

| 交付物 | 路径 | 作用 |
| --- | --- | --- |
| RFQ v2 入参规范化与验证 | `tools/rfq-worker-v2/rfq-v2-contract.mjs` | 接收旧字段 + v2 字段，输出标准 payload、S/A/B/C lead grade、quote readiness、D1 字段值、Resend 邮件 HTML/text |
| D1 migration | `tools/rfq-worker-v2/migrations/2026-05-18-rfq-v2-fields.sql` | 在现有 `inquiries` 表追加 schema_version、project_type、annual_volume、quote_components_json、lead_grade、quote_readiness 等字段 |
| Worker 交接说明 | `tools/rfq-worker-v2/README.md` | 解释 Worker 入参 schema，给出 D1/Resend 集成示例和部署注意事项 |
| GA4 事件恢复 | `src/lib/inquiryTracking.ts` + 表单组件 | 恢复 `quote_request`、`contact_form_submit`、`form_abandon`、`file_download`、`outbound_link_click`、`blog_subscribe`、`certificate_view` 事件封装 |
| RFQ v2 payload 补齐 | `src/components/contact/BatchRfqForm.tsx` / `SampleRequestForm.tsx` | Batch RFQ 顶层补 `country`、`annualVolume`、`targetMaterial`；Sample Request 顶层补 `productType`、`material`、`quantity`、`country` |

本轮遵守的后端边界：

- 不在未找到源码的情况下假装已经改动线上 Worker。
- 不从旧 Next 目录部署或变更生产配置。
- 不把 Resend / D1 / Cloudflare secret 写入代码。
- 迁移 SQL 只作为 D1 migration 文件提交，未直接改线上数据库。
- Worker 合同包保持旧字段兼容，避免影响 `contact_rfq`、`batch_rfq`、`sample_request`、`blog_subscribe` 现有调用。

验证结果：

```bash
node tools/rfq-worker-v2/rfq-v2-contract.mjs --self-test  # passed
npm run check:public-redlines                            # passed
npm run check:brand-colors                               # passed
npx astro check                                          # passed, 0 errors
```

仍需等 Worker 源仓库或 Cloudflare Worker 项目权限恢复后执行：

1. 把 `tools/rfq-worker-v2/rfq-v2-contract.mjs` 合并进实际 `rubberq-rfq-api` Worker。
2. 确认线上 D1 表名；如果不是 `inquiries`，先替换 migration 表名。
3. 通过 Wrangler D1 migration 应用字段。
4. 用一条测试 RFQ 跑通：前端表单 -> Worker -> D1 -> Resend -> `contact@rubberq.com`。

---

## 12. 2026-05-18 RFQ v2 线上 D1 / Worker 实施记录

本轮已按用户要求直接维护线上同一个 D1，没有创建第二个 D1。

线上资源确认：

| 资源 | 当前状态 |
| --- | --- |
| Cloudflare account | `midnightblue.lin@qq.com` / `bd6443a7f85aea8396ebb239016261e3` |
| Worker | `rubberq-rfq-api` |
| Worker endpoint | `https://rubberq-rfq-api.midnightblue-lin.workers.dev` |
| D1 database | `rubberq_rfq` |
| D1 database id | `e51f8f7e-6137-45f4-acb4-61dc4eb3def7` |
| D1 binding | `DB` |
| D1 table | `rfqs` |
| Existing secret | `RESEND_API_KEY` |
| Plain bindings | `ALLOWED_ORIGIN` / `FROM_EMAIL` / `TO_EMAIL` |

已完成：

- 将 D1 migration 改为作用于线上真实表 `rfqs`，而不是交接草稿里的 `inquiries`。
- 已对线上 `rubberq_rfq` 执行 `tools/rfq-worker-v2/migrations/2026-05-18-rfq-v2-fields.sql`。
- `rfqs` 表已追加 RFQ v2 字段：`schema_version`、`inquiry_type`、`project_type`、`annual_volume`、`project_stage`、`quote_components_json`、`selected_products_json`、`product_type`、`target_material`、`material`、`sample_quantity`、`country`、`source_tracking_json`、`field_priority_json`、`lead_grade`、`quote_readiness`、`rfq_context_json`、`attachment_name`、`attachment_mime_type`、`attachment_size`。
- 已用 `tools/rfq-worker-v2/worker.mjs` 部署到同名 Worker `rubberq-rfq-api`。
- 当前线上 Worker version id：`98ef9d07-83cb-4f41-9478-47d4464e38c3`。
- 旧回滚版本保留：`97faf548-8795-4992-9b9b-363366da6896`。

验证状态：

```bash
node tools/rfq-worker-v2/rfq-v2-contract.mjs --self-test  # passed
npx wrangler deploy --config tools/rfq-worker-v2/wrangler.toml --dry-run --outdir /tmp/rubberq-rfq-worker-build  # passed
npm run build  # passed，追加本记录前
```

本机 live POST 限制：

- 从本机访问 `https://rubberq.com` 正常。
- 从本机访问 `*.workers.dev` 超时，包括 `https://workers.dev` 与 `https://rubberq-rfq-api.midnightblue-lin.workers.dev`。
- 因此本机未能完成真实 POST 到 Worker 的端到端测试。
- 已查询 D1，确认 `codex-test@example.com` 没有写入测试脏数据。

后续需要从能正常访问 `workers.dev` 的网络环境，或给 Worker 绑定 `rubberq.com` 自有子路径/子域后，再跑一次真实链路测试：前端表单 -> Worker -> D1 -> Resend -> 收件箱。

---

## 13. 2026-05-18 Sanity 文章排期导入状态

Sanity 发布链路已改为 Leafclock-style：文章本身写入 `status: "published"` 与未来 `publishedAt`，Astro 前台只显示 `publishedAt <= now()` 的文章。

第一轮状态：

- GitHub Actions 每日发布器已删除。
- GitHub secret `SANITY_API_TOKEN` 已删除。
- `.env` 与 `.env.local` 已合并为本机单一 `.env.local`，该文件被 Git 忽略。
- `scripts/import-articles-to-sanity.mjs --apply` 已尝试执行，但 Sanity 返回 `permission "create" required`。
- 这表示当前 token 没有创建文章权限，5 篇排期文章尚未导入 Sanity。

处理原则：

- 不把 Sanity token 提交到 Git。
- 不把 Sanity token 放回 GitHub secret 做每日发布。
- 换用具备 `create` 权限的 Sanity token 后，只需在本机重新运行导入脚本。

第二轮完成状态：

- 用户已在本机 `.env.local` 更新具备 Editor 权限的 Sanity token。
- 5 篇本地 v2 文章已导入 Sanity，排期为 2026-06-01 至 2026-06-05。
- Sanity 中 51 篇旧 `status: "draft"` 文章已改为 `status: "published"`，排期为 2026-06-06 至 2026-07-26。
- 共 56 篇未来发布文章已就绪，当前不会前台显示，到时间后自然露出。
- 12 篇旧草稿因医疗/FDA、旧 AI/data-center、旧 robotics、高压 battery pack 或测试占位等原因保留为草稿。
- 新增 `scripts/schedule-sanity-drafts.mjs` 与 `npm run sanity:schedule-drafts`，用于以后继续批量排期 Sanity 草稿。

第三轮完成状态：

- 用户要求从每天一篇改为每天两篇。
- 已将 `scripts/import-articles-to-sanity.mjs` 和 `scripts/schedule-sanity-drafts.mjs` 的排期默认值改为每天 2 篇，并保留 `--per-day` 参数可调整。
- 已对 Sanity 当前 56 篇未来发布文章重新排期。
- 新排期范围为 2026-06-01 至 2026-06-28，共 28 天，每天正好 2 篇。
- 每天两篇分别落在 UTC 08:00-17:00 与 UTC 17:00-22:00 两个时间段，避免同一分钟集中露出。

第四轮完成状态：

- 用户指出起点应从今天开始。
- 已按当前日期 2026-05-18 重新排期 Sanity 当前 56 篇未来文章。
- 新排期范围为 2026-05-18 至 2026-06-14，共 28 天，每天正好 2 篇。
- 首篇未来文章时间为 2026-05-18T14:37:00.000Z，末篇为 2026-06-14T18:00:00.000Z。
- 当前前台立即可见文章数仍为 156，未来排期文章数为 56，保留草稿为 12。
- 5 篇本地 v2 文章 frontmatter 已同步到今天起的 Sanity 排期，并改为 `status: "published"`。
