import type { MetadataRoute } from "next";
import { resolveCurrentSite } from "@/lib/site";

// Static export: metadata routes must be pre-rendered at build time.
export const dynamic = "force-static";

// Serves /robots.txt. Crawl directives stay permissive; the sitemap URL is
// advertised here so Google can discover it without manual submission.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await resolveCurrentSite();
  const base = `https://${site.domain}`;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
