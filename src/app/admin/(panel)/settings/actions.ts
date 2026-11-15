"use server";

import { revalidateTag } from "next/cache";
import { requireRole } from "@/auth";
import { errorMessage, fail, zodErrors, type ActionResult } from "@/lib/action";
import { connectDb } from "@/lib/db";
import { TAGS } from "@/lib/tags";
import { safeZone } from "@/lib/time";
import { settingsInput } from "@/lib/validation/admin";
import { Settings } from "@/models";

/** Save the shop settings (owner only). Google connection and SEO defaults are saved elsewhere and left untouched. */
export async function saveSettings(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("owner");
    const parsed = settingsInput.safeParse(input);
    if (!parsed.success) return fail("Please fix the highlighted fields", zodErrors(parsed.error));
    const data = parsed.data;
    if (safeZone(data.timezone) !== data.timezone) return fail("Please fix the highlighted fields", { timezone: "Unknown time zone" });
    for (const w of data.bookingSlots.windows) {
      const [a, b] = w.split("-");
      if (a >= b) return fail("Please fix the highlighted fields", { "bookingSlots.windows": `Window ${w} must end after it starts` });
    }
    for (const [i, sched] of data.emergency.schedule.entries()) {
      if (sched.enabled && sched.open >= sched.close) {
        return fail("Please fix the highlighted fields", {
          [`emergency.schedule.${i}.close`]: "Close time must be after open time",
        });
      }
    }
    await connectDb();
    const doc = (await Settings.findById("site")) ?? new Settings({ _id: "site" });
    doc.set(data);
    await doc.save();
    revalidateTag(TAGS.settings);
    return { ok: true, message: "Settings saved" };
  } catch (err) {
    return fail(errorMessage(err));
  }
}
