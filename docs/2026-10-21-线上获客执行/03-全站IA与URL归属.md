# RubberQ 全站 IA 与 URL 归属

目的：让材料/产品/工艺搜索找到匹配入口，让工程与采购继续验证能力并提交需求。按用户批准方向组织，不重新讨论赛道取舍。

## 主导航

Products / Materials / Capabilities / Industries / Resources / About / Request a Quote。

Products：O-Rings & Seals、Custom Gaskets、Custom Molded Parts、Bellows & Boots、Diaphragms、Rubber-to-Metal Parts、FFKM Replacement Seals。

Materials：FFKM、FKM、EPDM、HNBR、NBR、Silicone、LSR；ACM/AEM保留二级索引，不扩张无任务的新页。

Capabilities：Rubber Molding、Compounding & Formulation、Compound Supply、Testing、Quality & Traceability、Factory。

Industries顺序：Semiconductor → Liquid Cooling & Energy Storage → EV Thermal Management → Humanoid Robotics；General Industrial、Automotive Tier 2保留次级入口。

Resources：Material Selection、O-Ring Size Guide、Hardness Guide、Compatibility Review、Failure Analysis、Standards、English Blog。

About：Company / Factory / Quality。工厂和质量是同一URL的多入口链接，不复制页面。

## 两层职责

- 获客：产品、材料、工艺、工程问题。采购页直接说明可讨论的产品、规格输入、评估方式和询盘下一步。
- 信任与转化：行业、质量、检测、工厂、企业与RFQ。行业页链接具体材料/产品，材料/产品页回链合适行业；均可直接进入Contact/Sample/Batch RFQ。

两层是访问任务分工，不是互不连接的目录。主页、导航和正文形成双向关系。

## URL规则

- 英文根路径，无`/en`；de/ja/es/zh前缀。英文博客唯一内容语言，现有兼容URL行为由原路由维护。
- 保留现有材料、产品、核心和行业URL。`/products/seals`作为O圈/密封件主入口，不另建近义O圈商业页。
- `/materials/ffkm`解释材料；`/products/ffkm-replacement-seals`承接设备维护替代评估；`/industries/semiconductor`承接设备工况。三页主任务不同。
- `/compounding`讲配方与混炼能力；`/compounds`承接外供；`/capabilities/rubber-molding`讲成型采购；`/products/custom`讲按图定制制品。
- `/materials/lsr`负责材料选择，`/capabilities/lsr-molding`负责工艺采购。
- 保留`/industries/ev-energy-storage`，主文案收敛EV热管理；新液冷与储能页承担该方向。对已有储能排名页面先读GSC与全文，不因新规划做301或撤销。
- 图表/计算器先交付指南与字段结构；数值表和算法须有相应标准与实测/权威数据才实施，不制造不可用工具。
- Title/description按页面任务定稿；canonical/hreflang经createLocaleAlternates，JsonLd按实际内容注入；没有可见FAQ不加FAQ内容。

## 唯一规划职责表

