# Google Search Console + GA4 接入手册（darlynmae.com）

代码已经写好并 env 驱动：只要拿到两个 ID 填进 `.env.local`，重部署即可生效，
**不需要再改任何代码**。本手册教你在 Google 后台拿到这两个值，并验证生效。

---

## 前置：先有 Google 账号
用你刚建好的 Google 账号登录。两个工具都用同一个账号即可。

---

## 一、GA4（看用户行为：停留、来源、设备）

1. 打开 https://analytics.google.com/
2. 左下角 **Admin（管理）** → 左上 **Create（创建）** → **Property（媒体资源）**
3. 名称填 `darlynmae.com`，时区选你所在时区（或 UTC+8），货币 USD
4. 业务目标随意勾，下一步到 **Data Streams（数据流）**
5. 选 **Web（网站）** → 填：
   - Website URL：`https://darlynmae.com`
   - Stream name：`darlynmae`
6. 创建后，页面会显示一个 **Measurement ID**，形如 `G-XXXXXXXXXX`
   → **复制这串 `G-` 开头的 ID**，这是你要的 GA4 ID。

---

## 二、GSC（看 Google 搜索带来的曝光/点击/排名）

1. 打开 https://search.google.com/search-console/
2. 点 **Add Property（添加资源）** → 选 **URL prefix（网址前缀）**
3. 填 `https://darlynmae.com` → 继续
4. 验证方式选 **HTML tag（HTML 标记）**
5. 复制那行 `<meta name="google-site-verification" content="XXXXXX" />` 里
   `content="..."` 引号内的那串 `XXXXXX`
   → **只要引号里的那串，不要带 `google-site-verification` 字样**，这是 GSC 验证码。
6. 先别急着点"验证"——等下面部署完、线上出现这个 meta 标签后再回来点。

> 备选验证方式（更高级，不需改代码）：在 Cloudflare DNS 里给 darlynmae.com 加一条
> **TXT 记录**，值为 GSC 给的 `google-site-verification=XXXXXX`。好处是以后换代码不影响验证。
> 新手建议先用上面的 HTML tag 方式。

---

## 三、填到项目里

在项目根目录新建文件 **`.env.local`**（注意前面有个点），内容粘贴：

```bash
# GA4 跟踪 ID（来自 analytics.google.com 的 Measurement ID，G- 开头）
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-把你刚复制的ID填这里

# GSC 验证码（来自 search console 的 meta content 引号内那串）
NEXT_PUBLIC_GSC_VERIFICATION=把你刚复制的验证码填这里
```

保存。这个文件已被 `.gitignore` 忽略，**不会**被提交到 GitHub，安全。

---

## 四、重新部署

开全局 TUN 代理，在 Git Bash 里：

```bash
cd /c/Users/Apple/WorkBuddy/2026-08-18-21-34-42/ai-project
bash scripts/deploy-cf.sh
```

等 1–2 分钟上线。

---

## 五、验证生效

1. **GSC**：回到搜索控制台第 6 步那个页面，点 **Verify（验证）**。
   提示成功即代表 Google 已确认你是站点主人。然后左侧 **Sitemaps（站点地图）**
   里提交 `https://darlynmae.com/sitemap.xml`，加快收录。
2. **GA4**：部署后访问站点随便点几个游戏页，等几分钟去
   analytics.google.com 的 **Reports（报告）→ Realtime（实时）**，应能看到活跃用户。
3. **肉眼确认 meta 标签**：浏览器打开 https://darlynmae.com 查看源代码，
   搜 `google-site-verification` 应能看到你填的那串；搜 `googletagmanager` 应能看到 GA4 脚本。

---

## 常见问题

- **没建 Google 账号 / 没填 .env.local 会怎样？**
  代码里做了"无值就跳过"，站点照常运行，只是没有统计数据。等你哪天填了重部署就有了。
- **改选品后要不要重做这套？**
  不用。GSC/GA4 是站点级，跟游戏数量无关。以后只管改游戏、跑 deploy 脚本即可。
- **欧盟用户隐私？**
  严格来说 GA4 需 Cookie 同意横幅才合规。冷启动阶段可先跑，流量起来后再加同意组件。
