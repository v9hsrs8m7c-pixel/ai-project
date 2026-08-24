# GameDistribution 官方接入技术方案（研究稿）

> 阶段：项目下一阶段前期研究
> 性质：**纯调研 + 方案设计，不含任何接入代码**
> 依据：GameDistribution 官方文档 / 开发者门户 / 发布商门户 / 官方 SDK 仓库，以及行业公认实践。
> 范围：面向「海外 H5 网页游戏聚合站」—— 我们扮演**发布商（Publisher / 门户）**角色，即在自有站点嵌入并分发 GameDistribution 的游戏，而非以开发者身份上传自研游戏。

---

## 0. 结论先行（给决策者的 30 秒）

**是否推荐采用：推荐。**

- GameDistribution（Azerion 旗下）是当前规模最大的 B2B 网页游戏分发网络之一，官方公布目录 **20,000+ 款游戏**、覆盖 **4,000+ 门户 / 媒体 / 运营商**、105 个国家、20+ 语言本地化内容。作为聚合站起步的内容源，性价比和风险都可控。
- **推荐接入方式：DGI（Direct Game Integration）iframe 嵌入。**
  - 理由：零托管、零自研、响应式、自动变现，三步即可上线（浏览目录 → 复制嵌入码 → 粘贴 iframe）。最契合「聚合站 / 门户」定位。
  - SDK / API 不是给门户用的：官方 SDK 是给**游戏开发者**把广告与统计打进游戏内部用的（且强制要求），门户嵌入游戏无需集成 SDK。
- **多站点 + 自动导入**：DGI 本身不提供面向门户的官方自动同步 API（目录在发布商后台手动复制）。因此建议**自建「目录适配层」**，把 GD 元数据归一化进我们现有数据层；真正实现「新增 / 更新 / 下架」全自动化，需与 GD 合作团队确认是否有官方目录 feed，或**补充接入 feed 型网络**（如 Zygomatic/htmlgames 的 JSON/XML、GameMonetize）作为自动化主力，降低单点依赖。
- **SEO**：iframe 游戏本体**不会被搜索引擎收录**，必须在 iframe 外层用「富文本详情页 + 结构化数据 + sitemap」把收录做在包裹层上。这是我们现有 Next.js 架构已经具备的能力。

---

## 1. 注册流程与 Publisher 账号要求

GameDistribution 平台有两种角色，务必区分：

| 角色 | 适用 | 注册入口 | 是否需审核 | 是否需 SDK |
|------|------|----------|-----------|-----------|
| **Developer（开发者）** | 上传**自研**游戏 | `gamedistribution.com/dev-panel/` | 是，QA 审核，**最长约 3 周** | **强制**集成官方 SDK |
| **Publisher（发布商/门户）** | 在自有站点**嵌入**GD 游戏 | 发布商门户 / 合作团队 onboarding | onboarding 审核（需符合合作门槛） | 不需要 |

我们作为聚合站，属于 **Publisher**，走 **DGI** 路径，**无需 SDK、无需提交游戏审核**。

### 1.1 注册所需信息（官方注册表单字段）
官方 `dev-panel` 注册表单收集：
- First name / Last name
- Email
- Country
- **Company（公司名）**
- **Website（网站）**
- 须勾选接受《Developer Terms and Conditions》+《Azerion Connect》条款

**结论：有网站要求，也有主体（公司）要求。** 个人无网站/无主体通常无法作为正式发布商合作。

### 1.2 发布商接入流程（DGI）
1. 注册 GameDistribution **Publisher** 账号，完成 onboarding（合作团队会评估你的站点规模与质量）。
2. 进入 GD 游戏目录，挑选想上架的游戏。
3. 点击每款游戏下方的「复制嵌入码」获取 iframe 片段。
4. 把 iframe 代码粘贴到站点页面即可。
5. 广告变现与数据看板由 GD 自动提供，收益按约定分成结算。

