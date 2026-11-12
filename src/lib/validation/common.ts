import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
export const slug = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");
export const optText = (max = 500) => z.string().trim().max(max).optional().or(z.literal("")).transform((v) => v || undefined);
export const optUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => !v || /^(https?:\/\/|\/)/.test(v), "Enter a full URL starting with https://")
  .optional()
  .transform((v) => v || undefined);
export const optNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? undefined : Number(v)),
  z.number().min(0).optional(),
);
export const image = z.object({
  url: z.string().trim().min(1, "Image URL is required"),
  alt: z.string().trim().min(1, "Alt text is required for accessibility and SEO").max(200),
  width: z.number().optional(),
  height: z.number().optional(),
});
export const richText = z
  .object({ json: z.unknown().optional(), html: z.string().max(500_000).optional() })
  .optional();
export const faq = z.object({
  question: z.string().trim().min(1, "Question is required").max(300),
  answer: z.string().trim().min(1, "Answer is required").max(3000),
});
export const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM");
