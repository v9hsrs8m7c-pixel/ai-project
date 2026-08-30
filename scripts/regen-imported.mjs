// regen-imported.mjs — 离线重建 games-imported.ts(无需联网)。
// 用法(在 ai-project 目录): node scripts/regen-imported.mjs
// 前提: 已导入的游戏目录在 public/games/<slug>/index.html(由 git checkout 还原或上次导入留下),
//       且 games-imported.ts 含有这些 slug(从 git HEAD 还原后即有)。
// 行为: 读取现有 slug 列表 -> 用每个 index.html 的 <title> 生成更好看的标题 ->
//       剔除 readme/technical/template 等非游戏页 -> 重写 games-imported.ts。
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, basename } from "node:path";

const D = dirname(fileURLToPath(import.meta.url));
const ROOT = join(D, "..");
const GAMES_DIR = join(ROOT, "public/games");
const OUT_TS = join(ROOT, "src/data/sources/selfhosted/games-imported.ts");

const SKIP = /^(readme|technical|template)$/i;

function prettify(name) {
  return name.replace(/^game__/, "").replace(/__v\d+$/i, "")
    .replace(/[-_]+/g, " ").replace(/\.(html?)$/i, "").trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// 优先用 HTML <title>, 否则退回 slug 美化; 避免出现 "Index" 这种空标题。
function titleFromHtml(html, slug) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (m) {
    const t = m[1].replace(/\s+/g, " ").trim();
    if (t && !/^index$/i.test(t)) return t;
  }
  return prettify(slug);
}

// ---- SEO 文案生成(内联, 离线可用, 随 regen 一起写入 games-imported.ts) ----
// 按游戏标题关键词路由到对应类型, 生成英文 简介/玩法/操作/特色/FAQ。
// 仿真器(sim)与工具(tool)走各自模板(用户已知此类偏"水", 先铺满冲收录)。
function faq(pairs) { return pairs.map(([q, a]) => ({ q, a })); }

function seoFor(slug, title) {
  const t = (title || "").toString().trim();
  const L = t.toLowerCase();
  let kind = "generic";
  if (/\btetris\b/.test(L)) kind = "tetris";
  else if (/2048/.test(L)) kind = "2048";
  else if (/snake|뱀|贪吃蛇/.test(L)) kind = "snake";
  else if (/\bpong\b/.test(L)) kind = "pong";
  else if (/flappy/.test(L)) kind = "flappy";
  else if (/gomoku|renju|五子/.test(L)) kind = "gomoku";
  else if (/chess|chaturaji|raumschach|janggi|quoridor/.test(L)) kind = "chess";
  else if (/(^|\s)go(\s|$)|바둑/.test(L)) kind = "go";
  else if (/rubik/.test(L)) kind = "rubik";
  else if (/minecraft|voxel/.test(L)) kind = "minecraft";
  else if (/idle|clicker|wishly|farm/.test(L)) kind = "idle";
  else if (/memory/.test(L)) kind = "memory";
  else if (/blackjack|card counter/.test(L)) kind = "card";
  else if (/bubble\s*shooter|space\s*invader|space\s*battle|星际|thunder|雷霆|shoot\s*the\s*ball|invaders/.test(L)) kind = "shooter";
  else if (/fluid|navier|mandelbrot|black\s*hole|lorenz|tesseract|penteract|simulation|aurora|plume|smoke|vortex|schlieren|three.?body|flatland|therm|cfd|visual/.test(L)) kind = "sim";
  else if (/viewer|sandbox|trainer|indenter|learner|predictor|player|normalization|unity|online\s*html/.test(L)) kind = "tool";
  else if (/untangle|matching|count|defense|car\s*game|ball|rush|trapped|arcade|locked|puzzle|box2d/.test(L)) kind = "puzzle";
  else if (/dual|board|side.?by.?side|infinite/.test(L)) kind = "board";
  return build(kind, t);
}

