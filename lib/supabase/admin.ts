import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * ⚠️ SERVICE ROLE CLIENT — bypasses Row Level Security entirely.
 *
 * Import this ONLY inside:
 *   - app/api/**\/route.ts (Route Handlers)
 *   - Server Actions
 *
 * NEVER import this file in any file that also runs in the browser
 * (no "use client" components, no client hooks). The `server-only`
 * package will throw a build error if that ever happens by mistake.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
