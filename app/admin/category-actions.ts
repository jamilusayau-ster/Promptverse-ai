"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, slugify } from "@/lib/admin";

function text(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

function readCategory(fd: FormData) {
  const name = text(fd, "name");
  return {
    name,
    slug: slugify(text(fd, "slug") || name),
    description: text(fd, "description") || null,
    icon: text(fd, "icon") || null,
    image_url: text(fd, "image_url") || null,
    updated_at: new Date().toISOString(),
  };
}

const enc = encodeURIComponent;

export async function createCategory(fd: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const data = readCategory(fd);
  if (!data.name || !data.slug) redirect("/admin/categories?error=" + enc("Name is required."));
  const { error } = await admin.from("categories").insert(data);
  if (error) redirect("/admin/categories?error=" + enc(error.message));
  revalidatePath("/", "layout");
  redirect("/admin/categories?ok=" + enc("Category created."));
}

export async function updateCategory(fd: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const id = text(fd, "id");
  const data = readCategory(fd);
  if (!id) redirect("/admin/categories");
  if (!data.name || !data.slug) redirect(`/admin/categories/${id}?error=` + enc("Name is required."));
  const { error } = await admin.from("categories").update(data).eq("id", id);
  if (error) redirect(`/admin/categories/${id}?error=` + enc(error.message));
  revalidatePath("/", "layout");
  redirect("/admin/categories?ok=" + enc("Category saved."));
}

export async function deleteCategory(fd: FormData): Promise<void> {
  const { admin } = await requireAdmin();
  const id = text(fd, "id");
  if (!id) redirect("/admin/categories");
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) redirect("/admin/categories?error=" + enc(error.message));
  revalidatePath("/", "layout");
  redirect("/admin/categories?ok=" + enc("Category deleted. Its prompts are now uncategorized."));
}
