import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <h1 className="font-display text-xl font-semibold">Admin</h1>
        <nav className="flex items-center gap-5 text-sm">
          <Link href="/admin" className="text-muted hover:text-ink">Overview</Link>
          <Link href="/admin/prompts" className="text-muted hover:text-ink">Prompts</Link>
          <Link href="/" className="text-muted hover:text-ink">View site</Link>
        </nav>
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}
