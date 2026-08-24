# 域名购买 + Vercel 部署 + GD 白名单 — Step-by-Step 清单

> 目标：把一个面向欧美用户的 GameDistribution 游戏聚合站，从"本地 mock + 预览"推进到"真实域名 + 真实游戏就地播放 + 收益归因 + SEO 就绪"。
> 适用架构：Next.js 动态 SSR（按 host 头解析多站点），部署到 Vercel。DNS 有两种路径（见阶段 1）：**A. Cloudflare + Vercel（推荐）** 或 **B. 纯 Vercel（最简）**。
> **🟢 已选定路径：A（Cloudflare + Vercel）** —— 下文步骤按此路径执行。

---

## 阶段 0：购买域名

> ✅ **已完成 2026-08-23**：域名 **`darlynmae.com`** 已通过 **Cloudflare Registrar** 购买并托管。
> 因为是 Cloudflare 自家注册商，**NS 已自动指向 Cloudflare**，无需再改 NS（阶段 1 的"改 NS"步骤可跳过，直接到 Cloudflare DNS 面板加记录）。

### 渠道推荐
- **首选 Cloudflare Registrar**：.com 成本价约 $9.77/年、零溢价、自带免费 WHOIS 隐私；且本就要用 Cloudflare 做 DNS/边缘，注册后直接托管，一步到位。
- **备选 Namecheap / Porkbun**：国际卡或 PayPal 支付，续费价格稳定，送隐私保护。
- **国内支付友好**：阿里云万网 / 腾讯云 DNSPod（支持支付宝/微信），但买完后需把 DNS 改到 Cloudflare 以获得欧美加速。
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

## 阶段 1：DNS 托管（两条路径，任选其一）

> 提示：Vercel 自身已有全球边缘网络（126 PoP，含欧美节点）+ 免费 SSL，所以**即使完全不上 Cloudflare**，欧美用户也是就近加速。Cloudflare 是"锦上添花 + 多域名集中管理 + 免费 WAF"，不是"不上就慢"。

### 路径 A（推荐）：Cloudflare + Vercel
> 由于 `darlynmae.com` 已在 Cloudflare Registrar 购买，**域名本身已托管在 Cloudflare**，跳过第 1–2 步的 NS 切换，直接进入第 3 步加记录。若将来换用其他注册商买的域名，再按第 1–2 步改 NS。

1. 登录 Cloudflare → 左侧 **Websites** → 确认 `darlynmae.com` 已存在且状态 **Active**（通过 Cloudflare Registrar 购买会自动出现并 Active）。
2. （仅非 Cloudflare 注册商购买时需做）把注册商处的 NS 改为 Cloudflare 提供的两个 `xxx.ns.cloudflare.com` / `yyy.ns.cloudflare.com`，等待生效。
3. 在 Cloudflare **DNS** 面板添加以下记录（橙色云 = Proxy ON 🟠）：
   - `A`      Name `@`   Content `76.76.21.21`        Proxy 🟠
   - `CNAME`  Name `www` Content `cname.vercel-dns.com` Proxy 🟠
4. 等待记录生效。Cloudflare 显示 **Active** 即成功。
5. **SSL/TLS** 面板保持默认（Vercel 要求 HTTPS，Cloudflare 代理自带证书，无需额外操作）。

### 路径 B（最简，跳过 Cloudflare）
1. 在域名**注册商**的 DNS 面板直接添加：
   - `A`      Name `@`   Content `76.76.21.21`
   - `CNAME`  Name `www` Content `cname.vercel-dns.com`
2. 完成。无 WAF / 无额外边缘缓存层，但已具备 Vercel 边缘加速 + 免费 SSL。

---

## 阶段 2：Vercel 部署

1. 注册 Vercel（用 GitHub 登录），**Import** 你的 ai-project 仓库。
2. **关键**：仓库已含 `vercel.json`（`framework: "nextjs"`），生产用默认 `npm run build` → **动态 SSR**，不会误用静态导出。不要手动改 `output`。
3. 项目 → **Settings → Domains** → 添加你的域名（主域 `darlynmae.com` 与 `www.darlynmae.com` 都加）。
4. 域名校验：
   - **路径 A（经 Cloudflare）**：橙云会隐藏真实记录，Vercel 可能读不到 A/CNAME。按 Vercel 提示在 Cloudflare 加一条校验 `TXT`：`_vercel` → Vercel 显示的验证码（Proxy 关 / 灰云即可）。校验通过后显示 "Valid Configuration"，SSL 由 Cloudflare 签发。
   - **路径 B（纯 Vercel）**：Vercel 直接读取注册商 DNS，自动校验并签发免费 SSL，通常几分钟完成。
5. 多站点扩展：每个站点一个独立域名，各自在 Vercel 添加即可；代码 `resolveCurrentSite()` 按 host 自动解析，**零代码改动**。

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
- 用 Vercel 边缘网络 + Cloudflare 保证欧美低延迟，优化 Core Web Vitals（LCP/INP/CLS），这是 Google 排名信号。

---

## 路径 A 快速参考卡（粘贴即用）

> 域名 `darlynmae.com` 已确定（Cloudflare Registrar 购买，NS 已自动托管）。照此逐行填，只有带 `<...>` 的占位（NS / `_vercel` 验证码）需替换为 Cloudflare / Vercel 实际显示的值。

**1) Cloudflare → 注册商后台：改 NS（覆盖默认）**
> `darlynmae.com` 经 Cloudflare Registrar 购买，**此步已自动完成，跳过**。若将来用其他注册商买的域名，再改 NS：
```
NS1 = <Cloudflare 给的第一个，如 xxx.ns.cloudflare.com>
NS2 = <Cloudflare 给的第二个，如 yyy.ns.cloudflare.com>
```

**2) Cloudflare → DNS → Records（全部 Proxy 🟠 橙云）**
```
Type  Name   Content                 Proxy
A     @      76.76.21.21             🟠
CNAME www    cname.vercel-dns.com    🟠
```

**3) Cloudflare → DNS → Records（仅校验用，Proxy 关 / 灰云）**
```
Type  Name     Content
TXT   _vercel  <Vercel 域名页显示的验证码>
```

**4) Vercel → 项目 → Settings → Domains**
```
添加：darlynmae.com
添加：www.darlynmae.com
→ 出现 "Valid Configuration" 即成功（SSL 由 Cloudflare 签发）
```

**5) GameDistribution → Publisher 后台 → White-list / Approved Domains**
```
添加：darlynmae.com
添加：www.darlynmae.com
```

---

## 决策备注（已确认）
- 部署目标：**Vercel**（全球 126 PoP，含欧美节点），**不买自建美国服务器**（单点反而拖累另一洲用户）。
- DNS 路径：**A（Cloudflare + Vercel）** 已选定 —— 边缘加速 + 免费 SSL + 免费 WAF/DDoS + 多域名集中管理。
- GD CDN 在国内访问可能偏慢，但目标用户为欧美，体验良好；国内仅影响站长自测。
- 多站点按域名解析，Vercel 每站绑定独立域名即可，代码零改动。
