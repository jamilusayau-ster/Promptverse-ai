import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const { admin } = await requireAdmin();
  const head = { count: "exact" as const, head: true };

  const [users, prompts, free, premium, paidCount, adUnlocks, favorites, viewRows, paidRows] =
    await Promise.all([
      admin.from("profiles").select("*", head),
      admin.from("prompts").select("*", head),
      admin.from("prompts").select("*", head).eq("prompt_type", "free"),
      admin.from("prompts").select("*", head).eq("prompt_type", "premium"),
      admin.from("payments").select("*", head).eq("status", "success"),
      admin.from("unlocks").select("*", head).eq("unlock_method", "rewarded_ads"),
      admin.from("favorites").select("*", head),
      admin.from("prompts").select("view_count"),
      admin.from("payments").select("amount").eq("status", "success"),
    ]);

  const totalViews = (viewRows.data ?? []).reduce(
    (sum: number, r: { view_count: number | null }) => sum + (r.view_count ?? 0),
    0
  );
  const revenueKobo = (paidRows.data ?? []).reduce(
    (sum: number, r: { amount: number }) => sum + r.amount,
    0
  );

  const stats: { label: string; value: string }[] = [
    { label: "Total users", value: String(users.count ?? 0) },
    { label: "Total prompts", value: String(prompts.count ?? 0) },
    { label: "Free prompts", value: String(free.count ?? 0) },
    { label: "Premium prompts", value: String(premium.count ?? 0) },
    { label: "Successful purchases", value: String(paidCount.count ?? 0) },
    { label: "Revenue", value: `₦${(revenueKobo / 100).toLocaleString("en-NG")}` },
    { label: "Ad unlocks", value: String(adUnlocks.count ?? 0) },
    { label: "Prompt views", value: totalViews.toLocaleString("en-NG") },
    { label: "Favorites", value: String(favorites.count ?? 0) },
  ];

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-semibold">Overview</h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl2 border border-border bg-surface p-4">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
