import type { MetadataRoute } from "next";
import { siteDefaults } from "@/lib/site";

const staticPaths = [
  "", "/services", "/devices", "/emergency", "/book", "/blog", "/gallery",
  "/reviews", "/about", "/contact", "/service-area", "/privacy", "/terms",
];

// Week 3: append active services, brands, devices and published posts from MongoDB.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  return staticPaths.map((p) => ({ url: `${siteDefaults.url}${p}`, lastModified: now }));
}
