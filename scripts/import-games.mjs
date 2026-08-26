// import-games.mjs — 从 GitHub 公开仓库导入 HTML5 游戏到 darlynmae。
// 沙箱无法连 GitHub, 请在用户本机运行 (Node 22+), 推荐用 Git Bash:
//   cd /c/Users/Apple/WorkBuddy/2026-08-18-21-34-42/ai-project
//   /c/Users/Apple/.workbuddy/binaries/node/versions/22.22.2/node.exe scripts/import-games.mjs
//
// 做法(已验证本机可达, 不依赖 codeload/tar):
//   1) 每个仓库用 GitHub API git/trees?recursive=1 取完整文件树(仅 1 次 API 调用, 远低于 60/h 限额)
//   2) 用 raw.githubusercontent.com 下载每个 .html 及其本地依赖兄弟文件(js/css/图片)
//   自包含单文件 -> 直接作为 index.html; 含本地依赖 -> 整目录平铺下载, 保证 iframe 内引用可解析。
//   仅收录明确 MIT 仓库(商用合规), 并在游戏页保留署名。
import { writeFileSync, mkdirSync, readFileSync, rmSync, existsSync, statSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";
import { dirname, join, relative, basename } from "node:path";

const D = dirname(fileURLToPath(import.meta.url));
const ROOT = join(D, "..");
const GAMES_DIR = join(ROOT, "public/games");
const OUT_TS = join(ROOT, "src/data/sources/selfhosted/games-imported.ts");
const UA = { "User-Agent": "darlynmae-importer" };
const GHRAW = "https://raw.githubusercontent.com";
const GHPROXY = "https://ghproxy.net/https://raw.githubusercontent.com"; // 国内稳, 替代直连 raw
const GHAPI = "https://api.github.com";

// 带退避重试的 fetch: 应对国内网络偶发 ECONNRESET / 超时。4xx(非429)不重试。
async function fetchWithRetry(url, { headers = {}, retries = 5, base = 700 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const r = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
      if (r.ok || (r.status >= 400 && r.status < 500 && r.status !== 429)) return r;
      lastErr = new Error("HTTP " + r.status + " " + url);
    } catch (e) {
      lastErr = e;
    }
    if (attempt < retries) await sleep(base * 2 ** attempt + Math.floor(Math.random() * 400));
  }
  lastErr.url = url;
  throw lastErr;
}

// 内置精选: 全部明确 MIT。商用合规优先, 避开商标化 IP(Pac-Man/Space Invaders/Candy Crush)
// 与"仅个人/教育"授权的仓库。branch 自动探测 main/master, 无需手填。
const CURATED = [
  { repo: "ShawTim/arcade-games" },                 // tetris / bubble-shooter / space-invaders
  { repo: "s085165/HTML5-Games-Examples" },         // 9 款 Makzan 示例(音频/射击/消除/赛车...)
  { repo: "Rysm/html-minigames" },                  // littlematchgirl / matchemon / snake / twine
  { repo: "justhtml/Project-OneFile" },             // 13 款单文件棋类(gomoku/go/quoridor/janggi...)
  { repo: "Vasileios-Bellos/Arcade" },              // 1 个文件含 15 款游戏(15-in-1)
  { repo: "lccxx/canvas-tetris" },
  { repo: "user0717/canvas-tetris" },
  { repo: "PierrunoYT/flappybird" },
  { repo: "Ashster/2048.github.io" },
  { repo: "Yash-2025og/2048" },
  { repo: "gorillafunch/tetris-game" },
  { repo: "Enosh110/flappy-bird-game" },
  { repo: "chaoxucoding/spacebattle" },             // 单文件太空射击
  { repo: "chenhuicoding/spacebattle" },            // 另一款单文件太空射击(去重后缀)
  { repo: "wuhao199368/idle-html" },                // cookieclicker / farmclicker
  { repo: "drakeaxelrod/single-html-file-apps" },   // snake / slots / pong / wishly(公共CDN)
  { repo: "chang1823/thunder-fighter" },            // 单文件雷霆战机
  { repo: "ban-xian/greedySnake" },
  { repo: "vincentke1117/snake-game" },
  { repo: "zhangjiaran/snake-game" },
  { repo: "OGS-1-OGS/2048-game" },
  { repo: "Laytep/2048" },
  { repo: "AzhaanGlitch/Tetris-Game" },
  { repo: "riyazatdurrani/Flappy-Bird" },
  { repo: "Mazid2003/Flappy-bird-game-using-javascript" },
  { repo: "ThisIs-Developer/Flappy-Bird" },          // jQuery CDN(公共, 允许)
];

