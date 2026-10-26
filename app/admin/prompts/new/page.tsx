import { requireAdmin } from "@/lib/admin";
import PromptForm from "@/components/admin/PromptForm";
import { createPrompt } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function NewPromptPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { admin } = await requireAdmin();
  const { data: categories } = await admin.from("categories").select("id,name").order("name");

  return (
    <div className="max-w-3xl">
      <h2 className="mb-4 font-display text-lg font-semibold">New prompt</h2>
      <PromptForm action={createPrompt} categories={categories ?? []} error={searchParams.error} />
    </div>
  );
}
