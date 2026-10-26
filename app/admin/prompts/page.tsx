import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { deletePrompt, setPromptFeatured, setPromptStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const btn =
  "rounded-full border border-border px-3 py-1.5 text-xs text-ink hover:border-electric";

export default async function AdminPromptsPage() {
  const { admin } = await requireAdmin();
  const { data } = await admin
    .from("prompts")
    .select("id,title,slug,prompt_type,status,featured,view_count")
    .order("created_at", { ascending: false });
  const prompts: any[] = data ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Prompts ({prompts.length})</h2>
        <Link href="/admin/prompts/new" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-base hover:bg-white">
          + New prompt
        </Link>
      </div>

      {prompts.length === 0 && (
        <p className="rounded-xl2 border border-border bg-surface p-5 text-sm text-muted">
          No prompts yet. Create your first one.
        </p>
      )}

      <div className="space-y-3">
        {prompts.map((p) => (
          <div key={p.id} className="rounded-xl2 border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={`/admin/prompts/${p.id}`} className="font-medium text-ink hover:text-electric">
                {p.title}
              </Link>
              <span className={p.prompt_type === "premium" ? "rounded-full bg-gold/15 px-2 py-0.5 text-[11px] text-gold" : "rounded-full bg-electric/15 px-2 py-0.5 text-[11px] text-electric"}>
                {p.prompt_type === "premium" ? "PREMIUM" : "FREE"}
              </span>
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">{p.status}</span>
              {p.featured && <span className="rounded-full border border-gold/50 px-2 py-0.5 text-[11px] text-gold">featured</span>}
              <span className="ml-auto text-xs text-muted">{(p.view_count ?? 0).toLocaleString("en-NG")} views</span>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/admin/prompts/${p.id}`} className={btn}>Edit</Link>
              <Link href={`/prompts/${p.slug}`} target="_blank" className={btn}>View</Link>

              <form action={setPromptStatus}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="status" value={p.status === "published" ? "draft" : "published"} />
                <button type="submit" className={btn}>{p.status === "published" ? "Unpublish" : "Publish"}</button>
              </form>

              <form action={setPromptFeatured}>
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="featured" value={p.featured ? "false" : "true"} />
                <button type="submit" className={btn}>{p.featured ? "Unfeature" : "Feature"}</button>
              </form>

              <form action={deletePrompt}>
                <input type="hidden" name="id" value={p.id} />
                <ConfirmButton message={`Delete "${p.title}" permanently?`} className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10">
                  Delete
                </ConfirmButton>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
