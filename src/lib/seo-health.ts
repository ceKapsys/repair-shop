import "server-only";
import { connectDb } from "./db";
import { plain } from "./serialize";
import type { BrandT, CategoryT, DeviceT, GalleryItemT, PageT, PostT, Seo, ServiceT } from "./types";
import { Brand, Device, GalleryItem, Page, PAGE_KEYS, Post, PostCategory, Service, ServiceCategory } from "@/models";

export type SeoIssue = "missing-title" | "long-title" | "missing-description" | "long-description" | "no-keyword" | "missing-alt";
export const ISSUE_LABELS: Record<SeoIssue, string> = {
  "missing-title": "No meta title",
  "long-title": "Title over 60 characters",
  "missing-description": "No meta description",
  "long-description": "Description over 160 characters",
  "no-keyword": "No focus keyword",
  "missing-alt": "Image without alt text",
};
export type SeoRow = { type: string; title: string; editHref: string; issues: SeoIssue[] };

/** Issues for one document's SEO fields. Pure, so it is unit-tested. */
export function seoIssues(seo: Seo | undefined, imagesMissingAlt = 0): SeoIssue[] {
  const out: SeoIssue[] = [];
  const t = seo?.metaTitle?.trim() ?? "";
  const d = seo?.metaDescription?.trim() ?? "";
  if (!t) out.push("missing-title");
  else if (t.length > 60) out.push("long-title");
  if (!d) out.push("missing-description");
  else if (d.length > 160) out.push("long-description");
  if (!seo?.focusKeyword?.trim()) out.push("no-keyword");
  if (imagesMissingAlt > 0) out.push("missing-alt");
  return out;
}

const htmlImagesMissingAlt = (html = "") => (html.match(/<img\b[^>]*>/g) ?? []).filter((tag) => !/\balt="[^"]+"/.test(tag)).length;

/** Every indexable page with its SEO problems, worst first. */
export async function seoHealth(): Promise<SeoRow[]> {
  await connectDb();
  const [services, brands, devices, posts, pages, serviceCats, postCats, gallery] = await Promise.all([
    Service.find({ isActive: true }).select("title seo images body.html").lean(),
    Brand.find().select("name seo").lean(),
    Device.find({ isActive: true }).select("model seo brandId").lean(),
    Post.find({ status: { $ne: "draft" } }).select("title seo coverImage body.html").lean(),
    Page.find().select("key title seo").lean(),
    ServiceCategory.find().select("name seo").lean(),
    PostCategory.find().select("name seo").lean(),
    GalleryItem.find({ $or: [{ alt: { $exists: false } }, { alt: "" }] }).select("caption").lean(),
  ]);
  const rows: SeoRow[] = [];
  for (const s of plain<ServiceT[]>(services)) rows.push({ type: "Service", title: s.title, editHref: `/admin/services/${s._id}`, issues: seoIssues(s.seo, (s.images ?? []).filter((i) => !i.alt).length + htmlImagesMissingAlt(s.body?.html)) });
  for (const b of plain<BrandT[]>(brands)) rows.push({ type: "Brand", title: b.name, editHref: `/admin/devices/brand/${b._id}`, issues: seoIssues(b.seo) });
  for (const d of plain<DeviceT[]>(devices)) rows.push({ type: "Device", title: d.model, editHref: `/admin/devices/model/${d._id}`, issues: seoIssues(d.seo) });
  for (const p of plain<PostT[]>(posts)) rows.push({ type: "Post", title: p.title, editHref: `/admin/blog/${p._id}`, issues: seoIssues(p.seo, (p.coverImage && !p.coverImage.alt ? 1 : 0) + htmlImagesMissingAlt(p.body?.html)) });
  const pageByKey = new Map(plain<PageT[]>(pages).map((p) => [p.key, p]));
  for (const [key, def] of Object.entries(PAGE_KEYS)) rows.push({ type: "Page", title: def.title, editHref: `/admin/seo/page/${key}`, issues: seoIssues(pageByKey.get(key)?.seo) });
  for (const c of plain<CategoryT[]>(postCats)) rows.push({ type: "Blog category", title: c.name, editHref: `/admin/categories/postCategory/${c._id}`, issues: seoIssues(c.seo) });
  void serviceCats; // service categories have no page of their own
  for (const g of plain<GalleryItemT[]>(gallery)) rows.push({ type: "Photo", title: g.caption || "Untitled photo", editHref: `/admin/gallery/${g._id}`, issues: ["missing-alt"] });
  return rows.sort((a, b) => b.issues.length - a.issues.length || a.type.localeCompare(b.type) || a.title.localeCompare(b.title));
}

/** Pages with no meta title or no meta description, for the dashboard. */
export async function pagesMissingSeo() {
  return (await seoHealth()).filter((r) => r.issues.includes("missing-title") || r.issues.includes("missing-description")).length;
}
