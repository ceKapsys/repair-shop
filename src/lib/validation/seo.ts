import { z } from "zod";
import { optText, optUrl } from "./common";

export const seoInput = z
  .object({
    metaTitle: optText(70),
    metaDescription: optText(200),
    focusKeyword: optText(80),
    keywords: z.array(z.string().trim().max(80)).max(20).default([]),
    canonical: optUrl,
    ogTitle: optText(90),
    ogDescription: optText(200),
    ogImage: optUrl,
    noindex: z.boolean().default(false),
    schemaType: optText(40),
  })
  .prefault({});
export type SeoInput = z.infer<typeof seoInput>;
