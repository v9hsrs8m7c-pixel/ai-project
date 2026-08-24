# 域名购买 + Cloudflare Pages 部署 + GD 白名单 — Step-by-Step 清单

> 目标：把一个面向欧美用户的 GameDistribution 游戏聚合站，从"本地 mock + 预览"推进到"真实域名 + 真实游戏就地播放 + 收益归因 + SEO 就绪"。
> 适用架构：Next.js 16 动态 SSR（按 `host` 头解析多站点），部署到 **Cloudflare Pages（Workers 运行时，经 `@opennextjs/cloudflare` 适配器）**。
> 域名 `darlynmae.com` 已通过 **Cloudflare Registrar** 购买并托管（NS 自动指向 Cloudflare）。
>
> **🟢 已选定部署目标：Cloudflare Pages / Workers（2026-08-24 决策）** —— 域名本就在 Cloudflare，免跨厂商 DNS + `_vercel` TXT 校验；300+ 边缘节点对欧美 SEO 友好；游戏站带宽消耗大，Cloudflare 全计划**无限带宽**长期省钱。

---

## 阶段 0：购买域名

> ✅ **已完成 2026-08-23**：域名 **`darlynmae.com`** 已通过 **Cloudflare Registrar** 购买并托管。
> 因为是 Cloudflare 自家注册商，**NS 已自动指向 Cloudflare**，无需再改 NS。

### 渠道推荐
- **首选 Cloudflare Registrar**：.com 成本价约 $9.77/年、零溢价、自带免费 WHOIS 隐私；注册后直接由 Cloudflare 托管 DNS + 边缘 + 部署，单一平台。
- **备选 Namecheap / Porkbun**：国际卡或 PayPal 支付，续费价格稳定。
- **不推荐**：GoDaddy（首年便宜、续费溢价高）。

### 选名建议
- 面向欧美：优先 `.com`，游戏向可 `.io` / `.gg`。
- 短、好拼、好记，英文母语者能直接拼写正确。
- 避开商标词（不要蹭 poki / crazygames 等成熟品牌）。
- "unblocked games" 流量大但有 Google 政策风险，建议走干净品牌词。
- 购买前先查：是否已被注册、是否涉及商标。

### 支付
- 国际卡或 PayPal（与 GD 收款账户保持一致，便于后续对账）。

---

## 阶段 1：DNS（域名已在 Cloudflare，几乎零操作）

> 因为是 Cloudflare Registrar 购买，`darlynmae.com` 已经由 Cloudflare 托管，**本阶段无需手动加任何 DNS 记录**。
> 在阶段 2 把 `darlynmae.com` 绑定为 Cloudflare Pages 的自定义域名时，Cloudflare 会**自动**添加对应的 CNAME 并签发 SSL（因为域名和 Pages 同属一个 Cloudflare 账号，免 TXT 校验、免跨厂商指向）。
> 只需确认：Cloudflare 面板 `Websites → darlynmae.com` 状态为 **Active**（绿色）。

（仅当你未来用其他注册商买的域名，才需要把 NS 改到 Cloudflare，再走阶段 2 的自定义域名绑定。）

---

## 阶段 2：Cloudflare Pages 部署（经 OpenNext 适配器）

### 2-A：准备 GitHub 仓库（前置，必须做）
1. github.com → **New repository** → 名字 `ai-project`（保持空仓库，不要勾 Add README）→ Create。
2. 复制仓库地址，形如 `https://github.com/<你的用户名>/ai-project.git`。
3. 本地已就绪：`.gitignore` 已忽略构建产物；本地初始提交 `e279460` 已包含全部源码（含 `wrangler.toml`、`package.json` 的 `build:cf` 脚本、`@opennextjs/cloudflare` 依赖）。
4. 本地推送：
   ```bash
   cd ai-project
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/ai-project.git
   git push -u origin main
   ```

### 2-B：Cloudflare 导入仓库
1. 打开 dash.cloudflare.com → 左侧 **Workers & Pages** → **Create** → 选 **Pages** 标签 → **Connect to Git** → 授权 GitHub → 选 `ai-project` → **Begin setup**。
2. 构建配置（**关键，照填**）：

   | 项 | 值 | 说明 |
   |---|---|---|
   | Framework preset | **None**（务必选 None） | 不要选 "Next.js" 预设 —— 它会用错误适配器 |
   | Build command | `npm run build:cf` | 即 `opennextjs-cloudflare build` |
   | Build output directory | `.open-next/assets` | OpenNext 产物目录 |
   | Root directory | `/`（默认） | |
   | Node.js version | **22.x** | Next 16 需要 Node ≥ 20，设 22 最稳 |

3. **Environment Variables**（可选，先不加）：不要设 `STATIC_EXPORT`（我们要动态 SSR）。`NEXT_PUBLIC_*` 类变量若将来有再填。
4. 点 **Save and Deploy** → Cloudflare 自动 `npm install` + `npm run build:cf` → 约 1–3 分钟，给你一个 `*.pages.dev` 预览域名，打开确认首页正常。

