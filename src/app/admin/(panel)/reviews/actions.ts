"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/auth";
import { errorMessage, fail, type ActionResult } from "@/lib/action";
import { connectDb } from "@/lib/db";
import { listLocations, syncReviews } from "@/lib/google-reviews";
import { TAGS } from "@/lib/tags";
import { Settings } from "@/models";

const bust = () => {
  revalidateTag(TAGS.reviews);
  revalidateTag(TAGS.settings);
};

export async function syncNow(): Promise<ActionResult> {
  try {
    await requireRole();
    const r = await syncReviews();
    if (!r.ok) return fail(r.error);
    bust();
    return { ok: true, message: `Synced ${r.count} review${r.count === 1 ? "" : "s"} from Google` };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

export async function loadLocations(): Promise<ActionResult<Awaited<ReturnType<typeof listLocations>>>> {
  try {
    await requireRole("owner");
    return { ok: true, data: await listLocations() };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

const locationInput = z.object({
  account: z.string().regex(/^accounts\/[\w-]+$/),
  location: z.string().regex(/^locations\/[\w-]+$/),
  title: z.string().max(200),
  placeId: z.string().max(200).optional(),
  mapsUri: z.url().max(500).optional(),
});

export async function chooseLocation(input: unknown): Promise<ActionResult> {
  try {
    await requireRole("owner");
    const p = locationInput.safeParse(input);
    if (!p.success) return fail("That location could not be saved");
    await connectDb();
    await Settings.updateOne(
      { _id: "site" },
      { $set: { "googleBusiness.accountName": p.data.account, "googleBusiness.locationName": p.data.location, "googleBusiness.locationTitle": p.data.title, ...(p.data.placeId ? { "googleBusiness.placeId": p.data.placeId } : {}), ...(p.data.mapsUri ? { "googleBusiness.mapsUri": p.data.mapsUri } : {}) } },
    );
    bust();
    return { ok: true, message: "Location saved" };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

export async function savePlaceId(placeId: string): Promise<ActionResult> {
  try {
    await requireRole("owner");
    const id = String(placeId).trim();
    if (id && !/^[\w-]{10,200}$/.test(id)) return fail("That doesn't look like a Google Place ID");
    await connectDb();
    await Settings.updateOne({ _id: "site" }, { $set: { "googleBusiness.placeId": id } }, { upsert: true });
    bust();
    return { ok: true, message: "Place ID saved" };
  } catch (err) {
    return fail(errorMessage(err));
  }
}

/** Forget the Google connection. Synced reviews stay; the owner can hide or delete them. */
export async function disconnectGoogle(): Promise<ActionResult> {
  try {
    await requireRole("owner");
    await connectDb();
    await Settings.updateOne({ _id: "site" }, { $unset: { "googleBusiness.tokensEncrypted": "", "googleBusiness.accountName": "", "googleBusiness.locationName": "", "googleBusiness.locationTitle": "", "googleBusiness.connectedAt": "" } });
    bust();
    return { ok: true, message: "Google disconnected" };
  } catch (err) {
    return fail(errorMessage(err));
  }
}
