import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-2 gap-8 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <span className="font-display text-lg font-semibold">
            PromptVerse <span className="text-electric">AI</span>
          </span>
          <p className="mt-3 text-sm text-muted max-w-xs">
            Better prompts. Better creations.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ink mb-3">Explore</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/explore?type=free" className="hover:text-ink">Free Prompts</Link></li>
            <li><Link href="/explore?type=premium" className="hover:text-ink">Premium Prompts</Link></li>
            <li><Link href="/categories" className="hover:text-ink">Categories</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ink mb-3">Company</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/about" className="hover:text-ink">About</Link></li>
            <li><Link href="/contact" className="hover:text-ink">Contact</Link></li>
            <li><Link href="/pricing" className="hover:text-ink">Pricing</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-ink mb-3">Legal</h3>
          <ul className="space-y-2 text-sm text-muted">
            <li><Link href="/privacy" className="hover:text-ink">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-ink">Terms of Service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} PromptVerse AI. All rights reserved.
      </div>
    </footer>
  );
}
