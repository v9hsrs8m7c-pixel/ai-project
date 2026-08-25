# 小游戏站 SEO 关键词调研 + 50 游戏开发路线图（SEO-First）

> 原则（用户拍板，2026-08-25）：**先调研用户搜索需求，再决定开发什么主题/类型，绝不能为了开发游戏而开发游戏。** 目标是带来流量与收入，顺序不能反：
> **需求调研 → 按需求开发 → 逐页 SEO → 发布积累流量 → 流量达标后接变现（Gamezop / AdSense / 开发者分成）**。
>
> 本文档是"开发前"的输入，决定 *做什么*；具体游戏实现见 `src/data/sources/selfhosted/games.ts` 与 `public/games/<slug>/index.html`。

---

## 0. 方法论与数据边界（先看这段，避免误读）

- **数据来源**：2026 年公开的休闲 / 超休闲游戏行业趋势报告、主流游戏门户的"热门"榜单文章、以及可查的公开搜索量引用（如 2048 约 82.3 万次/月这一公开口径）。
- **不是精确搜索量**：本环境无法直连 Google Keyword Planner / Ahrefs / Semrush 拉逐词精确月搜索量。下文的需求分级（Tier 1/2/3）是**基于公开趋势的方向性判断**，不是精确排名。
- **上线前必做**：用真实关键词工具（Google Keyword Planner 免费、Ahrefs / Semrush / Ubersuggest 试用）对本文的候选词跑一遍**精确月搜索量 + 竞争度（KD）**，据此微调开发优先级与页面标题。尤其欧美市场（en），建议以英语关键词为准。
- **长尾 > 头部**：头部词（"games"、"puzzle games"）竞争极大、新站几乎排不进；真正能带来早期流量的，是本文第 3 节的**长尾词簇**（"games like 2048"、"free bubble shooter no download"、"brain games for adults" 等）。

---

## 1. 核心结论：2026 年什么最值得做

| 信号 | 证据（2026 H1） | 对开发的指向 |
|---|---|---|
| **Puzzle 是休闲游戏第一大营收品类** | Puzzle 占休闲游戏收入 **44%+**；Match-3 约 **$2.5B**；Merge 约 **$1.3B** 且增速最快 | 益智 / 三消 / 合成 是变现确定性最高的方向，优先堆量 |
| **2048 类搜索量极高且长尾庞大** | "2048" 本身约 **82.3 万次/月**；"games like 2048"、"hexa 2048"、"2248"、"block blast"、"wood block puzzle"、"blockudoku" 构成超长尾 | 数字合并 / 方块拼放 是**最高优先级**主题簇 |
| **Hypercasual 稳定高下载** | Endless runner、Stack building、Physics puzzle、Color/Water sort、Rhythm tap、.io、Merge、Idle 长期居下载榜 | 这些轻量机制开发快、复用度高，适合快速铺量 |
| **Snake / Tetris / Flappy 经典回潮** | 多个 2026 榜单把 Snake、Tetris、Flappy 列为"回潮经典" | 已有 neon-snake / block-stack / flappy-orb，继续做变体 |
| **Bubble Shooter 长青休闲** | 多份报告列为"放松向稳定热门" | 已有 bubble-pop，做主题变体 |
| **Brain / Logic 长尾厚** | Sudoku、Minesweeper（回潮）、Mahjong Solitaire、Wordle、Word Search、Chess、Memory Match 属"brain games"大簇 | 益智/脑力类页面 SEO 价值高（教育/成人脑训练搜索多） |
| **.io / 领地类社交需求** | Paper.io 2、Hole.io 长期热门；"社交轻量"是 2026 趋势 | 做 2–3 款 .io 向（含 cell-eater 已有） |

---

## 2. 核心词（Core / Head terms）

> 这些词搜索量大但竞争极激烈，新站短期难排进前 10。**用途**：作为分类聚合页（hub）的主词与站内结构主干，而非单个游戏页硬刚。

- `puzzle games` / `free puzzle games`
- `online games` / `free online games` / `browser games`
- `2048` / `2048 game`
- `snake game` / `tetris` / `bubble shooter`
- `match 3 games` / `match three games`
- `io games` / `.io games`
- `brain games` / `brain training games`
- `kids games` / `games for kids`
- `unblocked games` / `games unblocked`（注意：这类词常带"学校/办公室可玩"意图，适合做合规无登录的卖点）
- `casual games` / `hypercasual games`

---

## 3. 长尾词簇（Long-tail — 早期流量的真正来源）

每个游戏页都应围绕一个长尾簇做标题 / meta / 首段，示例：

