"use server";

import { revalidateTag } from "next/cache";
import { requireRole } from "@/auth";
import { errorMessage, fail, zodErrors, type ActionResult } from "@/lib/action";
import { connectDb } from "@/lib/db";
import { TAGS } from "@/lib/tags";
import { seoSettingsInput } from "@/lib/validation/admin";
import { Settings } from "@/models";

/** Site-wide title template, default description and default social image. */
export async function saveSeoDefaults(input: unknown): Promise<ActionResult> {
  try {
    await requireRole();
    const parsed = seoSettingsInput.safeParse(input);
    if (!parsed.success) return fail("Please fix the highlighted fields", zodErrors(parsed.error));
    await connectDb();
    await Settings.updateOne({ _id: "site" }, { $set: { seoDefaults: parsed.data } }, { upsert: true });
    revalidateTag(TAGS.settings);
    return { ok: true };
  } catch (err) {
    return fail(errorMessage(err));
  }
}