### 1.3 门槛参考（行业可比口径）
GD 官方未公开披露门户合作的硬性流量门槛；但同类分发网络（如 Zygomatic/htmlgames 的 revenue-share 合作）明确要求：**≥25,000 月独立访客、月收益分成 ≥25 美元、需审批、须在其 ads.txt 中加入对方条目、按季度开票、最低付款 100 美元**。这代表行业通行结构——**GD 作为更大平台，门槛只会更高或持平**。建议在与 GD 合作团队沟通时主动确认：最低流量门槛、ads.txt 要求、结算周期与最低付款。

---

## 2. 支持的接入方式对比

| 方式 | 适用角色 | 原理 | 优点 | 缺点 | 适用场景 |
|------|----------|------|------|------|----------|
| **DGI iframe（推荐）** | 门户/发布商 | GD 托管游戏，门户用 `<iframe>` 嵌入其游戏页 URL | 零托管、零自研、响应式、自动变现、上线最快 | 对游戏外观/广告无控制权；依赖 GD CDN 可用性；iframe 不可被搜索引擎收录 | **聚合站 / 媒体站 / 运营商增值内容** |
| **HTML5 SDK（gd-html5）** | 游戏开发者 | 把 GD 的 SDK 脚本打进游戏内部，由游戏调用广告/统计事件 | 精细的广告位（pre-roll/mid-roll/rewarded）、统计、GDPR 事件 | 仅当你**自研并上传**游戏时才需要；对纯门户无意义；需游戏工程改造 | 自研 HTML5 游戏并上传到 GD |
| **Unity WebGL SDK / Flash SDK** | 特定引擎开发者 | 同上，针对 Unity / 遗留 Flash 引擎 | 对应引擎开箱集成 | 与门户嵌入无关；Flash 已淘汰 | 用 Unity 做 WebGL 游戏的开发者 |
| **（非官方）内部 API `game.api.gamedistribution.com`** | 技术探索 | 直接拉取游戏元数据 JSON | 能拿到完整元数据字段 | **非官方、无文档、随时变动、可能违反 ToS** | 仅用于调研；**不用于生产自动化** |
| **Feed 型（JSON/XML）— 其他网络** | 门户/发布商 | 定期拉取目录 feed 自动同步 | 真正可自动化导入/更新/下架 | GD 未对门户开放官方 feed；需接入 Zygomatic/htmlgames、GameMonetize 等 | 需要「自动目录同步」的门户 |

**关键澄清**：官方 SDK 是给「游戏开发者」把广告打进游戏用的，**门户嵌入游戏不碰 SDK**。门户的价值来自 DGI 的 iframe + GD 自动变现。

---

## 3. 可获取的游戏元数据

DGI 嵌入码本身只提供「游戏标题 + 封面缩略图 + iframe URL」。更完整的元数据可从 GD 内部游戏对象（官方 SDK/目录所依据的数据模型）归纳得到，字段示例如下（源自其游戏数据模型观察）：

| 字段 | 含义 | 我们用于 |
|------|------|----------|
| `title` / `name` | 游戏名称 | 详情页 H1、标题、卡片 |
| `slug` | URL 安全别名 | 详情页路由 `/games/[slug]` |
| `description` | 纯文本描述（已去 HTML） | 详情页正文、meta description |
| `category` / `categories[]` | 分类（如 "Casual"、"Puzzle"） | 映射到我们 `Category` 结构 |
| `tags[]` | 标签（id + title，如 fruits/ninja） | 标签云 / 相关推荐 |
| `assets[]` / `thumbs{}` | 多分辨率封面/截图 URL（如 512x384、1280x720） | 卡片封面、OG 图、详情页大图 |
| `iframeUrl` | 游戏可嵌入地址（DGI 提供） | 详情页 `<iframe>` 的 src |
| `publishedAt` | 上架时间 | 排序、「New Games」判定 |
| `mobileMode` | 横屏/竖屏（Landscape/Portrait） | iframe 容器比例 |
| `preRoll` / `rewardedAds` | 广告位标记 | 变现说明、调试 |
| `externalUrl` | 外部地址（多为 null） | 回链 |
| `status` / `activeStatus` | 上架状态 | 判断是否可分发 |

**对多站点有意义的点**：GD 不天然带「多站点」概念；元数据是单套目录。多站点共用由**我们自己的数据层**实现（见第 4 节）。

---

