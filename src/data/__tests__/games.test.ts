import test from "node:test";
import assert from "node:assert/strict";
import {
  games,
  getAllGames,
  getGamesForSite,
  getFeaturedGames,
  getPopularGames,
  getNewGames,
  getGameBySlug,
  getGamesByCategory,
  getCategories,
  getRelatedGames,
} from "../games.ts";

test("getAllGames returns the full catalog", () => {
  // Stage A: catalog is self-hosted originals only (GD source reserved/empty).
  assert.ok(getAllGames().length >= 8);
  assert.equal(getAllGames().length, games.length);
});

test("every game is assigned to at least one site via siteIds", () => {
  for (const g of games) {
    assert.ok(Array.isArray(g.siteIds) && g.siteIds.length > 0, `${g.slug} has no siteIds`);
  }
});

test("getGamesForSite('default') returns every catalog game in this phase", () => {
  const forSite = getGamesForSite("default");
  assert.equal(forSite.length, games.length);
});

test("getGamesForSite returns an empty list for an unknown site", () => {
  assert.equal(getGamesForSite("nonexistent").length, 0);
});

test("merchandising helpers only return flagged games", () => {
  assert.ok(getFeaturedGames().every((g) => g.featured === true));
  assert.ok(getPopularGames().every((g) => g.popular === true));
  assert.ok(getNewGames().every((g) => g.isNew === true));
});

test("getGameBySlug resolves a known game and returns undefined for unknown", () => {
  const known = getAllGames()[0];
  const found = getGameBySlug(known.slug);
  assert.ok(found);
  assert.equal(found?.title, known.title);
  assert.equal(getGameBySlug("does-not-exist"), undefined);
});

test("getGamesByCategory is category-case-insensitive", () => {
  const arcadeLower = getGamesByCategory("arcade");
  const arcadeUpper = getGamesByCategory("ARCADE");
  assert.ok(arcadeLower.length > 0);
  assert.equal(arcadeLower.length, arcadeUpper.length);
});

test("getCategories returns counts and is sorted by count desc", () => {
  const cats = getCategories();
  assert.ok(cats.length > 0);
  // Each count must be positive and match the actual games in that category.
  for (const c of cats) {
    assert.ok(c.count > 0);
    assert.equal(getGamesByCategory(c.slug).length, c.count);
  }
  // Sorted descending by count.
  for (let i = 1; i < cats.length; i++) {
    assert.ok(cats[i - 1].count >= cats[i].count);
  }
});

test("getRelatedGames excludes the source game and respects the limit", () => {
  const source = getAllGames()[0];
  const related = getRelatedGames(source, 4);
  assert.equal(related.length, 4);
  assert.ok(!related.some((g) => g.id === source.id));
});

test("getRelatedGames prefers same-category games first when siblings exist", () => {
  const source = getAllGames().find((g) => getGamesByCategory(g.category).length > 1)!;
  const related = getRelatedGames(source, 4);
  assert.equal(related[0].category, source.category);
});
