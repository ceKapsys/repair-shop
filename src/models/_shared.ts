import { Schema, model, models, type Model } from "mongoose";

/** Shared SEO sub-document embedded in services, devices, brands, categories, posts. */
export const seoSchema = new Schema(
  {
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 200 },
    focusKeyword: String,
    keywords: [String],
    canonical: String,
    ogTitle: String,
    ogDescription: String,
    ogImage: String,
    noindex: { type: Boolean, default: false },
    schemaType: String,
  },
  { _id: false },
);

export const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, required: true },
    width: Number,
    height: Number,
    blurDataURL: String,
  },
  { _id: false },
);

export const faqSchema = new Schema({ question: String, answer: String }, { _id: false });

/** `range` and `quote` are legacy values kept so existing documents stay valid. */
export const PRICE_TYPES = ["fixed", "from", "hidden", "range", "quote"] as const;
export const DEVICE_TYPES = [
  "phone",
  "laptop",
  "tablet",
  "console",
  "smartwatch",
  "audio",
  "other",
] as const;
export const BOOKING_STATUSES = [
  "new",
  "confirmed",
  "on-the-way",
  "in-progress",
  "done",
  "cancelled",
] as const;

/**
 * Register a model once (safe under hot reload). Typed loosely on purpose: reads are converted
 * to the plain shapes in lib/types.ts, and writes are validated by Zod schemas beforehand.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyModel = Model<any>;
export function defineModel(name: string, schema: Schema): AnyModel {
  return (models[name] as AnyModel) ?? model(name, schema);
}
