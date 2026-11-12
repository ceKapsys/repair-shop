/** SEO checklist used by the admin SEO tab and the SEO health table. */
export type SeoCheck = { id: string; label: string; ok: boolean };

export function seoChecks(input: {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  slug?: string;
  h1?: string;
  html?: string;
  imagesMissingAlt?: number;
  imageCount?: number;
}): SeoCheck[] {
  const kw = (input.focusKeyword ?? "").trim().toLowerCase();
  const title = (input.metaTitle || input.title || "").toLowerCase();
  const text = (input.html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const first100 = text.split(" ").slice(0, 100).join(" ").toLowerCase();
  const words = text ? text.split(" ").length : 0;
  const internalLinks = (input.html?.match(/href="\/(?!\/)/g) ?? []).length;
  const kwSlug = kw.replace(/\s+/g, "-");
  const tLen = (input.metaTitle || input.title || "").length;
  const dLen = (input.metaDescription ?? "").length;
  return [
    { id: "kw", label: "Focus keyword set", ok: Boolean(kw) },
    { id: "kw-title", label: "Keyword in title", ok: Boolean(kw) && title.includes(kw) },
    { id: "kw-h1", label: "Keyword in H1", ok: Boolean(kw) && (input.h1 ?? input.title).toLowerCase().includes(kw) },
    { id: "kw-intro", label: "Keyword in first 100 words", ok: Boolean(kw) && first100.includes(kw) },
    { id: "kw-slug", label: "Keyword in URL slug", ok: Boolean(kw) && (input.slug ?? "").includes(kwSlug) },
    { id: "kw-desc", label: "Keyword in description", ok: Boolean(kw) && (input.metaDescription ?? "").toLowerCase().includes(kw) },
    { id: "title-len", label: "Title 50–60 characters", ok: tLen >= 50 && tLen <= 60 },
    { id: "desc-len", label: "Description 140–160 characters", ok: dLen >= 140 && dLen <= 160 },
    { id: "alt", label: "All images have alt text", ok: (input.imagesMissingAlt ?? 0) === 0 && (input.imageCount ?? 1) > 0 },
    { id: "length", label: `Content length 300+ words (${words})`, ok: words >= 300 },
    { id: "links", label: `Internal links (${internalLinks})`, ok: internalLinks > 0 },
  ];
}

export function seoScore(checks: SeoCheck[]) {
  return Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);
}
