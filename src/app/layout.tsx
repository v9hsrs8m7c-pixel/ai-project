import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { resolveCurrentSite } from "@/lib/site";
import type { Theme } from "@/config/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Map a site's theme tokens onto CSS custom properties so each site can be
// visually themed independently without touching component code.
function themeToCssVars(theme: Theme): CSSProperties {
  return {
    "--color-bg": theme.background,
    "--color-surface": theme.surface,
    "--color-primary": theme.primary,
    "--color-accent": theme.accent,
    "--color-text": theme.text,
  } as CSSProperties;
}

// SEO metadata is derived from the resolved site config (SEO config reserved
// in SiteConfig). Switching domains later automatically switches metadata.
export async function generateMetadata(): Promise<Metadata> {
  const site = await resolveCurrentSite();
  return {
    metadataBase: new URL(
      site.seo.canonicalDomain
        ? `https://${site.seo.canonicalDomain}`
        : "http://localhost:3000",
    ),
    title: {
      default: site.seo.defaultTitle ?? site.title,
      template: site.seo.titleTemplate ?? `%s | ${site.siteName}`,
    },
    description: site.seo.defaultDescription ?? site.description,
    keywords: site.seo.keywords,
    robots: site.seo.robots,
    openGraph: {
      title: site.seo.defaultTitle ?? site.title,
      description: site.seo.defaultDescription ?? site.description,
      images: site.seo.ogImage ? [site.seo.ogImage] : undefined,
      type: "website",
    },
    twitter: {
      card: site.seo.twitterCard,
      title: site.seo.defaultTitle ?? site.title,
      description: site.seo.defaultDescription ?? site.description,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await resolveCurrentSite();
  return (
    <html lang="en">
      <body
        style={themeToCssVars(site.theme)}
        className="flex min-h-screen flex-col"
      >
        <Header site={site} />
        <div className="flex-1">{children}</div>
        <Footer site={site} />
      </body>
    </html>
  );
}
