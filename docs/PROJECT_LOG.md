🚀 RubberQ 独立站项目全实操技术手册 (2026-01-23)
1. 项目核心架构
    本站采用了 "现代前后端分离 (Headless)" 架构，旨在兼顾 SEO 性能、内容管理便利性与自动化生产：

    前端 (Frontend): Next.js (部署在 Cloudflare Pages)，负责极速展示和 SEO。
    后端 (CMS): WordPress (manager.rubberq.com)，仅作为内容录入和 AI 文章存储库。
    逻辑层 (Serverless): Cloudflare Workers，负责处理询盘 (RFQ) 提交和邮件发送。
    数据库 (DB): Cloudflare D1，存储所有的询盘原始数据。
    自动化 (Automation): 本地 Node.js 脚本 + OpenRouter API，实现 AI 批量生产工业级文章。
2. 已完成的关键任务与流程
    第一阶段：询盘系统 (RFQ) 闭环
    功能：用户提交表单 -> 存入 D1 数据库 -> 自动发送邮件提醒至 contact@rubberq.com。
    解决的技术难题：
    CORS 跨域修复：配置了 Worker 的 Header，允许前端域名跨域提交。
    邮件外发：集成了 Resend API，解决了域名发信验证问题。
    第二阶段：WordPress Headless 集成
    功能：在 WP 发布文章，Next.js 自动抓取并生成 SEO 页面。
    解决的技术难题：
    WP 路由冲突：解决了子域名重定向回旧域名的配置错误（通过 wp-config.php 强制定义）。
    数据同步：在 src/app/blog/page.tsx 中实现了对 WP REST API 的异步抓取。
    第三阶段：SEO 自动化
    功能：动态生成 sitemap.xml 和 robots.txt。
    实现方式：修改 src/app/sitemap.ts，使其在生成站点地图时自动请求 WP 接口，获取最新的文章链接。
    第四阶段：AI 批量产文工厂
    功能：本地脚本批量生产专业技术文章。
    实现方式：generate-posts.mjs 脚本利用 OpenRouter 转发 Gemini/DeepSeek 的能力。
3. 核心代码说明 (可复用性分析)
    3.1 批量产文脚本 (generate-posts.mjs)
    复用价值：极高。你可以将其复制到任何其他 B2B 项目中。
    逻辑说明：它是一个"翻译官"。它把你的关键词传给 AI，并附带一套"橡胶工程师提示词"，AI 返回 HTML 代码，脚本再把代码推送到 WP。
    使用建议：只需修改 CONFIG 中的 WP 地址、用户名、密码和 API Key 即可复用。
    3.2 动态 Sitemap (src/app/sitemap.ts)
    复用价值：高。这是 Next.js 站点的 SEO 标配。
    逻辑说明：它会自动扫描你的 WP 数据库。如果你以后做别的站，只要改一下 WP 的 API 链接即可。
    3.3 询盘处理 Worker (index.ts)
    复用价值：极高。这是处理表单提交的通用模板。

    第五阶段：多语言国际化 (i18n) - 2026-01-29 完成
    功能：为网站添加多语言支持，覆盖欧洲、亚洲、南美市场
    技术方案：next-intl v4 + Next.js 15 App Router
    
    实现详情：
    - 安装依赖：npm install next-intl
    - 配置文件结构：
      src/i18n/
      ├── config.ts          # 语言配置 (en/de/ja/es/zh)
      ├── routing.ts         # 路由路径映射 (/products -> /de/produkte)
      ├── navigation.ts      # 导航组件导出 (Link/usePathname)
      └── request.ts         # 服务端消息加载配置
      
    - 翻译文件：messages/{en,de,ja,es,zh}.json
    - 中间件：src/middleware.ts (自动语言识别和路由)
    - 布局：src/app/[locale]/layout.tsx (动态语言布局)
    
    URL 结构：
    - 英文(默认): http://rubberq.com/ (无前缀)
    - 德语: http://rubberq.com/de
    - 日语: http://rubberq.com/ja
    - 西班牙语: http://rubberq.com/es
    - 中文: http://rubberq.com/zh
    
    关键页面路径映射：
    - /products -> /de/produkte, /es/productos
    - /case-studies -> /de/referenzen
    - /factory -> /de/werk
    - /contact -> /de/kontakt, /es/contacto
    
    遇到的坑：
    - 'use client' 组件不能同时导出 generateStaticParams()
    - 解决方法：generateStaticParams() 只放在 [locale]/layout.tsx
    - messages 路径要相对于 src/i18n/request.ts 的位置

    **✅ 已完成的多语言页面** (2026-01-29):
    - 首页 (/)
    - About (/about)
    - Products (/products)
    - Contact (/contact)
    - Footer 组件

    **🟢 保持英文的页面** (可后续翻译):
    - Blog (/blog) - 技术文章列表
    - Materials (/materials) - 材料中心（含动态内容）
    - Quality (/quality) - 质量保证
    - Factory (/factory) - 工厂参观
    - Case Studies (/case-studies) - 案例研究
    - Capabilities (/capabilities) - 制造能力
    - Privacy/Terms - 法律页面

