import type { CategoryInfo, Game } from "../config/types.ts";
import { getGDGames } from "./sources/gamedistribution/adapter.ts";

// The game catalog is sourced through the GameDistribution adapter. In this
// phase the adapter reads a mock GD catalog (raw GD field shape); when real
// publisher credentials / an official feed become available, the adapter
// normalizes live data with zero changes to the rest of the app.
export const games: Game[] = getGDGames();

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
