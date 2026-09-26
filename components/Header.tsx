"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Menu, X, Sparkles } from "lucide-react";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/categories", label: "Categories" },
  { href: "/explore?type=free", label: "Free Prompts" },
  { href: "/explore?type=premium", label: "Premium" },
  { href: "/about", label: "About" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-base/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-electric to-violet">
            <Sparkles className="h-4 w-4 text-white" />
          </span>
          <span className="font-display text-lg font-semibold">
            PromptVerse <span className="text-electric">AI</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm text-muted hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/explore"
            aria-label="Search prompts"
            className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted hover:text-ink hover:border-electric transition-colors"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link href="/login" className="text-sm text-muted hover:text-ink transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-base hover:bg-white transition-colors"
          >
            Register
          </Link>
        </div>

        <button
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden grid h-10 w-10 place-items-center rounded-lg border border-border text-ink"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-base px-4 pb-6 pt-2">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setOpen(false)}
                className="border-b border-border/60 py-3 text-[15px] text-ink/90"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex gap-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full border border-border py-2.5 text-center text-sm text-ink"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full bg-ink py-2.5 text-center text-sm font-medium text-base"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
