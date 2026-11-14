import "server-only";
import { notFound, redirect } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { connectDb } from "./db";
import { loadSettings } from "./settings";
import { plain } from "./serialize";
import { siteDefaults } from "./site";
import type { BrandT, DeviceT } from "./types";
import { Brand, Device } from "@/models";
import type { AnyModel } from "@/models";

/** Load a doc for an editor page; "new" returns null. 404s on bad ids. */
export async function loadForEdit<T>(model: AnyModel, id: string): Promise<T | null> {
  if (id === "new") return null;
  if (!isValidObjectId(id)) notFound();
  await connectDb();
  const doc = await model.findById(id).lean();
  if (!doc) notFound();
  return plain<T>(doc);
}

export async function editorContext() {
  const s = await loadSettings();
  return { siteUrl: siteDefaults.url, titleTemplate: s.seoDefaults.titleTemplate, currency: s.currency };
}

/** Devices with brand names, for pickers. */
export async function deviceOptions() {
  await connectDb();
  const [brands, devices] = await Promise.all([
    Brand.find().sort({ order: 1, name: 1 }).lean(),
    Device.find().select("model brandId slug").sort({ model: 1 }).lean(),
  ]);
  const b = new Map(plain<BrandT[]>(brands).map((x) => [x._id, x]));
  return plain<DeviceT[]>(devices)
    .map((d) => ({ value: d._id, label: d.model, group: b.get(d.brandId)?.name ?? "—" }))
    .sort((x, y) => x.group.localeCompare(y.group) || x.label.localeCompare(y.label));
}

/** Guard for owner-only admin pages (Settings, Users). Editors are sent back to the dashboard. */
export async function requireOwnerPage() {
  const { currentUser } = await import("@/auth");
  const user = await currentUser();
  if (!user) redirect("/admin/login");
  if (user.role !== "owner") redirect("/admin");
  return user;
}
