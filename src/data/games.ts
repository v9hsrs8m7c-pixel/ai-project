import type { CategoryInfo, Game } from "../config/types.ts";
import { getGDGames } from "./sources/gamedistribution/adapter.ts";
import { getImportedGames } from "./sources/selfhosted/games-imported.ts";

// The catalog blends two sources today:
//   1. GameDistribution adapter (mock now, live DGI feed later) — Phase 2.
//   2. Imported HTML5 games served from /public/games — vetted MIT repos
//      (self-contained or public-CDN). The 50 earlier self-made engines were
//      hidden (not playable); their files stay in public/games for recovery,
//      just not surfaced here.
// Both normalize into the same decoupled `Game` model, so pages never care
// which source a game came from.
export const games: Game[] = [...getGDGames(), ...getImportedGames()];

// Return only the games that belong to a given site. Reserved for future
// multi-site catalog filtering; not yet consumed by any page.
export function getGamesForSite(siteId: string): Game[] {
  return games.filter((g) => g.siteIds.includes(siteId));
}

export function getAllGames(): Game[] {
  return games;
}

export function getFeaturedGames(): Game[] {
  return games.filter((g) => g.featured);
}

export function getPopularGames(): Game[] {
  return games.filter((g) => g.popular);
}

export function getNewGames(): Game[] {
  return games.filter((g) => g.isNew);
}

export function getGameBySlug(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}

export function getGamesByCategory(category: string): Game[] {
  return games.filter(
    (g) => g.category.toLowerCase() === category.toLowerCase(),
  );
}

// Unique categories with their game counts, sorted by count descending.
export function getCategories(): CategoryInfo[] {
  const counts = new Map<string, number>();
  for (const g of games) {
    counts.set(g.category, (counts.get(g.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([name, count]) => ({
      name,
      slug: name.toLowerCase(),
      count,
    }))
    .sort((a, b) => b.count - a.count);
}

// Related games: same category first, then top up with others so the
// detail page always has something to show.
export function getRelatedGames(game: Game, limit = 4): Game[] {
  const sameCategory = games.filter(
    (g) => g.id !== game.id && g.category === game.category,
  );
  const others = games.filter(
    (g) => g.id !== game.id && g.category !== game.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}
