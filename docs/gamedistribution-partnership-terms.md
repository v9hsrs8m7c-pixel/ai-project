# GameDistribution 官方合作条件确认（第一阶段）

> 性质：**纯条件确认调研，不包含任何接入代码。**
> 区分规则（务必遵守）：
> - 🟢 **官方明确规定** —— 在 GameDistribution / Azerion 官方公开页面或条款中明确写出。
> - 🟡 **官方未公开** —— 官方公开资料未披露（可能存在于签约合同 / Terms 中，但对外不可见）。
> - 🟠 **第三方推测（非 GD 官方）** —— 来自其他提供商条款或社区经验，**不代表 GD 事实**，仅作参考。
>
> 角色前提：我们作为 **Publisher / Portal（门户）** 嵌入并分发 GD 目录中的游戏，而非以 Developer 身份上传自研游戏。

---

## 18 项条件逐条确认

| # | 确认项 | 状态 | 结论摘要 |
|---|--------|------|----------|
| 1 | Publisher/Portal 注册入口 | 🟢 官方明确规定 | 发布商与开发者共用 **GameDistribution 开发者门户**（注册表单 `dev-panel` 收集 First/Last/Email/Country/Company/Website，须接受 Developer Terms + Azerion Connect）。DGI 页称 "Register as a GameDistribution Publisher"；支付 FAQ 指明发布商登录 **Developer Portal → Reporting → HeaderLift** 设置收款。官方未单独给出"仅发布商"注册子 URL，但发布商账号体系明确存在。 |
| 2 | 是否接受个人主体 | 🟢 官方明确规定 | **接受。** 支付 FAQ 原文：*"When registering as a private person, this information [tax ID] is not required."* → 明确有"private person（个人）"注册选项。 |
| 3 | 是否必须公司主体 | 🟢 官方明确规定 | **非必须。** 同上，个人可选；仅"注册为公司"时才需提交税号。 |
| 4 | Website 要求 | 🟢 官方明确规定 | 注册表单含 **Website 字段（必填）**；且收益按域名归因（*"published on your domain(s)"*），故需自有网站/域名。 |
| 5 | 是否需要人工审核 | 🟡 官方未公开 | 官方称发布商需完成 "onboarding process"，但**未公开**是否设硬性人工审核门槛/标准。注意：开发者**上传自研游戏**有 QA 审核（最长 3 周）—— 那是开发者侧；发布商嵌入目录游戏不触发游戏 QA。 |
| 6 | 是否存在最低流量要求 | 🟡 官方未公开 | 官方公开页**未声明**最低流量门槛。🟠 行业第三方（如 Zygomatic）有 ~2.5 万月独立访客要求，但那是**不同提供商**，不能套用于 GD。 |
| 7 | DGI iframe 官方接入方式 | 🟢 官方明确规定 | 是。官方 `publishers/embedded-links` + DGI 博客：从目录复制 iframe 嵌入码，拖放即用，响应式，无需托管。 |
| 8 | 是否需要 SDK | 🟢 官方明确规定 | **发布商嵌入不需要 SDK。** 官方 FAQ：SDK *"mandatory for all games"* 指**开发者上传的游戏**必须集成；门户用 DGI 嵌入不碰 SDK。 |
| 9 | 是否需要提交游戏审核 | 🟢 官方明确规定 | **发布商无需提交游戏审核。** QA（最长 3 周）仅针对开发者上传的自研游戏；发布商从目录直接嵌入。 |
| 10 | 游戏元数据获取方式 | 🟢 + 🟡 | 🟢 官方面向发布商：DGI 每款游戏提供嵌入码（含标题、封面缩略图、iframe URL）。🟡 未提供面向发布商的**官方元数据 API / 批量导出**；完整字段仅经**非官方**内部 API（`game.api.gamedistribution.com`，无文档、禁用生产）。结论：官方支持方式 = 逐游戏嵌入码；批量/编程获取**无官方途径**。 |
| 11 | 是否存在官方 Feed / API | 🟡 官方未公开 | 未向发布商开放官方 Feed/API。内部 API 属非官方，不可用于生产自动化。 |
| 12 | 商业授权 | 🟢 官方明确规定 | 可商用。注册即与 GD 建立 **revenue share 合作**；接受 Developer/Publisher Terms + Azerion Connect；游戏内广告变现，发布商按约定分成。 |
| 13 | 游戏内广告分成 | 🟢 + 🟡 | 🟢 收益来自游戏内视频广告（pre-roll / mid-roll / rewarded）：*"the longer people play, the more ads, the more revenue"*。🟡 **具体分成比例未公开**（*"see Revenue Share of our Terms & Conditions"*）。 |
| 14 | Publisher 网站自行投放广告的限制 | 🟡 官方未公开 | GD 官方**未明文禁止**发布商在自有站点投放展示广告；游戏**内**广告由 GD 控制并投放。Azerion 另提供全站展示广告方案（可选）。站点外围自有广告与游戏内 GD 广告是两件事，GD 未明示禁止。若自接第三方广告须遵守该网络政策（见 15/16）。 |
| 15 | 第三方广告网络限制 | 🟡 官方未公开 | GD 未公开限制发布商在站点使用第三方广告网络。接入第三方网络须遵守其政策；GD 收益按域名归因，不影响站点外围广告。 |
| 16 | Google AdSense 是否存在冲突 | 🟡 + 🟠 | 🟡 GD 侧**未声明**与 AdSense 冲突。🟠 是否可行取决于 **Google AdSense 自身政策**（AdSense 允许游戏类内容，但禁止把 AdSense 广告放入第三方游戏 iframe 内、须遵守广告位与内容政策）。应以 Google 官方政策为准，不能由 GD 条款推断。 |
| 17 | Revenue Share 官方规则 | 🟡 官方未公开（比例） | 规则框架公开（广告变现分成、按播放/展示计费）；**具体百分比、计算方式写在 Terms "Revenue Share" 章节，官网未公开**。框架=🟢公开；数字=🟡未公开（在合同/Terms 内）。 |
| 18 | 最低付款门槛 | 🟢 官方明确规定 | 支付 FAQ 原文：银行转账 **€100**，PayPal **€50**。结算周期：次月第一周出账，再下月末付款。 |

