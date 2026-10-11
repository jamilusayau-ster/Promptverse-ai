import { NextResponse } from "next/server";
import { finalizePayment } from "@/lib/payments";
import { addUnlockToCookie } from "@/lib/unlockCookie";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!rateLimit(`pay-verify:${clientIp(req)}`, 30, 10 * 60_000)) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }
  let reference = "";
  try { reference = String((await req.json()).reference || ""); } catch {}
  if (!/^pv_[a-f0-9]{32}$/.test(reference)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const result = await finalizePayment(reference);
  if (!result.ok) {
    if (result.error === "not_paid_yet") return NextResponse.json({ pending: true }, { status: 202 });
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  // Remember the unlock for guests (signed cookie). Logged-in users are
  // recognised from the database as well.
  addUnlockToCookie(result.promptId, 60 * 60 * 24 * 365);
  return NextResponse.json({ ok: true });
}