| 主题 | 长尾词示例（用于页面 SEO） |
|---|---|
| 数字合并 | `games like 2048`, `2048 game online`, `hexa 2048`, `2248 game`, `number merge puzzle`, `free 2048 no download` |
| 方块拼放 | `block blast`, `wood block puzzle`, `blockudoku`, `10x10 block puzzle`, `free block puzzle game` |
| 三消 | `games like candy crush`, `match 3 games free`, `jewel match 3`, `free match three no download` |
| 泡泡龙 | `bubble shooter game`, `free bubble shooter no download`, `bubble pop game`, `bubble shooter unblocked` |
| 贪吃蛇 | `snake game online`, `play snake`, `classic snake game`, `snake game unblocked` |
| 俄罗斯方块 | `tetris online`, `free tetris`, `tetris unblocked`, `block stack game` |
| 脑/逻辑 | `brain games for adults`, `sudoku free`, `minesweeper online`, `mahjong solitaire`, `word search free`, `memory match game` |
| 排序解压 | `ball sort puzzle`, `water sort`, `color sort`, `sand sort puzzle` |
| .io | `paper io`, `hole io`, `io games unblocked`, `territory io game` |
| 跑酷 | `helix jump`, `stack ball`, `endless runner game`, `free runner game` |
| 节奏 | `rhythm game online`, `tap game`, `music tap game` |
| 棋牌/双人 | `connect four`, `tic tac toe`, `checkers online`, `2 player games`, `two player games unblocked` |
| 体育 | `penalty kick`, `ping pong game`, `basketball game`, `8 ball pool` |
| 合成/放置 | `merge game`, `idle game`, `merge puzzle` |

> **英文内容语言**：目标市场欧美，游戏页标题/描述以英语撰写；中文仅用于后台与文档。

---

## 4. 50 游戏开发路线图（按搜索需求分 Tier，已建 8 个标 ✅）

> 逻辑：**Tier 1（需求最硬、变现最确定）先做**，把已上线的 8 个归到 Tier 1；其余按需求强度向下铺。
> 每款都是**原创**（自研几何/霓虹美术 + 原创名，不 clone 任何品牌 IP），落点 `public/games/<slug>/index.html` + `selfhosted/games.ts` 一条数据。

### Tier 1 — 最高需求 / 变现确定性最高（优先铺满）
| # | 原创名(slug) | 类型 | 对标热门机制 | 状态 |
|---|---|---|---|---|
| 1 | merge-numbers ✅ | Puzzle | 2048 | 已建 |
| 2 | neon-snake ✅ | Arcade | Snake | 已建 |
| 3 | brick-breaker ✅ | Arcade | Breakout | 已建 |
| 4 | flappy-orb ✅ | Arcade | Flappy | 已建 |
| 5 | bubble-pop ✅ | Casual | Bubble Shooter | 已建 |
| 6 | cell-eater ✅ | Action | .io 吞噬 | 已建 |
| 7 | block-stack ✅ | Puzzle | Tetris | 已建 |
| 8 | orbit-blaster ✅ | Action | 俯视射击 | 已建 |
| 9 | hex-merge | Puzzle | Hexa 2048 | 待建 |
| 10 | number-link-2248 | Puzzle | 2248 连线合并 | 待建 |
| 11 | block-blast | Puzzle | Wood Block 10x10 | 待建 |
| 12 | blockudoku | Puzzle | 9x9 数独方块 | 待建 |
| 13 | candy-match-3 | Puzzle | Match-3（Candy Crush 类） | 待建 |
| 14 | jewel-match-3 | Puzzle | Match-3 变体 | 待建 |
| 15 | ball-sort | Casual | Ball Sort 解压 | 待建 |
| 16 | water-sort | Casual | Water Sort 解压 | 待建 |

### Tier 2 — 强需求 / 长尾厚
| # | 原创名(slug) | 类型 | 对标热门机制 | 状态 |
|---|---|---|---|---|
| 17 | color-match | Casual | Color Match / Stroop | 待建 |
| 18 | sudoku-classic | Puzzle | Sudoku | 待建 |
| 19 | minesweeper | Puzzle | Minesweeper（回潮） | 待建 |
| 20 | mahjong-solitaire | Puzzle | Mahjong Solitaire | 待建 |
| 21 | word-connect | Puzzle | Wordscapes 类连字 | 待建 |
| 22 | helix-jump | Arcade | Helix Jump 跑酷 | 待建 |
| 23 | stack-ball | Arcade | Stack Ball 跑酷 | 待建 |
| 24 | going-balls | Arcade | 障碍躲避跑酷 | 待建 |
| 25 | paper-territory | Action | Paper.io 领地 | 待建 |
| 26 | hole-fill | Action | Hole.io 吞噬 | 待建 |
| 27 | tower-defense | Strategy | Tower Defense | 待建 |
| 28 | penalty-kick | Sports | 点球 | 待建 |
| 29 | ping-pong | Sports | 乒乓球 | 待建 |
| 30 | connect-four | Board | 四子棋（双人/单人） | 待建 |

