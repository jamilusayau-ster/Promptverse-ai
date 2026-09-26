export type PromptType = "free" | "premium";
export type PromptStatus = "draft" | "published" | "archived";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
}

/** Safe shape returned by the `prompts_public` view — never includes
 *  the premium master_prompt/negative_prompt. */
export interface PublicPrompt {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  category_id: string | null;
  platform: string | null;
  prompt_type: PromptType;
  featured: boolean;
  view_count: number;
  master_prompt: string | null; // populated only when prompt_type === "free"
  negative_prompt: string | null;
  how_to_use: string | null;
  pro_tips: string | null;
  settings: Record<string, string> | null;
  created_at: string;
}
