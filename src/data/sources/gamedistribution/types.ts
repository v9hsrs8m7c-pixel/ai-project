// Raw GameDistribution catalog shape (DGI / portal feed).
//
// Field names and nesting mirror what GD exposes per game: a stable id,
// title, descriptions, a category taxonomy (array) and tags, aggregated
// rating and play counts, multiple thumbnail resolutions, and the DGI embed
// payload (a publisher-attributed iframe `embedUrl`, with an optional raw
// `embedCode` snippet). Orientation is conveyed via width/height.
//
// NOTE: `featured` / `popular` / `isNew` are *portal curation* flags. In
// production they live in our own CMS, not in GD's data — they are kept here
// only so the mock catalog can drive the homepage sections end-to-end.

export interface RawGDGame {
  id: string;
  slug?: string;
  title: string;
  description: string;
  instructions?: string;
  categories: string[];
  tags: string[];
  rating: number;
  plays: string;
  thumbnails: Record<string, string>;
  embedUrl: string;
  embedCode?: string;
  width: number;
  height: number;
  publishedAt?: string;
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  siteIds: string[];
  // True when this is a live publisher game (real DGI embed) rather than
  // mock data. Surfaced in the UI as a "Verified Publisher" badge.
  real?: boolean;
}
