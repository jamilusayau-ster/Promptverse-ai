import Link from "next/link";
import type { Metadata } from "next";
import { fetchCategories } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse AI master prompts by category — video, image, storytelling, marketing and more.",
};

export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await fetchCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-6">Categories</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/categories/${c.slug}`}
            className="flex flex-col items-start gap-3 rounded-xl2 border border-border bg-surface p-5 hover:border-electric/60 transition-colors"
          >
            <span className="text-2xl">{c.icon}</span>
            <span className="font-display text-[15px] font-medium text-ink">{c.name}</span>
            {c.description && (
              <span className="text-xs text-muted line-clamp-2">{c.description}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
