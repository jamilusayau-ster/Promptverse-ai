import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB (the browser compresses first)
const TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

/** Admin-only thumbnail upload to the public `prompt-images` bucket. */
export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("file");
    if (f instanceof File) file = f;
  } catch {
    // handled below
  }
  if (!file) return NextResponse.json({ error: "No image received." }, { status: 400 });

  const ext = TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Only JPG, PNG or WEBP images are allowed." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image is too large (max 2 MB after compression)." }, { status: 413 });
  }

  const path = `thumbnails/${Date.now()}-${randomUUID()}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error } = await admin.storage
    .from("prompt-images")
    .upload(path, bytes, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) {
    console.error("[upload] storage error", error);
    return NextResponse.json({ error: "Upload failed. Check that the prompt-images bucket exists." }, { status: 500 });
  }

  const { data } = admin.storage.from("prompt-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
