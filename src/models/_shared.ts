import { Schema } from "mongoose";

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

export const PRICE_TYPES = ["fixed", "from", "range", "quote"] as const;
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
