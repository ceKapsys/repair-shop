import type { MetadataRoute } from "next";
import { siteDefaults } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/book/success"] }],
    sitemap: `${siteDefaults.url}/sitemap.xml`,
  };
}
