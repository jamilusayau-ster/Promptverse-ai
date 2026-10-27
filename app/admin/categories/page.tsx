import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import CategoryForm from "@/components/admin/CategoryForm";
import ConfirmButton from "@/components/admin/ConfirmButton";
import Flash from "@/components/admin/Flash";
import { createCategory, deleteCategory } from "@/app/admin/category-actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  const { admin } = await requireAdmin();
  const { data } = await admin
    .from("categories")
    .select("id,name,slug,icon,description")
    .order("name");
  const categories: any[] = data ?? [];

  return (
    <div>
      <Flash error={searchParams.error} ok={searchParams.ok} />

      <h2 className="mb-3 font-display text-lg font-semibold">Add category</h2>
      <div className="mb-8 rounded-xl2 border border-border bg-surface p-4">
        <CategoryForm action={createCategory} submitLabel="Add category" />
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold">Categories ({categories.length})</h2>
      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl2 border border-border bg-surface p-4">
            <span className="text-xl">{c.icon || "📁"}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">{c.name}</p>
              <p className="truncate text-xs text-muted">/categories/{c.slug}</p>
            </div>
            <Link href={`/admin/categories/${c.id}`} className="rounded-full border border-border px-3 py-1.5 text-xs text-ink hover:border-electric">
              Edit
            </Link>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <ConfirmButton
                message={`Delete category "${c.name}"? Its prompts will become uncategorized.`}
                className="rounded-full border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
              >
                Delete
              </ConfirmButton>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
