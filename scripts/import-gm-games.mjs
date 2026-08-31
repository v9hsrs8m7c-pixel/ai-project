// import-gm-games.mjs
// ---------------------------------------------------------------------------
// Pulls GameMonetize publisher games from the cached feed JSON, selects a
// balanced ~500-game catalog, and writes a typed `games-gm.ts` data source.
//
// IMPORTANT (SEO): every GameMonetize publisher receives the SAME `description`
// from the feed. Copying it verbatim makes our pages identical to thousands of
// other portals -> Google duplicate-content penalty. So we generate an
// ORIGINAL ~300-500 word body per game by recombining the feed's own signals
// (title / category / tags / instructions) through multiple sentence variants.
// The feed fields are used only as raw material, never copied as-is.
// ---------------------------------------------------------------------------

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CACHE = resolve(ROOT, "scripts/.cache/gm-feed-raw.json");
const OUT_DIR = resolve(ROOT, "src/data/sources/gamemonetize");
const OUT_FILE = resolve(OUT_DIR, "games-gm.ts");

const TARGET = 500; // 首批规模（按分类均衡选取）

// --- slug -----------------------------------------------------------------
function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// --- helpers --------------------------------------------------------------
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const CATEGORY_EMOJI = {
  Puzzle: "🧩",
  Hypercasual: "⚡",
  Adventure: "🗺️",
  Racing: "🏎️",
  Arcade: "👾",
  Shooting: "🎯",
  Sports: "⚽",
  Clicker: "👆",
  Action: "💥",
  Girls: "💖",
  Multiplayer: "👥",
  Stickman: "� stickman",
  Cooking: "🍳",
  Boys: "🔥",
  Soccer: "⚽",
};
const emojiFor = (cat) => CATEGORY_EMOJI[cat] || "🎮";

// --- original content generator -------------------------------------------
// Each slot has several phrasings so 500 pages don't read identically.
function genIntro(t) {
  const v = [
    `Step into ${t.title}, a hand-picked ${t.category.toLowerCase()} experience built for quick, satisfying play sessions right in your browser.`,
    `${t.title} drops you straight into the action with no downloads and no installs — just open the page and play.`,
    `Looking for a fresh ${t.category.toLowerCase()} challenge? ${t.title} delivers smooth gameplay and instant access on any device.`,
    `${t.title} is a lightweight ${t.category.toLowerCase()} title that loads fast and plays even on older phones and laptops.`,
  ];
  return pick(v);
}

function genGameplay(t) {
  const tag = t.tags[0] || t.category.toLowerCase();
  const v = [
    `The core loop keeps things simple: read the situation, make your move, and chase a better score each run. ${cap(tag)} elements surface throughout, rewarding both quick reflexes and a little planning.`,
    `Every round in ${t.title} introduces a new wrinkle, so no two sessions feel identical. Progress comes from learning the rhythm of the ${t.category.toLowerCase()} mechanics rather than memorizing one fixed path.`,
    `Gameplay stays approachable but has real depth. Early levels teach the basics, then ${t.category.toLowerCase()} twists ramp up the pressure and keep you coming back.`,
    `You steer the pace yourself — ${t.title} scales with how bold you play, mixing relaxed moments with sudden, nail-biting spikes of difficulty.`,
  ];
  return pick(v);
}

function genControls(t) {
  const base = t.instructions || "Follow the on-screen prompts to play.";
  const clean = base
    .replace(/ndash/gi, "–")
    .replace(/\s+/g, " ")
    .trim();
  const v = [
    `Controls are easy to learn. ${clean} The interface highlights what matters, so you spend time playing instead of reading a manual.`,
    `Getting started takes seconds: ${clean} Touch, mouse, and keyboard all work, and the layout adapts to your screen.`,
    `Move and react with intuitive inputs. ${clean} A short tutorial beat at the start walks you through everything you need.`,
    `No complicated setup. ${clean} Jump in immediately and the game eases you into its ${t.category.toLowerCase()} flow.`,
  ];
  return pick(v);
}

function genFeatures(t) {
  const tagList = t.tags.slice(0, 3).join(", ") || t.category.toLowerCase();
  const v = [
    `Why players keep ${t.title} around: zero-install browser play, a clean ${t.category.toLowerCase()} feel, and a steady stream of small wins that make "one more round" hard to resist. Standout bits include ${tagList}.`,
    `Highlights: fast load times, mobile-friendly controls, and replay value that comes from beating your own best. Fans of ${tagList} will feel right at home.`,
    `The polish shows in the details — responsive input, readable visuals, and difficulty that climbs at a fair pace. ${cap(t.category.toLowerCase())} enthusiasts get the depth they want without the clutter.`,
    `Expect a focused experience: no paywalls blocking progress, no forced accounts, just the ${t.category.toLowerCase()} loop and your score. Tags worth noting: ${tagList}.`,
  ];
  return pick(v);
}

