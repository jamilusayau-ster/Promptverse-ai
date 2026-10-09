import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/auth/LogoutButton";

export const metadata: Metadata = { title: "My Dashboard", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  // All of these are protected by Row Level Security: a user can only ever
  // read their own rows.
  const [{ data: profile }, { data: unlocks }, { data: payments }, { data: favorites }] =
    await Promise.all([
      supabase.from("profiles").select("display_name,email,role").eq("user_id", user.id).single(),
      supabase.from("unlocks").select("id,unlock_method,created_at,prompts(title,slug)")
        .eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("payments").select("id,reference,amount,currency,status,created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("favorites").select("id,prompts(title,slug)")
        .eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

  const card = "rounded-xl2 border border-border bg-surface p-5";
  const h2 = "mb-3 font-display text-sm font-semibold uppercase tracking-wide text-muted";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold">
            Hello, {profile?.display_name ?? "Creator"}
          </h1>
          <p className="mt-1 text-sm text-muted">{profile?.email ?? user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {profile?.role === "admin" && (
            <Link href="/admin" className="rounded-full bg-electric/15 px-4 py-2 text-sm text-electric">Admin</Link>
          )}
          <LogoutButton />
        </div>
      </div>

      <section>
        <h2 className={h2}>My Unlocked Prompts</h2>
        <div className={card}>
          {unlocks && unlocks.length > 0 ? (
            <ul className="divide-y divide-border">
              {unlocks.map((u: any) => (
                <li key={u.id} className="flex items-center justify-between gap-3 py-3">
                  <Link href={`/prompts/${u.prompts?.slug}`} className="text-sm text-ink hover:text-electric">
                    {u.prompts?.title}
                  </Link>
                  <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-[11px] text-muted">
                    {u.unlock_method === "payment" ? "Paid" : u.unlock_method === "rewarded_ads" ? "Via ads" : "Admin"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
              You have not unlocked any premium prompts yet.{" "}
              <Link href="/explore?type=premium" className="text-electric hover:underline">Browse premium</Link>
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className={h2}>Purchase History</h2>
        <div className={card}>
          {payments && payments.length > 0 ? (
            <ul className="divide-y divide-border">
              {payments.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                  <span className="text-muted">{new Date(p.created_at).toLocaleDateString()}</span>
                  <span>₦{(p.amount / 100).toLocaleString()}</span>
                  <span className="text-muted capitalize">{p.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No purchases yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className={h2}>Favorites</h2>
        <div className={card}>
          {favorites && favorites.length > 0 ? (
            <ul className="divide-y divide-border">
              {favorites.map((f: any) => (
                <li key={f.id} className="py-3">
                  <Link href={`/prompts/${f.prompts?.slug}`} className="text-sm text-ink hover:text-electric">
                    {f.prompts?.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">You have not saved any favorites yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
