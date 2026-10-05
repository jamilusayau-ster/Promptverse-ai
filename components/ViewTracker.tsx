"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ViewTracker({ promptId }: { promptId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const supabase = createClient();
    supabase.rpc("increment_prompt_view", { p_prompt_id: promptId }).then(({ error }) => {
      if (error) console.error("view tracking failed:", error.message);
    });
  }, [promptId]);

  return null;
}