---

## 结论摘要

1. **主体门槛宽松**：🟢 个人与公司都接受，公司非必须；注册需填 Website（必填）。这对我们以个人/小团队起步是利好。
2. **接入极轻**：🟢 发布商走 DGI iframe，无需 SDK、无需提交游戏审核、无需自托管。
3. **付款条款透明（官方）**：🟢 最低付款 €100（银行）/€50（PayPal），次月末结算。
4. **真正的不确定项在「钱」与「量」**：🟡 具体分成比例、是否设最低流量、发布商 onboarding 是否人工审核——官方均未公开，需签约前书面确认。
5. **自动化受阻**：🟡 GD 未向发布商开放官方 Feed/API；若要"新增/更新/下架"自动化，只能走"手动批量导入 + 审核队列"，或补充 feed 型网络（Zygomatic/htmlgames、GameMonetize 等，🟠 其条款不代表 GD）。
6. **广告共存需谨慎**：🟡 GD 未禁站点外围自有广告；但与 AdSense 是否冲突取决于 🟠 Google 政策，须单独核查。

---

## 待官方书面确认清单（签约/合作前必问）

- [ ] Revenue Share 具体比例与计算口径（pre-roll / mid-roll / rewarded 各自 eCPM 分成？）
- [ ] 发布商 onboarding 是否人工审核、审核标准与周期
- [ ] 是否存在最低流量 / 最低月收益门槛
- [ ] 是否有 ads.txt 要求（GD 按域名归因，需确认是否要求发布商在其 ads.txt 加 GD 条目）
- [ ] 是否提供合作伙伴目录 Feed / API（用于自动导入）
- [ ] 发布商在自有站点投放第三方广告（含 AdSense）是否被允许、有无限制
- [ ] 游戏下架 / 条款变更时的通知与收益结算兜底
- [ ] GAM 账号获取方式：GD/Azerion 是否通过 MCM 子账号开通，审批周期多久
- [ ] 若无 GAM 是否仍可开通 Publisher，或是否必须等待 GAM 批准后才能嵌入游戏

---

## 2026-08-21 新增发现：Publisher 注册要求绑定 Google Ad Manager

> 来源：用户在实际注册 GameDistribution Publisher 时截图（注册第二步表单），属于**官方注册流程的一手证据**，补充进本确认文档。

### 截图揭示的字段

注册流程第二步出现必填/可选字段：

- **GAM Email** *（必填）*
- **GAM Network Code** *（必填）*
- **I do not have an account with Google Ads Manager yet** *（复选框）*

结论：**GameDistribution Publisher 账号与 Google Ad Manager（GAM）强绑定**。注册时必须提供 GAM 账号信息，或明确勾选"暂时没有"让 GD/Azerion 后续指导开通。

### 对 18 项条件的影响与状态更新

