import Link from "next/link";
import type { Game } from "@/config/types";

// A single game card. The "cover image" is a uniform aspect-ratio box with the
// game emoji centered — keeps every card visually consistent and avoids any
// external image dependency (mock-only MVP). Links through to the detail page.
export function GameCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block overflow-hidden rounded-2xl border transition hover:-translate-y-1"
      style={{
        background: "var(--color-surface)",
        borderColor: "color-mix(in srgb, var(--color-text) 10%, transparent)",
      }}
    >
      {/* Uniform 3:4 cover — real thumbnail when available (GM games), else
          emoji fallback for legacy entries. */}
      <div
        className="relative grid aspect-[3/4] place-items-center overflow-hidden text-6xl"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--color-primary) 35%, transparent), transparent 60%)",
        }}
      >
        {game.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={game.thumb}
            alt={game.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span aria-hidden>{game.emoji}</span>
        )}
        {game.isNew && (
          <span
            className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: "var(--color-accent)", color: "#0b0b14" }}
          >
            New
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight" style={{ color: "var(--color-text)" }}>
            {game.title}
          </h3>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: "color-mix(in srgb, var(--color-accent) 20%, transparent)", color: "var(--color-accent)" }}
          >
            ★ {game.rating.toFixed(1)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs opacity-70" style={{ color: "var(--color-text)" }}>
          <span>{game.category}</span>
          <span>{game.plays} plays</span>
        </div>
      </div>
    </Link>
  );
}

// Responsive grid wrapper used by every game listing.
export function GameGrid({ games }: { games: Game[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
