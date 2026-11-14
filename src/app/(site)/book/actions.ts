"use server";

import { headers } from "next/headers";
import { copy, fill } from "@/content/copy";
import { zodErrors } from "@/lib/action";
import { createBooking, type CreateResult } from "@/lib/booking";
import { isDbConfigured } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/ratelimit";
import { reportError } from "@/lib/report";
import { loadSettings } from "@/lib/settings";
import { verifyTurnstile } from "@/lib/turnstile";
import { bookingInput } from "@/lib/validation/booking";

/** Public booking submit (standard and emergency). Rate-limited, Turnstile-checked, validated with the shared schema. */
export async function submitBooking(input: unknown): Promise<CreateResult> {
  let phone = "";
  try {
    const settings = await loadSettings();
    phone = settings.contacts.phones[0];
    if (!isDbConfigured()) return { ok: false, error: fill(copy.errors.server, { phone }) };
    const ip = await clientIp();
    if (!(await rateLimit("booking", ip, 5, 3600)).ok) return { ok: false, error: fill(copy.errors.rateLimit, { phone }) };

    const parsed = bookingInput.safeParse(input);
    if (!parsed.success) {
      const errs = zodErrors(parsed.error);
      // A filled honeypot is a bot: answer with the generic error and store nothing.
      if (errs.website) return { ok: false, error: fill(copy.errors.server, { phone }) };
      return { ok: false, error: Object.values(errs)[0] ?? fill(copy.errors.server, { phone }), fieldErrors: errs };
    }
    if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) return { ok: false, error: fill(copy.errors.server, { phone }) };

    const referer = (await headers()).get("referer") ?? undefined;
    return await createBooking(parsed.data, settings, referer ? new URL(referer).pathname + new URL(referer).search : undefined);
  } catch (err) {
    await reportError(err, { where: "submitBooking" });
    return { ok: false, error: fill(copy.errors.server, { phone }) };
  }
}
