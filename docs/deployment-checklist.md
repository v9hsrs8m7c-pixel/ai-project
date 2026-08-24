# 域名购买 + Vercel 部署 + GD 白名单 — Step-by-Step 清单

> 目标：把一个面向欧美用户的 GameDistribution 游戏聚合站，从"本地 mock + 预览"推进到"真实域名 + 真实游戏就地播放 + 收益归因 + SEO 就绪"。
> 适用架构：Next.js 16 动态 SSR（按 `host` 头解析多站点），部署到 **Vercel（Next.js 原生，零适配器）**。
> 域名 `darlynmae.com` 已通过 **Cloudflare Registrar** 购买并托管（NS 自动指向 Cloudflare，仅作 DNS / 注册商使用；网站实际跑在 Vercel）。
>
> **🟢 已回切部署目标：Vercel（2026-08-25 决策）** —— Cloudflare Pages + OpenNext 对 Next.js 16 存在兼容性硬坑（`proxy.ts` 未支持、需特定 OpenNext 版本、Node 版本/锁文件敏感），实测反复构建失败。Vercel 是 Next.js 原生平台，构建命令即 `next build`，无适配器、无 `wranglper.toml`、无 Node 版本配置，5 分钟内可上线。后续流量做大再评估迁回 Cloudflare 省带宽。

---

## 阶段 0：购买域名（已完成）

> ✅ **已完成 2026-08-23**：域名 **`darlynmae.com`** 已通过 **Cloudflare Registrar** 购买并托管。
> Cloudflare 仅作**注册商 + DNS 管理**使用，网站部署在 Vercel（跨厂商，下面阶段 1 加 DNS 指向 Vercel 即可）。

---

## 阶段 1：Cloudflare DNS 指向 Vercel（手动加 2 条记录）

因为域名在 Cloudflare、网站在 Vercel（跨厂商），需要在 Cloudflare DNS 里把流量指到 Vercel 的 IP。

1. 打开 dash.cloudflare.com → **Websites → darlynmae.com** → 左侧 **DNS** → **Records**。
2. 加第 1 条：
   | 字段 | 值 |
   |---|---|
   | Type | **A** |
   | Name | **@** |
   | IPv4 address | **76.76.21.21** |
   | Proxy status | **DNS only（灰云 ☁️ 空心）** |
   | TTL | Auto |
3. 加第 2 条：
   | 字段 | 值 |
   |---|---|
   | Type | **CNAME** |
   | Name | **www** |
   | Target | **cname.vercel-dns.com** |
   | Proxy status | **DNS only（灰云）** |
   | TTL | Auto |
4. 若列表里已有 Cloudflare 自动生成的占位 A 记录（指向 `192.0.2.1`），**编辑它改成 `76.76.21.21`**，不要新建重复记录。
5. 最终应有且仅有：
   ```
   A     @      76.76.21.21          🔘 DNS only
   CNAME www    cname.vercel-dns.com 🔘 DNS only
   ```

> 灰云（DNS only）= 让 Vercel 直接接管，避免 Cloudflare 代理与 Vercel SSL 冲突，验证最稳。站点跑稳后若想用 Cloudflare 边缘加速，可再点成橙云。

---

## 阶段 2：Vercel 部署（原生 Next.js，几乎零配置）

### 2-A：GitHub 仓库（已完成）
- 仓库 `ai-project` 已存在：`https://github.com/v9hsrs8m7c-pixel/ai-project.git`
- 最新提交已含 Vercel 配置（`vercel.json` + 标准 `next build` 脚本）。

### 2-B：Vercel 导入仓库
1. 打开 vercel.com → 用 **GitHub 登录并授权**。
2. 点 **Add New → Project** → 从 GitHub 列表选 **`ai-project`** → **Import**。
3. 构建配置（Vercel 通常**自动识别 Next.js**，核对即可）：
   | 项 | 值 |
   |---|---|
   | Framework Preset | **Next.js**（自动） |
   | Build Command | `npm run build` |
   | Install Command | `npm install` |
   | Output | 自动（不要手动开 Static Export） |
4. 点 **Deploy** → 约 1–3 分钟构建完，给一个预览域名 `ai-project-xxxx.vercel.app`，打开确认首页正常（应能看到 Wheely 2 等游戏卡片）。

