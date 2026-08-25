import type { SiteConfig } from "../types.ts";

// The single default site shipped in this phase.
// `domain` is a placeholder (no real domain is purchased). Any request whose
// Host header does not match a registered site falls back to this site.
export const defaultSite: SiteConfig = {
  siteId: "default",
  domain: "darlynmae.com",
  siteName: "Darlynmae",
  logo: "/logo.svg",
  title: "Darlynmae",
  description:
    "Play the best free HTML5 games online. No download, no install — just instant fun.",
  theme: {
    primary: "#7c3aed",
    background: "#0b0b14",
    surface: "#15151f",
    text: "#f5f5f7",
    accent: "#22d3ee",
  },
  seo: {
    defaultTitle: "Darlynmae — Free HTML5 Games",
    titleTemplate: "%s | Darlynmae",
    defaultDescription:
      "Play the best free HTML5 games online. No download, no install — just instant fun.",
    keywords: ["html5 games", "free games", "online games", "browser games", "arcade"],
    canonicalDomain: "darlynmae.com",
    robots: "index,follow",
    twitterCard: "summary_large_image",
    sitemap: true,
  },
  // Reserved but disabled — no analytics provider is wired up yet.
  analytics: {
    enabled: false,
  },
  // Reserved but disabled — no ad network is integrated yet.
  ads: {
    enabled: false,
  },
};