## 4. 结合现有 Next.js 多站点架构的导入与共用设计

### 4.1 现有架构（已验证）
- `src/config/types.ts`：`SiteConfig`（siteId / domain / siteName / theme / seo / analytics / ads）、`Game`、`Category`。
- `src/config/sites/index.ts`：`getSiteConfig(domain)` 注册表 + 回退默认站点。
- `src/lib/site.ts`：`resolveCurrentSite()` 按 `host` 头解析当前站点。
- `src/data/games.ts`：`games[]` + `getGamesForSite(siteId)`，按 `siteIds` 过滤。
- `src/data/categories.ts`：分类 + `getCategoriesForSite(siteId)`。
- 页面：`/`、`/category/[slug]`、`/games/[slug]`（含 Related Games），均 Server Component，静态导出时渲染默认站点。

### 4.2 设计：新增「目录适配层」(Catalog Adapter)
目标：**UI 与页面完全不动**，只把数据源从「手写 mock」切换到「GD 导入」。

```
src/
  sources/
    gamedistribution/
      types.ts          # GD 原始游戏对象类型
      fetch.ts          # 拉取 GD 目录（官方导出/feed；非官方 API 仅调试用）
      normalize.ts      # GD -> 我们的 Game/Category 映射（分类字符串->slug）
      index.ts          # getImportedGames() / getImportedCategories()
  data/
    catalog/            # 导入后的归一化 JSON（或数据库），按站点标记 siteIds
      default.json
    games.ts            # 改为：优先读 catalog，回退 mock（含 getGamesForSite 等）
```

**数据流：**
1. 适配层把 GD 元数据归一化为我们的 `Game` 类型：填 `name/slug/description/category(映射)/tags/cover(取 assets 中合适分辨率)/iframeUrl/publishedAt/mobileMode`，并打上 `source: "gamedistribution"` 与 `siteIds: ["default"]`。
2. 分类映射：GD 的分类字符串（Casual/Puzzle/...）映射到我们 `categories.ts` 的 `slug`；未命中则归入「Other」或动态建分类。
3. 现有 `getGamesForSite(siteId)`、`getFeaturedGames()`、`getRelatedGames()` 等函数**签名不变**，只是底层数据来自 catalog。
4. 游戏详情页 `/games/[slug]` 渲染 `<iframe src={game.iframeUrl}>`（外层包裹 SEO 内容，见第 6 节）。

**多站点共用策略：**
- 同一份 GD 目录可被多个站点引用：在 `catalog` 里给每个游戏维护 `siteIds` 数组，不同站点可设不同的 featured/popular 标记与本地化文案。
- `resolveCurrentSite()` 已按域名解析，导入层无需改动即可支持未来新站点共用同一目录。
- 注意跨站重复内容（见 6.4）。

---

## 5. 自动导入与目录更新评估（新增 / 更新 / 下架）

| 能力 | 通过 DGI 单独实现 | 通过 feed 型网络实现 |
|------|------------------|---------------------|
| 新增游戏 | 手动在 GD 后台复制嵌入码 → 人工入库 | feed 自动出现 → 定时拉取即可 |
| 更新（元数据/封面） | GD 改了后台，门户不感知，需手动同步 | feed 变更 → diff 自动更新 |
| 下架（开发者撤游戏） | **风险最高**：GD 侧下架后，门户 iframe 可能 404/报错，门户无自动通知 | feed 移除 → 定时拉取自动下线 |

**结论与建议：**
1. **GD 官方未向门户开放自动同步 API/feed。** 其 `game.api.gamedistribution.com` 是内部接口，无文档、随时变、且有 ToS 风险，**不可用于生产自动化**。
2. **推荐方案（稳健路径）：**
   - 短期：用 DGI 手动嵌入 + 自建适配层做**一次性批量导入**（把选中的游戏嵌入码/元数据录入 catalog），并加一个**「人工审核队列」**：新游戏先入草稿态，审核（版权/归因/质量）后再对站点可见。
   - 中期：与 GD 合作团队确认是否提供**合作伙伴目录 API/feed**；若提供，则接成定时拉取（cron），实现新增/更新/下架自动同步。
   - 长期/去风险：补充接入**明确提供 JSON/XML feed 的网络**（如 Zygomatic/htmlgames 在其游戏列表页直接给出 feed 链接；GameMonetize、CrazyGames 亦提供 feed/SDK），用 feed 做真正的自动化主力，GD 作为内容补充。**行业惯例是同时接 2–3 个网络以分散单点依赖风险。**
