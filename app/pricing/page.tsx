import type { Metadata } from "next";
import Link from "next/link";
import StaticPage from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Free prompts for everyone. Unlock any premium prompt for a one-time payment of ₦1,000.",
};

export default function PricingPage() {
  return (
    <StaticPage title="Pricing">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl2 border border-border bg-surface p-5">
          <p className="text-xs font-medium text-electric">FREE</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">₦0</p>
          <p className="mt-2 text-sm text-muted">
            Browse, search and copy every free prompt. No account required.
          </p>
        </div>
        <div className="rounded-xl2 border border-border bg-surface p-5">
          <p className="text-xs font-medium text-gold">PREMIUM</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">₦1,000</p>
          <p className="mt-2 text-sm text-muted">
            One-time payment per premium prompt. Unlock it instantly and keep access.
          </p>
        </div>
      </div>
      <h2>How premium unlocking works</h2>
      <ul>
        <li>Open any premium prompt and tap Unlock.</li>
        <li>Pay securely with Paystack (card, bank transfer and other methods Paystack offers).</li>
        <li>Your prompt unlocks as soon as the payment is confirmed by our server.</li>
        <li>Create a free account to keep your unlocked prompts available on all your devices.</li>
      </ul>
      <p>
        We never see or store your card details. Payments are processed by Paystack.
        See our <Link href="/terms">Terms of Service</Link> for the refund policy.
      </p>
    </StaticPage>
  );
}
