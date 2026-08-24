import Link from "next/link";
import type { CategoryInfo } from "@/config/types";

// Grid of category tiles linking to each category page. Reused on the
// homepage Categories section.
export function CategoryGrid({ categories }: { categories: CategoryInfo[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className="flex flex-col items-center justify-center gap-1 rounded-2xl border p-6 text-center transition hover:-translate-y-1"
          style={{
            background: "var(--color-surface)",
            borderColor: "color-mix(in srgb, var(--color-text) 10%, transparent)",
            color: "var(--color-text)",
          }}
        >
          <span className="text-xl font-semibold" style={{ color: "var(--color-primary)" }}>
            {cat.name}
          </span>
          <span className="text-xs opacity-70">{cat.count} games</span>
        </Link>
      ))}
    </div>
  );
}