| 调整项 | 更新后状态 | 说明 |
|--------|------------|------|
| Publisher 注册入口 | 🟢 官方明确规定 | 仍是 Developer Portal 注册，但流程中新增 GAM 绑定步骤。 |
| 是否必须公司主体 | 🟢 官方明确规定（不变） | 仍为"非必须"，个人可选。 |
| 是否需要人工审核 | 🟠 第三方推测 → 可能性更高 | 因 GAM 账号通常需 Google 侧审批（或 MCM 父账号开通），整体 onboarding 周期可能延长。第三方经验称需 2 周以上。 |
| 最低流量要求 | 🟡 官方未公开（不变） | GAM 本身传统面向中大型发布商，但近年门槛已降低；GD 是否设独立门槛仍未知。 |
| 是否存在官方 Feed/API | 🟡 官方未公开（不变） | 但 GAM 绑定可能为后续通过 GAM API 拉取广告/数据留下接口，需向 GD 确认。 |
| Google AdSense 冲突 | 🟡 + 🟠 | GAM 注册通常需要有效 AdSense 账户（Google 官方要求），这与我们之前"GD 未声明冲突"的结论不矛盾，但意味着**Publisher 通常需要先有 AdSense**（个人可申请）。AdSense 与 GAM 的关系、以及站点能否同时接其他广告，需以 Google 政策为准。 |

### 关于"没有 GAM 怎么办"

表单提供复选框 **"I do not have an account with Google Ads Manager yet"**，说明：

1. **不是死门槛**：GD 允许你暂时没有 GAM。
2. **大概率走 MCM 子账号**：Azerion/GameDistribution 是 Google 认证合作伙伴（MCM 父发布商常见身份），勾选后通常由他们通过 **Multiple Customer Management（MCM）** 给你开通一个 child network 子账号。第三方中文博客（2025）描述此流程：先提交表单，再按邮件指引获取 GAM 账号，最后把 Network Code 回填给 GD，整体约 **2 周以上**。
3. **另一种可能**：GD 要求你自己去 `admanager.google.com` 申请。但 Google 官方说明申请 GAM 需要"来自现有 Ad Manager 发布商的邀请"，对新人并不友好；因此由 Azerion 作为父账号开通子网络更合理。

### 给用户（个人 Publisher）的实操含义

- **仍可个人注册**：公司非必须，个人身份依然成立。
- **需要等 GAM**：即使你勾选了"没有 GAM"，也不能立即拿到嵌入码变现；必须等 GD/Azerion 帮你开通/关联 GAM 后才能进入 Publisher 后台。
- **可能需要 AdSense**：Google 官方称申请 GAM 需要有效 AdSense 账户（不强制积极使用）。若走 Azerion MCM 子账号，可能由他们简化此步骤，但仍建议提前准备好 AdSense 账户。
- **时间预期变长**：从"注册即用"变成"注册 → 等 GAM 开通 → 回填 → 审核 → 才能嵌入"，第三方经验预计 **2 周以上**。

### 建议继续操作

在当前截图页面：

1. **勾选** `I do not have an account with Google Ads Manager yet`。
2. 填完其余必填项，点击 **Registration** 提交。
3. 检查邮箱，等待 GD/Azerion 的 onboarding 邮件（通常会说明如何获取 GAM Network Code）。
4. 拿到邮件后，把邮件内容（尤其是 GAM 开通指引）转发/截图给我，我帮你判断是 MCM 子账号路径还是自助申请路径。

---

## 证据出处（官方）

- 发布商 DGI（iframe 接入）：`https://gamedistribution.com/publishers/embedded-links`
- DGI 博客说明：`https://blog.gamedistribution.com/embed-games-in-minutes-with-dgi-from-gamedistribution`
- 注册表单（dev-panel，含 Company/Website 字段与条款）：`https://gamedistribution.com/dev-panel`
- 开发者注册入口（同门户体系）：`https://developer.gamedistribution.com/register/developer/`
- **支付与付款 FAQ（个人/公司、€100/€50、结算周期）**：`https://gamedistribution.com/publishers/faq/reporting-and-payments/setting-up-and-receiving-your-revenue-payments/`
- 开发者 FAQ（SDK 强制仅针对上传游戏、QA 最长 3 周、分成说明）：`https://gamedistribution.com/developers/partnership/`
- 平台规模（20K+ 游戏 / 4K+ 门户）：`https://blog.gamedistribution.com/about-us/`

## 参考（非 GD 官方，勿等同）

- Zygomatic/htmlgames 合作条款（40% 分成、2.5 万月独立访客、ads.txt、最低付款 $100）：`https://www.zygomatic.com/page?game-distribution` —— 🟠 第三方提供商，仅作行业结构参考。
- 内部 API 观察（非官方、禁用生产）：`https://github.com/ikwhattoput/gamedistribution-apis` —— 🟠 调研用，不代表 GD 对外承诺。
