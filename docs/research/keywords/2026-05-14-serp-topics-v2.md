# 2026-05-14 SERP 主题库 v2（30 个文章选题）

> 基于 `2026-05-14-keywords-v2.md` Top 50 关键词派生。
>
> 目标：未来 3-6 个月（2026-Q3 - Q4）的内容生产 backlog。每篇文章直接对应 Sanity `_type: "article"` 文档，可批量导入。

## 文章设计原则（v2 + AI Search Native）

1. **Answer-First**：开篇 80-150 字必须是"该问题的权威答案"——能直接被 AI Overview / ChatGPT Search / Gemini 引用
2. **问题驱动**而非产品驱动：H1 多用 "Why / How / When / Selecting / vs" 结构
3. **教 + 卖混合**：教育 70% + RubberQ 视角 30%，避免"软文味"
4. **数据/标准/具体数字**：每篇至少含 1 张 spec 表 + 2 个 ASTM/ISO 标准号 + 1 个温度/性能范围
5. **内链回到落地页**：每篇 2-3 个上下文链接到 /compounding / /testing / /industries/[slug]
6. **CTA 区分两类**：图纸驱动客户 → "Request Quote"；应用驱动客户 → "Submit Application Brief"

## Sanity 字段映射建议

```typescript
{
  _type: "article",
  title: "{H1}",
  slug: { current: "{slug}" },
  excerpt: "{80-150 字 Answer-First 摘要}",  // 也是 meta description
  content: "{markdown body}",
  publishedAt: "{ISO timestamp}",
  author: "RubberQ Engineering Team",
  category: "{EV | Industrial | Semiconductor | Automotive | Compounding | Materials | Testing}",
  tags: ["{primary keyword}", "{secondary keyword}", ...],
  coverImage: { asset: { _ref, _type } },
  status: "published"  // 或 "draft" 待审核
}
```

---

## 文章选题 × 30 篇（按优先级 P0/P1/P2）

### 🔥 P0：第一批（5 篇必写，启动期）

