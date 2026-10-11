import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { finalizePayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

// Paystack calls this server-to-server, so payments still complete even if
// the buyer closes the browser right after paying. Set the URL in Paystack:
// Settings > API Keys & Webhooks > Webhook URL
//   https://YOUR-SITE.netlify.app/api/payments/webhook
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";
  const expected = createHmac("sha512", process.env.PAYSTACK_SECRET_KEY || "").update(raw).digest("hex");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(raw);
    if (event?.event === "charge.success" && event?.data?.reference) {
      await finalizePayment(String(event.data.reference));
    }
  } catch {}
  return NextResponse.json({ received: true });
}