### Tier 3 — 利基但长尾精准
| # | 原创名(slug) | 类型 | 对标热门机制 | 状态 |
|---|---|---|---|---|
| 31 | tic-tac-toe | Board | 井字棋 | 待建 |
| 32 | checkers | Board | 跳棋 | 待建 |
| 33 | memory-match | Casual | 记忆翻牌 | 待建 |
| 34 | word-search | Puzzle | 单词搜索 | 待建 |
| 35 | rhythm-tap | Arcade | 节奏点击 | 待建 |
| 36 | solitaire | Puzzle | 纸牌接龙 | 待建 |
| 37 | jigsaw-puzzle | Puzzle | 拼图 | 待建 |
| 38 | slither-arena | Action | Slither.io 蛇 | 待建 |
| 39 | jetpack-runner | Arcade | 喷气背包跑酷 | 待建 |
| 40 | knife-hit | Arcade |  timing 投掷 | 待建 |
| 41 | idle-tycoon | Casual | 极简放置 | 待建 |
| 42 | merge-garden | Casual | Merge 合成 | 待建 |
| 43 | bowling | Sports | 保龄球 | 待建 |
| 44 | billiards-8ball | Sports | 八球 | 待建 |
| 45 | car-drift | Racing | 漂移赛车 | 待建 |
| 46 | monster-truck | Racing | 怪物卡车 | 待建 |
| 47 | pinball | Arcade | 弹珠台 | 待建 |
| 48 | archery | Sports | 射箭 | 待建 |
| 49 | crossword | Puzzle | 填字 | 待建 |
| 50 | brain-teaser | Puzzle | 逻辑脑力 | 待建 |

---

## 5. 每个游戏页的 On-Page SEO 清单（开发时一并做，别等上线后补）

1. **唯一 `<title>`**：`{游戏原创名} – Play Free Online | Darlynmae`（含主词 + 品牌）。
2. **Meta description**：40–80 字，含 1 个长尾词（如 "Play Merge Numbers free online — a relaxing 2048-style number puzzle. No download, no sign-up."）。
3. **原创描述**：每页 40–80 字**原创**简介，绝不抄其他站（避免 thin/duplicate content 被 Google 判低质）。
4. **JSON-LD `Game` schema**：`<script type="application/ld+json">` 含 name / genre / description / url / gamePlatform=WebBrowser。
5. **分类聚合页（hub）**：Puzzle / Arcade / Casual / Action / Sports / Board / Racing / Strategy 各一页，列该分类全部游戏 + 内部链接（相关游戏互链，提升 crawl 与停留）。
6. **Open Graph + Twitter Card**：分享预览图。
7. **技术 SEO**：`sitemap.xml`（含所有 /games/<slug>）、`robots.txt`、`hreflang="en"`、移动端自适应（游戏本身已做 touch）。
8. **速度**：自托管静态 HTML，已天然快；避免塞第三方脚本拖慢 LCP。

---

## 6. 变现触发顺序（呼应全局目标）

1. **现在（Stage A）**：自托管原创游戏 + 逐页 SEO → 攒真实流量（收入 $0，但在建资产）。
2. **流量爬坡中**：接 **站内 AdSense**（来源②，独立线；过审需一定内容量）。
3. **有稳定流量后**：
   - 用 **Gamezop partner**（嵌入分成门槛最低）拿游戏内嵌入分成；
   - 以**开发者身份**把原创游戏投 **GD / CrazyGames** 拿开发者分成（这些游戏本就是原创，过审概率高）。
4. **不要**在流量为 0 时硬嵌 GD（域名未白名单会跳站外、伤留存）。

---

## 7. 待办（下一步由用户拍板）

- [ ] 用真实关键词工具复核本文 Tier 分级与精确搜索量。
- [ ] 按 Tier 1 剩余项（9–16）开始批量产出原创游戏（每个独立 HTML + 一条数据 + 第 5 节 SEO 字段）。
- [ ] 上线后监测 GSC（Google Search Console）实际收录与排名，反哺下一轮开发主题。
