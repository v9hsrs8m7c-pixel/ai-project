# GSC + GA4 接入手册（darlynmae.com）— 明日照做版

代码已写好、由环境变量驱动。**只需拿两个 ID 填进 `.env.local` 再部署，不用改任何代码。**

---

## 总览顺序（务必按这个来）

```
① 建好 Google 账号（手机号验证码先过）
        │
② 拿两个值：  GA4 的 Measurement ID（G-开头）
            + GSC 的验证码（meta content 引号内那串）
        │
③ 在项目根建 .env.local，把两个值填进去
        │
④ 开 TUN 代理 → bash scripts/deploy-cf.sh  （构建+部署，约 2 分钟）
        │
⑤ 回 GSC 点「验证」→ 提交 sitemap.xml
   去 GA4 实时报告看活跃用户
```

⚠️ **关键前置**：第④步部署时，`.env.local` 里必须已经有值，否则线上不会出现验证标签、GSC 会验证失败。所以顺序是 **先拿 ID（②）→ 填文件（③）→ 再部署（④）→ 最后验证（⑤）**。

---

## 一、GA4（看用户行为：来源 / 停留 / 设备）

1. 打开 https://analytics.google.com/ → 用你的 Google 账号登录
2. 左下角 **Admin（管理）** → 左上 **Create（创建）** → **Property（媒体资源）**
3. 名称填 `darlynmae.com`；时区选 **(GMT+08:00) 北京**；货币 **USD**
4. 业务目标随意勾 → 下一步到 **Data Streams（数据流）**
5. 点 **Web（网站）** → 填：
   - Website URL：`https://darlynmae.com`
   - Stream name：`darlynmae`
6. 创建后页面显示 **Measurement ID**，形如 `G-XXXXXXXXXX`
   → **复制这串 `G-` 开头的 ID**（这就是 GA4 ID）

---

## 二、GSC（看 Google 搜索曝光 / 点击 / 排名）

1. 打开 https://search.google.com/search-console/ → 用同一 Google 账号登录
2. 点 **Add Property（添加资源）** → 选 **URL prefix（网址前缀）**
3. 填 `https://darlynmae.com` → 继续
4. 验证方式选 **HTML tag（HTML 标记）**
5. 复制这行里 `content="..."` 引号内的那串：
   `<meta name="google-site-verification" content="XXXXXX" />`
   → **只要引号里的 `XXXXXX`，不要带 `google-site-verification` 字样**（这就是 GSC 验证码）
6. **先别点「验证」** —— 等第④步部署完、线上出现这个 meta 标签后，再回第⑤步点。

> 备选（高级，不用改代码）：在 Cloudflare DNS 给 darlynmae.com 加一条 **TXT 记录**，值填 GSC 给的 `google-site-verification=XXXXXX`。换代码也不影响验证，但新手先用 HTML tag 最简单。

---

## 三、填到项目里

项目根目录（和 `package.json` 同级）新建文件 **`.env.local`**（前面有个点），内容：

```bash
# GA4 跟踪 ID（analytics.google.com 的 Measurement ID，G- 开头）
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-把你刚复制的ID填这里

# GSC 验证码（search console meta content 引号内那串）
NEXT_PUBLIC_GSC_VERIFICATION=把你刚复制的验证码填这里
```

保存。**该文件已被 `.gitignore` 的 `.env*` 忽略，不会提交到 GitHub，安全。**

---

## 四、重新部署

开 **全局 TUN 代理**（否则 wrangler 连不上 Cloudflare），Git Bash 里：

```bash
cd "C:/Users/Apple/WorkBuddy/2026-08-18-21-34-42/ai-project"
bash scripts/deploy-cf.sh
```

看到 `Deployment complete` 后等 1–2 分钟上线。

---

## 五、验证生效

1. **GSC**：回到第②步的添加资源页，点 **Verify（验证）** → 提示成功即代表 Google 确认你是站长。
   然后左侧 **Sitemaps（站点地图）** → 提交 `https://darlynmae.com/sitemap.xml` → 加快收录。
2. **GA4**：部署后访问站点随便点几个游戏页，等几分钟去
   **Reports（报告）→ Realtime（实时）**，应能看到活跃用户。
3. **肉眼确认**：浏览器打开 https://darlynmae.com 看源代码，搜 `google-site-verification` 应看到你填的那串；搜 `googletagmanager` 应看到 GA4 脚本。

---

## 常见问题

- **没填 .env.local 就部署会怎样？** 代码做了"无值就跳过"，站点照常跑，只是没有统计。填了重部署就有了。
- **改选品 / 加游戏后要不要重做这套？** 不用。GSC/GA4 是站点级，跟游戏数量无关。以后只管改游戏、跑 deploy 脚本。
- **欧盟隐私合规？** 严格说 GA4 需 Cookie 同意横幅。冷启动先跑，流量起来再加同意组件。
- **GSC 验证失败？** 99% 是第④步部署时 `.env.local` 还没填值 / 没开 TUN 导致部署没成功。重做 ③④⑤。
- **sitemap 提交后显示"无法读取"？** 等几分钟（CF 边缘同步），或确认 `https://darlynmae.com/sitemap.xml` 能直接打开（应 197 条）。
