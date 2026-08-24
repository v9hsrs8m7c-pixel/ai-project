import type { Game } from "../../../config/types.ts";
import type { RawGDGame } from "./types.ts";
import { rawGDGames } from "./mock.ts";

// Maps a GameDistribution category to a cover emoji for our mock UI.
// GD has no emoji concept; this is portal-side presentation enrichment.
const CATEGORY_EMOJI: Record<string, string> = {
  Arcade: "🕹️",
  Puzzle: "🧩",
  Action: "⚔️",
  Racing: "🏎️",
  Casual: "🎮",
  Sports: "🏆",
  Strategy: "♟️",
  Adventure: "🗺️",
};

export function categoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? "🎮";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Normalizes a raw GD game into our decoupled `Game` model. Curation flags
// (featured/popular/isNew) pass through from the raw record; in production
// they would come from our own CMS rather than GD.
export function normalizeGDGame(raw: RawGDGame): Game {
  const category = raw.categories[0] ?? "Arcade";
  const slug = raw.slug ?? slugify(raw.title);
  return {
    id: raw.id,
    slug,
    title: raw.title,
    category,
    description: raw.description,
    emoji: categoryEmoji(category),
    url: `/games/${slug}/`,
    rating: raw.rating,
    plays: raw.plays,
    siteIds: raw.siteIds,
    featured: raw.featured,
    popular: raw.popular,
    isNew: raw.isNew,
    embedUrl: raw.embedUrl,
    embedCode: raw.embedCode,
    instructions: raw.instructions,
    width: raw.width,
    height: raw.height,
    tags: raw.tags,
    real: raw.real,
  };
}

export function getRawGDGames(): RawGDGame[] {
  return rawGDGames;
}

// The single source of truth for GD-sourced games in our catalog.
export function getGDGames(): Game[] {
  return rawGDGames.map(normalizeGDGame);
}

// Multi-site aware: same GD catalog, filtered per active site's siteIds.
export function getGDGamesForSite(siteId: string): Game[] {
  return getGDGames().filter((g) => g.siteIds.includes(siteId));
}
