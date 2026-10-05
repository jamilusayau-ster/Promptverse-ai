"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { useState, useTransition } from "react";
import type { Category } from "@/lib/types";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "views", label: "Most Viewed" },
  { value: "featured", label: "Featured" },
];

export default function ExploreControls({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  const activeType = searchParams.get("type");
  const activeCategory = searchParams.get("category");
  const activeSort = searchParams.get("sort") ?? "newest";

  return (
    <div className="space-y-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateParam("q", q || null);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search prompts, platforms, categories..."
          className="w-full rounded-full border border-border bg-surface py-3 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-electric outline-none"
        />
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {[
          { value: null, label: "All" },
          { value: "free", label: "Free" },
          { value: "premium", label: "Premium" },
        ].map((opt) => (
          <button
            key={opt.label}
            onClick={() => updateParam("type", opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeType === opt.value || (!activeType && !opt.value)
                ? "bg-ink text-base"
                : "border border-border text-muted hover:text-ink"
            }`}
          >
            {opt.label}
          </button>
        ))}

        <span className="mx-1 h-4 w-px bg-border" />

        <select
          value={activeCategory ?? ""}
          onChange={(e) => updateParam("category", e.target.value || null)}
          className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-ink outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        <select
          value={activeSort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="ml-auto rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-ink outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              Sort: {s.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
