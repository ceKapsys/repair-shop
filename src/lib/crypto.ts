import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function key() {
  const raw = process.env.TOKEN_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (!raw) throw new Error("TOKEN_ENCRYPTION_KEY is not set");
  return createHash("sha256").update(raw).digest(); // 32 bytes from any string
}

/** AES-256-GCM. Output: base64(iv | tag | ciphertext). */
export function encrypt(text: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return Buffer.concat([iv, c.getAuthTag(), enc]).toString("base64");
}

export function decrypt(payload: string) {
  const buf = Buffer.from(payload, "base64");
  const d = createDecipheriv("aes-256-gcm", key(), buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString("utf8");
}
