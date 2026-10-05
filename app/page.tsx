import Link from "next/link";
import { ArrowRight, Video, Image as ImageIcon, MessageSquare, Wand2 } from "lucide-react";
import PromptCardFallback, { PromptCardData } from "@/components/PromptCard";
import PromptGrid from "@/components/PromptGrid";
import { fetchPrompts, fetchCategories } from "@/lib/queries";

export const revalidate = 60;

// Placeholder data — Phase 2 replaces this with a live Supabase query
// against the `prompts_public` view.
const SAMPLE_PROMPTS: PromptCardData[] = [
  {
    slug: "google-veo-3-cinematic-master-prompt",
    title: "Google Veo 3 Cinematic Master Prompt",
    description: "Create ultra-realistic cinematic AI videos with dynamic camera movement and natural lighting.",
    thumbnail_url: null,
    category_name: "Google Veo",
    platform: "🎬 Google Veo",
    prompt_type: "free",
    view_count: 12400,
    featured: true,
  },
  {
    slug: "grandpa-extreme-sports-viral-master-prompt",
    title: "Grandpa Extreme Sports Viral Master Prompt",
    description: "Professional viral sports video prompt built for maximum watch-time and shares.",
    thumbnail_url: null,
    category_name: "Viral Reels",
    platform: "🔥 Kling AI",
    prompt_type: "premium",
    view_count: 8100,
  },
  {
    slug: "product-photography-studio-light-prompt",
    title: "Studio Product Photography Master Prompt",
    description: "Clean, commercial-grade product shots with perfect studio lighting and reflections.",
    thumbnail_url: null,
    category_name: "Product Photography",
    platform: "🖼️ Image",
    prompt_type: "free",
    view_count: 5320,
  },
  {
    slug: "runway-storytelling-short-film-prompt",
    title: "Runway Short Film Storytelling Prompt",
    description: "A structured narrative prompt for emotionally resonant short-form storytelling.",
    thumbnail_url: null,
    category_name: "Storytelling",
    platform: "🛫 Runway",
    prompt_type: "premium",
    view_count: 3980,
  },
];

const PLATFORMS = [
  { icon: Video, label: "Video Generation" },
  { icon: ImageIcon, label: "Image Prompts" },
  { icon: MessageSquare, label: "ChatGPT Prompts" },
  { icon: Wand2, label: "Cinematic Prompts" },
];

export default async function HomePage() {
  const [liveFeatured, categories] = await Promise.all([
    fetchPrompts({ sort: "featured" }),
    fetchCategories(),
  ]);
  const hasLiveData = liveFeatured.length > 0;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-node-glow" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
              AI Prompts for Creators
            </span>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold leading-[1.08] text-ink">
              Better prompts.
              <br />
              Better creations.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              Discover professional AI master prompts for video, image, storytelling, marketing
              and creative workflows — built by creators, for creators.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/explore?type=free"
                className="rounded-full bg-ink px-6 py-3 text-sm font-medium text-base hover:bg-white transition-colors"
              >
                Explore Free Prompts
              </Link>
              <Link
                href="/explore?type=premium"
                className="flex items-center gap-1.5 rounded-full border border-border px-6 py-3 text-sm font-medium text-ink hover:border-electric transition-colors"
              >
                Explore Premium <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Constellation visual — brand mark, single element of boldness */}
          <div className="relative mx-auto hidden lg:block h-80 w-80">
            <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="nodeGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4D7FFF" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
              {[
                [60, 90], [110, 60], [170, 70], [230, 100], [260, 160],
                [220, 220], [150, 240], [90, 210], [50, 160], [140, 150],
                [190, 150], [170, 190],
              ].map(([x, y], i, arr) => (
                <g key={i}>
                  {i < arr.length - 1 && (
                    <line
                      x1={x} y1={y}
                      x2={arr[(i + 3) % arr.length][0]} y2={arr[(i + 3) % arr.length][1]}
                      stroke="url(#nodeGrad)" strokeOpacity="0.35" strokeWidth="1"
                    />
                  )}
                  <circle cx={x} cy={y} r={i === 9 || i === 10 ? 5 : 3.5} fill="url(#nodeGrad)" />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* PLATFORM STRIP */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {PLATFORMS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl2 border border-border bg-surface px-4 py-3.5"
          >
            <Icon className="h-4.5 w-4.5 text-electric shrink-0" />
            <span className="text-sm text-ink/90">{label}</span>
          </div>
        ))}
      </section>

      {/* FEATURED PROMPTS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-semibold">Featured Prompts</h2>
          <Link href="/explore" className="flex items-center gap-1 text-sm text-electric hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {hasLiveData ? (
          <PromptGrid prompts={liveFeatured.slice(0, 4)} categories={categories} />
        ) : (
          <>
            <p className="mb-4 text-xs text-muted">
              Showing sample prompts — add real prompts in Supabase to replace these.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {SAMPLE_PROMPTS.map((p) => (
                <PromptCardFallback key={p.slug} prompt={p} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="rounded-xl2 border border-border bg-surface px-6 py-12 sm:px-12 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold">
            Ready to create better?
          </h2>
          <p className="mt-3 text-muted max-w-md mx-auto">
            Join creators using PromptVerse AI to skip the guesswork and generate stunning results.
          </p>
          <Link
            href="/explore"
            className="mt-6 inline-block rounded-full bg-ink px-7 py-3 text-sm font-medium text-base hover:bg-white transition-colors"
          >
            Start Exploring
          </Link>
        </div>
      </section>
    </>
  );
}
