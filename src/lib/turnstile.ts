import "server-only";

/** Verify a Cloudflare Turnstile token. Skipped (allowed) when no secret is configured, e.g. in local dev. */
export async function verifyTurnstile(token: string | undefined, ip?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch (err) {
    console.error("[turnstile]", err);
    return false;
  }
}
