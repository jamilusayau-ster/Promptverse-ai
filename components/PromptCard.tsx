import Link from "next/link";
import Image from "next/image";
import { Eye, Lock, Star } from "lucide-react";

export interface PromptCardData {
  slug: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  category_name: string;
  platform: string | null;
  prompt_type: "free" | "premium";
  view_count: number;
  featured?: boolean;
}

export default function PromptCard({ prompt }: { prompt: PromptCardData }) {
  const isPremium = prompt.prompt_type === "premium";

  return (
    <Link
      href={`/prompts/${prompt.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl2 border border-border bg-surface transition-colors hover:border-electric/60"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface2">
        {prompt.thumbnail_url ? (
          <Image
            src={prompt.thumbnail_url}
            alt={prompt.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="h-full w-full bg-node-glow" />
        )}

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-base/80 px-2.5 py-1 text-[11px] font-medium text-ink backdrop-blur">
          {prompt.platform}
        </div>

        {prompt.featured && (
          <div className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-gold/90">
            <Star className="h-3.5 w-3.5 text-base" fill="currentColor" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted">{prompt.category_name}</span>
          <span
            className={
              isPremium
                ? "rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-medium text-gold"
                : "rounded-full bg-electric/15 px-2 py-0.5 text-[11px] font-medium text-electric"
            }
          >
            {isPremium ? "PREMIUM" : "FREE"}
          </span>
        </div>

        <h3 className="mt-2 line-clamp-2 font-display text-[15px] font-medium leading-snug text-ink">
          {prompt.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted">{prompt.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-muted">
            <Eye className="h-3.5 w-3.5" /> {prompt.view_count.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-electric">
            {isPremium ? (
              <>
                <Lock className="h-3.5 w-3.5" /> Unlock
              </>
            ) : (
              "View Prompt"
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
