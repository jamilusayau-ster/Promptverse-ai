import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Guests have no account, so a verified unlock is remembered in a signed,
 * httpOnly cookie. The signature means the browser cannot forge or edit it.
 * Set UNLOCK_COOKIE_SECRET in Netlify (any long random text). If it is not
 * set, a key derived from the service role key is used instead.
 */
const COOKIE = "pv_unlocks";

function secret() {
  return process.env.UNLOCK_COOKIE_SECRET || `pv:${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
}
function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

interface Payload { p: Record<string, number>; } // promptId -> expiry (unix seconds)

function read(): Payload {
  const raw = cookies().get(COOKIE)?.value;
  if (!raw) return { p: {} };
  const [body, sig] = raw.split(".");
  if (!body || !sig) return { p: {} };
  const expected = sign(body);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return { p: {} };
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch {
    return { p: {} };
  }
}

export function cookieHasUnlock(promptId: string): boolean {
  const exp = read().p[promptId];
  return !!exp && exp > Math.floor(Date.now() / 1000);
}

export function addUnlockToCookie(promptId: string, ttlSeconds: number) {
  const data = read();
  const now = Math.floor(Date.now() / 1000);
  for (const k of Object.keys(data.p)) if (data.p[k] <= now) delete data.p[k];
  data.p[promptId] = now + ttlSeconds;
  const body = Buffer.from(JSON.stringify(data)).toString("base64url");
  cookies().set(COOKIE, `${body}.${sign(body)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
