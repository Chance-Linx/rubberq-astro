# 隐私事实、Cookie选择与询盘来源

目的：把法律页中的事实表述与实际浏览器、询盘流程对齐，修复无法重新选择Cookie及可选来源存储不检查选择的问题。本轮为本地修订与行为验证；完整RFQ附件/通知路径、干净候选和全项目集中审核仍未完成。

## 已修订的事实与文案

第19份报告记录的7项问题均已作本地处理：

- 法律正文改用已确认品牌RubberQ，移除未核实的英文主体变体；没有据此声称已核验法律登记名称。
- 移除“工业级安全协议”、领先汽车品牌OEM、普遍访问控制保证；改为提供必要项目信息，并在发送需要NDA、访问限制或特定传输方式的文件前商定处理方式。
- 两类政策的联系人改为网站/项目咨询，不虚构数据保护或法务专职部门。
- 隐私页说明联系资料、技术文件、询盘上下文、Cookie选择和可选会话来源的用途；列出源码中实际使用的Cloudflare、Resend、Sanity及可选Google Analytics。未宣称固定存储地域、保留期限或供应商法律合规认证。
- 移除未证明的注册商标断言；允许搜索服务正常索引和链接公开页面，保留对破坏服务、绕过访问控制及滥用RFQ的限制。

共115个五语种字段有明确前后值记录。原10份正文对象仍保存于 [[evidence/legal-body-baseline.json]]；具体变更见 [[evidence/legal-factual-revisions.json]]。报价/订单、适用法律及责任条款未改。正文日期更新为2026-10-21；两句Slogan保持原文。

## 真实Cookie选择控制

页脚新增五语种设置按钮，保存选择后也能重新打开。面板可关闭可选分析；分类文案由messages提供。修复损坏/不可用浏览器存储时界面与询盘异常，面板可在手机上滚动，页脚链接可换行。

分析默认关闭，用户允许后才注入Google脚本。关闭分析时设置对应`ga-disable`开关、更新consent状态、丢弃后续本站事件入队，清理本站分析Cookie及可选首次来源记录；其他标签页的选择变化也会响应。广告相关选项保持关闭。Google分析配置中的页面/引荐URL去除查询和片段；提交询盘的上下文独立按实际到达信息记录。

技术实现参考[Google隐私控制文档](https://developers.google.com/tag-platform/security/guides/privacy)与[consent设置文档](https://developers.google.com/tag-platform/security/guides/consent)。浏览器存储说明参考[ICO指南](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/)，该页面注明详细指南处于修订中。本轮不把这些参考或检查称为法律合规验收。

## 询盘来源与存储故障

来源字段区分`submission_context`和`consented_session`。前者携带本次页面、引荐、活动参数、来源页与CTA；后者还可使用允许分析后保存的入口记录。没有同意或存储失败时，不写可选首次来源，也不把当前页冒充首次到达页。

显式source参数优先；没有参数的文章到联系页路径可使用同站引荐页面。外站引荐保留在原referrer字段，不伪装为站内来源。来源页、CTA和模式保留在既有source_tracking_json中，通知正文也显示这些字段；没有新增D1列。

## 验证范围

| 范围 | 结果与边界 | 证据 |
|---|---|---|
| 默认、同意、撤回、重新允许、跨标签页、存储异常、来源上下文与JSON序列化 | 9/9无外部网络用例通过；不是GA4接收或真实D1入库 | [[evidence/privacy-source-tests.txt]] |
| 与内容/检索呈现测试合计 | 26/26通过 | 同上 |
| 五语种真实设置操作 | 页脚可重开，保存后刷新仍关闭；页面无Google脚本元素。未在真实浏览器允许分析发送测试访问 | [[evidence/cookie-five-locale-ui-checks.json]] |
| 手机/平板 | 10法律页×2视口及5语种手机面板，共25项无整页或面板横向溢出 | [[evidence/privacy-cookie-browser-layout.json]] |
| 专用功能/元数据 | 36/36；10份法律正文严格等于历史基线加115项明确修订，实际正文可读 | [[evidence/discovery-implementation-checks.json]] |
| 常规页面、文章、契约 | 225页面/4未知路径、27文章、116本地契约用例通过 | 相应既有evidence回执 |
| 类型与构建 | 0 errors/0 warnings，红线/品牌色与构建通过 | [[evidence/privacy-types.txt]]、[[evidence/privacy-build.txt]] |

源码审读和运行回执见 [[evidence/privacy-workflow-baseline.json]]、[[evidence/rfq-dataflow-source-review.json]]；浏览器截图见`cookie-settings-desktop.png`、`cookie-settings-zh-mobile.png`。

## 完整RFQ的明确余项

当前Worker参考源码将文件名/类型/大小保存为附件元数据，通知里也只有附件名，没有将提交的文件内容转交。这个发现不能被前端成功提示或现有116项规范化用例覆盖。后续必须实现、测试文件的保存或转交，并分别验证提交、记录、通知接受和实际送达语义。

本轮没有向生产接口提交、没有发出询盘通知或写入真实D1。四份进入任务前的源码改动保持原hash；新增付费、CMS写入、生产部署均0。后续继续完整RFQ、实际关键词/图谱、全站手机路径和干净候选，最后一次集中审核。
