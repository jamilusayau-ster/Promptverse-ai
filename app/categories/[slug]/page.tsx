import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchCategoryBySlug, fetchCategories, fetchPrompts } from "@/lib/queries";
import PromptGrid from "@/components/PromptGrid";

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await fetchCategoryBySlug(params.slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description || `Browse ${category.name} AI master prompts.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const category = await fetchCategoryBySlug(params.slug);
  if (!category) notFound();

  const [prompts, categories] = await Promise.all([
    fetchPrompts({ category: params.slug }),
    fetchCategories(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{category.icon}</span>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold">{category.name}</h1>
      </div>
      {category.description && <p className="text-muted mb-8 max-w-xl">{category.description}</p>}

      <PromptGrid prompts={prompts} categories={categories} />
    </div>
  );
}
