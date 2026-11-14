"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { seoChecks, seoScore } from "@/lib/seo-score";
import { cn } from "@/lib/utils";
import { ChipsInput, TextArea, TextInput, Toggle, useForm } from "./form";
import { ImageUrlInput } from "./image-input";

/** Approximate rendered width of a Google title in px (Arial 20px), to warn before truncation. */
function pixelWidth(text: string) {
  if (typeof document === "undefined") return text.length * 9;
  const c = document.createElement("canvas").getContext("2d")!;
  c.font = "20px Arial";
  return c.measureText(text).width;
}

/**
 * Shared SEO tab for services, devices, brands, categories, posts and pages.
 * Reads `seo.*` from the surrounding form plus the doc's own title/slug/body for fallbacks.
 */
export function SeoPanel({
  path,
  titleField = "title",
  bodyField,
  descFallbackField,
  siteUrl,
  titleTemplate,
  imagesField,
}: {
  path: string; // public path, e.g. /services/screen-repair
  titleField?: string;
  bodyField?: string;
  descFallbackField?: string;
  siteUrl: string;
  titleTemplate: string;
  imagesField?: string;
}) {
  const f = useForm();
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const title = (f.get(titleField) ?? "") as string;
  const metaTitle = (f.get("seo.metaTitle") ?? "") as string;
  const metaDescription = (f.get("seo.metaDescription") ?? "") as string;
  const shownTitle = titleTemplate.replace("%s", metaTitle || title || "Page title");
  const shownDesc = metaDescription || ((descFallbackField && f.get(descFallbackField)) as string) || "Add a meta description so Google shows your own summary.";
  const html = bodyField ? ((f.get(bodyField) as { html?: string })?.html ?? "") : "";
  const imgs = imagesField ? (([] as { alt?: string }[]).concat(f.get(imagesField) ?? [])) : [];
  const checks = seoChecks({
    title,
    metaTitle,
    metaDescription,
    focusKeyword: f.get("seo.focusKeyword") as string,
    slug: f.get("slug") as string,
    html,
    imageCount: imagesField ? imgs.length : 1,
    imagesMissingAlt: imgs.filter((i) => !i?.alt).length + (html.match(/<img(?![^>]*alt="[^"]+")/g) ?? []).length,
  });
  const score = seoScore(checks);
  const px = pixelWidth(shownTitle);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-5">
        <TextInput name="seo.focusKeyword" label="Focus keyword" hint="The main search phrase, e.g. “iPhone screen repair in Miami”" />
        <ChipsInput name="seo.keywords" label="Secondary keywords" />
        <TextInput
          name="seo.metaTitle"
          label="Meta title"
          counter={{ min: 50, max: 60 }}
          hint={px > 580 ? <span className="text-warning">About {Math.round(px)}px wide — Google may cut it off (≈580px).</span> : `Leave empty to use “${title || "the page title"}”.`}
        />
        <TextArea name="seo.metaDescription" label="Meta description" counter={{ min: 140, max: 160 }} rows={3} />
        <details className="rounded-input border border-line p-4">
          <summary className="cursor-pointer text-sm font-medium">Social sharing, canonical and indexing</summary>
          <div className="mt-4 space-y-4">
            <TextInput name="seo.ogTitle" label="Social title" hint="Defaults to the meta title" />
            <TextArea name="seo.ogDescription" label="Social description" rows={2} />
            <ImageUrlInput name="seo.ogImage" label="Social image (1200×630)" folder="pages" hint="If empty, one is generated automatically." />
            <TextInput name="seo.canonical" label="Canonical URL" hint="Only set this if the same content lives at another URL." />
            <Toggle name="seo.noindex" label="Hide from search engines (noindex)" />
          </div>
        </details>
      </div>

      <aside className="space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Google preview</p>
            <div className="flex rounded-lg border border-line p-0.5 text-xs" role="group" aria-label="Preview device">
              {(["desktop", "mobile"] as const).map((d) => (
                <button key={d} type="button" aria-pressed={device === d} onClick={() => setDevice(d)} className={cn("min-h-8 rounded-md px-2.5 capitalize", device === d && "bg-surface font-medium")}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className={cn("mt-2 rounded-input border border-line bg-on-primary p-4 font-[Arial,sans-serif] text-left", device === "mobile" && "max-w-[360px]")}>
            <p className="truncate text-xs text-ink-soft">{siteUrl.replace(/^https?:\/\//, "")}{path === "/" ? "" : path.replace(/\//g, " › ").replace(/^ › /, " › ")}</p>
            <p className={cn("mt-1 text-primary", device === "desktop" ? "truncate text-xl" : "line-clamp-2 text-lg")}>{shownTitle}</p>
            <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{shownDesc}</p>
          </div>
        </div>
        <div className="rounded-input border border-line p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">SEO checklist</p>
            <span className={cn("text-sm font-semibold tabular-nums", score >= 80 ? "text-success" : score >= 50 ? "text-warning" : "text-emergency")}>{score}/100</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {checks.map((c) => (
              <li key={c.id} className="flex items-start gap-2">
                {c.ok ? <CheckCircle2 size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-success" aria-label="Done" /> : <Circle size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-soft" aria-label="To do" />}
                <span className={c.ok ? "" : "text-ink-soft"}>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
