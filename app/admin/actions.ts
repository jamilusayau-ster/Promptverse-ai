"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, slugify, parseSettings } from "@/lib/admin";

function text(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

function readPrompt(fd: FormData) {
  const title = text(fd, "title");
  const status = text(fd, "status");
  return {
    title,
    slug: slugify(text(fd, "slug") || title),
    description: text(fd, "description") || null,
    thumbnail_url: text(fd, "thumbnail_url") || null,
    category_id: text(fd, "category_id") || null,
    platform: text(fd, "platform") || null,
    prompt_type: text(fd, "prompt_type") === "premium" ? "premium" : "free",
    master_prompt: text(fd, "master_prompt"),
    negative_prompt: text(fd, "negative_prompt") || null,
    settings: parseSettings(String(fd.get("settings") ?? "")),
    how_to_use: text(fd, "how_to_use") || null,
    pro_tips: text(fd, "pro_tips") || null,
    featured: fd.get("featured") === "on",
    status: ["draft", "published", "archived"].includes(status) ? status : "draft",
    updated_at: new Date().toISOString(),
  };
}

function refresh() {
  revalidatePath("/", "layout");
}

export async function createPrompt(fd: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const data = readPrompt(fd);
  if (!data.title || !data.slug || !data.master_prompt) {
    redirect("/admin/prompts/new?error=" + encodeURIComponent("Title, slug and master prompt are required."));
  }
  const { error } = await admin.from("prompts").insert(data);
  if (error) {
    redirect("/admin/prompts/new?error=" + encodeURIComponent(error.message));
  }
  refresh();
  redirect("/admin/prompts");
}

export async function updatePrompt(fd: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const id = text(fd, "id");
  const data = readPrompt(fd);
  if (!id) redirect("/admin/prompts");
  if (!data.title || !data.slug || !data.master_prompt) {
    redirect(`/admin/prompts/${id}?error=` + encodeURIComponent("Title, slug and master prompt are required."));
  }
  const { error } = await admin.from("prompts").update(data).eq("id", id);
  if (error) {
    redirect(`/admin/prompts/${id}?error=` + encodeURIComponent(error.message));
  }
  refresh();
  redirect("/admin/prompts");
}

export async function setPromptStatus(fd: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const id = text(fd, "id");
  const status = text(fd, "status");
  if (!id || !["draft", "published", "archived"].includes(status)) return;
  await admin.from("prompts").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  refresh();
}

export async function setPromptFeatured(fd: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const id = text(fd, "id");
  if (!id) return;
  await admin
    .from("prompts")
    .update({ featured: text(fd, "featured") === "true", updated_at: new Date().toISOString() })
    .eq("id", id);
  refresh();
}

export async function deletePrompt(fd: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const id = text(fd, "id");
  if (!id) return;
  await admin.from("prompts").delete().eq("id", id);
  refresh();
}
