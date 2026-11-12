import "server-only";
import type { Metadata } from "next";
import { getPage } from "./data";
import { getSettings } from "./settings";
import type { Seo } from "./types";

type Fallback = { title: string; description?: string; path: string; image?: string };

/** Per-document SEO with smart fallbacks to the page's own fields, then site defaults. */
export async function buildMetadata(seo: Seo | undefined | null, fb: Fallback): Promise<Metadata> {
  const s = await getSettings();
  const title = seo?.metaTitle || fb.title;
  const description = seo?.metaDescription || fb.description || s.seoDefaults.description;
  const image = seo?.ogImage || fb.image || s.seoDefaults.ogImage;
  const keywords = [seo?.focusKeyword, ...(seo?.keywords ?? [])].filter(Boolean) as string[];
  return {
    title,
    description,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: seo?.canonical || fb.path },
    robots: seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDescription || description,
      url: fb.path,
      siteName: s.shopName,
      images: image ? [image] : undefined,
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

/** Metadata for a fixed page, using its admin-edited Page document when present. */
export async function pageMetadata(key: string, fb: Fallback): Promise<Metadata> {
  const page = await getPage(key);
  return buildMetadata(page?.seo, { ...fb, title: page?.title || fb.title, description: fb.description || page?.intro });
}
