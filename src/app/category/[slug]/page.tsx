import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCategories, getGamesByCategory } from "@/data/games";
import { GameGrid } from "@/components/GameCard";

export function generateStaticParams() {
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategories().find((c) => c.slug === slug);
  if (!cat) return { title: "Category not found" };
  return { title: `${cat.name} Games`, description: `Play free ${cat.name} games online.` };
}

// Category listing page. Renders all games in the given category.
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cat = getCategories().find((c) => c.slug === slug);
  if (!cat) notFound();

  const games = getGamesByCategory(slug);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm opacity-70" style={{ color: "var(--color-text)" }}>
        <Link href="/" className="hover:opacity-100" style={{ color: "var(--color-accent)" }}>
          Home
        </Link>
        <span className="mx-2">/</span>
        <span>Categories</span>
        <span className="mx-2">/</span>
        <span className="font-medium" style={{ color: "var(--color-text)" }}>
          {cat.name}
        </span>
      </nav>

      <h1 className="text-3xl font-bold" style={{ color: "var(--color-text)" }}>
        {cat.name} Games
      </h1>
      <p className="mt-1 text-sm opacity-70" style={{ color: "var(--color-text)" }}>
        {cat.count} free {cat.name.toLowerCase()} games to play instantly.
      </p>

      <div className="mt-8">
        {games.length > 0 ? (
          <GameGrid games={games} />
        ) : (
          <p className="opacity-70" style={{ color: "var(--color-text)" }}>
            No games in this category yet.
          </p>
        )}
      </div>
    </main>
  );
}
