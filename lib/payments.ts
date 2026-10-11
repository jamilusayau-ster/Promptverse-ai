import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { cookieHasUnlock } from "@/lib/unlockCookie";

export const DEFAULT_PRICE_NGN = Number(process.env.PROMPT_UNLOCK_PRICE_NGN || 1000);
export const PAYSTACK_BASE = "https://api.paystack.co";

export function priceKobo(priceNgn: number | null | undefined): number {
  const ngn = priceNgn && priceNgn > 0 ? priceNgn : DEFAULT_PRICE_NGN;
  return Math.round(ngn * 100);
}

function paystackHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function paystackInitialize(body: Record<string, unknown>) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: paystackHeaders(),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  return res.json();
}

export async function paystackVerify(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: paystackHeaders(),
    cache: "no-store",
  });
  return res.json();
}

export type FinalizeResult =
  | { ok: true; promptId: string; slug: string | null }
  | { ok: false; error: string };

/**
 * The ONLY place a payment becomes an unlock. Called by the verify route
 * and by the Paystack webhook. It re-checks everything with Paystack using
 * the secret key, so a forged frontend "success" can never unlock anything.
 * It is idempotent: calling it twice for one reference gives one unlock.
 */
export async function finalizePayment(reference: string): Promise<FinalizeResult> {
  const admin = createAdminClient();

  const { data: payment } = await admin
    .from("payments").select("*").eq("reference", reference).maybeSingle();
  if (!payment) return { ok: false, error: "unknown_reference" };

  const { data: prompt } = await admin
    .from("prompts").select("id,slug").eq("id", payment.prompt_id).maybeSingle();

  if (payment.status !== "success") {
    const result = await paystackVerify(reference);
    const tx = result?.data;

    if (!result?.status || !tx) return { ok: false, error: "verify_failed" };

    if (tx.status === "failed") {
      await admin.from("payments").update({ status: "failed" }).eq("reference", reference);
      return { ok: false, error: "payment_failed" };
    }
    if (tx.status !== "success") return { ok: false, error: "not_paid_yet" };

    const emailOk = String(tx.customer?.email || "").toLowerCase() === String(payment.email).toLowerCase();
    if (
      tx.reference !== reference ||
      tx.amount !== payment.amount ||
      tx.currency !== payment.currency ||
      !emailOk
    ) {
      await admin.from("payments").update({ status: "failed", metadata: { reason: "mismatch" } }).eq("reference", reference);
      return { ok: false, error: "mismatch" };
    }

    await admin.from("payments")
      .update({ status: "success", verified_at: new Date().toISOString() })
      .eq("reference", reference);
  }

  const { data: existing } = await admin
    .from("unlocks").select("id").eq("payment_reference", reference).maybeSingle();
  if (!existing) {
    const { error } = await admin.from("unlocks").insert({
      user_id: payment.user_id,
      email: payment.email,
      prompt_id: payment.prompt_id,
      unlock_method: "payment",
      payment_reference: reference,
    });
    // 23505 = unique violation: an unlock already exists, which is fine.
    if (error && error.code !== "23505") return { ok: false, error: "unlock_failed" };
  }
  return { ok: true, promptId: payment.prompt_id, slug: prompt?.slug ?? null };
}

/** Does the current visitor have access to this premium prompt? */
export async function hasAccess(promptId: string): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const admin = createAdminClient();

  if (user) {
    const { data: profile } = await admin
      .from("profiles").select("role").eq("user_id", user.id).maybeSingle();
    if (profile?.role === "admin") return true;

    const notExpired = (rows: { expires_at: string | null }[] | null) =>
      (rows ?? []).some((r) => !r.expires_at || new Date(r.expires_at) > new Date());

    const { data: byUser } = await admin
      .from("unlocks").select("expires_at")
      .eq("prompt_id", promptId).eq("user_id", user.id);
    if (notExpired(byUser)) return true;

    // Purchases made as a guest with the same (confirmed) email also count.
    if (user.email && user.email_confirmed_at) {
      const { data: byEmail } = await admin
        .from("unlocks").select("expires_at")
        .eq("prompt_id", promptId).eq("email", user.email.toLowerCase());
      if (notExpired(byEmail)) return true;
    }
  }
  return cookieHasUnlock(promptId);
}
