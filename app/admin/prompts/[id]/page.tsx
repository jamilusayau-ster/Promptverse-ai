import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import PromptForm from "@/components/admin/PromptForm";
import { updatePrompt } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function EditPromptPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const { admin } = await requireAdmin();
  const [{ data: prompt }, { data: categories }] = await Promise.all([
    admin.from("prompts").select("*").eq("id", params.id).maybeSingle(),
    admin.from("categories").select("id,name").order("name"),
  ]);
  if (!prompt) notFound();

  return (
    <div className="max-w-3xl">
      <h2 className="mb-4 font-display text-lg font-semibold">Edit prompt</h2>
      <PromptForm action={updatePrompt} categories={categories ?? []} prompt={prompt} error={searchParams.error} />
    </div>
  );
}