function build(kind, title) {
  const T = title;
  switch (kind) {
    case "tetris": return {
      description: `Play ${T} online for free — stack falling blocks, clear full lines, and chase a new high score in this timeless HTML5 puzzle.`,
      instructions: "Use arrow keys (or swipe on mobile) to move and rotate the falling pieces; Space hard-drops.",
      content: {
        intro: `${T} is the classic block-stacking puzzle that has hooked players for four decades. Colored tetrominoes fall from the top of the well and you must place them to complete horizontal lines.`,
        gameplay: "Every time you fill a complete row it clears and the stack drops, earning points. The speed ramps up as you score, so quick thinking beats luck. Clearing four lines at once (a Tetris) scores the biggest bonus.",
        controls: "Left/Right arrows move a piece, Up rotates it, Down soft-drops, Space hard-drops. On touch screens, swipe to move and rotate and tap to drop.",
        features: "Endless single-player mode, increasing difficulty, instant restart, and a local high score. No download and no login — just open and play.",
        faq: faq([
          ["Is Tetris free to play?", "Yes, it runs entirely in your browser at no cost."],
          ["Does it work on mobile?", "Yes, touch and swipe controls are supported."],
          ["How do I score higher?", "Clear multiple lines at once, especially a four-line Tetris, for bonus points."],
        ]),
      },
    };
    case "2048": return {
      description: `Play ${T} online for free — slide tiles, merge matching numbers, and reach 2048 in this addictive HTML5 puzzle.`,
      instructions: "Use arrow keys or swipe (mobile) to slide all tiles in one direction.",
      content: {
        intro: `${T} is the minimalist number-merge puzzle: slide tiles on a 4x4 grid and combine equal numbers to climb toward 2048.`,
        gameplay: "Every move spawns a new tile (2 or 4). Tiles with the same number merge into their sum when they collide. The run ends when the board is full and no move is possible.",
        controls: "Arrow keys slide the board; on mobile, swipe in any direction. Some versions add undo and restart buttons.",
        features: "Simple rules, deep strategy, undo support, and instant restarts. Pure browser play, no install.",
        faq: faq([
          ["How do I win?", "Reach the 2048 tile; you can keep going for a higher score after that."],
          ["What happens when the board fills?", "If no slide can merge anything, the game ends."],
          ["Free to play?", "Yes, completely free in your browser."],
        ]),
      },
    };
    case "snake": return {
      description: `Play ${T} free online — guide the growing snake, eat, and avoid biting your own tail.`,
      instructions: "Use arrow keys or swipe (mobile) to steer the snake.",
      content: {
        intro: `${T} is the endlessly replayable arcade classic: steer a hungry snake around the board to gobble food and grow longer.`,
        gameplay: "Each pellet makes the snake longer and bumps your score. The only way to lose is to run into a wall or your own body, so plan your path as the snake stretches.",
        controls: "Arrow keys change direction; on mobile, swipe up/down/left/right. The snake moves continuously, so timing is everything.",
        features: "Instant restarts, increasing tension as you grow, and a local high score. No download required.",
        faq: faq([
          ["How do I score?", "Eat food to grow and add points."],
          ["What ends the game?", "Hitting a wall or your own tail."],
          ["Mobile friendly?", "Yes, swipe controls work on phones."],
        ]),
      },
    };
    case "pong": return {
      description: `Play ${T} free online — the classic paddle game, reimagined in HTML5.`,
      instructions: "Move your paddle with the mouse or arrow keys; keep the ball in play.",
      content: {
        intro: `${T} is the legendary two-paddle game where you bounce a ball past your opponent to score.`,
        gameplay: "Defend your side and angle your returns to beat the other paddle. First to the target score wins the match; rallies speed up as the ball accelerates.",
        controls: "Mouse or Up/Down arrows move the paddle; some modes are local multiplayer against a friend.",
        features: "Timeless arcade feel, local multiplayer option, and instant play with no install.",
        faq: faq([
          ["Can two people play?", "Yes, local multiplayer is supported where available."],
          ["How do I move?", "Mouse or arrow keys control your paddle."],
          ["Free?", "Yes, free in your browser."],
        ]),
      },
    };
    case "flappy": return {
      description: `Play ${T} free online — the addictive one-tap flyer.`,
      instructions: "Tap or press Space to flap; stay airborne between the pipes.",
      content: {
        intro: `${T} is the famously tricky flyer: keep a little bird aloft by tapping at exactly the right moments.`,
        gameplay: "Tap to flap upward, then fall under gravity. Thread through the gaps in the pipes without touching them — each cleared pair adds to your score.",
        controls: "Space or click/tap to flap; release to let gravity pull the bird down. That is the whole control scheme.",
        features: "One-button gameplay, brutal but fair difficulty, and instant retries. Runs anywhere in a browser.",
        faq: faq([
          ["How do I play?", "Tap to flap and avoid the pipes."],
          ["Why is it so hard?", "Tight timing plus gravity make every gap a real challenge."],
          ["Free?", "Yes, no cost to play."],
        ]),
      },
    };
    case "gomoku": return {
      description: `Play ${T} (Five in a Row) free online — place stones, line up five, and win.`,
      instructions: "Click or tap an empty intersection to place your stone.",
      content: {
        intro: `${T} is the classic Gomoku / Renju game where the first player to connect five stones in a row wins.`,
        gameplay: "Take turns dropping stones on the board; block your opponent while building your own unbroken line of five in any direction.",
        controls: "Tap an intersection to play your stone. Many versions offer undo and an AI opponent.",
        features: "Clean board, instant play, human-or-AI matches, and mobile-friendly touch input.",
        faq: faq([
          ["How do you win?", "Connect five of your stones in a row."],
          ["Can I play vs AI?", "Many versions include an AI opponent."],
          ["Free?", "Yes, free to play."],
        ]),
      },
    };
    case "chess": return {
      description: `Play ${T} online for free — a browser chess variant you can enjoy instantly, no download.`,
      instructions: "Click or tap a piece to select it, then choose a legal destination square.",
      content: {
        intro: `${T} takes the world's classic strategy game and reshapes its rules into a fresh variant you can play right here.`,
        gameplay: "Move pieces by the variant's rules to checkmate the opponent. The board and piece behavior follow the specific variant loaded on this page, so read the on-screen notes before you start.",
        controls: "Select a piece and choose a legal square; undo/redo and reset are usually available on screen.",
        features: "Self-contained chess engine, multiple rule twists, and playable on desktop and mobile.",
        faq: faq([
          ["Is this standard chess?", "It is a chess variant with its own rules — check the on-screen guide."],
          ["Can I undo a move?", "Yes, use the undo control if present."],
          ["Free to play?", "Yes."],
        ]),
      },
    };
    case "go": return {
      description: `Play ${T} (Go / Baduk) free in your browser — the deep strategy board game.`,
      instructions: "Click or tap an intersection to place a stone.",
      content: {
        intro: `${T} is the ancient board game of territory, where surrounding more empty space than your opponent wins the game.`,
        gameplay: "Place stones to enclose empty points; surrounded groups are captured and removed. The player controlling more territory at the end wins.",
        controls: "Tap an intersection to play; pass and undo options appear on screen where supported.",
        features: "Full Go rules, scoring support, and playable on desktop and mobile.",
        faq: faq([
          ["How do you win Go?", "Control more territory than your opponent."],
          ["Is it hard to learn?", "The rules are simple; mastery is very deep."],
          ["Free?", "Yes."],
        ]),
      },
    };
    case "rubik": return {
      description: `Solve a 3D Rubik's Cube free in your browser — drag to rotate, scramble, and solve.`,
      instructions: "Drag a face to rotate it; use buttons to scramble or reset.",
      content: {
        intro: `${T} brings the iconic twisty puzzle to your screen as a fully 3D, drag-to-turn cube.`,
        gameplay: "Scramble the cube, then restore every face to a single color by rotating layers. It is the same challenge as the physical toy, with no pieces to lose.",
        controls: "Click-drag a face to turn it; drag the background to orbit the camera.",
        features: "Real-time 3D, scramble/solve helpers, and no physical cube required.",
        faq: faq([
          ["Can I scramble it?", "Yes, a scramble button is provided."],
          ["Does it work on mobile?", "Yes, touch drag is supported."],
          ["Free?", "Yes."],
        ]),
      },
    };
    case "minecraft": return {
      description: `Play ${T} free in your browser — a blocky voxel sandbox you can explore and build.`,
      instructions: "Use WASD to move, mouse to look, click to place or break blocks.",
      content: {
        intro: `${T} is a lightweight, single-file voxel sandbox inspired by building games — mine, place, and shape blocks in a tiny world.`,
        gameplay: "Walk around the chunk, break and place blocks, and construct whatever you imagine within the sandbox. It is a creative playground rather than a goal-based level.",
        controls: "WASD to move, mouse to look and act, Space to jump. Touch controls work on mobile.",
        features: "Instant browser voxel world, creative building, and no download.",
        faq: faq([
          ["Do I need Minecraft installed?", "No, this runs in the browser."],
          ["Can I build things?", "Yes, place and break blocks freely."],
          ["Free?", "Yes."],
        ]),
      },
    };
    case "idle": return {
      description: `Play ${T} free — a relaxing clicker/idle game that grows while you watch.`,
      instructions: "Click or tap to act; let it idle to accumulate over time.",
      content: {
        intro: `${T} is a casual clicker / idle game where small actions snowball into bigger and bigger numbers.`,
        gameplay: "Click to earn, spend on upgrades, and watch your score climb automatically even when you step away. The loop is about efficient upgrading, not reflexes.",
        controls: "Click or tap the main button; use upgrade buttons to progress.",
        features: "Satisfying progression, offline-style growth, and endless upgrades to chase.",
        faq: faq([
          ["What is an idle game?", "One that progresses with minimal input over time."],
          ["Do I need to keep clicking?", "Upgrades let it run on its own."],
          ["Free?", "Yes."],
        ]),
      },
    };
    case "memory": return {
      description: `Play ${T} free online — a memory matching game to train your brain.`,
      instructions: "Click or tap cards to flip and match pairs.",
      content: {
        intro: `${T} is a classic memory / concentration game: find matching pairs by recalling where each card sits.`,
        gameplay: "Flip two cards at a time; matched pairs stay open and mismatches flip back. Clear the whole board to win the round.",
        controls: "Tap a card to reveal it, then tap another to test your memory. Wrong guesses hide both again.",
        features: "Brain training, adjustable difficulty, and quick rounds you can replay.",
        faq: faq([
          ["How do I win?", "Match all the pairs."],
          ["Good for memory?", "Yes, it exercises recall."],
          ["Free?", "Yes."],
        ]),
      },
    };
    case "card": return {
      description: `Train with ${T} free in your browser — a blackjack card-counting trainer.`,
      instructions: "Use the on-screen controls to deal, hit, stand, and track the count.",
      content: {
        intro: `${T} helps you practice counting cards at the blackjack table through repeated simulated hands.`,
        gameplay: "Play hands while the trainer shows the running count; build the habit of true-count estimation and better betting decisions without risking real money.",
        controls: "Buttons deal, hit, and stand; the live count display updates automatically as cards appear.",
        features: "Realistic shoe simulation, live count feedback, and a safe practice mode.",
        faq: faq([
          ["Is this real blackjack?", "It simulates hands for training, not gambling."],
          ["Does it teach counting?", "Yes, with live count feedback."],
          ["Free?", "Yes."],
        ]),
      },
    };
    case "shooter": return {
      description: `Play ${T} free online — a fast arcade shooter you can jump into instantly.`,
      instructions: "Move with arrow keys/WASD, aim and fire with the mouse (or tap on mobile).",
      content: {
        intro: `${T} is an arcade shoot-'em-up: dodge incoming fire and take down waves of enemies.`,
        gameplay: "Survive escalating waves, grab power-ups, and rack up score by clearing the screen. The longer you last, the tougher it gets.",
        controls: "WASD or arrows to move, mouse to aim and shoot; mobile uses a touch joystick plus tap-to-fire.",
        features: "Pulse-pounding action, power-ups, instant restarts, and no install.",
        faq: faq([
          ["How do I shoot?", "Aim with the mouse and click; mobile taps fire."],
          ["Is it hard?", "It ramps up, but practice quickly improves your runs."],
          ["Free?", "Yes."],
        ]),
      },
    };
    case "sim": return {
      description: `Explore ${T} free in your browser — a real-time interactive HTML5 simulation you can tweak and watch unfold.`,
      instructions: "Move your mouse or drag the on-screen controls; on mobile, tap and drag to interact.",
      content: {
        intro: `${T} is an interactive browser simulation that turns a piece of math or physics into something you can poke at in real time.`,
        gameplay: "Adjust the on-screen parameters and watch the visualization respond instantly. There is no win or lose — the fun is in experimenting and discovering patterns.",
        controls: "Click and drag to influence the scene; use any buttons or sliders to change settings. Touch works on mobile.",
        features: "Real-time rendering, fully client-side, educational and relaxing. Great for curiosity and screenshots.",
        faq: faq([
          ["Is this a game or a simulation?", "It is an interactive simulation — explore rather than compete."],
          ["Can I use it for learning?", "Yes, it visualizes real concepts you can experiment with."],
          ["Does it need a powerful PC?", "It runs in the browser; modern devices handle it smoothly."],
        ]),
      },
    };
    case "tool": return {
      description: `Use ${T} free in your browser — a handy single-file HTML5 tool, no install needed.`,
      instructions: "Follow the on-screen UI; use your mouse/keyboard, and touch on mobile.",
      content: {
        intro: `${T} is a small browser-based utility packaged as a single HTML5 file. It does one job and does it without any install or account.`,
        gameplay: "Open it, use the interface, and get your result. It is built for quick tasks rather than long sessions.",
        controls: "Standard form controls, buttons, and drag interactions. Mobile touch is supported.",
        features: "Portable single file, private (runs locally), and instantly available whenever you need it.",
        faq: faq([
          ["Is my data uploaded?", "No, it runs entirely in your browser."],
          ["Do I need to install anything?", "No, just open the page."],
          ["Is it free?", "Yes."],
        ]),
      },
    };
    case "puzzle": return {
      description: `Play ${T} free online — a quick browser puzzle to solve in a spare minute.`,
      instructions: "Use the mouse or arrow keys; on mobile, tap and drag to play.",
      content: {
        intro: `${T} is a compact browser puzzle built for short, satisfying sessions.`,
        gameplay: "Read the on-screen goal and solve it with a mix of logic and timing; most rounds take under a minute, so it is easy to replay.",
        controls: "Click or drag to interact; arrow keys where movement matters.",
        features: "Bite-sized challenges, instant restarts, and no login required.",
        faq: faq([
          ["How long is a round?", "Usually under a minute."],
          ["Do I need to sign up?", "No account needed."],
          ["Free?", "Yes."],
        ]),
      },
    };
    case "board": return {
      description: `Play ${T} free in your browser — a board game variant with a fresh twist.`,
      instructions: "Click or tap a piece, then choose its destination square.",
      content: {
        intro: `${T} puts a clever spin on a familiar board game, playable right here in your browser.`,
        gameplay: "Move pieces by the rules shown on screen to outplay your opponent or solve the layout. Each variant changes the strategy in an interesting way.",
        controls: "Select and place pieces with mouse or touch; undo and reset where available.",
        features: "Unique ruleset, self-contained engine, and desktop and mobile support.",
        faq: faq([
          ["What makes it different?", "It applies a variant ruleset to a classic board game."],
          ["Free to play?", "Yes."],
          ["Mobile friendly?", "Yes."],
        ]),
      },
    };
    default: return {
      description: `Play ${T} free in your browser — a lightweight single-file HTML5 game, no download required.`,
      instructions: "Use your mouse and keyboard; on mobile, tap and swipe to interact.",
      content: {
        intro: `${T} is a browser-based HTML5 game you can jump into instantly. Everything runs client-side, so there is nothing to install.`,
        gameplay: "The goal and rules are shown on screen as you play. Sessions are short and replayable, making it easy to fit a quick round between tasks.",
        controls: "Most actions use the mouse or arrow keys; mobile players can tap, drag, and swipe.",
        features: "Zero install, fast load, and a self-contained single file that works on desktop and phone alike.",
        faq: faq([
          ["Do I need to sign up?", "No account is required."],
          ["Can I play on my phone?", "Yes, the game is touch-friendly."],
          ["Is it free?", "Yes, completely free to play."],
        ]),
      },
    };
  }
}

