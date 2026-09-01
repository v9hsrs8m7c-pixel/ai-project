import type { MetadataRoute } from "next";
import { getAllGames, getCategories } from "@/data/games";
import { resolveCurrentSite } from "@/lib/site";

// Static export: metadata routes must be pre-rendered at build time.
export const dynamic = "force-static";

// Data-driven sitemap: every game and category URL is derived from the live
// catalog so it stays correct as games are added — no hand-maintained list.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await resolveCurrentSite();
  const base = `https://${site.domain}`;

  const gameUrls = getAllGames().map((g) => ({
    url: `${base}/games/${g.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const categoryUrls = getCategories().map((c) => ({
    url: `${base}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...categoryUrls,
    ...gameUrls,
  ];
}
