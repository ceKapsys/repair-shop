import "server-only";
import { createHash } from "node:crypto";

export function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

/** Signature for a direct browser → Cloudinary signed upload. */
export function signUpload(folder: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string | number> = {
    allowed_formats: "jpg,jpeg,png,webp,avif,heic,gif,svg,ico",
    folder,
    timestamp,
  };
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  const signature = createHash("sha1").update(toSign + process.env.CLOUDINARY_API_SECRET).digest("hex");
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    signature,
    ...params,
  };
}
