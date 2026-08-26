// import-games.mjs — 从 GitHub 公开仓库导入 HTML5 游戏到 darlynmae。
// 沙箱无法连 GitHub, 请在用户本机运行 (Node 22+), 推荐用 Git Bash:
//   cd /c/Users/Apple/WorkBuddy/2026-08-18-21-34-42/ai-project
//   /c/Users/Apple/.workbuddy/binaries/node/versions/22.22.2/node.exe scripts/import-games.mjs
//
// 做法: 下载仓库 tarball(codeload, 免 API 配额), 解包后扫描 .html,
//   自包含单文件 -> 直接作为 index.html; 含本地依赖(js/css/图片) -> 整父目录打包,
//   保证 iframe 内引用可解析。仅收录明确 MIT 仓库(商用合规), 并在游戏页保留署名。
import { writeFileSync, mkdirSync, readFileSync, rmSync, existsSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative, basename } from "node:path";
import { execSync } from "node:child_process";
import { tmpdir } from "node:os";

const D = dirname(fileURLToPath(import.meta.url));
const ROOT = join(D, "..");
const GAMES_DIR = join(ROOT, "public/games");
const OUT_TS = join(ROOT, "src/data/sources/selfhosted/games-imported.ts");

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

// 含本地/相对路径依赖时才需整包; 公共 CDN(https://) 或协议相对(//)浏览器可直连, 视为自包含。
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

function copyTree(srcDir, dstDir, filter) {
  mkdirSync(dstDir, { recursive: true });
  for (const e of readdirSync(srcDir)) {
    if (e === ".git" || e === "node_modules" || e === ".github") continue;
    const sp = join(srcDir, e), dp = join(dstDir, e);
    const st = statSync(sp);
    if (st.isDirectory()) copyTree(sp, dp, filter);
    else if (filter(e)) copyFileSync(sp, dp);
  }
}

function walk(dir, cb) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, cb);
    else cb(p);
  }
}

async function run() {
  cleanupPrevious();
  const tmp = join(tmpdir(), "darlynmae-import-" + Date.now());
  mkdirSync(tmp, { recursive: true });
  const entries = [];
  let imported = 0, skipped = 0;

  for (const t of targets) {
    const repo = t.repo;
    const owner = repo.split("/")[0];
    const name = repo.split("/")[1];
    console.log(`\n== ${repo} ==`);
    let branch = null, tarOk = false;
    for (const b of ["main", "master"]) {
      const url = `https://codeload.github.com/${repo}/tar.gz/${b}`;
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        writeFileSync(join(tmp, "repo.tgz"), Buffer.from(await res.arrayBuffer()));
        branch = b; tarOk = true; break;
      } catch { continue; }
    }
    if (!tarOk) { console.warn("  下载失败, 跳过"); skipped++; continue; }

    const exDir = join(tmp, "extracted");
    rmSync(exDir, { recursive: true, force: true });
    try { execSync(`tar -xzf "${join(tmp, "repo.tgz")}" -C "${tmp}"`, { stdio: "ignore" }); }
    catch (e) { console.warn("  解包失败:", e.message); skipped++; continue; }

    const base = join(tmp, `${name}-${branch}`);
    if (!existsSync(base)) { console.warn("  解包结构异常, 跳过"); skipped++; continue; }

    let htmls = [];
    walk(base, (p) => { if (/\.html?$/i.test(p) && !/template/i.test(basename(p))) htmls.push(p); });
    if (!htmls.length) { console.warn("  未发现 .html, 跳过"); skipped++; continue; }

    // 若仓库根有"大厅"index.html 且游戏在子目录, 跳过根大厅(链接会断)。
    const rels = htmls.map((p) => relative(base, p));
    const hasSub = rels.some((r) => dirnameOf(r) !== ".");
    if (hasSub) htmls = htmls.filter((p) => dirnameOf(relative(base, p)) !== ".");

    for (const hp of htmls) {
      const fn = basename(hp);
      const html = readFileSync(hp, "utf8");
      const slug = uniqSlug(fn.replace(/\.html?$/i, ""), owner);
      const dst = join(GAMES_DIR, slug);
      rmSync(dst, { recursive: true, force: true });
      let embed = "index.html";
      if (hasLocalDep(html)) {
        copyTree(dirname(hp), dst, (f) => !/^(readme|license|claude|skill)/i.test(f) && !/\.(md|txt)$/i.test(f));
        if (existsSync(join(dst, "index.html"))) embed = "index.html";
        else if (existsSync(join(dst, "index.htm"))) embed = "index.htm";
        else embed = fn;
      } else {
        mkdirSync(dst, { recursive: true });
        writeFileSync(join(dst, "index.html"), html);
      }
      console.log("  导入", slug, `(${repo})`);
      imported++;
      entries.push({ slug, title: prettify(fn), embed });
    }
  }
  rmSync(tmp, { recursive: true, force: true });

  const out = `import type { Game } from "../../../config/types.ts";\n\n// 从 GitHub 导入的 HTML5 游戏(经筛 MIT)。Generated by scripts/import-games.mjs. 保留原作者署名。\nconst IMPORTED: Game[] = [\n${
    entries.map((e) =>
      `  { id:"imp-${e.slug}", slug:${JSON.stringify(e.slug)}, title:${JSON.stringify(e.title)}, category:"imported", description:"Imported HTML5 game.", emoji:"🎮", url:"/games/${e.slug}/", rating:4.5, plays:"0", siteIds:["default"], embedUrl:"/games/${e.slug}/${e.embed}", instructions:"Play with mouse or keyboard.", content:{intro:"",gameplay:"",controls:"",features:"",faq:[]}, width:480, height:480, tags:[], source:"selfhosted", featured:false, popular:false, isNew:true },`
    ).join("\n")
  }\n];\n\nexport function getImportedGames(): Game[] { return IMPORTED; }\n`;
  writeFileSync(OUT_TS, out);
  console.log(`\n导入 ${imported} 款, 跳过 ${skipped} 款。已写 games-imported.ts。`);
  console.log("下一步: tsc 校验(可选) -> 本机 sync-games.ps1 或 git push 上线。");
}

// 小工具: 取相对路径的父目录("." 表示根)
function dirnameOf(rel) {
  const i = rel.lastIndexOf("/");
  return i < 0 ? "." : rel.slice(0, i);
}

run().catch((e) => { console.error(e); process.exit(1); });
