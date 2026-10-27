import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import Flash from "@/components/admin/Flash";
import { recheckPayment } from "@/app/admin/ops-actions";
import { fmtDate, naira } from "@/lib/format";

export const dynamic = "force-dynamic";

const TABS = [
  { value: "", label: "All" },
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const badge: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-300",
  pending: "bg-gold/15 text-gold",
  failed: "bg-red-500/15 text-red-300",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { status?: string; error?: string; ok?: string };
}) {
  const { admin } = await requireAdmin();
  const status = ["success", "pending", "failed"].includes(searchParams.status ?? "")
    ? (searchParams.status as string)
    : "";

  const base = admin
    .from("payments")
    .select("id,reference,email,amount,status,created_at,prompts(title)");
  const query = status ? base.eq("status", status) : base;
  const { data } = await query.order("created_at", { ascending: false }).limit(100);
  const payments: any[] = data ?? [];

  const { data: paid } = await admin.from("payments").select("amount").eq("status", "success");
  const revenue = (paid ?? []).reduce((s: number, p: { amount: number }) => s + p.amount, 0);

  return (
    <div>
      <Flash error={searchParams.error} ok={searchParams.ok} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Payments</h2>
        <p className="text-sm text-muted">
          Total confirmed revenue: <span className="font-medium text-ink">{naira(revenue)}</span>
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.label}
            href={t.value ? `/admin/payments?status=${t.value}` : "/admin/payments"}
            className={`rounded-full border px-3 py-1.5 text-xs ${
              status === t.value ? "border-electric text-ink" : "border-border text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <p className="mb-3 text-xs text-muted">
        Showing the latest {payments.length}. “Pending” rows are often checkouts the customer never finished. Use
        Re-check to ask Paystack again — it only unlocks the prompt if Paystack confirms the payment.
      </p>

      <div className="overflow-x-auto rounded-xl2 border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 font-medium">Email</th>
              <th className="px-3 py-2.5 font-medium">Prompt</th>
              <th className="px-3 py-2.5 font-medium">Amount</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-t border-border/70 align-top">
                <td className="px-3 py-2.5 text-xs text-muted">{fmtDate(p.created_at)}</td>
                <td className="px-3 py-2.5 text-ink/90">
                  {p.email}
                  <p className="mt-0.5 font-mono text-[10px] text-muted">{p.reference}</p>
                </td>
                <td className="px-3 py-2.5 text-ink/90">{p.prompts?.title ?? "—"}</td>
                <td className="px-3 py-2.5">{naira(p.amount)}</td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] ${badge[p.status] ?? "bg-surface2 text-muted"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {p.status !== "success" && (
                    <form action={recheckPayment}>
                      <input type="hidden" name="reference" value={p.reference} />
                      <button type="submit" className="rounded-full border border-border px-3 py-1 text-xs text-ink hover:border-electric">
                        Re-check
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted">No payments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
