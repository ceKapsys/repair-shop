"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/auth";
import { errorMessage, fail, type ActionResult } from "@/lib/action";
import { connectDb } from "@/lib/db";
import { TAGS } from "@/lib/tags";
import { slugify } from "@/lib/utils";
import { objectId } from "@/lib/validation/common";
import { Brand, Device } from "@/models";

const bulkInput = z.object({ brandId: objectId, names: z.string().max(20_000) });

/** Create many models at once from one-per-line text. Existing slugs are skipped. */
export async function bulkAddModels(input: unknown): Promise<ActionResult> {
  try {
    await requireRole();
    const { brandId, names } = bulkInput.parse(input);
    await connectDb();
    if (!(await Brand.exists({ _id: brandId }))) return fail("Brand not found");
    const list = Array.from(new Set(names.split(/\r?\n/).map((n) => n.trim()).filter(Boolean))).slice(0, 300);
    if (!list.length) return fail("Enter at least one model name");
    const existing = new Set((await Device.find({ brandId }).select("slug").lean()).map((d) => d.slug));
    const docs = list.map((model) => ({ brandId, model, slug: slugify(model) })).filter((d) => d.slug && !existing.has(d.slug));
    if (docs.length) await Device.insertMany(docs);
    revalidateTag(TAGS.devices);
    const skipped = list.length - docs.length;
    return { ok: true, message: `Added ${docs.length} model${docs.length === 1 ? "" : "s"}${skipped ? ` (${skipped} already existed)` : ""}` };
  } catch (err) {
    return fail(errorMessage(err));
  }
}
