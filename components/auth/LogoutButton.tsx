"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  async function logout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }
  return (
    <button onClick={logout}
      className={`flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm text-muted hover:text-ink ${className}`}>
      <LogOut className="h-4 w-4" /> Log out
    </button>
  );
}