3. **健壮性要求**：无论哪种来源，导入层都要做「源不可达 / 单游戏缺失」的降级（隐藏该游戏、不阻断整站），并保留上次成功快照。

---

## 6. SEO 影响与 iframe 游戏页设计

### 6.1 核心事实
搜索引擎**不会抓取或收录跨域 iframe 的内部内容**。用户能玩到游戏，但 Google/Bing **索引的是你的包裹页，不是游戏本身**。因此「收录」必须做在 iframe 外层。

### 6.2 详情页（包裹层）SEO 必做清单
- **唯一标题与描述**：`<title>` = 「游戏名 - 站点名」，meta description 用该游戏的**独特**简介（不要全站复制同一段）。
- **H1 = 游戏名**；正文提供人工/独特描述、操作说明、分类与标签——这些才是被收录的文本。
- **结构化数据（JSON-LD）**：用 `schema.org/VideoGame`（或 `Game`），含 `name`、`description`、`genre`、`image`、`gamePlatform:"Web Browser"`、`applicationCategory`、`author`(开发者)。这能争取富媒体搜索结果。
- **Open Graph + Twitter Card**：用封面图 `assets` 中的高分辨率版本，保证分享预览。
- **分类落地页**：每个分类单独页面，配**独特**的导言与内链，串联进游戏详情页。
- **sitemap.xml**：列出全部游戏 + 分类 URL；`robots.txt` 放行；可主动提交（含 IndexNow）。
- **Core Web Vitals**：iframe 用 `loading="lazy"`，容器用 `aspect-ratio` 固定比例（依 `mobileMode` 设横/竖屏），避免布局抖动（CLS）。
- **无 iframe 兜底**：若 iframe 被网络/adblock 拦截，页面仍展示封面 + 描述 + Play 按钮，保证页面有独立价值。
- **静态导出友好**：我们已是静态/SSR 预渲染包裹层 HTML，爬虫拿到的是完整文本；iframe 仅客户端加载，不影响收录。

### 6.3 多站点重复内容风险（重要）
多个站点复用同一份 GD 目录与描述，易被判定为**站群/薄内容**，导致收录与排名受损。
- 策略 A（推荐）：每个站点写**本地化/差异化**的导言与推荐语，使详情页文本不雷同。
- 策略 B：对确属跨站相同的页面使用 `rel="canonical"` 指向主站点版本。
- 避免：完全相同标题/描述/正文在多个域名上铺量。

---

## 7. 商业使用与授权要求

- **能否商用**：可以。GameDistribution 本身就是 B2B 商业分发，发布商通过嵌入游戏、由 GD 在游戏内投放视频广告（pre-roll / mid-roll / rewarded）获得**收益分成**。需接受《Developer/Publisher Terms》与《Azerion Connect》条款。
- **分成比例**：GD 官方将具体比例写在条款的「Revenue Share」章节，**官网 FAQ 仅说明「按广告变现分成」，未公开具体百分比**（需签约后在条款中确认）。行业可比口径（Zygomatic 同类型合作）为**合作方 40%**、最低月收益 25 美元、最低付款 100 美元、按季度开票——可作谈判参考，但 GD 自身数字以正式条款为准。
- **广告限制**：
  - 游戏**内部**广告由 GD 控制并投放，门户**一般不能替换**为自有广告。
  - 若接 Zygomatic 类合作，须在其 `ads.txt` 中加入对方条目，否则不计收益。
  - 自有站点外围展示广告可另行接入（GD 亦可提供 Azerion 展示广告），但与游戏内广告是两回事。
- **版权与归因**：游戏版权归开发者/GD；门户**仅获嵌入分发授权**，不可改游戏、不可冒用为自有内容，应**保留开发者署名**（行业许可规范均如此要求）。
- **地域与本地化**：GD 覆盖 105 个国家、20+ 语言本地化内容，利于海外分发。
- **下架/终止风险**：GD 可因开发者撤游戏、条款变更等随时下架内容；收益为「可撤销的合作权益」，非权利。

