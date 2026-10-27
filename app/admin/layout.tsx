import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/prompts", label: "Prompts" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/unlocks", label: "Unlocks" },
  { href: "/admin/users", label: "Users" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="border-b border-border pb-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-xl font-semibold">Admin</h1>
          <Link href="/" className="text-sm text-muted hover:text-ink">View site</Link>
        </div>
        <nav className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}
