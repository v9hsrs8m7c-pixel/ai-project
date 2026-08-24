import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeGDGame,
  getGDGames,
  getGDGamesForSite,
  categoryEmoji,
} from "../adapter.ts";
import { rawGDGames } from "../mock.ts";

test("normalizeGDGame maps raw GD fields to our Game model", () => {
  const raw = rawGDGames[0];
  const g = normalizeGDGame(raw);
  assert.equal(g.id, raw.id);
  assert.equal(g.slug, raw.slug ?? raw.title.toLowerCase());
  assert.equal(g.category, raw.categories[0]);
  assert.equal(g.emoji, categoryEmoji(raw.categories[0]));
  assert.equal(g.url, `/games/${raw.slug ?? raw.title.toLowerCase()}/`);
  assert.equal(g.embedUrl, raw.embedUrl);
  assert.deepEqual(g.tags, raw.tags);
  assert.deepEqual(g.siteIds, raw.siteIds);
});

test("categoryEmoji falls back to a default for unknown categories", () => {
  assert.equal(categoryEmoji("Arcade"), "🕹️");
  assert.equal(categoryEmoji("ThisCatDoesNotExist"), "🎮");
});

test("getGDGames returns one Game per raw entry", () => {
  assert.equal(getGDGames().length, rawGDGames.length);
});

test("getGDGamesForSite filters by siteIds", () => {
  assert.equal(getGDGamesForSite("default").length, rawGDGames.length);
  assert.equal(getGDGamesForSite("nonexistent").length, 0);
});
