import Link from "next/link";
import { settingsToText } from "@/lib/admin";

type Category = { id: string; name: string };

const input =
  "w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-electric focus:outline-none";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";

export default function PromptForm({
  action,
  categories,
  prompt,
  error,
}: {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  prompt?: Record<string, any> | null;
  error?: string;
}) {
  const p: Record<string, any> = prompt ?? {};

  return (
    <form action={action} className="space-y-5">
      {p.id && <input type="hidden" name="id" value={p.id} />}

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className={label}>Title *</label>
        <input name="title" required defaultValue={p.title ?? ""} className={input} />
      </div>

      <div>
        <label className={label}>Slug (leave empty to create from title)</label>
        <input name="slug" defaultValue={p.slug ?? ""} placeholder="google-veo-3-cinematic-master-prompt" className={input} />
      </div>

      <div>
        <label className={label}>Short description</label>
        <textarea name="description" rows={2} defaultValue={p.description ?? ""} className={input} />
      </div>

      <div>
        <label className={label}>Thumbnail image URL</label>
        <input name="thumbnail_url" defaultValue={p.thumbnail_url ?? ""} placeholder="https://...supabase.co/storage/v1/object/public/prompt-images/..." className={input} />
        <p className="mt-1 text-xs text-muted">
          Upload the image to the prompt-images bucket in Supabase Storage, then paste its public URL here.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>Category</label>
          <select name="category_id" defaultValue={p.category_id ?? ""} className={input}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>AI platform</label>
          <input name="platform" defaultValue={p.platform ?? ""} placeholder="Google Veo" className={input} />
        </div>
        <div>
          <label className={label}>Type</label>
          <select name="prompt_type" defaultValue={p.prompt_type ?? "free"} className={input}>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div>
          <label className={label}>Status</label>
          <select name="status" defaultValue={p.status ?? "draft"} className={input}>
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published</option>
            <option value="archived">Archived (hidden)</option>
          </select>
        </div>
      </div>

      <div>
        <label className={label}>Master prompt *</label>
        <textarea name="master_prompt" required rows={10} defaultValue={p.master_prompt ?? ""} className={`${input} font-mono`} />
      </div>

      <div>
        <label className={label}>Negative prompt</label>
        <textarea name="negative_prompt" rows={3} defaultValue={p.negative_prompt ?? ""} className={`${input} font-mono`} />
      </div>

      <div>
        <label className={label}>Recommended settings (one per line, like &quot;Duration: 15 sec&quot;)</label>
        <textarea name="settings" rows={4} defaultValue={settingsToText(p.settings)} placeholder={"Duration: 15 sec\nAspect ratio: 9:16\nQuality: 4K"} className={input} />
      </div>

      <div>
        <label className={label}>How to use</label>
        <textarea name="how_to_use" rows={4} defaultValue={p.how_to_use ?? ""} className={input} />
      </div>

      <div>
        <label className={label}>Pro tips</label>
        <textarea name="pro_tips" rows={4} defaultValue={p.pro_tips ?? ""} className={input} />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" name="featured" defaultChecked={!!p.featured} className="h-4 w-4" />
        Featured prompt
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-base hover:bg-white">
          Save prompt
        </button>
        <Link href="/admin/prompts" className="rounded-full border border-border px-6 py-2.5 text-sm text-ink hover:border-electric">
          Cancel
        </Link>
      </div>
    </form>
  );
}
