import { requireAdmin } from "@/lib/admin";
import Flash from "@/components/admin/Flash";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { setUserRole } from "@/app/admin/ops-actions";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { error?: string; ok?: string };
}) {
  const { user, admin } = await requireAdmin();
  const { data } = await admin
    .from("profiles")
    .select("user_id,display_name,email,role,created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const users: any[] = data ?? [];

  return (
    <div>
      <Flash error={searchParams.error} ok={searchParams.ok} />
      <h2 className="mb-3 font-display text-lg font-semibold">Users ({users.length})</h2>

      <div className="overflow-x-auto rounded-xl2 border border-border">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-surface text-xs text-muted">
            <tr>
              <th className="px-3 py-2.5 font-medium">Name</th>
              <th className="px-3 py-2.5 font-medium">Email</th>
              <th className="px-3 py-2.5 font-medium">Joined</th>
              <th className="px-3 py-2.5 font-medium">Role</th>
              <th className="px-3 py-2.5 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id} className="border-t border-border/70">
                <td className="px-3 py-2.5 text-ink/90">{u.display_name || "—"}</td>
                <td className="px-3 py-2.5 text-ink/90">{u.email}</td>
                <td className="px-3 py-2.5 text-xs text-muted">{fmtDate(u.created_at)}</td>
                <td className="px-3 py-2.5">
                  <span className={u.role === "admin" ? "rounded-full bg-violet/20 px-2 py-0.5 text-[11px] text-violet" : "rounded-full border border-border px-2 py-0.5 text-[11px] text-muted"}>
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {u.user_id !== user.id && (
                    <form action={setUserRole}>
                      <input type="hidden" name="user_id" value={u.user_id} />
                      <input type="hidden" name="role" value={u.role === "admin" ? "user" : "admin"} />
                      <ConfirmButton
                        message={u.role === "admin" ? `Remove admin rights from ${u.email}?` : `Make ${u.email} an admin? They will be able to manage everything.`}
                        className="rounded-full border border-border px-3 py-1 text-xs text-ink hover:border-electric"
                      >
                        {u.role === "admin" ? "Remove admin" : "Make admin"}
                      </ConfirmButton>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
