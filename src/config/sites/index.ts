import type { SiteConfig } from "../types.ts";
import { defaultSite } from "./default.ts";

// Site registry: maps a canonical domain to its SiteConfig.
// To add a second site later, define its config under ./<siteId>.ts and
// register it here. No other code needs to change.
const REGISTRY: Record<string, SiteConfig> = {
  [defaultSite.domain]: defaultSite,
};

// Resolve a SiteConfig from the incoming request domain.
// Unknown / dev domains (e.g. localhost) fall back to the default site so the
// app always renders something valid.
export function getSiteConfig(domain: string): SiteConfig {
  const key = domain.trim().toLowerCase().split(":")[0];
  return REGISTRY[key] ?? defaultSite;
}

// List all registered sites. Useful for sitemaps, admin tooling, etc.
export function listSites(): SiteConfig[] {
  return Object.values(REGISTRY);
}

export { defaultSite };
