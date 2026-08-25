// Shared type definitions for the multi-site / multi-tenant architecture.
// These types are deliberately decoupled from any single site so that the
// same code can serve multiple independent domains in the future.

export interface Theme {
  primary: string;
  background: string;
  surface: string;
  text: string;
  accent: string;
}

// Reserved SEO configuration. Not every field is wired up yet, but the shape
// is fixed so pages can consume it without later refactors.
export interface SeoConfig {
  defaultTitle?: string;
  titleTemplate?: string;
  defaultDescription?: string;
  keywords?: string[];
  canonicalDomain?: string;
  robots?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  sitemap?: boolean;
}

export type AnalyticsProvider = "ga" | "plausible" | "umami" | "custom";

// Reserved analytics configuration. Disabled by default; no third-party
// provider is wired up in this phase.
export interface AnalyticsConfig {
  enabled: boolean;
  provider?: AnalyticsProvider;
  trackingId?: string;
  endpoint?: string;
}

export interface AdSlot {
  id: string;
  placement: string;
  size?: string;
}

export type AdsProvider = "adsense" | "custom";

// Reserved advertising configuration. Disabled by default; no ad network is
// integrated in this phase.
export interface AdsConfig {
  enabled: boolean;
  provider?: AdsProvider;
  clientId?: string;
  slots?: AdSlot[];
}

export interface SiteConfig {
  siteId: string;
  domain: string;
  siteName: string;
  logo: string;
  title: string;
  description: string;
  theme: Theme;
  seo: SeoConfig;
  analytics: AnalyticsConfig;
  ads: AdsConfig;
}

// Game catalog model. `siteIds` is intentionally an array so a single game
// can belong to multiple sites in the future (many-to-many reservation).
export interface Game {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  emoji: string;
  url: string;
  rating: number;
  plays: string;
  siteIds: string[];
  // Optional merchandising flags used to build the homepage sections.
  // They are intentionally simple booleans so the MVP stays data-driven
  // without any backend or CMS.
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  // GameDistribution DGI integration (Phase 2).
  embedUrl?: string; // publisher-attributed iframe src
  embedCode?: string; // raw GD embed snippet (if provided)
  instructions?: string; // how to play
  width?: number;
  height?: number;
  tags?: string[]; // GD tags, reserved for SEO
  // True when this entry is a live publisher game (real DGI embed), as
  // opposed to a mock catalog entry used for development/preview.
  real?: boolean;
  // Origin of the game. "gamedistribution" = GD embed (Phase 2 + revenue
  // share later). "selfhosted" = our own original HTML5 game served from
  // /public (Stage A: build traffic with playable, jump-free content we own).
  source?: "gamedistribution" | "selfhosted";
}

// Derived category summary used by the Categories section and category pages.
export interface CategoryInfo {
  name: string;
  slug: string;
  count: number;
}
