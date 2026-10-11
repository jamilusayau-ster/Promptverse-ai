"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Lock, X, CreditCard, Gift, Loader2, PartyPopper } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CopyButton from "@/components/CopyButton";

interface Props {
  slug: string;
  priceNgn: number;
}
interface Unlocked {
  master_prompt: string;
  negative_prompt: string | null;
}

declare global {
  interface Window {
    PaystackPop?: new () => {
      resumeTransaction: (
        accessCode: string,
        callbacks?: { onSuccess?: (tx: any) => void; onCancel?: () => void; onError?: (e: any) => void }
      ) => void;
    };
  }
}

const REF_KEY = (slug: string) => `pv_pending_ref:${slug}`;

function loadPaystackScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.PaystackPop) return resolve(true);
    const existing = document.querySelector('script[data-paystack]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v2/inline.js";
    s.async = true;
    s.dataset.paystack = "1";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function PremiumUnlock({ slug, priceNgn }: Props) {
  const [content, setContent] = useState<Unlocked | null>(null);
  const [checking, setChecking] = useState(true);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const price = `₦${priceNgn.toLocaleString()}`;

  const fetchContent = useCallback(async (): Promise<boolean> => {
    const res = await fetch(`/api/prompts/${slug}/unlocked`, { cache: "no-store" });
    if (!res.ok) return false;
    setContent(await res.json());
    return true;
  }, [slug]);

  // Verify a reference with the server (server asks Paystack). Retries a few
  // times because a payment can take a moment to settle.
  const verifyReference = useCallback(
    async (reference: string, attempts = 6): Promise<boolean> => {
      for (let i = 0; i < attempts; i++) {
        const res = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        if (res.ok) {
          localStorage.removeItem(REF_KEY(slug));
          if (await fetchContent()) {
            setJustUnlocked(true);
            setOpen(false);
            return true;
          }
        }
        if (res.status !== 202) break; // 202 = not settled yet, try again
        await new Promise((r) => setTimeout(r, 2500));
      }
      return false;
    },
    [fetchContent, slug]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!cancelled && data.user) setLoggedIn(true);

      if (await fetchContent()) {
        if (!cancelled) setChecking(false);
        return;
      }
      // Returning from a Paystack redirect, or from a closed tab?
      const urlRef = new URLSearchParams(window.location.search).get("ref");
      const ref = urlRef || localStorage.getItem(REF_KEY(slug));
      if (ref && /^pv_[a-f0-9]{32}$/.test(ref)) await verifyReference(ref);
      if (!cancelled) setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [fetchContent, verifyReference, slug]);

  async function payNow() {
    setError(null);
    if (!loggedIn && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address. Your receipt and access are tied to it.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, email: email.trim() }),
      });
      const data = await res.json();
      if (res.status === 409) { await fetchContent(); setOpen(false); return; }
      if (!res.ok) {
        setError(
          res.status === 429 ? "Too many attempts. Please wait a few minutes."
          : "We could not start the payment. Please try again.");
        setBusy(false);
        return;
      }

      localStorage.setItem(REF_KEY(slug), data.reference);
      const ready = await Promise.race([
        loadPaystackScript(),
        new Promise<boolean>((r) => setTimeout(() => r(false), 10000)),
      ]);

      if (!ready || !window.PaystackPop) {
        window.location.href = data.authorization_url; // redirect fallback
        return;
      }
      const popup = new window.PaystackPop();
      popup.resumeTransaction(data.access_code, {
        onSuccess: async () => {
          setBusy(true);
          const ok = await verifyReference(data.reference);
          if (!ok) setError("Payment received but not confirmed yet. Refresh this page in a minute.");
          setBusy(false);
        },
        onCancel: () => setBusy(false),
        onError: () => { setError("The payment window had a problem. Please try again."); setBusy(false); },
      });
    } catch {
      setError("Network problem. Check your connection and try again.");
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center rounded-xl2 border border-border bg-surface p-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted" />
      </div>
    );
  }

  if (content) {
    return (
      <div className="space-y-4">
        {justUnlocked && (
          <div className="rounded-xl2 border border-electric/40 bg-electric/10 p-4">
            <p className="flex items-center gap-2 font-display text-base font-medium">
              <PartyPopper className="h-5 w-5 text-electric" /> Prompt Unlocked!
            </p>
            {!loggedIn && (
              <p className="mt-1 text-sm text-muted">
                <Link href="/register" className="text-electric hover:underline">Create a free account</Link>{" "}
                to keep your unlocked prompts synchronized.
              </p>
            )}
          </div>
        )}
        <div className="rounded-xl2 border border-border bg-[#0D1020] p-5">
          <pre className="whitespace-pre-wrap break-words font-body text-sm leading-relaxed text-ink/90">
            {content.master_prompt}
          </pre>
          <div className="mt-4"><CopyButton text={content.master_prompt} /></div>
        </div>
        {content.negative_prompt && (
          <div>
            <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-muted">Negative Prompt</h3>
            <div className="rounded-xl2 border border-border bg-[#0D1020] p-5">
              <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink/90">{content.negative_prompt}</pre>
              <div className="mt-4"><CopyButton text={content.negative_prompt} label="Copy Negative Prompt" /></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="rounded-xl2 border border-border bg-surface p-6 text-center">
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-gold/15">
          <Lock className="h-5 w-5 text-gold" />
        </div>
        <h3 className="font-display text-lg font-medium">This is a Premium Prompt</h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
          Unlock the full master prompt instantly for {price}.
        </p>
        <button onClick={() => { setOpen(true); setError(null); }}
          className="mt-5 rounded-full bg-gold px-6 py-2.5 text-sm font-medium text-base transition-opacity hover:opacity-90">
          Unlock Premium Prompt
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center"
          role="dialog" aria-modal="true" onClick={() => !busy && setOpen(false)}>
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-border bg-surface p-6 sm:max-w-md sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Unlock this Premium Prompt</h2>
                <p className="mt-1 text-sm text-muted">Choose how you want to unlock this prompt.</p>
              </div>
              <button aria-label="Close" disabled={busy} onClick={() => setOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border text-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl2 border border-border bg-base/60 p-4 opacity-70">
                <p className="flex items-center gap-2 text-sm font-medium"><Gift className="h-4 w-4 text-electric" /> Watch Ads</p>
                <p className="mt-1 text-sm text-muted">Watch 3 rewarded ads to unlock this prompt.</p>
                <button disabled className="mt-3 w-full cursor-not-allowed rounded-full border border-border py-2.5 text-sm text-muted">
                  Coming soon
                </button>
              </div>

              <div className="rounded-xl2 border border-electric/40 bg-base/60 p-4">
                <p className="flex items-center gap-2 text-sm font-medium"><CreditCard className="h-4 w-4 text-electric" /> Pay {price}</p>
                <p className="mt-1 text-sm text-muted">Unlock this premium prompt instantly for {price}.</p>
                {!loggedIn && (
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address" autoComplete="email"
                    className="mt-3 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-electric" />
                )}
                {error && <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
                <button onClick={payNow} disabled={busy}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-2.5 text-sm font-medium text-base hover:bg-white disabled:opacity-60">
                  {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Please wait...</> : `Pay ${price}`}
                </button>
                <p className="mt-2 text-center text-[11px] text-muted">Secure payment by Paystack. Card, bank, or transfer.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
