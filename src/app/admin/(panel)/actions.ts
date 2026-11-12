"use server";

import { revalidateTag } from "next/cache";
import { requireRole } from "@/auth";
import { errorMessage, fail, zodErrors, type ActionResult } from "@/lib/action";
import { connectDb } from "@/lib/db";
import { readingTime } from "@/lib/format";
import { cleanHtml } from "@/lib/sanitize";
import { plain } from "@/lib/serialize";
import { TAGS } from "@/lib/tags";
import { Redirect } from "@/models";
import { entity, type Kind } from "./registry";

/* eslint-disable @typescript-eslint/no-explicit-any */

function bust(tags: string[]) {
  for (const t of tags) revalidateTag(t);
}

/** Add old → new redirect and repoint existing redirects to avoid chains. */
async function addSlugRedirect(from: string, to: string) {
  if (from === to) return;
  await Redirect.updateMany({ to: from }, { $set: { to } });
  await Redirect.deleteOne({ from: to }); // the new URL must not redirect away
  await Redirect.updateOne({ from }, { $set: { to, code: 301 } }, { upsert: true });
  revalidateTag(TAGS.redirects);
}

function prepare(kind: Kind, data: any) {
  if (data.body?.html !== undefined) data.body = { json: data.body.json, html: cleanHtml(data.body.html) };
  if (kind === "post") {
    data.readingTime = readingTime(data.body?.html);
    if (data.status === "published" && !data.publishAt) data.publishAt = new Date();
    if (data.status === "scheduled" && !data.publishAt) throw new Error("Pick a date and time to schedule this post");
  }
  if (kind === "review") data.source = "manual";
  if (kind === "redirect" && data.from === data.to) throw new Error("A redirect can’t point to itself");
  return data;
}

/** Create or update any catalogue/content document. Validates with the shared Zod schema. */
export async function saveDoc(kind: Kind, id: string | null, input: unknown): Promise<ActionResult> {
  try {
    const session = await requireRole();
    const e = entity(kind);
    const parsed = e.schema.safeParse(input);
    if (!parsed.success) return fail("Please fix the highlighted fields", zodErrors(parsed.error));
    await connectDb();
    const data = prepare(kind, parsed.data as any);

    if (id) {
      const existing = await e.model.findById(String(id));
      if (!existing) return fail("This item no longer exists");
      const oldPath = e.path ? await e.path(existing.toObject()) : null;
      existing.set(data);
      await existing.save();
      const newPath = e.path ? await e.path(existing.toObject()) : null;
      if (oldPath && newPath && oldPath !== newPath) await addSlugRedirect(oldPath, newPath);
      bust(e.tags);
      return { ok: true, id: String(existing._id) };
    }

    if (kind === "post") data.authorId = session.user.id;
    if (e.ordered) {
      const last = await e.model.findOne().sort({ order: -1 }).select("order").lean<{ order?: number }>();
      data.order = (last?.order ?? -1) + 1;
    }
    const doc = await e.model.create(data);
    bust(e.tags);
    return { ok: true, id: String(doc._id), message: `${e.label} created` };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

export async function deleteDoc(kind: Kind, id: string): Promise<ActionResult<any> & { data?: any }> {
  try {
    await requireRole();
    const e = entity(kind);
    await connectDb();
    if (kind === "brand") {
      const { Device } = await import("@/models");
      if (await Device.exists({ brandId: String(id) })) return fail("Delete or move this brand’s models first");
    }
    const doc = await e.model.findByIdAndDelete(String(id)).lean();
    if (!doc) return fail("Already deleted");
    bust(e.tags);
    return { ok: true, data: plain(doc) };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

/** Undo for deleteDoc: re-insert the exact document (same _id). */
export async function restoreDoc(kind: Kind, doc: any): Promise<ActionResult> {
  try {
    await requireRole();
    const e = entity(kind);
    if (!doc?._id) return fail("Nothing to restore");
    await connectDb();
    await e.model.create(doc);
    bust(e.tags);
    return { ok: true };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

export async function reorderDocs(kind: Kind, ids: string[]): Promise<ActionResult> {
  try {
    await requireRole();
    const e = entity(kind);
    if (!e.ordered) return fail("Not sortable");
    await connectDb();
    await e.model.bulkWrite(ids.map((id, i) => ({ updateOne: { filter: { _id: String(id) }, update: { $set: { order: i } } } })));
    bust(e.tags);
    return { ok: true };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

export async function toggleDoc(kind: Kind, id: string, field: string, value: boolean): Promise<ActionResult> {
  try {
    await requireRole();
    const e = entity(kind);
    if (!e.toggles?.includes(field)) return fail("Not allowed");
    await connectDb();
    await e.model.updateOne({ _id: String(id) }, { $set: { [field]: Boolean(value) } });
    bust(e.tags);
    return { ok: true };
  } catch (err) {
    return fail(errorMessage(err));
  }
}
