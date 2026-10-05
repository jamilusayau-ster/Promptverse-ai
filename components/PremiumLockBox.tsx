"use client";

import { Lock } from "lucide-react";

/**
 * Phase 2 placeholder. The real unlock modal (rewarded ads + Paystack
 * payment, server-verified) is built in Phase 4/5 and will replace the
 * button's onClick with the actual unlock flow.
 */
export default function PremiumLockBox() {
  return (
    <div className="rounded-xl2 border border-border bg-surface p-6 text-center">
      <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-gold/15">
        <Lock className="h-5 w-5 text-gold" />
      </div>
      <h3 className="font-display text-lg font-medium">This is a Premium Prompt</h3>
      <p className="mt-1.5 text-sm text-muted max-w-sm mx-auto">
        Unlock instantly by watching 3 rewarded ads or paying ₦1,000.
      </p>
      <button
        disabled
        className="mt-5 rounded-full bg-gold/20 px-6 py-2.5 text-sm font-medium text-gold cursor-not-allowed"
        title="Unlock flow ships in Phase 4"
      >
        Unlock Premium Prompt
      </button>
      <p className="mt-3 text-xs text-muted">Unlocking is enabled in the next build phase.</p>
    </div>
  );
}
