import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchPromptBySlug, fetchRelatedPrompts, fetchCategories } from "@/lib/queries";
import CopyButton from "@/components/CopyButton";
import PremiumLockBox from "@/components/PremiumLockBox";
import ViewTracker from "@/components/ViewTracker";
import PromptGrid from "@/components/PromptGrid";

export const revalidate = 30;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const prompt = await fetchPromptBySlug(params.slug);
  if (!prompt) return {};
  return {
    title: prompt.title,
    description: prompt.description || undefined,
    alternates: { canonical: `/prompts/${prompt.slug}` },
    openGraph: {
      title: prompt.title,
      description: prompt.description || undefined,
      images: prompt.thumbnail_url ? [prompt.thumbnail_url] : undefined,
      type: "article",
    },
  };
}

export default async function PromptDetailPage({ params }: Props) {
  const prompt = await fetchPromptBySlug(params.slug);
  if (!prompt) notFound();

  const [related, categories] = await Promise.all([
    fetchRelatedPrompts(prompt.category_id, prompt.id),
    fetchCategories(),
  ]);

  const categoryName =
    categories.find((c) => c.id === prompt.category_id)?.name ?? "Uncategorized";
  const isPremium = prompt.prompt_type === "premium";
  const settings = prompt.settings && typeof prompt.settings === "object" ? prompt.settings : null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <ViewTracker promptId={prompt.id} />

      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl2 border border-border bg-surface">
        {prompt.thumbnail_url ? (
          <Image src={prompt.thumbnail_url} alt={prompt.title} fill className="object-cover" priority />
        ) : (
          <div className="h-full w-full bg-node-glow" />
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span
          className={
            isPremium
              ? "rounded-full bg-gold/15 px-3 py-1 text-xs font-medium text-gold"
              : "rounded-full bg-electric/15 px-3 py-1 text-xs font-medium text-electric"
          }
        >
          {isPremium ? "🔥 PREMIUM" : "FREE"}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
          {prompt.platform}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
          {categoryName}
        </span>
      </div>

      <h1 className="mt-4 font-display text-2xl sm:text-3xl font-semibold leading-tight">
        {prompt.title}
      </h1>
      {prompt.description && (
        <p className="mt-3 text-[15px] leading-relaxed text-muted">{prompt.description}</p>
      )}

      {/* MASTER PROMPT */}
      <div className="mt-8">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted">
          🎬 Master Prompt
        </h2>

        {isPremium && !prompt.master_prompt ? (
          <PremiumLockBox />
        ) : (
          <div className="rounded-xl2 border border-border bg-[#0D1020] p-5">
            <pre className="whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-ink/90">
              {prompt.master_prompt}
            </pre>
            <div className="mt-4">
              <CopyButton text={prompt.master_prompt ?? ""} />
            </div>
          </div>
        )}
      </div>

      {/* SETTINGS */}
      {settings && !isPremium && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Recommended Settings
          </h2>
          <div className="rounded-xl2 border border-border bg-surface p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(settings).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-muted capitalize">{key.replace(/_/g, " ")}</p>
                <p className="mt-0.5 text-sm font-medium text-ink">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEGATIVE PROMPT */}
      {prompt.negative_prompt && !isPremium && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Negative Prompt
          </h2>
          <div className="rounded-xl2 border border-border bg-[#0D1020] p-5">
            <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/90">
              {prompt.negative_prompt}
            </pre>
            <div className="mt-4">
              <CopyButton text={prompt.negative_prompt} label="Copy Negative Prompt" />
            </div>
          </div>
        </div>
      )}

      {/* HOW TO USE */}
      {prompt.how_to_use && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted">
            How To Use
          </h2>
          <div className="rounded-xl2 border border-border bg-surface p-5 text-sm leading-relaxed text-ink/90 whitespace-pre-line">
            {prompt.how_to_use}
          </div>
        </div>
      )}

      {/* PRO TIPS */}
      {prompt.pro_tips && (
        <div className="mt-8">
          <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted">
            Pro Tips
          </h2>
          <div className="rounded-xl2 border border-border bg-surface p-5 text-sm leading-relaxed text-ink/90 whitespace-pre-line">
            {prompt.pro_tips}
          </div>
        </div>
      )}

      {/* RELATED */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 font-display text-xl font-semibold">Related Prompts</h2>
          <PromptGrid prompts={related} categories={categories} />
        </div>
      )}
    </div>
  );
}
