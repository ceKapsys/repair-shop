import "server-only";

/**
 * Report a server error. Always logs; also sends to Sentry when SENTRY_DSN is set
 * (a plain envelope POST, so no SDK is needed). Never throws.
 */
export async function reportError(err: unknown, context: Record<string, unknown> = {}) {
  console.error("[error]", context, err);
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    const u = new URL(dsn);
    const projectId = u.pathname.replace(/^\//, "");
    const error = err instanceof Error ? err : new Error(String(err));
    const eventId = crypto.randomUUID().replace(/-/g, "");
    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: "node",
      level: "error",
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
      extra: context,
      exception: { values: [{ type: error.name, value: error.message, stacktrace: error.stack ? { frames: [{ filename: "server", function: error.stack.slice(0, 2000) }] } : undefined }] },
    };
    const body = `${JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() })}\n${JSON.stringify({ type: "event" })}\n${JSON.stringify(event)}`;
    await fetch(`${u.protocol}//${u.host}/api/${projectId}/envelope/`, {
      method: "POST",
      headers: { "content-type": "application/x-sentry-envelope", "x-sentry-auth": `Sentry sentry_version=7, sentry_key=${u.username}, sentry_client=repair-shop/1.0` },
      body,
      signal: AbortSignal.timeout(3000),
    });
  } catch (e) {
    console.error("[report] could not reach Sentry", e);
  }
}