| # | H1 | Slug | 主关键词 | 字数 | Category | 价值 |
|---|---|---|---|---|---|---|
| 1 | Why Compound Chemistry Matters More Than the Molder for EV Battery Seals | `compound-chemistry-vs-molder-ev-battery-seals` | custom rubber compound formulation + EV battery pack seal | 2000 | EV | **旗舰文** — 直接立 v2 叙事，能在 AI Search 被引用为"什么是好的橡胶供应商" |
| 2 | HNBR vs FKM for EV Thermal Management Hoses: A Compound Selection Guide | `hnbr-vs-fkm-ev-thermal-management-compound-guide` | HNBR formulation for EV thermal management | 1800 | Compounding | EV 高意向 + 比较型，能稳定吃流量 |
| 3 | What Is In-House Rubber Compounding (and Why 95% of Suppliers Don't Do It) | `what-is-in-house-rubber-compounding` | in-house rubber mixing supplier + rubber compounder vs molder difference | 1500 | Compounding | 教育型 reframe，把 RubberQ 定位拉到 L3 层级 |
| 4 | Single-Line A-Mixing for Semiconductor FFKM: Why Cross-Contamination Tolerance is Near-Zero | `single-line-mixing-semiconductor-ffkm-contamination` | custom FFKM compound development + single line rubber mixing | 1700 | Semiconductor | 半导体高价值客户的精准词 |
| 5 | Compound Traceability: How to Make Sure Your 2030 PPAP File Reproduces Your 2026 Part | `compound-traceability-ppap-10-year-reproducibility` | rubber compound batch consistency 5 years | 1600 | Quality | v2 独有信任叙事，PPAP 是工程师痛点 |

### P1：第二批（10 篇，1-2 个月内补完）

| # | H1 | Slug | 主关键词 | 字数 | Category |
|---|---|---|---|---|---|
| 6 | Selecting Flame-Retardant EPDM for EV Charging Pile and BESS Cabinet Sealing | `flame-retardant-epdm-charging-pile-bess-selection` | flame retardant EPDM for charging pile | 1800 | EV |
| 7 | Why EV Battery Pack Seals Demand Compound Chemistry, Not Standard Off-Shelf O-Rings | `ev-battery-pack-seal-compound-vs-standard` | EV battery pack seal manufacturer + low compression set rubber compound | 1800 | EV |
| 8 | The True Cost of "Cheap" Rubber Compounds: A 10-Year TCO Analysis for Industrial OEMs | `true-cost-cheap-rubber-compounds-10-year-tco` | hydraulic rubber seal manufacturer China | 2000 | Industrial |
| 9 | A Buyer's Guide to ASTM D2000 Line Call-Outs: What "2BC715B14" Actually Means | `astm-d2000-line-callout-buyers-guide` | ASTM D2000 compliant rubber compound | 1800 | Compounding |
| 10 | Compression Set Performance: The Most Misunderstood Spec on Your Rubber Datasheet | `compression-set-rubber-seal-explained` | low compression set rubber compound + ASTM D395 | 1600 | Materials |
| 11 | When to Use ACM vs AEM for Automotive Heat-Resistant Sealing | `acm-vs-aem-automotive-heat-sealing` | custom AEM compound automotive + ATF resistant ACM | 1700 | Automotive |
| 12 | Why "We're IATF 16949 Certified" Is Not Enough: What to Audit in a Rubber Supplier's QMS | `iatf-16949-rubber-supplier-audit-checklist` | IATF 16949 rubber seal supplier | 2000 | Quality |
| 13 | How a Japanese Formulation Partnership Changes Compound Development Timelines | `japanese-rubber-formulation-partnership-development-timeline` | Japanese rubber formulation manufacturer + sino-japanese rubber engineering | 1500 | Compounding |
| 14 | Cross-Contamination Risk in Multi-Product Rubber Mixing Lines (and How to Audit It) | `rubber-mixing-cross-contamination-audit` | single line rubber mixing supplier | 1600 | Compounding |
| 15 | A Material Selection Guide: 9 Elastomer Families and When to Use Each | `elastomer-material-selection-guide-9-families` | (long-tail; bridges Materials hub) | 2200 | Materials |

### P2：第三批（15 篇，3-6 个月内陆续补）

| # | H1 | Slug | 主关键词 | 字数 |
|---|---|---|---|---|
| 16 | FFKM in Plasma Etch Chambers: Compound Chemistry for Wafer Fab Sealing | `ffkm-plasma-etch-compound-chemistry` | plasma etch chamber seal | 1800 |
| 17 | What Engineers Get Wrong About "Custom Rubber Parts" (and What to Ask Instead) | `engineers-mistake-custom-rubber-parts-questions` | custom rubber compound formulation | 1500 |
| 18 | Low-Volume Precision Rubber Manufacturing: The Sweet Spot Most Suppliers Avoid | `low-volume-precision-rubber-manufacturing-sweet-spot` | low volume precision rubber manufacturer | 1600 |
| 19 | An NDA Workflow for Custom Compound Development: What Engineers Should Expect | `custom-compound-nda-workflow-engineers` | rubber compound co-development NDA | 1400 |
| 20 | The 5-Stage Compound Development Cycle: From Application Brief to Production Release | `5-stage-compound-development-cycle` | rubber material development partner | 1800 |
| 21 | Heat Aging Test Reports (ASTM D573): How to Read Them and What's Missing | `astm-d573-heat-aging-rubber-report-read` | ASTM D573 heat aging rubber data | 1500 |
| 22 | Tensile Strength + Elongation: The Rubber Datasheet Numbers That Actually Predict Field Life | `tensile-elongation-rubber-field-life-prediction` | ASTM D412 tensile testing | 1700 |
| 23 | Why ±0.05mm Tolerance Matters (and When It Doesn't): A Specification Reality Check | `rubber-005mm-tolerance-when-it-matters` | precision rubber seal ±0.05mm tolerance + ISO 3302-1 | 1500 |
| 24 | Bellows and Boots for Robotic Joints: Compound Selection for 1M+ Cycle Life | `robot-joint-bellows-compound-1m-cycles` | machine way bellows supplier | 1800 |
| 25 | Steam-Resistant EPDM Gaskets in Process Equipment: Compound Family vs Steam Quality | `steam-resistant-epdm-process-equipment` | steam resistant gasket EPDM industrial | 1600 |
| 26 | Why Most Rubber Suppliers Cannot Reproduce a Compound 5 Years Later | `why-rubber-suppliers-cannot-reproduce-compound-5-years` | rubber compound batch consistency | 1500 |
| 27 | When a "China Supplier" is Actually a Sino-Japanese Engineering Operation: Sourcing Audit Notes | `china-supplier-sino-japanese-engineering-audit` | sino-japanese rubber engineering | 1700 |
| 28 | Pneumatic Actuator Seals: Cylinder Bore + Compound Selection Logic | `pneumatic-actuator-seal-compound-selection` | pneumatic actuator seal supplier IATF | 1600 |
| 29 | An Engineer's Glossary of Rubber Compound Terms (Mooney, Cure, Set, Bloom) | `rubber-compound-terms-glossary-mooney-cure-set` | (educational hub link) | 2000 |
| 30 | RoHS, REACH, and EV Battery Sealing: Compliance + Compound Selection | `rohs-reach-ev-battery-sealing-compliance` | (compliance bridge for EV) | 1700 |

---

## 内链锚点矩阵（每篇文章必带 2-3 个）

固定锚点 → 落地页：

| 锚点关键词 | 落地页 |
|---|---|
| "in-house compounding" | /compounding |
| "see our compound library" | /compounding#library |
| "5-stage development workflow" | /compounding#workflow |
| "full ASTM/ISO testing matrix" | /testing |
| "Why Single-Line Matters" | /compounding#a-line + /quality#why-single-line |
| "EV applications we serve" | /industries/ev-energy-storage |
| "semiconductor process seals" | /industries/semiconductor |
| "industrial seal sub-sectors" | /industries/industrial-equipment |
| "automotive Tier 2 fit profile" | /industries/automotive-tier2 |
| "Is My Project a Good Fit?" | /#good-fit-block |
| "submit an application brief" | /contact?type=application |
| "request a drawing-driven quote" | /contact?type=drawing |

每篇 P0 文章至少要带 3 个上述锚点。

## 发布节奏建议

| 月份 | 节奏 | 累计 |
|---|---|---|
| 2026-06（启动月） | 5 篇 P0 + 2 篇 P1（共 7 篇）— 一周 1.5-2 篇密集铺底 | 7 |
| 2026-07 | 5 篇 P1（一周 1 篇稳定节奏） | 12 |
| 2026-08 | 3 篇 P1 + 2 篇 P2 | 17 |
| 2026-09 | 4 篇 P2（含 1 个长 hub 文 #15 或 #29） | 21 |
| 2026-10 | 4 篇 P2 | 25 |
| 2026-11 | 5 篇 P2 | 30 |

3-6 个月达成 30 篇文章库。**关键**：P0 5 篇必须在启动月内全部发完，因为它们是 v2 叙事的"内容地基"。

## 写作执行：用什么 pipeline

1. **第一批 5 篇 P0** — 由 Claude / GPT 生成初稿（用 `docs/copywriting/frameworks/technical-deep-dive.md` 框架），RubberQ 工程师审稿 + 加事实细节 + 添加 1-2 张真实测试数据图 → 上 Sanity
2. **P1 / P2** — 可半自动化：参考 RubberQ-B2B-Site 时代的 `tools/generate-posts*.mjs` 思路，迁移到 Sanity API（用 `@sanity/client` 的 `create()` mutation），脚本生成草稿后人工审稿

下一步会产出：
- **C3**：直接写 5 篇 P0 文章的 markdown 全文（约 9000 字 × 5），可手动复制到 Sanity Studio，或编写一个 import 脚本批量灌入

---

- 创建日期：2026-05-14
- 创建人：Claude
- 关联：`2026-05-14-keywords-v2.md`、`rubberq-info.md` v2 节、`2026-05-12-wireframe-v2.md`
- 维护规则：发表过的文章在表格"Slug"列后追加 ✅ + Sanity `_id`；新增选题按日期追加到文末
