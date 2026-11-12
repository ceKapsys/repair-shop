import type { Metadata } from "next";
import type { SeoInput } from "./validation/seo";
import { getSettings } from "./settings";

type Fallback = { title: string; description?: string; path: string; image?: string };

/** Per-document SEO with smart fallbacks to the page's own fields, then site defaults. */
export async function buildMetadata(seo: Partial<SeoInput> | undefined, fb: Fallback): Promise<Metadata> {
  const s = await getSettings();
  const title = seo?.metaTitle || fb.title;
  const description = seo?.metaDescription || fb.description || s.seo.description;
  const image = seo?.ogImage || fb.image || s.seo.ogImage;
  return {
    title,
    description,
    keywords: [seo?.focusKeyword, ...(seo?.keywords ?? [])].filter(Boolean) as string[],
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
  };
}