### 2-C：配置 KV 缓存绑定（生产缓存用）
OpenNext 的增量缓存需要一个 KV 命名空间。
1. Cloudflare → **Workers & Pages → KV** → **Create a namespace**，名字随意（如 `darlynmae-cache`）→ 记下它的 **ID**。
2. 回到 Pages 项目 → **Settings → Bindings**（或 Functions / KV 区域，按当前面板）→ **Add binding** → 类型 **KV**，绑定名填 **`NEXT_CACHE`**（必须与 `wrangler.toml` 一致）→ 选刚创建的命名空间 → 保存。
3. 重新触发一次部署（Settings 改了通常自动重部署，或手动 Redeploy）。
   > 本地 `opennextjs-cloudflare build` 不需要 KV 也能构建通过；KV 是运行时缓存，不绑不影响首屏，只是缓存不持久。

### 2-D：绑定真实域名（darlynmae.com）
1. Pages 项目 → **Custom domains** → 输入 `darlynmae.com` → **Add**；再输入 `www.darlynmae.com` → **Add**。
2. 因为域名同属此 Cloudflare 账号，Cloudflare **自动**添加 CNAME 并签发 SSL，**无需手动加 DNS、无需 TXT 校验**。
3. 等待几分钟到最长 48h，状态变 **Active** 即成功（橙云 🟠 保持开启 = 边缘加速 + 免费 SSL + WAF）。
4. 建议设主域重定向：`www.darlynmae.com` → `darlynmae.com`（301）。

---

## 阶段 3：GD 白名单（关键，否则游戏会跳走）

1. 登录 GameDistribution Publisher 后台。
2. 找到 **White-list / Approved Domains** 设置（位置随后台版本可能变动，找不到就问 partnership@azerion.com）。
3. 提交你的真实域名（建议同时加 `darlynmae.com` 和 `www.darlynmae.com`）。
4. 等待审核通过（可能 1 至数天）。
5. 归因 URL 已由 `GameEmbed` 按站点动态拼 `gd_sdk_referrer_url=https://darlynmae.com/games/{slug}`，上线后自动生效；此步只需在 GD 后台把域名加白名单即可，无需逐游戏改代码。

---

## 阶段 4：验证（先 1 款，再扩量）

1. 打开 `/games/wheely-2`，确认游戏**就地播放**（不跳转到 GD 站外）。
2. 确认 iframe 的 `gd_sdk_referrer_url=https://darlynmae.com/games/wheely-2`。
3. 浏览器控制台检查广告请求是否从你的页面 URL 发出（GD 要求 ads 从游戏页 URL 请求，否则广告收益受损）。
4. 确认 Google Ad Manager 关联 / onboarding 已完成，否则游戏内广告不填充。
5. **验证通过后再批量接入 30–50 款游戏**——先打通流程，再堆量，避免返工。

---

## 阶段 5：SEO（配合多站点架构）

- 每个站点生成 `sitemap.xml` 与 `robots.txt`，提交到 Google Search Console。
- 游戏包裹页提供**唯一文案** + `VideoGame` 结构化数据（Schema.org）+ OG 图（之前方案已规划）。
- iframe 游戏本体**不被搜索引擎收录**，收录靠包裹层内容；多站点用 `canonical` / 差异化文案防止站群判定。
- 用 **Cloudflare 300+ 边缘节点**保证欧美低延迟，优化 Core Web Vitals（LCP/INP/CLS），这是 Google 排名信号。

---

## 快速参考卡（粘贴即用）

> 域名 `darlynmae.com` 已确定（Cloudflare Registrar 购买，NS 已自动托管）。以下步骤全部在 Cloudflare 单一平台完成，**无跨厂商、无 TXT 校验**。

**1) GitHub：建空仓库 `ai-project` → 本地推送**
```bash
git branch -M main
git remote add origin https://github.com/<你的用户名>/ai-project.git
git push -u origin main
```

**2) Cloudflare Pages → Connect Git → 构建配置**
```
Framework preset : None
Build command    : npm run build:cf
Output directory : .open-next/assets
Node.js version  : 22.x
```

**3) Cloudflare → KV → 建命名空间 → Pages Settings → Bindings 加 KV**
```
Binding name : NEXT_CACHE
Namespace    : <你建的 KV 命名空间>
```

**4) Pages → Custom domains → 加 darlynmae.com 与 www.darlynmae.com**
```
（同账号自动加 CNAME + SSL，无需手动 DNS / TXT）
```

**5) GameDistribution → Publisher 后台 → White-list / Approved Domains**
```
添加：darlynmae.com
添加：www.darlynmae.com
```

---

## 决策备注（已确认）
- 部署目标：**Cloudflare Pages / Workers**（经 `@opennextjs/cloudflare` 适配器，Next.js 16 官方支持路线）。
- 选择理由：域名本就在 Cloudflare → 免跨厂商 DNS + `_vercel` TXT 校验；300+ 边缘节点对欧美 SEO 友好；游戏站带宽大，Cloudflare **无限带宽**长期省钱。
- 适配器风险已核验为**低**：本项目**无 `middleware.ts`/`proxy.ts`**、**无 `next/image`**、`resolveCurrentSite()` 走 `headers()` 读 host 属主流 SSR 模式，OpenNext 支持。
- 本地冒烟构建（`opennextjs-cloudflare build`）用于验证应用能在适配器下成功编译；云端 Cloudflare 构建为最终权威验证。
- 多站点按域名解析，`resolveCurrentSite()` 按 host 自动解析，**零代码改动**。
