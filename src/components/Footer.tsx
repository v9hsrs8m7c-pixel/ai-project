import type { SiteConfig } from "@/config/types";

// Simple, reusable footer. Brand + copyright derive from the active site so
// it stays correct across multiple sites without per-site duplication.
export function Footer({ site }: { site: SiteConfig }) {
  const year = new Date().getFullYear();
  return (
    <footer
      className="mt-16 border-t px-4 py-10"
      style={{
        borderColor: "color-mix(in srgb, var(--color-text) 10%, transparent)",
        color: "var(--color-text)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 text-center text-sm opacity-70">
        <p className="text-base font-semibold" style={{ color: "var(--color-primary)" }}>
          {site.siteName}
        </p>
        <p>{site.description}</p>
        <p className="mt-2 text-xs">
          © {year} {site.siteName}. Built with the multi-site architecture.
        </p>
      </div>
    </footer>
  );
}
