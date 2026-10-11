import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasAccess } from "@/lib/payments";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

/**
 * The ONLY route that can return a premium master prompt. It checks the
 * visitor's verified unlock on the server first. No unlock = 403 and the
 * prompt text is never sent.
 */
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  if (!rateLimit(`unlocked:${clientIp(req)}`, 60, 60_000)) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }
  const admin = createAdminClient();
  const { data: prompt } = await admin
    .from("prompts")
    .select("id,prompt_type,master_prompt,negative_prompt")
    .eq("slug", params.slug).eq("status", "published").maybeSingle();
  if (!prompt) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const headers = { "Cache-Control": "no-store" };
  if (prompt.prompt_type === "premium" && !(await hasAccess(prompt.id))) {
    return NextResponse.json({ error: "locked" }, { status: 403, headers });
  }
  return NextResponse.json(
    { master_prompt: prompt.master_prompt, negative_prompt: prompt.negative_prompt },
    { headers }
  );
}