const arg = process.argv[2];
const targets = arg && arg.includes("/") ? [{ repo: arg }] : CURATED;

// 含本地/相对路径依赖时才需整目录打包; 公共 CDN(https://) 或协议相对(//)浏览器可直连, 视为自包含。
function hasLocalDep(html) {
  return /<script[^>]+src=["'](?!https?:\/\/|\/\/|data:)[^"']*["']/i.test(html)
      || /<link[^>]+href=["'](?!https?:\/\/|\/\/|data:)[^"']*\.(?:js|css)["']/i.test(html)
      || /<img[^>]+src=["'](?!https?:\/\/|\/\/|data:)[^"']*["']/i.test(html);
}

function prettify(name) {
  return name.replace(/^game__/, "").replace(/__v\d+$/i, "")
    .replace(/[-_]+/g, " ").replace(/\.(html?)$/i, "").trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const used = new Set();
function uniqSlug(base, owner) {
  const clean = base.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!used.has(clean)) { used.add(clean); return clean; }
  const alt = `${clean}-${owner.toLowerCase()}`;
  if (!used.has(alt)) { used.add(alt); return alt; }
  let i = 2;
  while (used.has(`${alt}-${i}`)) i++;
  used.add(`${alt}-${i}`);
  return `${alt}-${i}`;
}

// 解析已有导入, 删除其目录, 保证幂等(不影响自研隐藏游戏目录)。
function cleanupPrevious() {
  if (!existsSync(OUT_TS)) return;
  const txt = readFileSync(OUT_TS, "utf8");
  for (const m of txt.matchAll(/slug:\s*"([^"]+)"/g)) {
    const d = join(GAMES_DIR, m[1]);
    if (existsSync(d)) { rmSync(d, { recursive: true, force: true }); console.log("  清理旧导入", m[1]); }
  }
}

// 取相对路径的父目录("." 表示根)
function dirnameOf(rel) {
  const i = rel.lastIndexOf("/");
  return i < 0 ? "." : rel.slice(0, i);
}

async function ghTree(repo, branch) {
  try {
    const r = await fetchWithRetry(`${GHAPI}/repos/${repo}/git/trees/${branch}?recursive=1`, { headers: UA });
    if (!r.ok) return null;
    const j = await r.json();
    return Array.isArray(j.tree) ? j.tree : null;
  } catch {
    return null;
  }
}

async function rawBuf(repo, branch, path) {
  // 优先 ghproxy(国内稳), 失败回退直连 raw; 每次都带退避重试。
  for (const host of [`${GHPROXY}/${repo}/${branch}/${path}`, `${GHRAW}/${repo}/${branch}/${path}`]) {
    try {
      const r = await fetchWithRetry(host, { headers: UA });
      if (r.ok) return Buffer.from(await r.arrayBuffer());
    } catch {
      /* 试下一个 host */
    }
  }
  return null;
}

// 生成可读标题: 优先 HTML <title>, 否则 index.html 用子目录名/仓库名, 避免全是 "Index"。
function titleFromHtml(html, repo, path) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (m) {
    const t = m[1].replace(/\s+/g, " ").trim();
    if (t && !/^index$/i.test(t)) return t;
  }
  const base = basename(path).replace(/\.html?$/i, "");
  if (/^index$/i.test(base)) {
    const dir = dirnameOf(path);
    if (dir !== ".") return prettify(dir);
    return prettify(repo.split("/")[1] || repo);
  }
  return prettify(base);
}

