import { NextResponse } from "next/server";
import crypto from "crypto";
import { finalizePayment } from "@/lib/payments";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Paystack webhook. Paystack calls this itself when a payment succeeds,
 * even if the customer's browser died or their network dropped.
 * Security: the request is only trusted if its HMAC-SHA512 signature,
 * made with our secret key, matches. The payment is then re-verified
 * with Paystack inside finalizePayment, so nothing is trusted blindly.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";
  const secret = process.env.PAYSTACK_SECRET_KEY || "";

  if (!secret || !signature) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (event?.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = String(event?.data?.reference || "");
  if (!/^pv_[a-f0-9]{32}$/.test(reference)) {
    // Not one of our payments. Acknowledge so Paystack does not keep retrying.
    return NextResponse.json({ received: true, ignored: true });
  }

  const result = await finalizePayment(reference);
  if (!result.ok && ["db_error", "unlock_failed", "verify_failed"].includes(result.error)) {
    // Temporary problem on our side: a 500 makes Paystack retry later.
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ received: true });
}