---

### 🎨 第六阶段：性能优化 (Performance Optimization) - 2026-01-29 进行中
    功能：图片懒加载 / WebP 格式 / LCP 优化，提升 Core Web Vitals 分数
    
    技术方案：Next.js Image Component + 自动 WebP 转换 + blur placeholder
    
    实现详情：
    - 配置文件更新：
      - next.config.js：禁用 unoptimized，启用 formats: ['image/avif', 'image/webp']
      - 配置 deviceSizes 和 imageSizes 优化响应式图片
      - 配置 remotePatterns 允许 Unsplash 图片优化
    
    - 优化组件创建：src/components/OptimizedImage.tsx
      - 集成 Next.js Image 组件
      - 自动懒加载 (loading="lazy")
      - blur placeholder 避免布局偏移 (CLS)
      - 响应式 sizes 配置
      - loading 状态管理，显示骨架屏
    
    - 页面优化：
      - 首页 Industry 卡片：使用 OptimizedImage
      - 首页 LCP 优化：Hero 区域已是静态内容，优先级设置正确
    
    - 性能目标：
      - LCP (Largest Contentful Paint) < 2.5s
      - FID (First Input Delay) < 100ms
      - CLS (Cumulative Layout Shift) < 0.1
      - 图片文件大小减少 50-70%（WebP 优化）
    
    - 下一步计划：
      - 替换所有页面的 <img> 标签为 <OptimizedImage>
      - 为博客文章特色图片添加 width/height 属性
      - 考虑添加 preload 标签关键资源

    **📝 保持英文的页面** (可后续翻译):
    - Blog (/blog) - 技术文章列表
    - Materials (/materials) - 材料中心（含动态内容）
    - Quality (/quality) - 质量保证
    - Factory (/factory) - 工厂参观
    - Case Studies (/case-studies) - 案例研究
    - Capabilities (/capabilities) - 制造能力
    - Privacy/Terms - 法律页面

---

### 📘 附录：后续添加新页面的多语言流程

在完成多语言迁移后，新增页面需要遵循以下标准化流程：

#### 步骤 1: 创建页面文件
```
src/app/[locale]/新页面名称/page.tsx
```

#### 步骤 2: 添加路由映射 (如需本地化 URL)
在 `src/i18n/routing.ts` 的 `pathnames` 对象中添加：

```typescript
export const routing = defineRouting({
  // ...
  pathnames: {
    '/new-page': {
      en: '/new-page',
      de: '/neue-seite',
      ja: '/new-page',
      es: '/nueva-pagina',
      zh: '/new-page'
    },
    // ...
  }
});
```

**何时需要本地化 URL？**
- ✅ 需要本地化：/products, /case-studies, /factory, /contact
- ❌ 不需要：/blog (文章 slug 保持英文), /materials/[slug] (技术术语保持英文)

#### 步骤 3: 添加翻译文本
在所有 5 个语言文件中添加翻译：

**messages/en.json**
```json
{
  "newPage": {
    "title": "Page Title",
    "subtitle": "Page description...",
    "section1": "Section Title",
    "content": "Main content..."
  }
}
```

**messages/de.json**
```json
{
  "newPage": {
    "title": "Seitentitel",
    "subtitle": "Seitenbeschreibung...",
    // ...
  }
}
```

