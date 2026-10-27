"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { finalizePayment } from "@/lib/payments";

function text(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

const enc = encodeURIComponent;

/** Ask Paystack again about a payment and finish it if it was really paid. */
export async function recheckPayment(fd: FormData): Promise<void> {
  await requireAdmin();
  const reference = text(fd, "reference");
  if (!/^pv_[a-f0-9]{32}$/.test(reference)) {
    redirect("/admin/payments?error=" + enc("Invalid payment reference."));
  }
  const result = await finalizePayment(reference);
  revalidatePath("/admin/payments");
  if (result.ok) {
    redirect("/admin/payments?ok=" + enc("Payment confirmed with Paystack and the prompt is unlocked."));
  }
  redirect("/admin/payments?error=" + enc(`Not confirmed by Paystack (${result.error}).`));
}

/** Give someone access to a prompt by email (support / gifts). */
export async function grantUnlock(fd: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const email = text(fd, "email").toLowerCase();
  const promptId = text(fd, "prompt_id");
  if (!email.includes("@") || !promptId) {
    redirect("/admin/unlocks?error=" + enc("Enter a valid email and choose a prompt."));
  }
  const { data: profile } = await admin
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .maybeSingle();
  const { error } = await admin.from("unlocks").insert({
    user_id: profile?.user_id ?? null,
    email,
    prompt_id: promptId,
    unlock_method: "admin",
  });
  if (error) {
    const msg = error.code === "23505" ? "That user already has access to this prompt." : error.message;
    redirect("/admin/unlocks?error=" + enc(msg));
  }
  revalidatePath("/admin/unlocks");
  redirect("/admin/unlocks?ok=" + enc("Access granted."));
}

export async function revokeUnlock(fd: FormData): Promise<void> {
  await requireAdmin().then(async ({ admin }) => {
    const id = text(fd, "id");
    if (id) await admin.from("unlocks").delete().eq("id", id);
  });
  revalidatePath("/admin/unlocks");
  redirect("/admin/unlocks?ok=" + enc("Access removed."));
}

export async function setUserRole(fd: FormData): Promise<void> {
  const { user, admin } = await requireAdmin();
  const userId = text(fd, "user_id");
  const role = text(fd, "role");
  if (!userId || !["user", "admin"].includes(role)) redirect("/admin/users");
  if (userId === user.id) {
    redirect("/admin/users?error=" + enc("You cannot change your own role."));
  }
  const { error } = await admin
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) redirect("/admin/users?error=" + enc(error.message));
  revalidatePath("/admin/users");
  redirect("/admin/users?ok=" + enc("Role updated."));
}
