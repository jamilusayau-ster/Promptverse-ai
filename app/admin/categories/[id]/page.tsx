import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import CategoryForm from "@/components/admin/CategoryForm";
import Flash from "@/components/admin/Flash";
import { updateCategory } from "@/app/admin/category-actions";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const { admin } = await requireAdmin();
  const { data: category } = await admin
    .from("categories")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();
  if (!category) notFound();

  return (
    <div className="max-w-3xl">
      <h2 className="mb-4 font-display text-lg font-semibold">Edit category</h2>
      <Flash error={searchParams.error} />
      <CategoryForm action={updateCategory} category={category} submitLabel="Save category" cancelHref="/admin/categories" />
    </div>
  );
}
