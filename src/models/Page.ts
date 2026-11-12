import { Schema } from "mongoose";
import { defineModel, seoSchema } from "./_shared";

/** Editable copy + SEO for fixed pages (home, about, contact, emergency, legal, listings). */
const schema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    intro: String,
    body: { json: Schema.Types.Mixed, html: String },
    seo: seoSchema,
  },
  { timestamps: true },
);

export const Page = defineModel("Page", schema);

export const PAGE_KEYS = {
  home: { title: "Home", path: "/" },
  services: { title: "Repair services", path: "/services" },
  devices: { title: "Devices we repair", path: "/devices" },
  emergency: { title: "Emergency repair", path: "/emergency" },
  book: { title: "Book a repair", path: "/book" },
  blog: { title: "Blog", path: "/blog" },
  gallery: { title: "Our work", path: "/gallery" },
  reviews: { title: "Customer reviews", path: "/reviews" },
  about: { title: "About us", path: "/about" },
  contact: { title: "Contact", path: "/contact" },
  "service-area": { title: "Service area", path: "/service-area" },
  privacy: { title: "Privacy policy", path: "/privacy" },
  terms: { title: "Terms of service", path: "/terms" },
} as const;
export type PageKey = keyof typeof PAGE_KEYS;
