import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllGames, getGameBySlug, getRelatedGames } from "@/data/games";
import { GameGrid } from "@/components/GameCard";
import { GameEmbed } from "@/components/GameEmbed";
import { Section } from "@/components/Section";
import { resolveCurrentSite } from "@/lib/site";

export function generateStaticParams() {
  return getAllGames().map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) return { title: "Game not found" };
  return { title: game.title, description: game.description };
}

// Game detail page. Embeds the playable game via the GameDistribution DGI
// adapter and shows a Related Games strip — closing the
// Home → Category → Detail → Related browsing loop.
export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = getGameBySlug(slug);
  if (!game) notFound();

  const site = await resolveCurrentSite();
  const related = getRelatedGames(game);

  // Structured data so search engines understand the game as an entity and
  // the breadcrumb hierarchy. Game body itself is not crawlable (iframe), so
  // this markup is part of the page's indexable SEO asset.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        name: game.title,
        description: game.description,
        genre: game.category,
        url: `https://${site.domain}/games/${game.slug}`,
        inLanguage: "en",
        gamePlatform: "Web browser",
        applicationCategory: "Game",
        operatingSystem: "Any",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `https://${site.domain}/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: game.category,
            item: `https://${site.domain}/category/${game.category.toLowerCase()}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: game.title,
            item: `https://${site.domain}/games/${game.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="mb-6 text-sm opacity-70" style={{ color: "var(--color-text)" }}>
        <Link href="/" className="hover:opacity-100" style={{ color: "var(--color-accent)" }}>
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/category/${game.category.toLowerCase()}`}
          className="hover:opacity-100"
          style={{ color: "var(--color-accent)" }}
        >
          {game.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium" style={{ color: "var(--color-text)" }}>
          {game.title}
        </span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[1fr_320px]">
        {/* Playable game — GameDistribution DGI iframe (via adapter) */}
        <GameEmbed game={game} siteDomain={site.domain} slug={game.slug} />

        {/* Info + play CTA */}
        <aside className="flex flex-col">
          <h1 className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
            {game.title}
          </h1>
          <div className="mt-2 flex items-center gap-3 text-sm opacity-80" style={{ color: "var(--color-text)" }}>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: "color-mix(in srgb, var(--color-accent) 20%, transparent)", color: "var(--color-accent)" }}
            >
              ★ {game.rating.toFixed(1)}
            </span>
            <span>{game.plays} plays</span>
            <span>·</span>
            <span>{game.category}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed opacity-80" style={{ color: "var(--color-text)" }}>
            {game.description}
          </p>

          {/* Game is embedded above; no separate play button needed. */}
        </aside>
      </div>

      <Section title="Related Games" subtitle="More games you might enjoy.">
        <GameGrid games={related} />
      </Section>
    </main>
  );
}