function buildOut(entries) {
  const lines = entries.map((e) => {
    const seo = seoFor(e.slug, e.title);
    const c = seo.content;
    const faqStr = c.faq.map((f) => `{ q:${JSON.stringify(f.q)}, a:${JSON.stringify(f.a)} }`).join(", ");
    return `  { id:"imp-${e.slug}", slug:${JSON.stringify(e.slug)}, title:${JSON.stringify(e.title)}, category:"imported", description:${JSON.stringify(seo.description)}, emoji:"🎮", url:"/games/${e.slug}/", rating:4.5, plays:"0", siteIds:["default"], embedUrl:"/games/${e.slug}/index.html", instructions:${JSON.stringify(seo.instructions)}, content:{intro:${JSON.stringify(c.intro)},gameplay:${JSON.stringify(c.gameplay)},controls:${JSON.stringify(c.controls)},features:${JSON.stringify(c.features)},faq:[${faqStr}]}, width:480, height:480, tags:[], source:"selfhosted", featured:false, popular:false, isNew:true },`;
  }).join("\n");
  return `import type { Game } from "../../../config/types.ts";\n\n// 从 GitHub 导入的 HTML5 游戏(经筛 MIT)。Generated by scripts/import-games.mjs / regen-imported.mjs. 保留原作者署名。\nconst IMPORTED: Game[] = [\n${lines}\n];\n\nexport function getImportedGames(): Game[] { return IMPORTED; }\n`;
}

function run() {
  if (!existsSync(OUT_TS)) { console.error("games-imported.ts 不存在, 无法重建。"); process.exit(1); }
  const txt = readFileSync(OUT_TS, "utf8");
  const slugs = [...txt.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
  console.log(`读到 ${slugs.length} 个 slug, 开始离线重建标题...`);

  const seen = new Set();
  const entries = [];
  for (const slug of slugs) {
    if (SKIP.test(slug)) { console.log("  跳过非游戏页:", slug); continue; }
    const f = join(GAMES_DIR, slug, "index.html");
    if (!existsSync(f)) { console.log("  缺失文件, 跳过:", slug); continue; }
    if (seen.has(slug)) continue;
    const html = readFileSync(f, "utf8");
    const title = titleFromHtml(html, slug);
    seen.add(slug);
    entries.push({ slug, title });
    console.log("  ", slug, "=>", title);
  }

  writeFileSync(OUT_TS, buildOut(entries));
  console.log(`\n重建完成: ${entries.length} 款(原 ${slugs.length}, 跳过 ${slugs.length - entries.length})。已写 games-imported.ts。`);
}

run();
