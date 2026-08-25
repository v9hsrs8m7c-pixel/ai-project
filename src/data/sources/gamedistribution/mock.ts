import type { RawGDGame } from "./types.ts";

// GameDistribution catalog adapter — production-ready SCAFFOLD (currently empty).
//
// The site's live catalog is 100% self-hosted ORIGINAL HTML5 games
// (see ../selfhosted/games.ts). This GD source is intentionally empty and
// reserved for a later phase:
//   - once darlynmae.com clears GameDistribution's traffic gate and the domain
//     is whitelisted, OR
//   - once a Gamezop "partner" account (lowest traffic threshold of the embed-
//     and-earn networks) is approved,
// we repopulate `rawGDGames` with a live feed / credential-backed fetch. The
// RawGDGame shape below already matches GD's per-game structure, so the adapter
// and the rest of the app need ZERO changes when we re-enable it.
//
// IMPORTANT: do NOT re-add placeholder "MOCK" entries here. They render broken
// pages (rMOCK URLs 404) and carry zero SEO value. Only real, whitelisted
// publisher games belong in this array. Until then the catalog is original-only.
export const rawGDGames: RawGDGame[] = [];
