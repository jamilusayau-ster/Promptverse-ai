"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

/**
 * Standard Google AdSense display ad (NOT a rewarded ad).
 *
 * Safe by default: if the AdSense client id or the slot id is not set in the
 * environment variables, this component renders NOTHING (no empty box, no
 * fake ad). Add the keys in Netlify and ads appear without code changes.
 *
 * Do not place it next to Copy / Unlock / Pay buttons, or on login, payment
 * and dashboard pages.
 */
export type AdPlacement = "home" | "list" | "detail";

// NEXT_PUBLIC_ variables must be referenced statically so Next.js can inline them.
const CLIENT = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT;
const SLOTS: Record<AdPlacement, string | undefined> = {
  home: process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_HOME,
  list: process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_LIST,
  detail: process.env.NEXT_PUBLIC_GOOGLE_AD_SLOT_DETAIL,
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdSlot({
  placement,
  className = "",
}: {
  placement: AdPlacement;
  className?: string;
}) {
  const slot = SLOTS[placement];
  const pushed = useRef(false);

  useEffect(() => {
    if (!CLIENT || !slot || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ad blockers or script failures must never break the page
    }
  }, [slot]);

  if (!CLIENT || !slot) return null;

  return (
    <aside
      aria-label="Advertisement"
      className={`mx-auto my-8 w-[calc(100%-2rem)] max-w-4xl overflow-hidden rounded-xl2 border border-border/60 bg-surface/40 p-2 [&:has(ins[data-ad-status=unfilled])]:hidden ${className}`}
    >
      <Script
        id="adsense-loader"
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <p className="mb-1 text-center text-[10px] uppercase tracking-wider text-muted">
        Advertisement
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
