import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasAccess, paystackInitialize, priceKobo } from "@/lib/payments";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  if (!rateLimit(`pay-init:${clientIp(req)}`, 10, 10 * 60_000)) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  let body: { slug?: string; email?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!slug) return NextResponse.json({ error: "bad_request" }, { status: 400 });

  // Identity comes from the server session when logged in, never from the client.
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = (user?.email || body.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "email_required" }, { status: 400 });

  // The prompt and the PRICE come from the database, not from the browser.
  const admin = createAdminClient();
  const { data: prompt } = await admin
    .from("prompts").select("id,slug,price_ngn")
    .eq("slug", slug).eq("status", "published").eq("prompt_type", "premium").maybeSingle();
  if (!prompt) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (await hasAccess(prompt.id)) {
    return NextResponse.json({ error: "already_unlocked" }, { status: 409 });
  }

  const amount = priceKobo(prompt.price_ngn);
  const reference = `pv_${randomUUID().replace(/-/g, "")}`;

  const { error: insertError } = await admin.from("payments").insert({
    user_id: user?.id ?? null,
    email,
    prompt_id: prompt.id,
    reference,
    amount,
    currency: "NGN",
    status: "pending",
    gateway: "paystack",
    metadata: { slug: prompt.slug },
  });
  if (insertError) return NextResponse.json({ error: "server_error" }, { status: 500 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const result = await paystackInitialize({
    email,
    amount,
    currency: "NGN",
    reference,
    callback_url: `${siteUrl}/prompts/${prompt.slug}?ref=${reference}`,
    metadata: { prompt_id: prompt.id, slug: prompt.slug },
  });

  if (!result?.status || !result?.data?.access_code) {
    await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
    return NextResponse.json({ error: "gateway_error" }, { status: 502 });
  }

  return NextResponse.json({
    reference,
    access_code: result.data.access_code,
    authorization_url: result.data.authorization_url,
  });
}
