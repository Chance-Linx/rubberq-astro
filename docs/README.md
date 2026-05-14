# rubberq-astro/docs/ — 项目文档（规范位置）

> **从 2026-05-11 起，本目录是项目文档的规范（canonical）位置**。
>
> 原因：rubberq-astro 已确认为唯一在维护的站点实现，文档与代码同源同步。`RubberQ-B2B-Site/docs/`（原位置）从此只读，新工作不再追加；根目录的 `项目文档/` 是导航便利镜像，定期同步本目录。

## 目录结构

```
docs/
├── README.md                              # 本文件
├── 2026-05-11-下一步任务规划-完整版.md     # 5 步任务规划（v2）
├── Claude 讨论.md                         # 四轮战略对话原文（推理过程）
├── rubberq-info.md                        # 公司硬背景 + 末节 v2 战略画像（权威）
├── Super Prompt.md                        # AI 协作纲领 + 末节 v2 口径补丁（强制）
├── 项目简介.md                            # 项目背景、技术架构、16 个页面清单
├── 项目规划.md                            # M1-M4 里程碑、资源分配、风险预案
├── 项目任务清单.md                        # T-001..T-010（2026-02 旧任务，待对齐 v2）
├── 项目日志.md                            # 编年体执行日志
├── PROJECT_LOG.md                         # 早期技术手册（RFQ 闭环 / WP Headless / 批量产文）
├── 周报模板-流量转化询盘质量.md           # 周报模板
├── 网站图片管理指南.md                    # 图片资产规范
├── research/                              # 调研：竞品 / 知识图谱 / 关键词 / 新兴行业
│   ├── README.md
│   ├── competitors/analysis-summary.md
│   ├── industry-emerging.md
│   ├── keywords/{core-keywords.csv, semantic-map.md}
│   └── knowledge-graph/{materials.json, processes.md, standards.json}
├── ia/                                    # 信息架构：sitemap / navigation / aio-blocks / schema
└── copywriting/                           # 文案：frameworks / templates / samples
```

## 读取顺序（新人/新对话从 0 起步）

1. 先读 `CLAUDE.md`（根目录） — 拿全局口径
2. 再读 `rubberq-info.md` **末节** — v2 战略画像（双重身份、Good Fit、产能 Re-framing、报价单四段式）
3. 再读 `Super Prompt.md` **末节** — v2 口径补丁（强制叙事、敢说不、输出红线）
4. 再读 `2026-05-11-下一步任务规划-完整版.md` — 5 步任务规划与悬念
5. 需要回溯推理过程时再开 `Claude 讨论.md`

## 维护规则

- **追加式记录**：所有 `.md` 文档新增内容追加到文末，禁止覆盖/删除已有内容
- **v2 节为权威**：与 v2 节冲突的旧表述以 v2 为准
- **悬念回收**：每次回收 Q1（一句话定位） / Q2（日方 EV 经验） / 新决策点，按日期追加到对应文档末尾

## 三处 docs 的关系

| 路径 | 角色 | 是否更新 |
|---|---|---|
| `rubberq-astro/docs/`（本目录） | **规范位置**（canonical） | ✅ 主更新位置 |
| `项目文档/`（项目根目录） | 导航便利镜像 | 🔄 定期从本目录同步 |
| `RubberQ-B2B-Site/docs/` | 历史原位（与 Next.js 实现同期） | 🚫 只读，不再更新 |
