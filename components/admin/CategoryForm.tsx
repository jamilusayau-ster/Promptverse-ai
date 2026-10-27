import Link from "next/link";

const input =
  "w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-electric focus:outline-none";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";

export default function CategoryForm({
  action,
  category,
  submitLabel,
  cancelHref,
}: {
  action: (formData: FormData) => Promise<void>;
  category?: Record<string, any> | null;
  submitLabel: string;
  cancelHref?: string;
}) {
  const c: Record<string, any> = category ?? {};
  return (
    <form action={action} className="space-y-4">
      {c.id && <input type="hidden" name="id" value={c.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label}>Name *</label>
          <input name="name" required defaultValue={c.name ?? ""} className={input} />
        </div>
        <div>
          <label className={label}>Slug (empty = from name)</label>
          <input name="slug" defaultValue={c.slug ?? ""} placeholder="google-veo" className={input} />
        </div>
        <div>
          <label className={label}>Icon (emoji)</label>
          <input name="icon" defaultValue={c.icon ?? ""} placeholder="🎬" className={input} />
        </div>
        <div>
          <label className={label}>Image URL (optional)</label>
          <input name="image_url" defaultValue={c.image_url ?? ""} className={input} />
        </div>
      </div>
      <div>
        <label className={label}>Description</label>
        <textarea name="description" rows={2} defaultValue={c.description ?? ""} className={input} />
      </div>
      <div className="flex gap-3">
        <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-base hover:bg-white">
          {submitLabel}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className="rounded-full border border-border px-5 py-2.5 text-sm text-ink hover:border-electric">
            Cancel
          </Link>
        )}
      </div>
    </form>
  );
}