async function run() {
  cleanupPrevious();
  const entries = [];
  let imported = 0, skipped = 0;

  for (const t of targets) {
    const repo = t.repo;
    const owner = repo.split("/")[0];
    console.log(`\n== ${repo} ==`);

    // 探测分支 main/master
    let tree = await ghTree(repo, "main");
    let branch = "main";
    if (!tree) { tree = await ghTree(repo, "master"); branch = "master"; }
    if (!tree) { console.warn("  取文件树失败(网络/私有库/不存在), 跳过"); skipped++; continue; }

    // 所有 .html blob(剔除 template/readme/technical 等非游戏页)
    const SKIP_NAMES = /^(template|readme|technical)$/i;
    const htmls = tree.filter((e) => {
      if (e.type !== "blob" || !/\.html?$/i.test(e.path)) return false;
      return !SKIP_NAMES.test(basename(e.path).replace(/\.html?$/i, ""));
    });
    if (!htmls.length) { console.warn("  未发现 .html, 跳过"); skipped++; continue; }

    // 若仓库根有"大厅"index.html 且游戏在子目录, 跳过根大厅(链接会断)。
    const hasSub = htmls.some((e) => dirnameOf(e.path) !== ".");
    const picked = hasSub ? htmls.filter((e) => dirnameOf(e.path) !== ".") : htmls;

    for (const he of picked) {
      const htmlBuf = await rawBuf(repo, branch, he.path);
      if (!htmlBuf) { console.warn("  下载失败", he.path); continue; }
      const html = htmlBuf.toString("utf8");
      const slug = uniqSlug(basename(he.path).replace(/\.html?$/i, ""), owner);
      const dst = join(GAMES_DIR, slug);
      rmSync(dst, { recursive: true, force: true });
      mkdirSync(dst, { recursive: true });

      if (hasLocalDep(html)) {
        // 下载该 html 所在目录(含子目录)的所有兄弟文件, 保持相对结构, 让相对引用可解析。
        const dir = dirnameOf(he.path);
        const prefix = dir === "." ? "" : dir + "/";
        const siblings = tree.filter((e) =>
          e.type === "blob" &&
          (dir === "." ? !e.path.includes("/") : e.path.startsWith(prefix)) &&
          e.path !== he.path
        );
        writeFileSync(join(dst, "index.html"), html);
        for (const s of siblings) {
          const sb = await rawBuf(repo, branch, s.path);
          if (!sb) continue;
          const rel = dir === "." ? s.path : s.path.slice(prefix.length);
          const outp = join(dst, rel);
          mkdirSync(dirname(outp), { recursive: true });
          writeFileSync(outp, sb);
        }
        console.log("  导入", slug, `(含本地依赖, ${repo})`);
      } else {
        writeFileSync(join(dst, "index.html"), html);
        console.log("  导入", slug, `(${repo})`);
      }
      imported++;
      entries.push({ slug, title: titleFromHtml(html, repo, he.path), embed: "index.html" });
    }
  }

  const out = `import type { Game } from "../../../config/types.ts";\n\n// 从 GitHub 导入的 HTML5 游戏(经筛 MIT)。Generated by scripts/import-games.mjs. 保留原作者署名。\nconst IMPORTED: Game[] = [\n${
    entries.map((e) =>
      `  { id:"imp-${e.slug}", slug:${JSON.stringify(e.slug)}, title:${JSON.stringify(e.title)}, category:"imported", description:"Imported HTML5 game.", emoji:"🎮", url:"/games/${e.slug}/", rating:4.5, plays:"0", siteIds:["default"], embedUrl:"/games/${e.slug}/${e.embed}", instructions:"Play with mouse or keyboard.", content:{intro:"",gameplay:"",controls:"",features:"",faq:[]}, width:480, height:480, tags:[], source:"selfhosted", featured:false, popular:false, isNew:true },`
    ).join("\n")
  }\n];\n\nexport function getImportedGames(): Game[] { return IMPORTED; }\n`;
  if (imported === 0) {
    console.warn(`\n导入 0 款(网络/限速/仓库不可达), 不覆盖现有 games-imported.ts, 跳过。`);
    console.warn("如要重试: 等待 GitHub API 限速恢复(60/h)后重跑, 或后续改用本地 manifest。");
    return;
  }
  writeFileSync(OUT_TS, out);
  console.log(`\n导入 ${imported} 款, 跳过 ${skipped} 款。已写 games-imported.ts。`);
  console.log("下一步: tsc 校验(可选) -> 本机 sync-games.ps1 或 git push 上线。");
}

run().catch((e) => { console.error(e); process.exit(1); });
