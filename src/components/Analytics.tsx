import Script from "next/script";

/**
 * Google Analytics 4 loader.
 *
 * Fully driven by NEXT_PUBLIC_GA4_MEASUREMENT_ID, which Next.js inlines at build
 * time. When the var is absent (e.g. the very first deploy, before the Google
 * account exists) this component renders nothing, so the site stays fully
 * functional with no analytics attached. Once the ID is provided via .env.local
 * and the site is rebuilt, GA4 activates automatically — no code change needed.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  );
}
