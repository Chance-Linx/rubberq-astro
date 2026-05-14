# 2026-05-12 Wireframe v2

> 把差异审计的 must-add / must-rewrite 转成可实施的 wireframe + 文案草稿。第 4 步直接据此实施，不再有"精打磨"中间版本。
>
> **英文文案为权威源**，5 语种翻译在第 4 步从 en.json 派生。
>
> 决策依据：`rubberq-info.md` 末两节（v2 画像 + 2026-05-12 悬念回收 #1）。
>
> **待确认事实数据**（用 `[待确认]` 占位，上线前必须回填，不影响 wireframe 结构）：日方工程师团队规模、A 炼密炼机吨位、月产能、batch size 范围、实验室具体设备型号、已开发配方数量。
>
> **战略决策**：EV 行业页采用"敢说不"姿态——明确列出 RubberQ 能做的 EV 应用（充电基础设施、BESS、EV 周边设备、EV 整车 Tier 2 低/中压件），不在网站上枚举不能做的（高压电池 Pack 内部密封等）。这是 v2 最干净的对外口径，客户具体咨询高压电池密封时再单独评估，不在网站上承诺也不在网站上否认。

---

## 目录

1. [站点 IA 与导航重构](#1-站点-ia-与导航重构)
2. [Home 首页重做](#2-home-首页重做)
3. [About 页面重做](#3-about-页面重做)
4. [⭐ Compounding & R&D（新建）](#4--compounding--rd新建)
5. [⭐ Testing & Validation（新建）](#5--testing--validation新建)
6. [Industries 路由重构 + 4 个详情页](#6-industries-路由重构--4-个详情页)
7. [Materials 重写](#7-materials-重写)
8. [Quality 重写](#8-quality-重写)
9. [Capabilities 扩展](#9-capabilities-扩展)
10. [Contact / RFQ 表单重做](#10-contact--rfq-表单重做)
11. [JsonLd Organization schema 重写](#11-jsonld-organization-schema-重写)
12. [5 语种 messages 待新增 keys 清单](#12-5-语种-messages-待新增-keys-清单)
13. [实施顺序与依赖](#13-实施顺序与依赖)

---

## 1. 站点 IA 与导航重构

### 1.1 当前 vs v2 主导航对比

| 当前 nav 项 | v2 nav 项 | 变化 |
|---|---|---|
| Products | Products | 保留 |
| Case Studies | Case Studies | 保留 |
| Materials | Materials | 重写内容（见 §7） |
| Resources（含 Capabilities / Quality / Standards 等 dropdown） | Resources（不变） | 保留 |
| Blog | Blog | 保留 |
| Search | Search | 保留 |
| About Us | About Us | 重写（见 §3） |
| Contact / Get Quote | Contact / Get Quote | 重写表单（见 §10） |
| — | **Compounding & R&D** ⭐ | **新增**，放在 Products 之后第 2 位 |
| — | **Industries** ⭐ | **新增**，可放在主 nav 或在 Resources dropdown 之上做独立入口 |

### 1.2 推荐主 nav 终版顺序（左到右）

```
Logo │ Products │ Compounding & R&D │ Industries │ Materials │ Resources ▾ │ About │ Blog │ Search │ [Get Quote 按钮]
```

Resources dropdown 内容（不变）：Capabilities · Quality · Standards · Case Studies · 网站图片管理指南（下载）

### 1.3 新增路由清单

| 路径 | 文件 | 类型 |
|---|---|---|
| `/[locale]/compounding` | `src/pages/[locale]/compounding.astro` | 新建 |
| `/[locale]/testing` | `src/pages/[locale]/testing.astro` | 新建（或并入 Quality） |
| `/[locale]/industries` | `src/pages/[locale]/industries/index.astro` | 新建（行业总览） |
| `/[locale]/industries/[slug]` | `src/pages/[locale]/industries/[slug].astro` | 新建（4 个详情页动态路由） |

industries slug 4 个：`ev-energy-storage` / `industrial-equipment` / `semiconductor` / `automotive-tier2`

---

## 2. Home 首页重做

文件：`src/pages/[locale]/index.astro`

### 2.1 Hero（重写）

```
┌────────────────────────────────────────────────────────────────┐
│ [Badge] JAPANESE FORMULATION × CHINESE PRECISION × SINCE 1995  │
│                                                                 │
│ H1 大标题：                                                     │
│   PRECISION                                                     │
│   IN EVERY                                                      │
│   MOLECULE.                                                     │
│                                                                 │
│ Tagline（首页主 Tagline）：                                     │
│   "Japanese Formulation. Chinese Precision.                     │
│    Trusted Since 1995."                                         │
│                                                                 │
│ Subtitle：                                                       │
│   Custom-formulated precision rubber components for EV          │
│   & energy storage, industrial equipment, semiconductor,        │
│   and Tier 2 automotive — engineered through 30 years of        │
│   Sino-Japanese collaboration, validated in our in-house lab.   │
│                                                                 │
│ [CTA Primary] REQUEST QUOTE → /contact                          │
│ [CTA Secondary] EXPLORE OUR R&D → /compounding                  │
│                                                                 │
│ Trust badges: IATF 16949 · ISO 9001 · ISO 14001                 │
└────────────────────────────────────────────────────────────────┘
```

**变化**：badge 改为双重身份；CTA primary 从 "TECHNICAL HUB" 改为 "REQUEST QUOTE"；CTA secondary 从 "QUALITY & TRUST" 改为 "EXPLORE OUR R&D"（指向新建的最值钱的页面）。

### 2.2 Features 4 卡片（重写）

替代 Reliability / Precision / Traceability / Innovation：

| 新卡片标题 | 副标题（≤25 词） |
|---|---|
| **JAPANESE R&D COLLABORATION** | Compounds developed with Japanese formulation engineers — partners since 1995. |
| **IN-HOUSE COMPOUNDING** | Single dedicated A-mixing line for batch-to-batch consistency over years of production. |
| **OWN TESTING LABORATORY** | Aging, tensile, oil-resistance, thermal endurance — every formulation validated to ASTM/ISO standards. |
| **30-YEAR SINO-JAPANESE HERITAGE** | Long-term OEM supplier for leading Japanese automotive brands, now serving global EV / industrial / semiconductor customers. |

### 2.3 "Is My Project a Good Fit?" 板块（新增，紧贴 Features 之后）

```
┌──────────────────────────────────────────────────────────────┐
│ H2: Is Your Project a Good Fit for RubberQ?                  │
│ Sub: We're transparent about who we serve best — and who     │
│      we don't. Here's how to know.                           │
│                                                               │
│ ┌─────────────────────────┐  ┌─────────────────────────────┐ │
│ │ ✅ GREAT FIT             │  │ ⚠ NOT THE RIGHT FIT         │ │
│ │                          │  │                              │ │
│ │ • Annual volumes 10K-5M  │  │ • >10M parts annually        │ │
│ │   parts per SKU          │  │   (commodity rubber)         │ │
│ │ • Tolerances ±0.05mm or  │  │ • Single-source ultra-low-   │ │
│ │   tighter                │  │   cost orders                 │ │
│ │ • Custom / proprietary   │  │ • Standard catalog items     │ │
│ │   compound development   │  │   only                        │ │
│ │ • Long-term supply with  │  │ • Medical implant-grade      │ │
│ │   compound traceability  │  │   (we don't hold ISO 13485)  │ │
│ │ • ISO/IATF certified mfg │  │                              │ │
│ └─────────────────────────┘  └─────────────────────────────┘ │
│                                                               │
│ [CTA] Tell us about your project →                            │
└──────────────────────────────────────────────────────────────┘
```

> **战略意义**：v2 第五节"敢说不"姿态的网站化。**绝对不删 not-fit 列** — 这是与 95% 中国厂的差异化关键。

### 2.4 Capacity Re-framing 卡片（新增，紧贴 Good Fit 之后）

```
H3: Purposefully Sized for Precision

Body（直接用 v2 第六节标准话术）：
"Our manufacturing is purposefully sized for precision and 
small-to-medium batch production — typically 500g to 5,000kg 
per compound batch. We deliberately don't compete on commodity 
rubber volumes. This dedicated single-line setup gives us 
stronger compound-to-compound traceability and reduced 
cross-contamination risk — critical for customers who need 
formulation consistency across years of production."

[Inline link] Learn how our single-line setup works → /compounding
```

### 2.5 Industries 区块（重做）

替换原来的 Robotics / AI Infra / Machinery（且链接到博客）：

```
H2: Specialized Industries We Serve

┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ ⚡ EV &      │ │ ⚙ INDUSTRIAL│ │ 🔬 SEMICOND. │ │ 🚗 AUTOMOTIVE│
│ ENERGY       │ │ EQUIPMENT    │ │ (FFKM)       │ │ TIER 2        │
│ STORAGE      │ │              │ │              │ │              │
│              │ │              │ │              │ │              │
│ Compound     │ │ Hydraulic /  │ │ FKM/FFKM     │ │ Tier 2 key   │
│ chemistry    │ │ pneumatic    │ │ process      │ │ components — │
│ for battery, │ │ seals,       │ │ seals for    │ │ not Tier 1   │
│ HV connector,│ │ pump/valve   │ │ wafer        │ │ million-vol  │
│ thermal mgmt.│ │ housings.    │ │ handling.    │ │ orders.       │
│              │ │              │ │              │ │              │
│ → /industries│ │ → /industries│ │ → /industries│ │ → /industries│
│ /ev-energy   │ │ /industrial- │ │ /semicon...  │ │ /automotive- │
│ -storage     │ │ equipment    │ │              │ │ tier2        │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

EV 在最左（第一优先）。Medical 卡片移除。所有链接指向新建的行业详情页（§6），不再跳博客。

### 2.6 Compounding & R&D 入口区块（新增，CTA 前）

```
H2: From Polymer to Component — Our Hidden Edge

Subtext: 95% of rubber suppliers buy compounds. We engineer 
them. With Japanese-developed master formulations and our 
own A-mixing line + testing lab, we own the entire value 
chain from polymer chemistry to finished part.

[CTA] Tour Our R&D Capabilities → /compounding
```

### 2.7 现有 TrustSignals 区块（保留）

`<TrustSignals locale={locale} />` 保持原样。

### 2.8 Final CTA + Footer

Footer 横幅加 Tagline：
> *"Japanese Formulation. Chinese Precision. Trusted Since 1995."*

放在 footer 顶部，居中显示，下面是原 footer 导航。

---

## 3. About 页面重做

文件：`src/pages/[locale]/about.astro`

### 3.1 Hero（重写）

```
H1: Our Heritage
Sub: A Sino-Japanese joint venture established in June 1995, 
     combining Japanese formulation expertise with Chinese 
     precision manufacturing — validated by our in-house 
     testing laboratory.

Quote (居中，斜体)：
"Japanese formulation engineering. Chinese precision 
craftsmanship. One trusted partner since 1995."
```

替代原来的 "Automotive quality is in our DNA."

### 3.2 "Dual-Brain Model" 板块（新增，放在 Heritage 后）

```
┌─────────────────────────────────────────────────────────────┐
│ H2: How We Work — The Dual-Brain Model                      │
│                                                              │
│ ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│ │   🧠 JAPAN    │ → │  🛠 CHINA    │ → │  🔬 OWN LAB   │   │
│ │              │    │              │    │              │   │
│ │ Formulation  │    │ Precision    │    │ Aging,       │   │
│ │ engineering  │    │ manufacturing│    │ tensile, oil,│   │
│ │ team —       │    │ — single     │    │ thermal      │   │
│ │ partnered    │    │ A-mixing     │    │ tests every  │   │
│ │ with us      │    │ line + IATF  │    │ formulation  │   │
│ │ since 1995.  │    │ 16949 facility│   │ before       │   │
│ │              │    │ in Fuzhou.   │    │ production.  │   │
│ └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                              │
│ Caption: "European mid-sized peers can't match our cost.    │
│           Pure Chinese peers can't match our quality.       │
│           Pure Japanese peers can't match our scale."       │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Heritage Text（重写 heritageText1 / 2）

```
heritageText1（重写）：
"For over three decades, we have served as a long-term OEM 
supplier for leading Japanese automotive brands. Our compounds 
are developed in collaboration with Japanese formulation 
engineers we've partnered with since 1995. Every formulation 
undergoes full validation in our in-house lab — aging, tensile, 
oil resistance, thermal endurance — before release to 
production."

heritageText2（重写）：
"Today, as Japanese automotive demand stabilizes, we are 
expanding into EV/energy storage, industrial equipment, 
semiconductor (FFKM), and Tier 2 automotive applications where 
precision compounds matter most. We bring the same zero-defect 
discipline to every new sector we enter."
```

### 3.4 Stats 板块（更新数字）

```
30 │ Years Experience      （改自 "Years Experience" — 数字改为 30）
20K │ Sqm Factory
IATF│ 16949 Certified
[?] │ Japanese Engineering Partners （新增；数字待确认）
```

### 3.5 "What We Don't Do" 板块（新增，About 页底部）

```
H2: We're Honest About Where We Fit

We are not the right partner for:
- High-volume commodity rubber (tens of millions+ parts/year)
- Single-source ultra-low-cost orders
- Medical implant-grade applications (we don't hold ISO 13485)

We're the right partner for:
- Engineered compounds with custom chemistry
- ±0.05mm tolerance precision parts
- Long-term supply with full compound traceability
- 10,000 – 5,000,000 parts annually per SKU

[CTA] Discuss your project →
```

---

## 4. ⭐ Compounding & R&D（新建）

文件：`src/pages/[locale]/compounding.astro`  
URL：`/[locale]/compounding`  
**v2 第四节明确"最值钱的页面"。这一页要做到任何欧美工程师/采购在 SERP 看到摘要，立刻想点进。**

### 4.1 Hero

```
[Badge] OUR HIDDEN EDGE — 30 YEARS OF SINO-JAPANESE R&D

H1: Compounded by Japan. Built in China. Tested in-House.

Sub: While 95% of rubber suppliers buy compounds off the shelf, 
RubberQ engineers them. From polymer chemistry to validated 
batch release — we own the entire value chain.

[CTA Primary] Discuss Your Application → /contact?type=application
[CTA Secondary] Download Compound Capability Sheet → [PDF]
```

### 4.2 "Why Compounding Matters" 板块（教育型，AI Search 友好）

```
H2: Why Compounding Matters

When you buy a rubber part from a typical Asian supplier, the 
compound was likely:
- Bought in bulk from a Chinese compound trader
- Mixed in a shared multi-product line with cross-contamination risk
- Untested by the molder before molding
- Impossible to reproduce 5 years later when you need replacement parts

When you work with us, every compound is:
- Designed by our Japanese formulation partners since 1995
- Mixed on our dedicated single A-line (zero cross-contamination)
- Tested in-house for every batch (aging, tensile, viscosity, cure)
- Permanently traceable — your 2030 PPAP file will still match your 2026 part
```

### 4.3 A-Mixing Line（核心证据板块）

```
H2: Our Single A-Mixing Line

[图 / 视频：A 炼车间实拍]

Capacity: 500g – 5,000kg per compound batch
Mixer: [待确认数值] kg Banbury internal mixer
Throughput: [待确认数值] tons / month

Three operational advantages we deliberately preserve by 
running ONE line, not many:

┌──────────────────────────────────────────────────────────┐
│ 1. COMPOUND CONSISTENCY                                  │
│    Same Banbury, same process curve, same operator team. │
│    Your 2030 PPAP file will reproduce your 2026 part     │
│    exactly. Multi-line plants can't guarantee this.      │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 2. CROSS-CONTAMINATION CONTROL                           │
│    Strict cleaning SOP between batches. Sequence-ordered │
│    scheduling: highest-purity compounds first, high-     │
│    carbon-black/peroxide compounds last. Critical for    │
│    semiconductor FFKM and EV battery seal applications.  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ 3. ENGINEER-WITNESSED PRODUCTION                         │
│    Every batch's rheology curve and Mooney viscosity is  │
│    reviewed in real time by our lab team — not sampled.  │
│    Multi-line plants only sample-check.                  │
└──────────────────────────────────────────────────────────┘
```

### 4.4 R&D Lab Equipment（设备照片 + 简短说明）

```
H2: Inside Our R&D Laboratory

[Grid 4-6 个设备卡，每卡含照片 + 一句描述]

- Rheometer / Mooney Viscometer — cure characteristics
- Universal Tensile Tester — strength & elongation
- Aging Oven — long-term thermal/ozone aging
- Compression Set Tester — sealing durability
- Oil Immersion Bath — fluid resistance
- DMA / TGA（待确认是否拥有）— dynamic/thermal analysis

[Link] See full equipment + ASTM/ISO standards → /testing
```

### 4.5 Compound Development Workflow（5 阶段流程图）

```
H2: From Application to Production

Stage 1 — NEED ASSESSMENT
   You describe operating conditions (temp, fluid, lifecycle).
   Mutual NDA in place within 5 business days.

Stage 2 — FORMULATION DESIGN  →  3-6 weeks
   Japanese formulation partners propose 2-3 candidate
   compounds based on application chemistry.

Stage 3 — LAB TRIAL  →  2-4 weeks
   We mix small batches (500g) and run full property tests.
   You receive the test report; we iterate as needed.

Stage 4 — PILOT MOLDING  →  2-3 weeks
   Pilot tooling + small-batch molded samples for your
   functional validation in your end environment.

Stage 5 — PRODUCTION RELEASE  →  4-8 weeks
   Tooling scaled to production. First-article inspection,
   PPAP/FAI documentation, batch traceability live.

Total: 12-24 weeks for ground-up compound development.
       4-8 weeks if optimizing an existing RubberQ compound.
```

### 4.6 Compound Library（保密展示）

```
H2: Our Compound Library

[待确认数值，chat 用 "200+"] proprietary compounds developed 
over 30 years. Categorized by polymer family and application 
chemistry. Specific formulations remain proprietary; high-
level capability shown below:

[Table: 胶种 × 应用场景 × 温度区间 × 关键性能 ]

┌────────┬──────────────────┬──────────────┬─────────────────┐
│ Family │ Typical Apps     │ Temp Range   │ Key Property    │
├────────┼──────────────────┼──────────────┼─────────────────┤
│ FKM    │ Auto/Industrial  │ -20 to +200° │ Chemical resist.│
│ FFKM   │ Semicon, Plasma  │ -20 to +260° │ Extreme purity  │
│ HNBR   │ EV thermal mgmt  │ -40 to +160° │ Low compr. set  │
│ NBR    │ Oil sealing      │ -40 to +120° │ Cost-effective  │
│ EPDM   │ Battery, Outdoor │ -50 to +150° │ Weather/steam   │
│ ACM    │ Auto trans.      │ -25 to +175° │ ATF resistance  │
│ AEM    │ Auto heat ducts  │ -40 to +175° │ Heat + oil      │
│ HCR Si │ Industrial seals │ -60 to +230° │ Wide temp range │
│ LSR    │ Precision overm. │ -60 to +200° │ Liquid injection│
└────────┴──────────────────┴──────────────┴─────────────────┘

Need a property combination not listed? That's exactly what 
we develop. [CTA] Start a custom compound brief →
```

### 4.7 Honest Boundaries（v2 第十节诚实区分）

```
H2: What We Can — and Cannot — Promise

We're transparent about development scope so you can plan 
accordingly:

✅ FAST (4-8 weeks): Optimize an existing RubberQ compound
   (e.g., adjust hardness, cost, single property).

✅ STANDARD (8-16 weeks): Select + validate from our 
   compound library for your specific application.

⚠ NDA-DEPENDENT (12-24 weeks): Ground-up new compound from 
   first-principles polymer chemistry. Timeline depends on 
   Japanese team availability — disclosed in NDA.

We will not promise "new compound from scratch in 4 weeks." 
Anyone who does is either lying or cutting corners that will 
fail PPAP.
```

### 4.8 CTA

```
H2: Ready to Co-Develop?

Whether you have a drawing waiting for a quote, or a material 
problem looking for a solution — start the conversation.

[CTA Primary] Submit Application Brief → /contact?type=application
[CTA Secondary] Request Compound Datasheet → [Inline form]
```

---

## 5. ⭐ Testing & Validation（新建）

文件：`src/pages/[locale]/testing.astro`（独立页）  
URL：`/[locale]/testing`  
**v2 chat 原话："比 100 张工厂照片都管用"。这是 SEO 金矿 — 每个标准号都是工程师精确搜索词。**

### 5.1 Hero

```
[Badge] IN-HOUSE VALIDATION TO ASTM / ISO STANDARDS

H1: Every Compound. Every Batch. Tested in-House.

Sub: We don't outsource testing to third-party labs we can't 
control. Our in-house laboratory runs full property validation 
on every formulation — to recognized international standards — 
before any compound enters production.
```

### 5.2 设备 × 测试 × 标准号 三列表（核心内容）

```
H2: Our Testing Capability Matrix

┌─────────────────────────┬────────────────────────────┬──────────────────────┐
│ Equipment               │ Test                       │ Standards             │
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ Universal Tensile Tester│ Tensile Strength,          │ ASTM D412 / ISO 37   │
│                         │ Elongation, Modulus        │                      │
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ Aging Oven              │ Heat Aging, Ozone          │ ASTM D573 / D1149    │
│                         │ Resistance                 │                      │
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ Compression Set Tester  │ Compression Set            │ ASTM D395            │
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ Oil Immersion Bath      │ Fluid / Oil / Fuel         │ ASTM D471 / ISO 1817 │
│                         │ Resistance                 │                      │
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ Durometer (Shore A/D)   │ Hardness                   │ ASTM D2240           │
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ Rheometer (MDR)         │ Cure Characteristics       │ ASTM D5289           │
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ Mooney Viscometer       │ Mooney Viscosity, Scorch   │ ASTM D1646 / ISO 289 │
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ Specific Gravity Balance│ Density Verification       │ ASTM D297            │
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ DMA（待确认）           │ Dynamic Mechanical Analysis│ ASTM D5992 / ISO 4664│
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ TGA（待确认）           │ Thermogravimetric Analysis │ ASTM E1131           │
├─────────────────────────┼────────────────────────────┼──────────────────────┤
│ Video Measuring System  │ Dimensional Inspection     │ ISO 3302-1 Class M1  │
└─────────────────────────┴────────────────────────────┴──────────────────────┘

All equipment calibrated annually by CNAS-accredited 
third-party laboratories.
```

### 5.3 Sample Test Report（脱敏样本下载）

```
H2: What Our Test Reports Look Like

[图：脱敏后的测试报告 PDF 缩略图]

Standard report includes: customer ref, batch ID, polymer 
family, property values, ASTM/ISO standard reference, 
pass/fail vs target, technician signature, lab manager 
counter-signature, calibration cert references.

[CTA Primary] Download Sample Report (PDF) → [link]
```

### 5.4 Custom Testing Protocols

```
H2: Custom Test Protocols Available

Beyond standard ASTM/ISO methods, we run customer-specified 
test protocols including:

- Long-term immersion in your specific service fluid
- Custom-temperature aging cycles
- Compression Set at non-standard temperatures
- Stress relaxation
- Customer-supplied test fixtures

[CTA] Discuss your validation protocol →
```

### 5.5 Link to Quality 页

```
Quality systems & certifications: → /quality
```

---

## 6. Industries 路由重构 + 4 个详情页

### 6.1 总览页 `/[locale]/industries/index.astro`

```
H1: Industries We Serve

Sub: We focus on four sectors where engineered compounds + 
precision manufacturing matter most. We deliberately don't 
serve everyone.

[4 个大卡片 grid，每卡同首页 §2.5 风格，但描述更长]

[Bottom note]
Not seeing your industry? Most precision rubber applications 
fit into one of these four. [CTA] Talk to an engineer →
```

### 6.2 EV & Energy Storage `/industries/ev-energy-storage.astro`

```
H1: Precision Rubber for EV & Energy Storage Applications

Hero sub:
"EV and energy storage applications demand sealing chemistry 
that holds for years — across thermal cycling, fluid 
exposure, vibration, and outdoor weathering. We bring 30 
years of Japanese automotive-grade compound development into 
the next generation of mobility and grid infrastructure."

H2: Four EV & Energy Sub-Sectors We Serve

⚡ Charging Infrastructure
   - Charging gun and connector seals
   - Charging cable junction gaskets
   - Charging pile cabinet seals (IP67)
   - Outdoor enclosure gaskets
   Compounds: EPDM (weather + flame-retardant grades), FKM, Silicone

⚡ Battery Energy Storage Systems (BESS)
   - BESS cabinet sealing (IP67 / IP68)
   - Cable gland and bushing seals
   - Vibration isolation mounts
   - Door and access panel gaskets
   Compounds: EPDM, HNBR, NBR

⚡ EV Peripheral & Manufacturing Equipment
   - EV battery test rig seals
   - Thermal cycling chamber gaskets
   - Production-line sealing for EV component OEMs
   - Drive-unit dynamometer seals
   Compounds: FKM, HNBR, FFKM (for plasma cleaning equipment)

⚡ EV Vehicle Tier 2 Components
   - Thermal management hoses and O-rings
   - Low/medium-voltage connector seals
   - Vibration isolators (motor mounts, battery pack mounts)
   - Sensor seals (Tier 2 supplied to Tier 1 modules)
   Compounds: HNBR, FKM, EPDM, ACM, AEM

H2: Why Compound Chemistry Wins in EV Applications

Unlike legacy ICE seals, EV seals operate in:
- Continuous high-temperature exposure (thermal management 
  hoses see 130-160°C constantly, not just at peak)
- Compression set under long-duration static load (battery 
  pack lifecycle = 8-15 years, not warranty replacement)
- Mixed-fluid environments (coolants, dielectric fluids, 
  electrolyte vapor)
- Vibration combined with thermal cycling

Our advantage: every compound is developed with these 
specific service conditions in mind — not pulled off a shelf.

H2: Material Selection Guide for EV

[Table: Sub-sector × Recommended compound × Temp range × 
Compression set target × IP rating capability]

H2: How We Engage

For drawings-in-hand RFQs: 12-24h quote turnaround.

For application briefs (where you have a sealing problem but 
no compound selected yet): we engage in a structured 5-stage 
co-development process with our Japanese formulation team. 
Full process: 12-24 weeks ground-up; 4-8 weeks if optimizing 
from our existing library.

[CTA Primary] Submit Your EV Application Brief →
[CTA Secondary] Download EV Compound Capability Sheet (PDF)
```

### 6.3 Industrial Equipment `/industries/industrial-equipment.astro`

```
H1: Precision Seals for Industrial Equipment

Sub: Our most established sector. Pneumatic, hydraulic, pump, 
and valve OEMs are our day-to-day customers — many for over 
a decade.

H2: Application Sub-Sectors
- Hydraulic & Pneumatic
  · Cylinder rod seals, piston seals, wiper seals
  · Pneumatic actuator seals
- Pump & Valve
  · Pump housing gaskets
  · Valve stem seals
- Machine Way Protection
  · Bellows, boots, way covers
- Process Equipment
  · Steam-resistant gaskets, chemical-resistant seals

H2: Why Industrial Customers Choose Us
- Engineered compounds, not commodity rubber
- ±0.05mm tolerance achievable
- IATF 16949 supplied to industrial OEMs since 1995
- Compound consistency for 5+ year supply contracts

[CTA] Get a quote →
```

### 6.4 Semiconductor (FFKM) `/industries/semiconductor.astro`

```
H1: FKM and FFKM Seals for Semiconductor Manufacturing

Sub: Cross-contamination tolerance in semiconductor process 
is near-zero. Our single dedicated A-mixing line — with 
sequence-ordered scheduling and validated cleaning SOP — 
delivers the compound purity that wafer-fab seals demand.

H2: Where We Engage

We engage on semiconductor sealing as a co-development 
service, not as an off-shelf catalog. Two engagement modes:

▸ FKM-Based Process Seals (proven)
  Wafer handling, chamber static seals, gas-line gaskets in 
  non-aggressive plasma environments. Built on 30 years of 
  FKM compound development. Standard 8-16 week lead time.

▸ FFKM-Based Process Seals (co-development)
  Aggressive plasma etch, ALD/CVD chamber dynamic seals, 
  high-purity gas delivery. FFKM is our flagship co-
  development offering — premium chemistry, premium pricing, 
  premium reliability. Engagement: structured 5-stage 
  development with our Japanese formulation team, NDA-backed.

H2: Why Single-Line Matters in Semicon

In a multi-line plant, yesterday's high-carbon-black batch 
can leave residue affecting today's FFKM batch — even with 
cleaning. We eliminate that risk by design: ONE A-line, 
sequence-ordered (high-purity first, high-filler last), 
validated SOP between batches. Auditable.

H2: Process Compatibility (Customer-Specified)

We do not publish standard FFKM formulations — every 
semiconductor application has unique process chemistry 
(etchant gases, RF power, thermal cycling). Submit your 
process conditions; we'll propose compound chemistry within 
2-3 weeks under NDA.

[CTA] Submit Your Semicon Application Brief →
```

### 6.5 Automotive Tier 2 `/industries/automotive-tier2.astro`

```
H1: Automotive Tier 2 Components — Where Precision Matters Most

Sub: We've supplied long-term to Japanese automotive OEMs 
since 1995. Today we focus on Tier 2 applications where 
custom compounds and tight tolerance — not raw volume — 
drive supplier selection.

H2: Where We Fit
✅ Tier 2 key components (thermal mgmt, sensor seals, 
   sub-system gaskets)
✅ Low-to-medium volume premium parts (10K-1M annually)
✅ Compound co-development with Tier 1 R&D engineers
❌ Tier 1 platform-wide volume parts (millions/year per SKU)
❌ Commodity replacement parts (catalog-grade)

H2: Existing Customer Profile (脱敏)
- Long-term Japanese OEM relationships since 1995
- Tier 1 supplier base in Europe and North America (since 
  [待确认])
- Specialty: applications where compound chemistry matters 
  more than mold count

[CTA] Discuss your Tier 2 component →
```

---

## 7. Materials 重写

文件：`src/pages/[locale]/materials.astro`

### 7.1 Hero 重写

```
H1: In-House Rubber Compounding Across 9+ Polymer Families
Sub: We don't buy compounds. We engineer them — with Japanese 
     formulation partners, across 30 years and [待确认 200+] 
     proprietary formulations.
```

### 7.2 材料卡片扩展（从 4 个 → 9 个）

按以下顺序排列（v2 行业优先级驱动）：

| Material | 主要应用 | 加在何处 |
|---|---|---|
| **HNBR** ⭐ 新增 | EV thermal mgmt, high-temp auto | 第 1 位（EV 重仓） |
| **FKM** | Aerospace, chem, high-perf auto | 保留 |
| **FFKM** ⭐ 新增 | Semiconductor, plasma | 第 3 位 |
| **EPDM** | Battery, outdoor, water/steam | 保留 |
| **NBR** | Hydraulic, oil sealing | 保留 |
| **ACM** ⭐ 新增 | Auto transmission, ATF | 新增 |
| **AEM** ⭐ 新增 | Auto heat ducts | 新增 |
| **Silicone (HCR)** | Industrial seals | 保留，重写 FDA 表述 |
| **LSR** ⭐ 新增 | Precision overmolding | 新增 |

### 7.3 Silicone 段落重写

```
Current: "FDA compliant grades available"
New:     "Industrial-grade silicone (HCR & LSR). FDA-compliant 
          grades on request for food-contact and industrial 
          equipment applications — not for medical implant use 
          (we do not hold ISO 13485)."
```

### 7.4 Custom Compound Library 板块（新增）

```
H2: Need a Property Combination Not Listed?

[Body：解释自有配方库 + 引导到 Compounding & R&D]

[CTA] Explore our R&D capabilities → /compounding
```

---

## 8. Quality 重写

文件：`src/pages/[locale]/quality.astro`

### 8.1 Hero subtitle 重写

```
Current: "...for AI, Robotics, and Automotive industries."
New: "From compound design to final inspection, our IATF 
      16949 certified quality system serves EV/energy 
      storage, industrial equipment, semiconductor, and 
      Tier 2 automotive customers with compound traceability 
      maintained across years of production."
```

### 8.2 lab 设备清单加 ASTM/ISO 标准号

把 Quality 页的 lab 板块更新为含标准号的简表（4 件设备），并加 link 跳转到完整 Testing & Validation 页（§5）。

### 8.3 "Why Single-Line Matters" 子板块（新增）

简版三段（链接到 Compounding & R&D 的详细版）：

```
H3: Why We Run a Single A-Mixing Line

Three operational advantages we deliberately preserve:
1. Compound consistency over years (your 2030 PPAP reproduces 
   your 2026 part).
2. Cross-contamination control (sequence-ordered scheduling 
   + strict SOP).
3. Engineer-witnessed batches (real-time rheology + Mooney 
   review, not sampled).

[Inline link] See our compounding capabilities in detail → 
/compounding
```

---

## 9. Capabilities 扩展

文件：`src/pages/[locale]/capabilities.astro`

### 9.1 Hero subtitle 加 single A-line 叙事

```
Current: "Our two-stage mixing process is the backbone of 
          our quality promise..."
New: "Our two-stage mixing process — run on a single, 
      dedicated A-mixing line designed by our Japanese 
      formulation partners — is the backbone of our quality 
      promise. By separating masterbatching from final 
      compounding, we achieve superior batch-to-batch 
      consistency for critical applications."
```

### 9.2 在 Phase 2 (Masterbatching / A-Mixing) 后插入 callout

```
─────── CALLOUT BOX ───────
"Single Line, Zero Cross-Contamination"

Sequence-ordered scheduling: highest-purity compounds first 
in the day, high-carbon-black/peroxide compounds last. SOP-
driven cleaning between batch families. Critical for 
semiconductor FFKM and EV battery seal applications.

[link] Learn more about our compounding strategy → /compounding
───────────────────────────
```

---

## 10. Contact / RFQ 表单重做

文件：`src/components/contact/ContactForm.tsx` + `src/pages/[locale]/contact.astro`

### 10.1 industry options 重写

```typescript
// 改前
industryOptions: { robotics, ai, automotive, machinery, other }

// 改后
industryOptions: {
  ev: "EV & Energy Storage",
  industrial: "Industrial Equipment (Hydraulic / Pneumatic / Pumps / Valves)",
  semiconductor: "Semiconductor (FFKM / Process Seals)",
  automotiveTier2: "Automotive Tier 2",
  robotics: "Robotics & Automation",
  aiHardware: "AI Hardware / Data Centers",
  other: "Other (please describe)"
}
```

**移除**：`automotive: "Automotive (IATF 16949 req.)"`（被 automotiveTier2 替代）

### 10.2 新增字段（按顺序）

```
┌────────────────────────────────────────────────────────┐
│ Project Type *  (radio, required)                      │
│ ◯ Drawing-driven RFQ — I have a spec, need a quote    │
│ ◯ Application-driven — I have a problem, need a       │
│   compound solution                                     │
│ ◯ Sample request only                                  │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ Estimated Annual Volume *  (select)                    │
│ ▼ Under 10,000 parts                                   │
│ ▼ 10,000 – 100,000 parts (Sweet spot)                  │
│ ▼ 100,000 – 1,000,000 parts (Sweet spot)               │
│ ▼ 1,000,000 – 5,000,000 parts (Sweet spot)             │
│ ▼ Over 5,000,000 parts (We may not be the right fit)   │
└────────────────────────────────────────────────────────┘
[Inline hint when "Over 5M" or "Under 10K" selected:]
  → Our setup is purposefully sized for 10K-5M annual volumes. 
    Smaller pilot or larger commodity orders may require 
    a different supplier or a custom engagement.

┌────────────────────────────────────────────────────────┐
│ Quote Components Needed (multi-select, optional)       │
│ ☐ Compound development feasibility & cost              │
│ ☐ Tooling cost estimate                                │
│ ☐ Per-piece cost (production-ready)                    │
│ ☐ NDA template (we'll send first)                      │
│ ☐ Sample quote (small qty for evaluation)              │
└────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────┐
│ Project Stage (select, optional)                       │
│ ▼ Feasibility study                                    │
│ ▼ Prototype / pilot                                    │
│ ▼ Pre-production validation                            │
│ ▼ Production / supply agreement                        │
└────────────────────────────────────────────────────────┘
```

### 10.3 Response SLA 文案更新

```
Current: "Our engineering team typically responds to technical 
          inquiries and RFQs within 12-24 hours."
New: "Response SLA:
      - Drawing-driven RFQ: 12-24 hours
      - Application-driven inquiry: 3-5 business days (includes 
        preliminary Japanese formulation team review)
      - Sample request: 24-48 hours"
```

### 10.4 后端联动（第 4 步实施时处理）

- Worker `rubberq-rfq-api` 入参 schema 增字段：`projectType`, `annualVolume`, `quoteComponents[]`, `projectStage`
- D1 表 migration：增加上述字段
- GA event payload：在 `inquiryTracking.ts` 的 `quote_request` event 内带上 projectType + annualVolume

---

## 11. JsonLd Organization schema 重写

文件：`src/lib/structuredData.ts`

```typescript
export function createOrganizationSchema(locale: string) {
  const baseUrl = localeBaseUrl(locale);

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'RubberQ',
    legalName: 'Fuzhou RubberQ Rubber Co., Ltd.',
    foundingDate: '1995-06',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Sino-Japanese joint venture established in June 1995. RubberQ engineers custom rubber compounds in collaboration with Japanese formulation engineers since 1995, and precision-manufactures small-to-medium batch components for EV/energy storage, industrial equipment, semiconductor, and Tier 2 automotive applications. IATF 16949 / ISO 9001 / ISO 14001 certified with in-house testing laboratory.',
    slogan: 'Japanese Formulation. Chinese Precision. Trusted Since 1995.',
    sameAs: [
      'https://www.linkedin.com/company/rubberq',
    ],
    email: 'contact@rubberq.com',
    areaServed: ['Europe', 'North America', 'Japan', 'Southeast Asia'],
    knowsAbout: [
      'In-house rubber compounding',
      'Custom elastomer formulation',
      'Japanese-developed master compounds',
      'FKM', 'FFKM', 'HNBR', 'NBR', 'EPDM', 'ACM', 'AEM',
      'Silicone (HCR)', 'LSR',
      'Precision rubber seals',
      'EV battery thermal management seals',
      'Semiconductor process seals (FFKM)',
      'Industrial hydraulic and pneumatic seals',
      'Compound traceability',
      'Single-line mixing for compound consistency',
      'IATF 16949 quality management',
      'Compound development partnership',
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Quality Management',
        name: 'IATF 16949:2016',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Quality Management',
        name: 'ISO 9001:2015',
      },
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Environmental Management',
        name: 'ISO 14001:2015',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'contact@rubberq.com',
      availableLanguage: ['en', 'de', 'ja', 'es', 'zh'],
      areaServed: ['Global'],
    },
    mainEntityOfPage: baseUrl,
  };
}
```

**关键变化**：
- 加 `foundingDate: '1995-06'`
- 加 `slogan` 字段（首页 Tagline）
- `description` 全量重写为 v2 叙事
- `knowsAbout` 从 6 项扩到 22 项（含 FFKM / HNBR / EV / semicon / 配方等）
- `hasCredential` 从单一 IATF 扩展为完整三认证

---

## 12. 5 语种 messages 待新增 keys 清单

第 4 步实施时需要在 `src/messages/{en,de,ja,es,zh}.json` 同步以下 keys。en 是源语言。

```
hero:
  badgeV2: "JAPANESE FORMULATION × CHINESE PRECISION × SINCE 1995"
  taglineV2: "Japanese Formulation. Chinese Precision. Trusted Since 1995."
  subtitleV2: [新 subtitle 全文]
  ctaPrimaryV2: "REQUEST QUOTE"
  ctaSecondaryV2: "EXPLORE OUR R&D"

features:
  jpRdTitle / jpRdDesc
  inhouseCompoundingTitle / inhouseCompoundingDesc
  ownLabTitle / ownLabDesc
  heritageV2Title / heritageV2Desc

goodFit:
  title / subtitle
  fitItems[] (5 条)
  notFitItems[] (4 条)
  cta

capacityReframing:
  title / body

compoundingRDEntry:
  title / subtext / cta

industries:
  evEnergyStorage: { title, desc, url }
  industrialEquipment: { title, desc, url }
  semiconductor: { title, desc, url }
  automotiveTier2: { title, desc, url }
  // 删除 industries.medical

footerTagline: [Tagline]

# 新页面 messages 树
compounding: { hero, whyCompounding, aLine{ capacity, advantage1, advantage2, advantage3 }, lab, workflow{ stage1..5 }, library, boundaries, cta }
testing: { hero, matrix, sampleReport, customProtocols, qualityLink }
industries: { index, evEnergyStorage{ ... }, industrialEquipment{ ... }, semiconductor{ ... }, automotiveTier2{ ... } }

about:
  dualBrainTitle / dualBrainJapan / dualBrainChina / dualBrainLab / dualBrainCaption
  heritageText1V2 / heritageText2V2
  whatWeDontDo: { title, notFit[], rightFit[], cta }
  taglineV2  // Quote 重写

quality:
  heroSubtitleV2
  whySingleLine: { title, points[3], cta }

capabilities:
  heroSubtitleV2
  singleLineCallout: { title, body, cta }

contact.form:
  industryOptionsV2: { ev, industrial, semiconductor, automotiveTier2, robotics, aiHardware, other }
  projectType: { label, drawing, application, sample }
  annualVolume: { label, options[5], hintLowHigh }
  quoteComponents: { label, options[5] }
  projectStage: { label, options[4] }
  responseSlaV2: { title, drawing, application, sample }
```

---

## 13. 实施顺序与依赖

第 4 步实施时建议按以下顺序，因为后面的依赖前面的：

```
1. JsonLd schema 重写 (§11)
   └─ 影响所有页面的 Organization 引入

2. messages/en.json 新增所有 keys (§12)
   └─ 影响所有页面的 t() 调用

3. 新建 Compounding & R&D 页 (§4) + Testing & Validation 页 (§5)
   └─ 影响 nav + 内链 + 整体叙事

4. Home 重做 (§2) + About 重做 (§3)
   └─ 影响首屏品牌

5. Industries 路由新建 + 4 个详情页 (§6)
   └─ 依赖 messages + Compounding 入口

6. Materials 重写 (§7) + Quality 重写 (§8) + Capabilities 扩展 (§9)
   └─ 链路细节

7. RFQ 表单重做 (§10) + Worker 联动 + D1 migration + GA event
   └─ 后端链路，独立步骤

8. 5 语种翻译同步（de/ja/es/zh.json 全部补齐）
   └─ 上线前必须

9. Nav 重构 (§1)
   └─ 全部页面就位后再切换

10. 部署 + 回归测试
```

预估总工作量（与差异审计 §六 一致）：**10-12 天**。

---

## 14. 本文档维护

- 本文档是 v2 wireframe **唯一权威版本**，第 4 步实施直接据此进行
- 实施过程中如发现 wireframe 需要修订，**就地修改本文档**（不要建"v2.1 / v2-final"等版本变体）
- 实施完成后在文末追加"实际落地结果"小节，记录哪些原样落地 / 哪些就地修订
- `[待确认]` 占位上线前必须全部回填到真实数值

---

- 创建日期：2026-05-12
- 创建人：Claude（基于 v2 画像 + 悬念回收 #1 + 差异审计）
- 关联：
  - `rubberq-info.md` 末两节（v2 + 悬念回收 #1）
  - `Super Prompt.md` 末节（v2 口径补丁）
  - `2026-05-11-网站定位重做-差异审计.md`
  - `2026-05-11-下一步任务规划-完整版.md`

---

## 15. 2026-05-13 第 4 步实际落地记录

### 已实现（代码层面）

| 项 | 文件 | 状态 |
|---|---|---|
| §11 JsonLd Organization schema 重写 | `src/lib/structuredData.ts` | ✅ description / slogan / foundingDate 1995-06 / knowsAbout 22 项 / hasCredential 三认证 |
| §12 messages/en.json v2 keys | `src/messages/en.json` | ✅ metadata 全量重写 + 新 keys：hero v2 / features 4 / goodFit / capacityReframing / compoundingRDEntry / footerTagline / compounding 全树 / testing 全树 / industriesPage 4 子页 / aboutV2 全树 / qualityV2 / capabilitiesV2 / rfqV2 |
| §4 Compounding & R&D 新页 | `src/pages/[locale]/compounding.astro` | ✅ Hero（含 video 占位） / Why Compounding / A-Mixing Line + 3 优势 / Lab 设备网格（6 件，占位） / 5 阶段开发流程 / 配方库 9 行表 / Honest Boundaries / 工艺宣传片占位 / Final CTA |
| §5 Testing & Validation 新页 | `src/pages/[locale]/testing.astro` | ✅ Hero / 设备 × 测试 × ASTM/ISO 标准号 11 行矩阵 / 设备图 8 格 / Sample Report 占位 / Custom Protocols / Quality link |
| §2 Home 重做 | `src/pages/[locale]/index.astro` | ✅ Hero v2（badge + tagline + 新 CTA） / Features 4 v2 卡 / Good Fit 双列 / Capacity Re-framing / Industries 4 卡（EV/Industrial/Semicon/Auto Tier 2）/ Compounding 入口 |
| §3 About 重做 | `src/pages/[locale]/about.astro` | ✅ Hero quote v2 / Dual-Brain Model 三栏 / Corporate Video 占位 / Heritage Text v2 / Stats 30 年 / Factory Scenes 改占位 / What We Don't Do |
| §6 Industries 路由 + 4 详情页 | `src/pages/[locale]/industries/index.astro` + `[slug].astro` | ✅ 总览页 4 卡 + 动态路由覆盖 ev-energy-storage / industrial-equipment / semiconductor / automotive-tier2 |
| §1 Nav 加 Compounding & R&D + Industries | `src/components/Navbar.astro` | ✅ Desktop + Mobile 都加；Resources dropdown 加 Testing |
| Footer Tagline 横幅 | `src/components/Footer.astro` | ✅ 顶部横幅 + Technical Hub 栏加 Compounding/Testing/Industries 链接 |

### 第二批已完成（2026-05-13 续）

| 项 | 文件 | 状态 |
|---|---|---|
| §7 Materials 重写 | `src/pages/[locale]/materials.astro` + `en.json` materialsPage | ✅ Hero 改为 in-house compounding 叙事 / 9 种材料卡（HNBR/FKM/FFKM/EPDM/NBR/ACM/AEM/Silicone/LSR）按行业优先级排序 / Silicone 段移除 "medical/FDA implant"，改为 industrial-grade + FDA on request / 比较矩阵保留 4 主流材料 / 底部加 Custom Compound Library 入口指向 /compounding |
| §8 Quality 重写 | `src/pages/[locale]/quality.astro` + `en.json` quality | ✅ Hero subtitle 改 v2 / lab 设备表加 ASTM 标准号（D5289 / D412 / D573 / ISO 3302-1）/ 加 "Why Single-Line Matters" 三栏黑底板块 / 加链接到 /testing 完整测试矩阵 |
| §9 Capabilities 扩展 | `src/pages/[locale]/capabilities.astro` + `en.json` capabilities | ✅ Hero subtitle 加 single A-line + Japanese formulation partners 叙事 / Phase 2 (A-Mixing) 后插入 Single-Line callout（黑底橙边）含链接到 /compounding |

### 待办（第 5 步之前）

- §10 RFQ 表单后端联动：Worker 入参 schema + D1 migration + GA event payload（前端 messages keys 已就位）
- 5 语种翻译同步：de.json / ja.json / es.json / zh.json 当前缺新增 keys，会自动回退到 en，但 SEO meta 必须逐语补全
- 媒体资产替换：约 70 个图片占位 + 5 段视频位等待用户素材

### 验证

- `astro sync`：✅ 通过（435ms，所有路由生成成功）
- `astro check`：✅ 我的 v2 新文件无 error（pre-existing materials/[slug].astro 有 4 个 error 与本次无关）
- `astro build`：在 sandbox 环境因 fd 限制超时，但 Server entrypoints 阶段所有页面正常路由识别（含 industries/[slug] 动态路由）。用户在 macOS 或 Cloudflare CI 环境构建无 sandbox 限制

### 媒体占位计数

实现的页面共埋了 **52 个 data-slot-id 占位**（图片 47 + 视频 5），每个含 `data-slot-id` / `data-purpose` / `data-spec` / `data-priority` 四个属性，方便审核后批量替换。详见 `2026-05-12-媒体资产位清单.md`。

---

- 更新日期：2026-05-13
- 更新人：Claude
- 后续维护：第 5 步及之后的代码改动就地修改本文档"实际落地记录"小节即可，不建版本变体
