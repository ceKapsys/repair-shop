import "server-only";
import { Resend } from "resend";
import type { ReactElement } from "react";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = (process.env.MAIL_FROM || process.env.EMAIL_FROM) || "Bookings <onboarding@resend.dev>";

/** Send an email via Resend. Logs instead of sending when no API key is configured. Never throws. */
export async function sendEmail(opts: { to: string | string[]; subject: string; react: ReactElement; replyTo?: string }) {
  const to = Array.isArray(opts.to) ? opts.to.filter(Boolean) : [opts.to];
  if (!to.length) return { ok: false as const, error: "no recipients" };
  if (!resend) {
    console.info(`[email:dev] to=${to.join(",")} subject="${opts.subject}"`);
    return { ok: true as const, dev: true };
  }
  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject: opts.subject, react: opts.react, replyTo: opts.replyTo });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  } catch (err) {
    console.error("[email]", err);
    return { ok: false as const, error: String(err) };
  }
}
