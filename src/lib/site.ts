import { headers } from "next/headers";
import { getSiteConfig, defaultSite } from "@/config/sites";
import type { SiteConfig } from "@/config/types";

// Resolve the active SiteConfig for the current request based on its Host
// header. This is the single entry point the App Router pages use, keeping
// domain-resolution logic out of individual pages.
//
// During a STATIC_EXPORT build there is no request context (no Host header),
// so we render the default site. This keeps the app deployable as a pure
// static site for previews while the normal build keeps full dynamic,
// per-domain multi-site resolution.
export async function resolveCurrentSite(): Promise<SiteConfig> {
  if (process.env.STATIC_EXPORT === "1") return defaultSite;
  const h = await headers();
  const host = h.get("host")?.split(":")[0] ?? "localhost";
  return getSiteConfig(host);
}
