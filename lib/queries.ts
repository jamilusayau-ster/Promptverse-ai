import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Category, PublicPrompt } from "@/lib/types";

export interface ExploreFilters {
  q?: string;
  type?: "free" | "premium";
  category?: string; // category slug
  platform?: string;
  sort?: "newest" | "views" | "featured";
}

/**
 * All prompt listing/search/category/browse queries go through this
 * function, which reads ONLY from `prompts_public` — the view that never
 * exposes premium master_prompt content. Never query `prompts` directly
 * from a public-facing page.
 */
export async function fetchPrompts(filters: ExploreFilters = {}) {
  const supabase = createClient();
  let query = supabase.from("prompts_public").select(
    "id,title,slug,description,thumbnail_url,category_id,platform,prompt_type,featured,view_count,created_at"
  );

  if (filters.type) query = query.eq("prompt_type", filters.type);
  if (filters.platform) query = query.eq("platform", filters.platform);
  if (filters.q) {
    query = query.or(
      `title.ilike.%${filters.q}%,description.ilike.%${filters.q}%,platform.ilike.%${filters.q}%`
    );
  }
  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  switch (filters.sort) {
    case "views":
      query = query.order("view_count", { ascending: false });
      break;
    case "featured":
      query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query.limit(60);
  if (error) {
    console.error("fetchPrompts error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,icon,image_url")
    .order("name");
  if (error) {
    console.error("fetchCategories error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,icon,image_url")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

/**
 * Fetch a single prompt for its detail page. For FREE prompts, the
 * `prompts_public` view already includes the real master_prompt. For
 * PREMIUM prompts, master_prompt/negative_prompt come back null here —
 * the actual content is only ever fetched client-side, after a verified
 * unlock, from /api/prompts/[slug]/unlocked (built in Phase 4).
 */
export async function fetchPromptBySlug(slug: string): Promise<PublicPrompt | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("prompts_public")
    .select(
      "id,title,slug,description,thumbnail_url,category_id,platform,prompt_type,featured,view_count,master_prompt,negative_prompt,how_to_use,pro_tips,settings,created_at"
    )
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as PublicPrompt;
}

export async function fetchRelatedPrompts(categoryId: string | null, excludeId: string) {
  if (!categoryId) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from("prompts_public")
    .select("id,title,slug,description,thumbnail_url,category_id,platform,prompt_type,featured,view_count")
    .eq("category_id", categoryId)
    .neq("id", excludeId)
    .limit(4);
  return data ?? [];
}