---

## 8. 风险分析与建议

| 维度 | 风险 | 等级 | 建议 |
|------|------|------|------|
| 技术 | 依赖 GD iframe/CDN 可用性；GD 改 URL/结构会导致游戏失效 | 中 | 导入层做降级（缺失游戏自动隐藏、保留快照）；监控关键游戏可访问性 |
| 技术 | 若误用非官方内部 API 做自动化，随时断裂且可能违规 | 高 | **禁用**内部 API 于生产；仅用于调试；自动化走官方 feed/导出或补充网络 |
| 授权 | 收益分成比例不透明、单点合作可被终止/改条款 | 中 | 签约前书面确认分成、结算周期、最低付款、ads.txt 要求；保存条款副本 |
| 授权 | 游戏可被开发者/平台下架，目录漂移 | 中 | 定时校验游戏可访问性；下架自动下线并告警 |
| SEO | iframe 不收录；多站点重复内容 | 中-高 | 见第 6 节：富文本包裹层 + 结构化数据 + sitemap + canonical/差异化 |
| 维护 | 目录需持续同步（新增/更新/下架） | 中 | 建适配层 + 审核队列 + 定时拉取（feed 型）；人工抽检质量 |
| 商业 | 单网络依赖（GD 改政策即损失内容/收入） | 中 | 同时接 2–3 个网络（GD + Zygomatic/htmlgames + GameMonetize 等）分散风险 |

---

## 9. 最终推荐

1. **采用 GameDistribution 作为聚合站核心内容源之一**——规模、覆盖、变现闭环都成熟，适合起步。
2. **接入方式：DGI iframe**（最低成本、自动变现、零托管）。**不碰官方 SDK**（那是给自研游戏开发者的）。
3. **架构落地**：新增「目录适配层」把 GD 元数据归一化进现有 `data` 层，UI/页面零改动即可从 mock 切到真实目录；多站点通过 `siteIds` 共用同一目录。
4. **自动化取务实路径**：DGI 无官方自动同步 → 先做「手动批量导入 + 审核队列」；同步向 GD 确认是否有合作伙伴 feed；并**补充 feed 型网络**做真正的自动新增/更新/下架，降低单点依赖。严禁用非官方内部 API 做生产自动化。
5. **SEO 前置投入**：把收录做在 iframe 包裹层（唯一文案 + JSON-LD + OG + sitemap + canonical/差异化），这是聚合站能否被搜索到的关键。
6. **商业前置确认**：签约前书面拿到分成比例、结算、ads.txt、最低门槛等条款，并保留快照与多网络备份。

---

## 附录：主要官方/权威来源
- GameDistribution 开发者/变现：`https://gamedistribution.com/developers`
- 开发者注册表单（字段与条款）：`https://gamedistribution.com/dev-panel/`
- 发布商 DGI（iframe 嵌入）：`https://gamedistribution.com/publishers/embedded-links`
- DGI 博客说明：`https://blog.gamedistribution.com/embed-games-in-minutes-with-dgi-from-gamedistribution`
- 官方 HTML5 SDK 仓库：`https://github.com/gamedistribution/GD-HTML5`
- 平台规模（20K+ 游戏 / 4K+ 门户）：`https://blog.gamedistribution.com/about-us/`
- 来源与许可说明（门户嵌入 GD 游戏的授权语境）：`https://gamehubarena.fun/page/game-sources-and-licensing`
- 可参照的 feed 型替代（JSON/XML + 40% 分成）：`https://www.zygomatic.com/page?game-distribution`
- 非官方内部 API 观察（**仅调研，禁生产**）：`https://github.com/ikwhattoput/gamedistribution-apis`

> 说明：以上结论基于公开官方文档与行业通行实践整理；凡涉及**具体分成比例、流量门槛、ads.txt 细节、是否提供合作伙伴目录 API** 等合同性内容，需在正式合作前向 GameDistribution / Azerion 合作团队书面确认。
