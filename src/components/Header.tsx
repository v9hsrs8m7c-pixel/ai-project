"use client";

import Link from "next/link";
import { useState } from "react";
import type { SiteConfig } from "@/config/types";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#categories", label: "Categories" },
  { href: "/#popular", label: "Popular" },
  { href: "/#new", label: "New" },
];

// Responsive header for the default site. Collapses to a hamburger menu on
// mobile (mobile-first). Brand + nav derive from the active SiteConfig so the
// same component works for any future site without changes.
export function Header({ site }: { site: SiteConfig }) {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur"
      style={{
        background: "color-mix(in srgb, var(--color-surface) 85%, transparent)",
        borderColor: "color-mix(in srgb, var(--color-text) 10%, transparent)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold"
          style={{ color: "var(--color-primary)" }}
          onClick={() => setOpen(false)}
        >
          <span aria-hidden>🎮</span>
          <span>{site.siteName}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium opacity-80 transition hover:opacity-100"
              style={{ color: "var(--color-text)" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md md:hidden"
          style={{ color: "var(--color-text)" }}
        >
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <nav
          className="border-t px-4 py-3 md:hidden"
          style={{ borderColor: "color-mix(in srgb, var(--color-text) 10%, transparent)" }}
        >
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium opacity-80 hover:opacity-100"
                  style={{ color: "var(--color-text)" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
