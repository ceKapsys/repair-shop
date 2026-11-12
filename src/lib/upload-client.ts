"use client";

export type Uploaded = { url: string; width?: number; height?: number };

const MAX_BYTES = 12 * 1024 * 1024;
const MAX_EDGE = 2400;

/** Downscale and re-encode large photos in the browser before upload. */
async function compress(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 400_000) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export async function uploadImage(file: File, folder: string): Promise<Uploaded> {
  if (!file.type.startsWith("image/")) throw new Error("Only image files can be uploaded");
  if (file.size > MAX_BYTES) throw new Error("Image is larger than 12 MB");
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (signRes.status === 501) throw new Error("Uploads need Cloudinary keys. Paste an image URL instead.");
  if (!signRes.ok) throw new Error((await signRes.json().catch(() => ({}))).error ?? "Upload not allowed");
  const s = await signRes.json();
  const body = new FormData();
  body.set("file", await compress(file));
  for (const k of ["api_key", "timestamp", "signature", "folder", "allowed_formats"]) {
    const v = k === "api_key" ? s.apiKey : s[k];
    if (v !== undefined) body.set(k, String(v));
  }
  const res = await fetch(`https://api.cloudinary.com/v1_1/${s.cloudName}/image/upload`, { method: "POST", body });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Upload failed");
  return { url: data.secure_url as string, width: data.width, height: data.height };
}
