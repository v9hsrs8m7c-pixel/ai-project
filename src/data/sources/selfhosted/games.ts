import type { Game } from "../../../config/types.ts";

// Self-hosted original HTML5 games (Stage A).
//
// These are OUR OWN games served from /public/games/<slug>/index.html. They
// are original implementations of popular *genres* (2048, snake, breakout,
// flappy, bubble shooter, .io eat, tetris, top-down shooter) with original
// art and names — no cloned IP, which is required to later pass CrazyGames /
// Poki / GD developer review.
//
// Why self-host now: every "embed someone else's games & earn" network gates
// you behind approval (GD rejected us for low traffic). Self-hosted games are
// jump-free, fully owned, and build real on-site playable content + SEO while
// we accumulate the traffic needed to clear those gates later.
//
// Each entry points `embedUrl` at a local path under /public so GameEmbed
// renders it as a plain iframe with no third-party referrer.

const SELF_HOSTED: Game[] = [
  {
    id: "sh-merge-numbers",
    slug: "merge-numbers",
    title: "Merge Numbers",
    category: "Puzzle",
    description:
      "Slide the tiles, merge equal numbers, and chase the elusive 2048 tile in this relaxing number puzzle.",
    emoji: "🧩",
    url: "/games/merge-numbers/",
    rating: 4.7,
    plays: "0",
    siteIds: ["default"],
    embedUrl: "/games/merge-numbers/index.html",
    instructions: "Use arrow keys or swipe to merge matching tiles. Reach 2048 to win.",
    width: 480,
    height: 480,
    tags: ["puzzle", "numbers", "brain", "2048"],
    source: "selfhosted",
    featured: true,
    popular: true,
    isNew: true,
  },
  {
    id: "sh-neon-snake",
    slug: "neon-snake",
    title: "Neon Snake",
    category: "Arcade",
    description:
      "A glowing twist on the classic snake. Eat the orbs, grow longer, and don't bite your own tail.",
    emoji: "🐍",
    url: "/games/neon-snake/",
    rating: 4.5,
    plays: "0",
    siteIds: ["default"],
    embedUrl: "/games/neon-snake/index.html",
    instructions: "Arrow keys or swipe to steer. Eat orbs to grow; avoid walls and yourself.",
    width: 480,
    height: 480,
    tags: ["arcade", "snake", "neon", "classic"],
    source: "selfhosted",
    featured: true,
    popular: true,
    isNew: true,
  },
  {
    id: "sh-brick-breaker",
    slug: "brick-breaker",
    title: "Brick Breaker",
    category: "Arcade",
    description:
      "Smash every brick with a single ball and a trusty paddle. How high can your combo go?",
    emoji: "🧱",
    url: "/games/brick-breaker/",
    rating: 4.6,
    plays: "0",
    siteIds: ["default"],
    embedUrl: "/games/brick-breaker/index.html",
    instructions: "Move the paddle with your mouse or arrow keys. Keep the ball alive.",
    width: 480,
    height: 480,
    tags: ["arcade", "breakout", "classic", "skill"],
    source: "selfhosted",
    featured: true,
    popular: true,
    isNew: true,
  },
  {
    id: "sh-flappy-orb",
    slug: "flappy-orb",
    title: "Flappy Orb",
    category: "Arcade",
    description:
      "Tap to keep the little orb aloft and thread it through the gaps. One mistake and it's over.",
    emoji: "🚀",
    url: "/games/flappy-orb/",
    rating: 4.3,
    plays: "0",
    siteIds: ["default"],
    embedUrl: "/games/flappy-orb/index.html",
    instructions: "Click, tap, or press Space to flap. Dodge the pipes.",
    width: 480,
    height: 480,
    tags: ["arcade", "flappy", "reaction", "endless"],
    source: "selfhosted",
    featured: false,
    popular: true,
    isNew: true,
  },
  {
    id: "sh-bubble-pop",
    slug: "bubble-pop",
    title: "Bubble Pop",
    category: "Casual",
    description:
      "Aim, shoot, and match three or more bubbles of the same color to pop them in satisfying chains.",
    emoji: "🫧",
    url: "/games/bubble-pop/",
    rating: 4.4,
    plays: "0",
    siteIds: ["default"],
    embedUrl: "/games/bubble-pop/index.html",
    instructions: "Aim with the mouse and click to shoot. Match 3+ same-color bubbles to clear them.",
    width: 480,
    height: 480,
    tags: ["casual", "bubble", "match", "relax"],
    source: "selfhosted",
    featured: false,
    popular: false,
    isNew: true,
  },
  {
    id: "sh-cell-eater",
    slug: "cell-eater",
    title: "Cell Eater",
    category: "Action",
    description:
      "A tiny-cell survival game. Eat smaller dots to grow, outmaneuver bigger cells, and rule the petri dish.",
    emoji: "🟢",
    url: "/games/cell-eater/",
    rating: 4.2,
    plays: "0",
    siteIds: ["default"],
    embedUrl: "/games/cell-eater/index.html",
    instructions: "Move your cell with the mouse. Eat smaller dots, avoid bigger ones.",
    width: 480,
    height: 480,
    tags: ["action", "io", "casual", "survival"],
    source: "selfhosted",
    featured: false,
    popular: false,
    isNew: true,
  },
  {
    id: "sh-block-stack",
    slug: "block-stack",
    title: "Block Stack",
    category: "Puzzle",
    description:
      "The timeless falling-block challenge. Rotate and drop the pieces to clear full lines and keep the stack low.",
    emoji: "🟦",
    url: "/games/block-stack/",
    rating: 4.6,
    plays: "0",
    siteIds: ["default"],
    embedUrl: "/games/block-stack/index.html",
    instructions: "Arrow keys: ← → move, ↑ rotate, ↓ soft drop. Clear lines to score.",
    width: 480,
    height: 480,
    tags: ["puzzle", "tetris", "blocks", "classic"],
    source: "selfhosted",
    featured: false,
    popular: false,
    isNew: true,
  },
  {
    id: "sh-orbit-blaster",
    slug: "orbit-blaster",
    title: "Orbit Blaster",
    category: "Action",
    description:
      "Pilot your ship through a neon asteroid field, blast the enemies, and survive the endless wave.",
    emoji: "💥",
    url: "/games/orbit-blaster/",
    rating: 4.3,
    plays: "0",
    siteIds: ["default"],
    embedUrl: "/games/orbit-blaster/index.html",
    instructions: "WASD or arrows to move, click or Space to fire. Destroy enemies, dodge fire.",
    width: 480,
    height: 480,
    tags: ["action", "shooter", "neon", "arcade"],
    source: "selfhosted",
    featured: false,
    popular: false,
    isNew: true,
  },
];

// Single source of truth for self-hosted games in the catalog.
export function getSelfHostedGames(): Game[] {
  return SELF_HOSTED;
}
