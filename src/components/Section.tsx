import Link from "next/link";
import type { ReactNode } from "react";

// A titled section with optional "view all" link. Reused for Featured /
// Popular / New Games so the homepage stays consistent and DRY.
export function Section({
  id,
  title,
  subtitle,
  href,
  hrefLabel,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm opacity-70" style={{ color: "var(--color-text)" }}>
              {subtitle}
            </p>
          )}
        </div>
        {href && hrefLabel && (
          <Link
            href={href}
            className="shrink-0 text-sm font-medium opacity-80 hover:opacity-100"
            style={{ color: "var(--color-accent)" }}
          >
            {hrefLabel} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
