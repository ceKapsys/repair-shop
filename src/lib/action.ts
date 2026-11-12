import type { ZodError } from "zod";

export type ActionResult<T = unknown> =
  | { ok: true; id?: string; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function zodErrors(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

export function errorMessage(err: unknown) {
  if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
    const key = Object.keys((err as { keyValue?: object }).keyValue ?? {})[0];
    return `That ${key ?? "value"} is already used. Pick another.`;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}
