import { requireAdmin } from "@/lib/admin";
import Flash from "@/components/admin/Flash";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { grantUnlock, revokeUnlock } from "@/app/admin/ops-actions";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

const input =
  "w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-electric focus:outline-none";

const methodLabel: Record<string, string> = {
  payment: "Payment",
  rewarded_ads: "Ads",
  admin: "Admin",
};

export default async function AdminUnlocksPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  const { admin } = await requireAdmin();
  const [{ data: unlockData }, { data: promptData }] = await Promise.all([
    admin
      .from("unlocks")
      .select("id,email,unlock_method,payment_reference,created_at,prompts(title)")
      .order("created_at", { ascending: false })
      .limit(100),
    admin.from("prompts").select("id,title").eq("prompt_type", "premium").order("title"),
  ]);
  const unlocks: any[] = unlockData ?? [];
  const prompts: any[] = promptData ?? [];

  return (
    <div>
      <Flash error={searchParams.error} ok={searchParams.ok} />

      <h2 className="mb-3 font-display text-lg font-semibold">Give access</h2>
      <form action={grantUnlock} className="mb-8 grid gap-3 rounded-xl2 border border-border bg-surface p-4 sm:grid-cols-[1fr_1fr_auto]">
        <input name="email" type="email" required placeholder="customer@email.com" className={input} />
        <select name="prompt_id" required defaultValue="" className={input}>
          <option value="" disabled>Choose premium prompt</option>
          {prompts.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
        <button type="submit" className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-base hover:bg-white">
          Grant
        </button>
      </form>

      <h2 className="mb-3 font-display text-lg font-semibold">Recent unlocks</h2>
      <div className="overflow-x-auto rounded-xl2 border border-border">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 font-medium">Email</th>
              <th className="px-3 py-2.5 font-medium">Prompt</th>
              <th className="px-3 py-2.5 font-medium">Method</th>
              <th className="px-3 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {unlocks.map((u) => (
              <tr key={u.id} className="border-t border-border/70 align-top">
                <td className="px-3 py-2.5 text-xs text-muted">{fmtDate(u.created_at)}</td>
                <td className="px-3 py-2.5 text-ink/90">{u.email || "—"}</td>
                <td className="px-3 py-2.5 text-ink/90">{u.prompts?.title ?? "—"}</td>
                <td className="px-3 py-2.5">
                  <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                    {methodLabel[u.unlock_method] ?? u.unlock_method}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <form action={revokeUnlock}>
                    <input type="hidden" name="id" value={u.id} />
                    <ConfirmButton
                      message="Remove this access? The person will have to unlock the prompt again."
                      className="rounded-full border border-red-500/40 px-3 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      Remove
                    </ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
            {unlocks.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted">No unlocks yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
