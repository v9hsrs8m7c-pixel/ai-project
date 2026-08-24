import type { Game } from "@/config/types";

// GameEmbed renders a GameDistribution DGI iframe.
//
// It prefers a publisher-attributed `embedUrl` (rendered as a responsive
// iframe we control) and only falls back to the raw `embedCode` HTML snippet
// when no `embedUrl`-style `embedUrl` is present.
//
// The `gd_sdk_referrer_url` query parameter is appended here (per active
// site + game slug) so revenue attribution lands on the correct domain in a
// multi-site deployment. GD also uses it for whitelisting / play-in-place.
//
// Badges:
//   real:true  -> "Verified Publisher" (green) — live DGI embed
//   MOCK token -> "Demo · mock data"      (accent) — non-live mock catalog
//   neither    -> none

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
  const { embedUrl, embedCode, title, instructions, real } = game;
  const isMock = (embedUrl ?? embedCode ?? "").includes(MOCK_MARKER);

  // Only append the referrer when we have both a URL and the slug to build it.
  const finalSrc = embedUrl && slug ? withReferrer(embedUrl, siteDomain, slug) : embedUrl;

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
