import { Suspense } from "react";
import type { Metadata } from "next";
import { fetchPrompts, fetchCategories } from "@/lib/queries";
import ExploreControls from "@/components/ExploreControls";
import PromptGrid from "@/components/PromptGrid";

export const metadata: Metadata = {
  title: "Explore Prompts",
  description: "Search and browse free and premium AI master prompts across every category and platform.",
};

export const revalidate = 60;

interface Props {
  searchParams: {
    q?: string;
    type?: "free" | "premium";
    category?: string;
    platform?: string;
    sort?: "newest" | "views" | "featured";
  };
}

export default async function ExplorePage({ searchParams }: Props) {
  const [prompts, categories] = await Promise.all([
    fetchPrompts(searchParams),
    fetchCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-6">Explore Prompts</h1>

      <Suspense>
        <ExploreControls categories={categories} />
      </Suspense>

      <div className="mt-8">
        <PromptGrid prompts={prompts} categories={categories} />
      </div>
    </div>
  );
}
