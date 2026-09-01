# Cloudflare Pages 迁移手册（darlynmae.com）

将 Next.js 站点从 Vercel 迁移到 Cloudflare Pages 的完整流程与踩坑记录。
适用于「已在 `next.config.ts` 内置静态导出开关」的项目。

---

## 0. 为什么之前卡了一下午、现在能成

**之前失败的根因**：当时没有静态导出通道，等于把「动态 SSR 构建」直接丢给 Cloudflare Pages。
Cloudflare Pages 跑 Next.js 动态构建**必须配 `@cloudflare/next-on-pages` 适配器**（本质是塞进 Worker），
当时没配 → 构建/运行直接挂 → 耗了一下午 → 退回 Vercel。

**现在能成的原因**：`next.config.ts` 已内置 `STATIC_EXPORT=1` 静态导出开关。开了之后
`next build` 吐纯静态 `out/`（HTML + 资源），**不需要任何适配器**；Cloudflare Pages 当静态站点托管即可。

> 配套代码改动（已提交）：
> - `src/app/robots.ts` / `src/app/sitemap.ts` / `src/app/opengraph-image.tsx` 加 `export const dynamic = "force-static";`
> - `public/_redirects`：写入 `www.darlynmae.com/* https://darlynmae.com/:splat 301`
> - `package.json` 加脚本 `"build:static": "STATIC_EXPORT=1 next build"`

---

## 1. 前置条件

- Node 已就绪（`node -v` / `npm -v`）
- 已装 `node_modules`（`npm install`）
- **终端必须开全局 TUN 代理**：`git push`、`npm install`、`npx wrangler` 直连会被 `ECONNRESET` 重置（国内网络）。
- 一个 **Cloudflare API Token**（权限：`Account → Cloudflare Pages → Edit`），见第 3 步。
- 域名已在 Cloudflare Registrar 购买（DNS 自然归 CF 管，绑自定义域名时 CF 能自动改记录）。

---

## 2. 本机生成静态产物 `out/`

在 **Git Bash** 里（不能用 PowerShell/cmd，见下方坑①）：

```bash
cd /c/Users/Apple/WorkBuddy/2026-08-18-21-34-42/ai-project
npm install                      # 若 node_modules 不全
STATIC_EXPORT=1 ./node_modules/.bin/next build   # 直接调二进制，绕过 npm 脚本 env 前缀问题
```

预期：约 4–8 分钟，末尾无 error，产出 `out/`。

核对产物（关键数量）：
```bash
find out/games -name "*.html" | wc -l     # 游戏页（应 ~500–605）
ls out/category/*.html | wc -l            # 分类页（应 ~15–16）
ls out/sitemap.xml out/ads.txt out/robots.txt out/_redirects   # 关键文件都在
du -sh out                                # 体积（应 ~78M，CF 免费额度内）
```

> 注意：`out/games/` 下是**平铺**的 `out/games/<slug>.html`，不是子目录 `index.html`。

---

## 3. 部署到 Cloudflare Pages

### 3a. 拿 API Token（绕过浏览器 OAuth 回调超时，见坑②）

1. 登录 `dash.cloudflare.com` → 头像 → **My Profile** → **API Tokens** → **Create Token**
2. 选 **Create Custom Token**：
   - Permissions → Add more → `Account` / `Cloudflare Pages` / `Edit`
   - Account Resources → `Include` → 你的账号（或 All accounts）
3. Continue → Create → **复制 token（只显示一次）**
4. 同一账号 `dash.cloudflare.com` 首页右下角复制 **Account ID**

### 3b. 部署（Git Bash，开 TUN 代理）

```bash
cd /c/Users/Apple/WorkBuddy/2026-08-18-21-34-42/ai-project
export CLOUDFLARE_API_TOKEN="粘贴token"
export CLOUDFLARE_ACCOUNT_ID="粘贴Account ID"
npx wrangler pages deploy out --project-name darlynmae
```