### 2-C：绑定真实域名 darlynmae.com
1. 项目内点 **Settings → Domains**。
2. 输入 `darlynmae.com` → Add；再输入 `www.darlynmae.com` → Add。
3. 因为阶段 1 已用灰云指向 Vercel，Vercel 通常**自动检测通过**（显示 Valid Configuration）。若提示需要验证，回 Cloudflare DNS 加一条：
   | Type | Name | Content | Proxy |
   |---|---|---|---|
   | TXT | `_vercel` | `<Vercel 显示的验证码>` | DNS only（灰） |
4. 设主域重定向：建议 `www.darlynmae.com` → `darlynmae.com`（301 Redirect），apex 作主域。
5. 等 DNS 生效（几分钟到最长 48h），状态变 **Valid Configuration / Active** 即成功。

---

## 阶段 3：GD 白名单（关键，否则游戏会跳走）

1. 登录 GameDistribution Publisher 后台。
2. 找 **White-list / Approved Domains**（位置随后台版本可能变动，找不到问 partnership@azerion.com）。
3. 提交 `darlynmae.com` 和 `www.darlynmae.com`。
4. 等待审核（可能 1 至数天）。
5. 归因 URL 已由 `GameEmbed` 按站点动态拼 `gd_sdk_referrer_url=https://darlynmae.com/games/{slug}`，上线自动生效，白名单通过即就地播放，无需改代码。

---

## 阶段 4：验证（先 1 款，再扩量）

1. 打开 `https://darlynmae.com/games/wheely-2`，确认游戏**就地播放**（不跳 GD 站外）。
2. 确认 iframe 的 `gd_sdk_referrer_url=https://darlynmae.com/games/wheely-2`。
3. 控制台检查广告请求是否从你的页面 URL 发出（GD 要求 ads 从游戏页 URL 请求，否则收益受损）。
4. 确认 Google Ad Manager 关联 / onboarding 已完成，否则游戏内广告不填充。
5. **验证通过后再批量接入 30–50 款**——先打通流程，再堆量。

---

## 阶段 5：SEO（配合多站点架构）

- 每站生成 `sitemap.xml` 与 `robots.txt`，提交 Google Search Console。
- 游戏包裹页提供**唯一文案** + `VideoGame` 结构化数据 + OG 图。
- iframe 游戏本体不被收录，收录靠包裹层内容；多站用 `canonical` / 差异化文案防站群判定。
- Vercel 全球边缘（~100 PoP 含欧美）+ 自动 SSL，对 Core Web Vitals / 欧美延迟友好，利于 SEO。

---

## 快速参考卡（粘贴即用）

**1) Cloudflare DNS（域名在 Cloudflare，指向 Vercel）**
```
A     @      76.76.21.21          DNS only (灰云)
CNAME www    cname.vercel-dns.com DNS only (灰云)
```

**2) Vercel → Import `ai-project` → Deploy**
```
Framework : Next.js (auto)
Build     : npm run build
Install   : npm install
```

**3) Vercel → Settings → Domains → 加 darlynmae.com 与 www.darlynmae.com**
```
（灰云直指 Vercel，通常自动通过；否则加 _vercel TXT 灰云校验）
```

**4) GameDistribution → Publisher 后台 → White-list / Approved Domains**
```
添加：darlynmae.com
添加：www.darlynmae.com
```

---

## 决策备注（已确认）
- 部署目标：**Vercel**（Next.js 原生，零适配器、`vercel.json` 已就绪、构建命令 `next build`）。
- 回切理由：Cloudflare Pages + `@opennextjs/cloudflare` 对 Next.js 16 有兼容性硬坑（OpenNext 官方标注 16 未完全支持、`proxy.ts` 早期版本不支持、Node/锁文件敏感），实测反复构建失败，耗时巨大。
- 域名仍在 Cloudflare Registrar 管理 DNS（阶段 1 灰云指向 Vercel），未损失域名资产。
- 后续若流量做大、带宽成本敏感，可再评估迁回 Cloudflare Pages/Workers（届时需要 OpenNext 最新版 + 处理 Next 16 兼容）。
- 多站点按域名解析，`resolveCurrentSite()` 走 `headers()` 读 host，**零代码改动**。
