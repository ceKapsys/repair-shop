"use server";

import { requireRole } from "@/auth";
import { connectDb } from "@/lib/db";
import { PAGE_KEYS } from "@/models/Page";
import { Brand, Device, Post, Service } from "@/models";

/** Internal pages for the editor's link picker. */
export async function getLinkTargets() {
  await requireRole();
  await connectDb();
  const [services, brands, devices, posts] = await Promise.all([
    Service.find({ isActive: true }).select("title slug").lean(),
    Brand.find().select("name slug").lean(),
    Device.find({ isActive: true }).select("model slug brandId").lean(),
    Post.find({ status: { $ne: "draft" } }).select("title slug").lean(),
  ]);
  const brandSlug = new Map(brands.map((b) => [String(b._id), { slug: b.slug, name: b.name }]));
  return [
    ...Object.values(PAGE_KEYS).map((p) => ({ label: p.title, href: p.path, group: "Page" })),
    ...services.map((s) => ({ label: s.title, href: `/services/${s.slug}`, group: "Service" })),
    ...brands.map((b) => ({ label: b.name, href: `/devices/${b.slug}`, group: "Brand" })),
    ...devices.flatMap((d) => {
      const b = brandSlug.get(String(d.brandId));
      return b ? [{ label: `${b.name} ${d.model}`, href: `/devices/${b.slug}/${d.slug}`, group: "Device" }] : [];
    }),
    ...posts.map((p) => ({ label: p.title, href: `/blog/${p.slug}`, group: "Post" })),
  ];
}
