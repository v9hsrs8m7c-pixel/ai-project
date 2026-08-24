import type { NextConfig } from "next";

// When STATIC_EXPORT=1 we emit a pure static site (out/) so the portal can be
// deployed to static hosting / preview sandboxes. The default build stays
// dynamic (SSR) to preserve per-domain multi-site resolution.
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" } : {}),
};

export default nextConfig;