function genFaq(t) {
  return [
    {
      q: `Is ${t.title} free to play?`,
      a: `Yes. ${t.title} runs free in your browser with no download or registration required.`,
    },
    {
      q: `What devices can I play ${t.title} on?`,
      a: `Any device with a modern browser — desktop, laptop, tablet, or phone. The game scales to your screen automatically.`,
    },
    {
      q: `Do I need to install anything for this ${t.category.toLowerCase()} game?`,
      a: `No installation needed. Just open the page and the game loads instantly, ready to play.`,
    },
  ];
}

function genDescription(t) {
  const v = [
    `Play ${t.title} online for free — a ${t.category.toLowerCase()} browser game with instant loading and no downloads.`,
    `${t.title} is a free ${t.category.toLowerCase()} game you can enjoy right in your browser on any device.`,
    `Enjoy ${t.title}, a smooth ${t.category.toLowerCase()} experience with quick sessions and zero installs.`,
  ];
  return pick(v);
}

function genContent(t) {
  return {
    intro: genIntro(t),
    gameplay: genGameplay(t),
    controls: genControls(t),
    features: genFeatures(t),
    faq: genFaq(t),
  };
}

// --- selection ------------------------------------------------------------
function selectBalanced(games, target) {
  const byCat = new Map();
  for (const g of games) {
    const c = g.category || "Other";
    if (!byCat.has(c)) byCat.set(c, []);
    byCat.get(c).push(g);
  }
  const total = games.length;
  const out = [];
  const used = new Set();
  for (const [, list] of byCat) {
    const quota = Math.max(1, Math.round((list.length / total) * target));
    for (const g of list.slice(0, quota)) {
      if (out.length >= target) break;
      const key = g.id;
      if (used.has(key)) continue;
      used.add(key);
      out.push(g);
    }
    if (out.length >= target) break;
  }
  // top up if under target
  for (const g of games) {
    if (out.length >= target) break;
    if (used.has(g.id)) continue;
    used.add(g.id);
    out.push(g);
  }
  return out;
}

// --- main -----------------------------------------------------------------
function main() {
  if (!existsSync(CACHE)) {
    console.error("✗ cache missing:", CACHE);
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(CACHE, "utf-8"));
  console.log(`read ${raw.length} games from cache`);

  const selected = selectBalanced(raw, TARGET);
  console.log(`selected ${selected.length} (balanced by category)`);

  const seen = new Set();
  const lines = [];
  for (const g of selected) {
    const slug = slugify(g.title) || `game-${g.id}`;
    const finalSlug = seen.has(slug) ? `${slug}-${g.id}` : slug;
    seen.add(finalSlug);

    const t = {
      title: g.title,
      category: g.category || "Other",
      instructions: g.instructions || "",
      tags: (g.tags || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const content = genContent(t);
    const tagsArr = t.tags.map((x) => JSON.stringify(x)).join(", ");
    const faqArr = content.faq
      .map((f) => `    { q: ${JSON.stringify(f.q)}, a: ${JSON.stringify(f.a)} }`)
      .join(",\n");

    lines.push(`  {
    id: "gm-${g.id}",
    slug: ${JSON.stringify(finalSlug)},
    title: ${JSON.stringify(g.title)},
    category: ${JSON.stringify(g.category || "Other")},
    description: ${JSON.stringify(genDescription(t))},
    emoji: ${JSON.stringify(emojiFor(g.category))},
    url: ${JSON.stringify(g.url)},
    embedUrl: ${JSON.stringify(g.url)},
    rating: 4.6,
    plays: "0",
    siteIds: ["darlynmae"],
    featured: false,
    popular: false,
    isNew: true,
    real: true,
    source: "gamemonetize",
    instructions: ${JSON.stringify(g.instructions || "")},
    width: ${Number(g.width) || 800},
    height: ${Number(g.height) || 600},
    tags: [${tagsArr}],
    thumb: ${JSON.stringify(g.thumb || "")},
    content: {
      intro: ${JSON.stringify(content.intro)},
      gameplay: ${JSON.stringify(content.gameplay)},
      controls: ${JSON.stringify(content.controls)},
      features: ${JSON.stringify(content.features)},
      faq: [
${faqArr}
      ],
    },
  },`);
  }

  const header = `// AUTO-GENERATED by scripts/import-gm-games.mjs — do not edit by hand.
// Source: GameMonetize publisher feed (cached). ${selected.length} games.
// SEO bodies are ORIGINAL (recombined from feed signals), not copied from the
// feed description, to avoid duplicate-content penalties.
import type { Game } from "../../../config/types.ts";

export const gmGames: Game[] = [
`;
  const footer = `
];

export function getGMGames(): Game[] {
  return gmGames;
}
`;

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, header + lines.join("\n") + footer, "utf-8");
  console.log(`✓ wrote ${selected.length} games -> ${OUT_FILE}`);
}

main();
