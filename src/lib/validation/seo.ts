import { z } from "zod";

export const seoInput = z.object({
  metaTitle: z.string().max(60, "Keep titles under 60 characters").optional(),
  metaDescription: z.string().max(160, "Keep descriptions under 160 characters").optional(),
  focusKeyword: z.string().max(80).optional(),
  keywords: z.array(z.string().max(80)).max(20).default([]),
  canonical: z.url().optional().or(z.literal("")),
  ogTitle: z.string().max(90).optional(),
  ogDescription: z.string().max(200).optional(),
  ogImage: z.url().optional().or(z.literal("")),
  noindex: z.boolean().default(false),
  schemaType: z.string().optional(),
});
export type SeoInput = z.infer<typeof seoInput>;
