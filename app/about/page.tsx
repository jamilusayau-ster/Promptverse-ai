import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "About",
  description: "PromptVerse AI is a library of professional AI master prompts for creators.",
};

export default function AboutPage() {
  return (
    <StaticPage title="About PromptVerse AI">
      <p>
        PromptVerse AI is a library of professional AI master prompts for video, image,
        storytelling, marketing and creative workflows. Our tagline says it best:
        better prompts, better creations.
      </p>
      <h2>What you will find here</h2>
      <ul>
        <li>Free prompts you can copy and use right away, with no account needed.</li>
        <li>Premium prompts with a free preview, unlocked once for a small one-time price.</li>
        <li>Recommended settings, negative prompts, how-to steps and pro tips for each prompt.</li>
        <li>Prompts organised by platform and category, such as Google Veo, Kling AI, Runway, ChatGPT and more.</li>
      </ul>
      <h2>Why we built it</h2>
      <p>
        Good results from AI tools start with a good prompt. We write, test and organise
        prompts so creators can spend less time guessing and more time creating.
      </p>
      <h2>Important note</h2>
      <p>
        AI tools change often and results can vary between runs and between tools. We
        do not guarantee any specific output from a prompt.
      </p>
      <p>
        Questions or feedback? Visit our <Link href="/contact">Contact page</Link>.
      </p>
    </StaticPage>
  );
}
