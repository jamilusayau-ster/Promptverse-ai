import PromptCard from "@/components/PromptCard";
import type { Category } from "@/lib/types";

interface RawPrompt {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  category_id: string | null;
  platform: string | null;
  prompt_type: "free" | "premium";
  featured: boolean;
  view_count: number;
}

export default function PromptGrid({
  prompts,
  categories,
}: {
  prompts: RawPrompt[];
  categories: Category[];
}) {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  if (prompts.length === 0) {
    return (
      <div className="rounded-xl2 border border-border bg-surface py-16 text-center">
        <p className="text-muted">No prompts found. Try a different search or filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {prompts.map((p) => (
        <PromptCard
          key={p.id}
          prompt={{
            slug: p.slug,
            title: p.title,
            description: p.description ?? "",
            thumbnail_url: p.thumbnail_url,
            category_name: (p.category_id && catMap.get(p.category_id)) || "Uncategorized",
            platform: p.platform,
            prompt_type: p.prompt_type,
            view_count: p.view_count,
            featured: p.featured,
          }}
        />
      ))}
    </div>
  );
}
