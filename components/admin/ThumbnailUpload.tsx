"use client";

import { useState } from "react";

const input =
  "w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-electric focus:outline-none";
const label = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted";

/** Shrink big phone photos to max 1600px WEBP before uploading. */
async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not compress the image."))),
      "image/webp",
      0.82
    )
  );
}

export default function ThumbnailUpload({ defaultUrl = "" }: { defaultUrl?: string }) {
  const [url, setUrl] = useState(defaultUrl);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setMsg("");
    try {
      const blob = await compress(file);
      const body = new FormData();
      body.append("file", new File([blob], "thumbnail.webp", { type: blob.type || "image/webp" }));
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Upload failed.");
      setUrl(json.url);
      setMsg("Uploaded. Press “Save prompt” to keep it.");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label className={label}>Thumbnail image</label>

      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Thumbnail preview" className="mb-3 aspect-[16/9] w-full max-w-sm rounded-lg border border-border object-cover" />
      )}

      <label className="inline-block cursor-pointer rounded-full border border-border px-4 py-2 text-sm text-ink hover:border-electric">
        {busy ? "Uploading…" : url ? "Change image" : "Upload image"}
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={onPick} disabled={busy} className="hidden" />
      </label>
      {url && !busy && (
        <button type="button" onClick={() => setUrl("")} className="ml-3 text-xs text-muted hover:text-ink">
          Remove
        </button>
      )}

      {msg && <p className="mt-2 text-xs text-muted">{msg}</p>}

      <input
        name="thumbnail_url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="…or paste an image URL"
        className={`${input} mt-3`}
      />
    </div>
  );
}
