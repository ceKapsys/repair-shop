import type { MetadataRoute } from "next";
import { getAllDevices, getBrands, getPosts, getServices } from "@/lib/data";
import { siteDefaults } from "@/lib/site";

const staticPaths = [
  "", "/services", "/devices", "/emergency", "/book", "/blog", "/gallery",
  "/reviews", "/about", "/contact", "/service-area", "/privacy", "/terms",
];

export const revalidate = 3600;

/** Static pages plus every live service, brand, model and published post. noindex docs are left out. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const u = (p: string) => `${siteDefaults.url}${p}`;
  const [services, brands, devices, posts] = await Promise.all([getServices(), getBrands(), getAllDevices(), getPosts()]);
  const brandSlug = new Map(brands.map((b) => [b._id, b.slug]));
  const at = (d?: string) => (d ? new Date(d) : undefined);
  return [
    ...staticPaths.map((p) => ({ url: u(p), changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...services.filter((s) => !s.seo?.noindex).map((s) => ({ url: u(`/services/${s.slug}`), lastModified: at(s.updatedAt), priority: 0.9 })),
    ...brands.filter((b) => !b.seo?.noindex).map((b) => ({ url: u(`/devices/${b.slug}`), lastModified: at(b.updatedAt), priority: 0.6 })),
    ...devices
      .filter((d) => !d.seo?.noindex && brandSlug.has(d.brandId))
      .map((d) => ({ url: u(`/devices/${brandSlug.get(d.brandId)}/${d.slug}`), lastModified: at(d.updatedAt), priority: 0.8 })),
    ...posts.filter((p) => !p.seo?.noindex).map((p) => ({ url: u(`/blog/${p.slug}`), lastModified: at(p.updatedAt ?? p.publishAt), priority: 0.5 })),
  ];
}
