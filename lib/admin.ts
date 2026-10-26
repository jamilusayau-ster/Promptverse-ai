import "server-only";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server-side admin gate. Call it at the top of every admin page and every
 * admin server action. Not logged in -> login page. Logged in but not an
 * admin in the `profiles` table -> 404 (the admin area is not revealed).
 */
export async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") notFound();

  return { user, admin };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** "Duration: 15 sec" lines -> { Duration: "15 sec" } */
export function parseSettings(text: string): Record<string, string> | null {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const i = line.indexOf(":");
    if (i < 1) continue;
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim();
    if (k && v) out[k] = v;
  }
  return Object.keys(out).length ? out : null;
}

export function settingsToText(s: unknown): string {
  if (!s || typeof s !== "object") return "";
  return Object.entries(s as Record<string, unknown>)
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join("\n");
}
