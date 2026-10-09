"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register" | "forgot" | "reset";

const COPY: Record<Mode, { title: string; subtitle: string; button: string }> = {
  login: { title: "Welcome back", subtitle: "Log in to access your unlocked prompts.", button: "Log in" },
  register: { title: "Create your account", subtitle: "Keep your unlocked prompts synced across devices.", button: "Create account" },
  forgot: { title: "Forgot password", subtitle: "Enter your email and we will send you a reset link.", button: "Send reset link" },
  reset: { title: "Set a new password", subtitle: "Choose a new password for your account.", button: "Update password" },
};

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const copy = COPY[mode];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    const supabase = createClient();
    const origin = window.location.origin;

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      } else if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: name },
            emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setMessage("Account created. Check your email to confirm your address, then log in.");
        }
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setMessage("If that email has an account, a reset link is on its way.");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage("Password updated. Redirecting...");
        setTimeout(() => router.push("/dashboard"), 1200);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted outline-none focus:border-electric";

  return (
    <div className="mx-auto w-full max-w-md px-4 py-14">
      <h1 className="font-display text-2xl font-semibold">{copy.title}</h1>
      <p className="mt-2 text-sm text-muted">{copy.subtitle}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {mode === "register" && (
          <input className={inputClass} placeholder="Display name" value={name}
            onChange={(e) => setName(e.target.value)} required />
        )}
        {mode !== "reset" && (
          <input className={inputClass} type="email" placeholder="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        )}
        {mode !== "forgot" && (
          <input className={inputClass} type="password"
            placeholder={mode === "reset" ? "New password" : "Password"} value={password}
            onChange={(e) => setPassword(e.target.value)} required minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"} />
        )}

        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>}
        {message && <p className="rounded-lg bg-electric/10 px-3 py-2 text-sm text-electric">{message}</p>}

        <button type="submit" disabled={loading}
          className="w-full rounded-full bg-ink py-3 text-sm font-medium text-base transition-colors hover:bg-white disabled:opacity-60">
          {loading ? "Please wait..." : copy.button}
        </button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-muted">
        {mode === "login" && (
          <>
            <p><Link href="/forgot-password" className="text-electric hover:underline">Forgot password?</Link></p>
            <p>New here? <Link href="/register" className="text-electric hover:underline">Create an account</Link></p>
          </>
        )}
        {mode === "register" && (
          <p>Already have an account? <Link href="/login" className="text-electric hover:underline">Log in</Link></p>
        )}
        {mode === "forgot" && (
          <p><Link href="/login" className="text-electric hover:underline">Back to log in</Link></p>
        )}
      </div>
    </div>
  );
}