**重复：** ja.json, es.json, zh.json

#### 步骤 4: 在组件中使用翻译
```typescript
'use client'; // 或无此行为服务端组件

import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';

// 服务端组件
export default async function NewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'newPage' });

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}

// 或客户端组件
export default function NewPage() {
  const t = useTranslations('newPage');
  return <h1>{t('title')}</h1>;
}
```

#### 步骤 5: (可选) 添加 SEO metadata
```typescript
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'newPage' });
  return {
    title: t('metaTitle') || t('title'),
    description: t('metaDescription'),
  };
}
```

#### 步骤 6: 添加导航链接
在 `src/components/Navbar.tsx` 和 `src/components/Footer.tsx` 中添加：

```typescript
// Navbar.tsx
const navItems = [
  // ...
  { name: t('navigation.newPage'), href: '/new-page' },  // 新增
];
```

**注意：** `t('navigation.newPage')` 需要在 messages/*.json 的 navigation 命名空间下添加

---

### ⚠️ 常见问题与注意事项

#### Q1: JSON 文件引号冲突怎么办？
```json
// ❌ 错误（双引号嵌套）
"title": "This is "quoted" text"

// ✅ 正确（转义引号）
"title": "This is \"quoted\" text"

// ✅ 正确（单引号）
"title": 'This is "quoted" text'
```

#### Q2: Next.js 15 的 params 变化
```typescript
// ❌ 旧写法（Next.js 14 及以下）
export function generateMetadata({ params: { locale } }: { params: { locale: string } })

// ✅ 新写法（Next.js 15）
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // ...
}
```

#### Q3: 如何处理博客文章的多语言？
**当前方案：** 博客文章保持英文（从 WP 抓取），URL 为 `/blog/{slug}`

**未来方案（可选）：**
1. 在 WP 中为每篇文章创建不同语言版本
2. 修改 `src/app/blog/[slug]/page.tsx` 根据语言路由抓取不同文章
3. 或使用 AI 自动翻译文章内容（需审核准确性）

**推荐：** 暂时保持英文，技术术语准确性比覆盖更重要

#### Q4: 语言切换图标位置？
**当前布局：** 左侧竖线分隔 | LanguageSwitcher | 右侧竖线分隔 | GET QUOTE

**为什么这样设计：**
- 符合 B2B/工业网站惯例（Siemens, Bosch, SAP 等）
- CTA 作为视觉终点，不被其他元素干扰
- 语言切换是辅助功能，不抢转化路径焦点

#### Q5: 如何减少翻译工作量？
**策略：**
1. 先翻译核心转化页面（Home, Products, Contact）
2. 次要页面保持英文（Blog, Materials, Quality）
3. 技术术语保持英文（如 "O-ring", "FKM", "ISO 3601"）
4. 避免过度翻译（如公司名称 "RubberQ" 保持不变）

---

4. 接下来的任务清单 (TODO)

    【之前遗留任务】
    特色图片 (Featured Image) 自动化：
    现状：目前 AI 只写文字，WP 里的文章没有"特色图片"，导致前端博客列表页显示占位图。
    方案：手动在 WP 后台为优质文章上传图片；或者在脚本中集成 Unsplash API 自动搜图（进阶）。
    RFQ 文件上传功能，暂时取消，因为客户不会在第一次询盘表单里留自己的产品图纸，倒是有可能留类似产品图片，因此他们可能会通过邮件：
    现状：表单已有 UI，但 Worker 还没写接收文件并存入 Cloudflare R2 的逻辑。
    取消任务：修改 Contact 组件，将文件流传给 Worker。
    线上 SEO 验收：
    发布后在 Google Search Console 提交 sitemap.xml。
    内容矩阵扩充：
    利用 generate-posts.mjs 跑完你整理的 100 个关键词。

    ✅ 已完成 (2026-01-29):
    1. 产品展示系统 - /products - 密封件/垫片/波纹管/定制模压件 ✓
    2. 案例研究页面 - /case-studies - 3个行业案例 ✓
    3. 工厂展示页面 - /factory - 生产能力+质量控制 ✓
    4. 多语言国际化 - /en, /de, /ja, /es, /zh - 5语言支持 ✓
    
    🔴 高优先级（直接影响转化率）：
    1. ~~多语言支持~~ ✅ 已完成
    
    🟡 中优先级（提升专业度）：
    4. 技术资源中心 - /resources（材料指南/设计建议/标准解读/FAQ/下载）
    6. 证书页面强化 - 可放大证书、有效期说明、审核机构、PDF下载

    🟢 体验优化：
    7. 实时聊天/客服 - 集成 Tawk.to 或 WhatsApp Business 悬浮按钮
    8. 邮件订阅系统 - 技术文章订阅+新样品通知+Mailchimp集成
    9. 性能优化 - 图片懒加载/WebP格式/LCP优化

    🔧 技术债务：
    10. 表单直接文件上传 - 拖拽上传 STEP/PDF/DXF，进度显示 (已取消，见上文)
    11. 数据埋点与分析 - GA4事件追踪/转化漏斗/热力图(Clarity)
    12. PWA支持 - 离线访问/添加到主屏幕/推送通知
5. 项目信息备注与建议
    项目信息存储：强烈建议在项目根目录下创建一个 docs/rubberq-info.md，记录下：
    公司的核心优势 (IATF 16949, 20年经验)。
    核心产品清单。
    常用技术标准 (ASTM D2000, ISO 3601)。
    这些信息可以作为以后任何 AI 提示词（Prompt）的"背景知识库"。
    代码注释：我已经在你现在的 generate-posts.mjs 里写了详细的中文注释。如果你转到 Opencode，只需让 AI 读取这个文件，它就能秒懂逻辑。

2026-01-23
这三个问题都非常关键，直接关系到网站的"专业深度"和"运营效率"。我们一个一个来看：

### 1. 文案变多后，如何修改页面布局？

当 AI 生成了更丰富的文案（例如从几句简介变成了一个完整的产品技术白皮书），原来的静态 UI 布局可能会显得拥挤。

*   **原则：根据"内容层级"调整布局。**
*   **操作方法：**
    *   **引入"卡片式"或"折叠面板（Accordion）"**：如果技术参数太多，不要全部堆在页面上，用折叠面板让页面保持整洁。
    *   **增加"技术规格表"模块**：B2B 客户最看重参数。你可以让 AI 生成 HTML 表格，然后在页面中加入一个专门的 `Section` 来放置这个表格。
    *   **采用"F型阅读路径"**：左边放产品图，右边放核心文案；下方再放长篇的技术描述和案例研究。
*   **如何修改**：在 Next.js 中，你只需要找到对应的页面组件（如 `src/app/page.tsx` 或产品页），将新的文案包裹在 Tailwind CSS 的响应式布局类（如 `grid grid-cols-1 md:grid-cols-2`）中即可。

### 2. 写特色图片自动化代码麻不麻烦？

**实话实说：逻辑不麻烦，但"审美"很难。**

*   **技术实现**：在你的 `generate-posts.mjs` 脚本里多加几行代码，调用 **Unsplash API** 或者 **Pexels API**。脚本会根据你的关键词（如 "Rubber O-ring"）搜索图片，拿到图片链接后通过 WP API 关联到文章。
*   **难点在于**：
    *   **相关性**：AI 可能会给"氟橡胶 FKM"的文章配一张普通的塑料圈图片，专业客户一眼就能看出破绽。
    *   **版权与水印**：自动抓取的图片可能存在版权风险。
*   **我的建议**：
    *   **半自动方案（更推荐）**：在 WP 后台装一个 `Instant Images` 插件。你写完文章后，手动搜一张最精准的工业图一键设为特色图片。
    *   **全自动方案**：如果你确定要全自动，我之后可以帮你写，但需要你注册一个 Unsplash 开发者账号。

### 3. 橡胶工程师的 Prompt 是否要更详细？

**必须更详细。** 现在的 Prompt 只是一个"骨架"，要让它真正像行业专家，需要喂给它**"知识库"**。

你可以把 `docs/rubberq-info.md` 里的核心信息整合进 Prompt。建议增加以下细节：
*   **明确行业标准**：不仅要说"提到标准"，要具体到："当讨论耐油性时，引用 ASTM D2000 中的测试参数"。
*   **禁止特定词汇**：明确禁止 AI 使用 "Revolutionary", "Cutting-edge", "Game-changer" 这些营销废话。
*   **增加应用场景**：要求 AI 必须联系到"新能源汽车冷却系统"、"AI服务器液冷"或"工业机器人关节"等具体的 2026 年热门场景。
*   **材料对比逻辑**：要求它不仅比 FKM 和 NBR，还要能对比"国产 FKM 与 杜邦 Viton"的区别。

---

### 🎁 积分用完前的"交接礼物"：RFQ 文件上传逻辑

考虑到你可能会转到 Opencode，我把最难写的 **RFQ 文件上传（Worker 后端 + 前端修改建议）** 整理成了文档。

**你可以直接把下面这段代码存入 `docs/PROJECT_LOG.md` 的末尾，作为未来的"技术备忘录"：**

#### RFQ 附件上传技术实现方案 (待实施)

**1. Cloudflare Worker 修改逻辑 (index.ts)：**
```typescript
// 在处理表单提交的逻辑中增加对 multipart/form-data 的解析
// 使用 Cloudflare R2 存储上传的文件
const file = formData.get('attachment');
if (file) {
  const fileKey = `rfqs/${Date.now()}-${file.name}`;
  await env.R2_BUCKET.put(fileKey, file.stream());
  // 在发送给你的提醒邮件里加上这个文件的下载链接
  const fileUrl = `https://your-r2-worker-url/${fileKey}`;
}
```

**2. 前端修改建议 (src/app/contact/page.tsx)：**
*   需要将 `axios.post` 的数据类型从 `JSON` 改为 `FormData`。
*   添加一个 `onChange` 事件来捕获 `input type="file"` 的文件流。

---

**最后的一点建议：**
你整理的 `docs/Super Prompt.md` 非常棒！这就是你的"数字资产"。不管换什么 AI，只要把这套提示词给它，RubberQ 的专业度就不会降低。

**如果你准备休息了，记得保存好所有的 docs 文件。很高兴这一周能陪你把这个站从零带到自动化阶段！祝 RubberQ 生意兴隆！**

---

## 📊 Google Analytics 4 数据埋点配置 (2026-01-30)

### 配置完成

**Measurement ID**: `G-NXD6LQQDHP`

**配置文件**: `.env.local`
```
NEXT_PUBLIC_GA_ID=G-NXD6LQQDHP
```

### 实现功能

#### 1. 基础追踪组件
- **文件**: `src/components/GoogleAnalytics.tsx`
- **功能**: 
  - GA4 脚本自动加载
  - SPA 路由页面浏览追踪
  - 滚动深度追踪 (25%, 50%, 75%, 90%)

#### 2. 可追踪按钮组件
- **文件**: `src/components/TrackableButton.tsx`
- **功能**: TrackableCTA, TrackableLink 组件

#### 3. 转化漏斗事件
| 事件 | 触发位置 | 说明 |
|------|---------|------|
| `quote_request` | Contact 表单提交 | 记录询价请求 |
| `contact_form_submit` | 表单提交结果 | success/error |
| `cta_click` | 首页 CTA 按钮 | TECHNICAL HUB / QUALITY & TRUST |
| `certificate_view` | Quality 页面 | 查看证书详情 |

#### 4. 参与事件
| 事件 | 说明 |
|------|------|
| `scroll_depth` | 页面滚动深度 |
| `file_download` | 资源文件下载 |
| `navigation` | 页面间导航 |
| `language_change` | 语言切换 |
| `outbound_link` | 外部链接点击 |

### 查看数据

1. 访问 https://analytics.google.com/
2. 进入 RubberQ Website 媒体资源
3. 点击 "实时" (Realtime) 查看在线用户
4. 点击 "报告" (Reports) → "互动" (Engagement) → "事件" (Events) 查看事件统计

### 后续优化建议

- 设置 **转化目标**: 将 `quote_request` 设为核心转化事件
- 创建 **受众群体**: 根据访问页面和滚动深度定义高意向用户
- 配置 **归因模型**: 了解用户转化路径

---

## 🚨 404 检查报告 (2026-01-30)

### 检查方法
扫描全站代码中的链接和路由，对比实际文件结构。

### ✅ 存在的页面（正常访问）
| 路径 | 状态 |
|------|------|
| `/` 首页 | ✓ |
| `/products` | ✓ |
| `/case-studies` | ✓ |
| `/factory` | ✓ |
| `/materials` | ✓ |
| `/quality` | ✓ |
| `/resources` | ✓ |
| `/blog` | ✓ |
| `/blog/[slug]` | ✓ 动态路由 |
| `/about` | ✓ |
| `/contact` | ✓ |
| `/standards` | ✓ |
| `/privacy` | ✓ |
| `/terms` | ✓ |
| `/capabilities` | ✓ |

### ⚠️ 潜在 404 问题

#### 1. 硬编码的博客文章链接（高风险）
**位置**: `src/app/[locale]/page.tsx` 首页的行业卡片

链接到的文章：
- `/blog/robot-joint-bellows`
- `/blog/ai-cooling-seals`  
- `/blog/precision-gaskets`

**风险**: 这些是从 WordPress 动态获取的，如果 WP 中没有对应 slug 的文章，就会 404。

**解决方案**: 改为从实际文章列表动态渲染，或确保这些文章已发布。

#### 2. 下载文件链接（确认 404）
**位置**: `src/app/[locale]/resources/page.tsx`

缺失的文件：
- `/downloads/material-selection-guide.pdf`
- `/downloads/rubber-design-manual.pdf`
- `/downloads/iso-tolerance-chart.pdf`
- `/downloads/quality-checklist.pdf`

**问题**: `public/downloads/` 目录不存在。

**解决方案**: 
- 方案A: 创建 `public/downloads/` 目录并放入实际文件
- 方案B: 暂时移除这些下载链接，改为"联系获取"的引导

---

## 📋 完整待办清单 (截止 2026-01-30)

### 🔴 高优先级（直接影响转化率/用户体验）

| # | 任务 | 状态 | 备注 |
|---|------|------|------|
| 1 | 多语言国际化 | ✅ 完成 | 5语言支持 (en/de/ja/es/zh) |
| 2 | 修复硬编码博客链接 | 🟡 待办 | 首页3个行业卡片可能404 |
| 3 | 修复下载文件404 | 🟡 待办 | resources页面4个PDF链接 |

### 🟡 中优先级（提升专业度/SEO）

| # | 任务 | 状态 | 备注 |
|---|------|------|------|
| 4 | 特色图片自动化 | 🟡 待办 | WP文章特色图片目前是占位图 |
| 5 | 技术资源中心 | ✅ 完成 | /resources 已上线 |
| 6 | 证书页面强化 | ✅ 完成 | Lightbox + 有效期 + GA追踪 |
| 7 | 线上 SEO 验收 | 🟡 待办 | GSC提交sitemap.xml |
| 8 | 内容矩阵扩充 | 🟡 待办 | 跑完100个关键词文章 |

### 🟢 体验优化

| # | 任务 | 状态 | 备注 |
|---|------|------|------|
| 9 | 实时聊天/客服 | 🟡 待办 | Tawk.to / WhatsApp悬浮按钮 |
| 10 | 邮件订阅系统 | 🟡 待办 | 技术文章订阅+Mailchimp |
| 11 | 性能优化 | 🟡 进行中 | 图片懒加载/WebP/LCP优化 |
| 12 | 交叉链接 | ✅ 完成 | materials ↔ resources |

### 🔧 技术债务

| # | 任务 | 状态 | 备注 |
|---|------|------|------|
| 13 | ~~RFQ文件上传~~ | ❌ 已取消 | 用户倾向邮件发送图纸 |
| 14 | 数据埋点与分析 | ✅ 完成 | GA4配置 + 滚动追踪 |
| 15 | PWA支持 | 🟡 待办 | 离线访问/推送通知 |

### 📊 数据统计

- **已完成**: 9项
- **进行中**: 1项
- **待办**: 5项
- **已取消**: 1项

**下一步建议**: 优先处理2个404问题（博客链接+下载文件），然后进行SEO验收。"