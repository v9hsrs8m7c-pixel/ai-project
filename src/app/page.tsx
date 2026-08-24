import Link from "next/link";
import { resolveCurrentSite } from "@/lib/site";
import { getCategories, getFeaturedGames, getNewGames, getPopularGames } from "@/data/games";
import { GameGrid } from "@/components/GameCard";
import { CategoryGrid } from "@/components/CategoryGrid";
import { Section } from "@/components/Section";

// Default site homepage. Resolves the active SiteConfig from the request
// domain (multi-site aware) and renders the merchandising sections.
export default async function Home() {
  const site = await resolveCurrentSite();
  const featured = getFeaturedGames();
  const popular = getPopularGames();
  const newest = getNewGames();
  const categories = getCategories();

  return (
    <>
      {/* Hero */}
      <section
        className="mx-auto max-w-6xl px-4 pb-4 pt-12 text-center sm:pt-16"
      >
        <p
          className="mb-3 text-sm font-semibold uppercase tracking-[0.25em]"
          style={{ color: "var(--color-accent)" }}
        >
          {site.siteId} · Free to play
        </p>
        <h1
          className="text-4xl font-extrabold leading-tight sm:text-6xl"
          style={{ color: "var(--color-text)" }}
        >
          {site.title}
        </h1>
        <p
          className="mx-auto mt-4 max-w-xl text-base opacity-80 sm:text-lg"
          style={{ color: "var(--color-text)" }}
        >
          {site.description}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="#featured"
            className="rounded-full px-6 py-3 text-sm font-semibold"
            style={{ background: "var(--color-primary)", color: "#fff" }}
          >
            Start Playing
          </Link>
          <Link
            href="#categories"
            className="rounded-full border px-6 py-3 text-sm font-semibold opacity-90"
            style={{
              borderColor: "color-mix(in srgb, var(--color-text) 20%, transparent)",
              color: "var(--color-text)",
            }}
          >
            Browse Categories
          </Link>
        </div>
      </section>

      <Section
        id="featured"
        title="Featured Games"
        subtitle="Hand-picked titles we think you'll love."
      >
        <GameGrid games={featured} />
      </Section>

      <Section
        id="popular"
        title="Popular Games"
        subtitle="The most played games right now."
        href="/#categories"
        hrefLabel="All categories"
      >
        <GameGrid games={popular} />
      </Section>

      <Section
        id="new"
        title="New Games"
        subtitle="Fresh arrivals added to the portal."
      >
        <GameGrid games={newest} />
      </Section>

      <Section
        id="categories"
        title="Categories"
        subtitle="Find your favorite kind of fun."
      >
        <CategoryGrid categories={categories} />
      </Section>
    </>
  );
}