| URL | 页面 | 任务 | 主词 | 动作 |
|---|---|---|---|---|
| `/` | 首页 | 信任总入口/商业分流 | precision rubber parts manufacturer | 保留现有URL |
| `/about` | 关于RubberQ | 企业信任 | RubberQ manufacturer | 保留现有URL |
| `/products` | 产品总览 | 产品获客枢纽 | custom rubber parts | 保留现有URL |
| `/products/seals` | O圈与密封件 | 产品商业页 | custom o-rings | 保留现有URL |
| `/products/gaskets` | 定制垫片 | 产品商业页 | custom gaskets | 保留现有URL |
| `/products/bellows` | 波纹管与防护套 | 产品商业页 | rubber bellows | 保留现有URL |
| `/products/custom` | 定制模压件 | 产品商业页 | custom molded rubber parts | 保留现有URL |
| `/products/diaphragms` | 隔膜 | 产品商业页 | rubber diaphragm manufacturer | 规划新URL |
| `/products/rubber-to-metal-bonded-parts` | 橡胶金属粘接件 | 产品商业页 | rubber to metal bonding | 规划新URL |
| `/products/ffkm-replacement-seals` | FFKM售后替代件 | 售后采购商业页 | ffkm replacement seals | 规划新URL |
| `/materials` | 材料总览 | 材料获客枢纽 | rubber materials | 保留现有URL |
| `/materials/ffkm` | FFKM材料 | 材料页 | ffkm o-rings | 保留现有URL |
| `/materials/fkm` | FKM材料 | 材料页 | fkm o-rings | 保留现有URL |
| `/materials/epdm` | EPDM材料 | 材料页 | epdm seals | 保留现有URL |
| `/materials/hnbr` | HNBR材料 | 材料页 | hnbr seals | 保留现有URL |
| `/materials/nbr` | NBR材料 | 材料页 | nbr o-rings | 保留现有URL |
| `/materials/silicone` | Silicone材料 | 材料页 | silicone rubber molding | 保留现有URL |
| `/materials/lsr` | LSR材料 | 材料页 | liquid silicone rubber molding | 保留现有URL |
| `/materials/acm` | ACM材料 | 材料页 | acm rubber | 保留现有URL |
| `/materials/aem` | AEM材料 | 材料页 | aem rubber | 保留现有URL |
| `/capabilities` | 制造能力 | 能力枢纽 | rubber parts manufacturer | 保留现有URL |
| `/capabilities/rubber-molding` | 橡胶成型工艺 | 工艺商业页 | custom rubber molding | 规划新URL |
| `/capabilities/lsr-molding` | LSR成型项目 | 工艺商业页 | liquid silicone rubber molding | 规划新URL |
| `/compounding` | 配方与混炼能力 | 能力商业页 | rubber compounding | 保留现有URL |
| `/compounds` | 配方胶料外供 | 外供商业页 | rubber compounder | 规划新URL |
| `/testing` | 检测实验室 | 验证信任页 | rubber testing laboratory | 保留现有URL |
| `/quality` | 质量与认证 | 供应商评估信任页 | rubber manufacturing quality | 保留现有URL |
| `/factory` | 工厂 | 制造信任页 | rubber factory | 保留现有URL |
| `/industries` | 应用行业总览 | 行业转化枢纽 | industrial rubber components | 保留现有URL |
| `/industries/semiconductor` | 半导体 | 行业转化页 | semiconductor seals | 保留现有URL |
| `/industries/liquid-cooling-energy-storage` | 液冷与储能 | 行业转化页 | liquid cooling seals | 规划新URL |
| `/industries/ev-energy-storage` | EV热管理（保留旧URL） | 行业转化页 | ev thermal management seals | 保留现有URL |
| `/industries/humanoid-robotics` | 人形机器人 | 行业转化页 | robot rubber components | 规划新URL |
| `/industries/industrial-equipment` | 通用工业 | 行业转化页 | custom industrial rubber parts | 保留现有URL |
| `/industries/automotive-tier2` | 汽车Tier2 | 行业转化页 | automotive rubber components | 保留现有URL |
| `/resources` | 工程资源 | 工程参考枢纽 | rubber engineering resources | 保留现有URL |
| `/standards` | 标准索引 | 标准参考页 | rubber standards | 保留现有URL |
| `/resources/o-ring-size-guide` | O圈尺寸与沟槽指南 | 工程参考页 | o-ring size chart | 规划新URL |
| `/resources/rubber-hardness-guide` | 橡胶硬度指南 | 工程参考页 | shore a hardness | 规划新URL |
| `/resources/material-compatibility` | 材料兼容性指南 | 工程参考页 | chemical compatibility chart | 规划新URL |
| `/resources/seal-failure-analysis` | 密封失效分析 | 工程参考页 | rubber seal failure | 规划新URL |
| `/blog` | 英文博客 | 内容聚合 | rubber component guides | 保留现有URL |
| `/case-studies` | 项目经验 | 证据页 | rubber component project review | 保留现有URL |
| `/contact` | 工程咨询与报价 | 转化入口 | rubber parts quote | 保留现有URL |
| `/sample-request` | 样品申请 | 转化入口 | custom rubber samples | 保留现有URL |
| `/batch-rfq` | 多件号RFQ | 转化入口 | rubber parts rfq | 保留现有URL |
| `/search` | 站内搜索 | 导航工具 | site search | 保留现有URL |
| `/privacy` | 隐私政策 | 法律/功能页 | 功能页 | 保留现有URL |
| `/terms` | 使用条款 | 法律/功能页 | 功能页 | 保留现有URL |

## 存量保护与实施验收

271篇文章是报告基线，不是本轮读取后的实时库存。上线前按实际CMS正文、状态与GSC查询—页面读取决定保留、补充、合并或新增。标题/slug匹配只能列候选，不能标记已覆盖。新页规划不等于已创建；全部内链目标实际存在后才写入生产。

实施顺序：核心商业页与工厂信任稿 → 材料与工艺 → 外供/替代 → 行业 → 工程资源与存量正文归属。每批自审、红线、品牌色、5语种、构建、真实路由与RFQ回归；状态分别记录本地稿、CMS、部署、线上、搜索和询盘。
