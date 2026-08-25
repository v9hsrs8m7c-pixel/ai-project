import type { Game } from "@/config/types";

// GameEmbed renders a playable iframe for a game.
//
// Two sources are supported:
//   • GameDistribution (`source: "gamedistribution"`) — a publisher-attributed
//     DGI iframe. The `gd_sdk_referrer_url` query is appended (per active site
//     + slug) for revenue attribution + GD whitelisting / play-in-place.
//   • Self-hosted (`source: "selfhosted"`) — our own original HTML5 game served
//     from /public. Rendered as a plain local iframe with NO referrer (it is
//     our own asset, jump-free, and not monetized through GD).
//
// Badges:
//   real:true            -> "Verified Publisher" (green) — live DGI embed
//   MOCK token           -> "Demo · mock data"  (accent) — non-live mock catalog
//   source:selfhosted    -> "Self-hosted · original" (accent) — our own game
//   none of the above    -> none

const MOCK_MARKER = "MOCK";

function withReferrer(embedUrl: string, siteDomain: string, slug: string): string {
  const base = embedUrl.split("?")[0]; // strip any pre-existing query
  const referrer = `https://${siteDomain}/games/${slug}`;
  return `${base}?gd_sdk_referrer_url=${referrer}`;
}

export function GameEmbed({
  game,
  siteDomain = "darlynmae.com",
  slug,
  className,
}: {
  game: Game;
  siteDomain?: string;
  slug?: string;
  className?: string;
}) {
  const { embedUrl, embedCode, title, instructions, real, source } = game;
  const isMock = (embedUrl ?? embedCode ?? "").includes(MOCK_MARKER);
  const isSelfHosted = source === "selfhosted" || (embedUrl?.startsWith("/") ?? false);

  // Self-hosted games are our own local assets — render as-is, no referrer.
  // GD embeds get the attribution query only when we also have the slug.
  const finalSrc = isSelfHosted
    ? embedUrl
    : embedUrl && slug
      ? withReferrer(embedUrl, siteDomain, slug)
      : embedUrl;

  return (
    <div className={className}>
      <div
        className="relative w-full overflow-hidden rounded-3xl"
        style={{
          aspectRatio: "16 / 9",
          background: "var(--color-surface)",
          borderColor: "color-mix(in srgb, var(--color-text) 10%, transparent)",
          borderWidth: 1,
        }}
      >
        {finalSrc ? (
          <iframe
            src={finalSrc}
            title={`Play ${title}`}
            className="absolute inset-0 h-full w-full"
            style={{ border: 0 }}
            allow="autoplay; fullscreen; gamepad; microphone; clipboard-write"
            allowFullScreen
            loading="lazy"
          />
        ) : embedCode ? (
          <div
            className="absolute inset-0"
            // Trusted, portal-curated GD embed snippet only.
            dangerouslySetInnerHTML={{ __html: embedCode }}
          />
        ) : (
          <div
            className="absolute inset-0 grid place-items-center text-sm opacity-60"
            style={{ color: "var(--color-text)" }}
          >
            No playable embed for this game yet.
          </div>
        )}

        {real ? (
          <span
            className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: "#22c55e", color: "#04130a" }}
          >
            ✓ Verified Publisher
          </span>
        ) : isMock ? (
          <span
            className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: "var(--color-accent)", color: "#0b0b14" }}
          >
            Demo · mock data
          </span>
        ) : isSelfHosted ? (
          <span
            className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: "var(--color-accent)", color: "#0b0b14" }}
          >
            Self-hosted · original
          </span>
        ) : null}
      </div>

      {instructions && (
        <p className="mt-3 text-sm opacity-80" style={{ color: "var(--color-text)" }}>
          <span className="font-semibold">How to play: </span>
          {instructions}
        </p>
      )}
    </div>
  );
}