- `npx` 首次会问 `Ok to proceed? (y)` → 输入 `y`
- 设了 token 后**不再弹浏览器**，直接上传 2900+ 文件（含 `_next` 资源）
- 结束返回预览 URL：`https://<随机>.darlynmae.pages.dev`

> ⚠️ 不能用 Cloudflare 后台「拖拽上传」：`out/` 总文件 **2900+**，超后台 1000 文件限制 → 必须走 CLI。

---

## 4. 预览验证（切 DNS 前必做）

打开预览 URL，并实跑：

```bash
# 响应头应含 Server: cloudflare
curl -sI https://<随机>.darlynmae.pages.dev/
# ads.txt / sitemap 应 200
curl -s -o /dev/null -w "%{http_code}\n" https://<随机>.darlynmae.pages.dev/ads.txt
curl -s -o /dev/null -w "%{http_code}\n" https://<随机>.darlynmae.pages.dev/sitemap.xml
```

确认：游戏列出、游戏页能加载 gamemonetize iframe + 广告、sitemap/ads.txt 都在。

---

## 5. 绑生产域名（Vercel 全程不停机）

1. Cloudflare 后台 → **Workers & Pages** → `darlynmae` 项目 → **Custom domains**
2. **Set up a custom domain** → 输入 `darlynmae.com` → 确认
3. 再添加 `www.darlynmae.com` → 确认
4. CF 会弹窗要你**确认 DNS 变更**（把旧 Vercel 记录改成 Pages）→ 点 **Activate domain**
   - `www` 旧 CNAME：`cname.vercel-dns.com` → 改 `darlynmae.pages.dev`
   - `darlynmae.com` 旧 A 记录：`76.76.21.21`（Vercel IP）→ 改指向 Pages
5. 两个域名都变 **Active** 即生效（DNS/SSL 通常几分钟）

---

## 6. 生产验证

```bash
curl -sI https://darlynmae.com/ | grep -iE "server:|cf-ray"   # 应 Server: cloudflare
nslookup darlynmae.com                                          # 应解析到 Cloudflare IP（172.67.x / 104.16.x），非 76.76.21.21
curl -s -o /dev/null -w "%{http_code}\n" https://darlynmae.com/ads.txt
```

---

## 7. 收尾

- 跑稳 1 周 → 暂停 Vercel 项目（留作兜底）
- `git push` 补同步本地提交
- 吊销旧 token（Vercel `vcp_`、旧 Cloudflare `cfut_`）；部署专用 token 保留但勿外泄

---

## 8. 常见坑速查

| 现象 | 原因 | 解法 |
|---|---|---|
| `git push` / `npm install` → `ECONNRESET` | 终端直连被重置 | 开**全局 TUN 代理** |
| `npm run build:static` → `'STATIC_EXPORT' 不是内部或外部命令` | Windows 用 cmd 跑，不认 bash `VAR=val` 前缀 | 在 **Git Bash** 跑，或直调 `STATIC_EXPORT=1 ./node_modules/.bin/next build` |
| `npx wrangler` → `Timed out waiting for authorization code` | TUN 代理劫持 `localhost` OAuth 回调 | 改用 **API Token**（`CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`），不弹浏览器 |
| 后台拖拽上传 → 提示超 1000 文件 | `out/` 含 `_next` 共 2900+ | 必须用 **wrangler CLI** |
| `www` 直接 200、未跳 apex | CF Pages `_redirects` 不支持域名级 from | 可选：CF 后台 **Rules → Redirect Rules** 建 `www.darlynmae.com/* → https://darlynmae.com/$1`（301） |

---

## 9. 以后重新部署（增游戏到 800/1000 款等）

1. 改 `scripts/import-gm-games.mjs` 的 `TARGET` 数量 → 重跑生成 `games-gm.ts`
2. 本机：`STATIC_EXPORT=1 ./node_modules/.bin/next build`
3. `npx wrangler pages deploy out --project-name darlynmae`（开 TUN + 设 token）
4. 自动覆盖线上（Pages 每次部署是新版本，旧版本保留可作 rollback）
