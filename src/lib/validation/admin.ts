import { z } from "zod";
import { faq, hhmm, image, objectId, optNumber, optText, optUrl, richText, slug } from "./common";
import { seoInput } from "./seo";

export const serviceInput = z
  .object({
    title: z.string().trim().min(2, "Title is required").max(120),
    slug,
    categoryId: objectId.optional().or(z.literal("")).transform((v) => v || undefined),
    shortDesc: optText(300),
    verbPhrase: optText(120),
    body: richText,
    icon: optText(40),
    images: z.array(image).max(12).default([]),
    priceType: z.enum(["fixed", "from", "hidden", "range", "quote"]).transform((t) => (t === "quote" ? "hidden" : t === "range" ? "from" : t)),
    priceMin: optNumber,
    priceMax: optNumber,
    showPrice: z.boolean().default(true),
    duration: optText(60),
    warrantyDays: optNumber,
    partsNote: optText(300),
    isEmergencyAvailable: z.boolean().default(false),
    isCommonRepair: z.boolean().default(false),
    deviceIds: z.array(objectId).default([]),
    faqs: z.array(faq).max(30).default([]),
    isActive: z.boolean().default(true),
    seo: seoInput,
  })
  .superRefine((v, ctx) => {
    if (v.priceType !== "hidden" && v.priceMin == null)
      ctx.addIssue({ code: "custom", path: ["priceMin"], message: "Enter a price, or choose “Hidden”" });
  });

export const categoryInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  slug,
  icon: optText(40),
  seo: seoInput,
});

export const brandInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  slug,
  logo: optUrl,
  deviceType: z.enum(["phone", "laptop", "tablet", "console", "smartwatch", "audio", "other"]),
  seo: seoInput,
});

export const deviceInput = z.object({
  brandId: objectId,
  model: z.string().trim().min(1, "Model name is required").max(120),
  slug,
  image: optUrl,
  releaseYear: z.preprocess((v) => (v === "" || v == null ? undefined : Number(v)), z.number().int().min(1990).max(2100).optional()),
  specs: z.record(z.string(), z.string().max(200)).default({}),
  repairs: z
    .array(z.object({ serviceId: objectId, priceType: z.enum(["fixed", "from", "hidden"]).optional(), price: optNumber, showPrice: z.boolean().default(true), duration: optText(60) }))
    .default([]),
  isActive: z.boolean().default(true),
  seo: seoInput,
});

export const postInput = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  slug,
  excerpt: optText(400),
  body: richText,
  coverImage: image.optional().nullable().transform((v) => v ?? undefined),
  categoryIds: z.array(objectId).default([]),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  status: z.enum(["draft", "scheduled", "published"]),
  publishAt: z.string().optional().or(z.literal("")).transform((v) => (v ? new Date(v) : undefined)),
  seo: seoInput,
});

export const galleryInput = z.object({
  image: z.object({ url: z.string().min(1, "Image is required"), width: z.number().optional(), height: z.number().optional() }),
  afterImage: z
    .object({
      url: z.string().min(1, "After image is required"),
      width: z.number().optional(),
      height: z.number().optional(),
      alt: z.string().trim().max(200).optional(),
    })
    .optional()
    .nullable(),
  caption: optText(200),
  alt: z.string().trim().min(1, "Alt text is required").max(200),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  deviceId: objectId.optional().or(z.literal("")).transform((v) => v || undefined),
  serviceId: objectId.optional().or(z.literal("")).transform((v) => v || undefined),
  isBeforeAfter: z.boolean().default(false),
  pairId: objectId.optional().or(z.literal("")).transform((v) => v || undefined),
});

export const reviewInput = z.object({
  authorName: z.string().trim().min(1, "Name is required").max(80),
  authorPhoto: optUrl,
  rating: z.coerce.number().int().min(1).max(5),
  text: optText(3000),
  publishedAt: z.string().optional().or(z.literal("")).transform((v) => (v ? new Date(v) : new Date())),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const redirectInput = z.object({
  from: z.string().trim().regex(/^\/[^\s]*$/, "Start with / (a path on this site)"),
  to: z.string().trim().regex(/^(\/|https?:\/\/)[^\s]*$/, "Use a path (/new) or a full URL"),
  code: z.coerce.number().refine((n) => n === 301 || n === 302, "301 or 302"),
});

export const pageInput = z.object({
  key: z.string().min(1),
  title: z.string().trim().min(1, "Title is required").max(120),
  intro: optText(600),
  body: richText,
  seo: seoInput,
});

export const userInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  email: z.email("Enter a valid email"),
  role: z.enum(["owner", "editor"]),
  password: z.string().min(12, "At least 12 characters").max(200).optional().or(z.literal("")).transform((v) => v || undefined),
});

export const passwordChangeInput = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    next: z.string().min(12, "At least 12 characters").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { path: ["confirm"], message: "Passwords don’t match" });

const window = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM-HH:MM");

export const settingsInput = z.object({
  shopName: z.string().trim().min(1, "Shop name is required").max(80),
  tagline: optText(120),
  timezone: z.string().trim().min(1).max(60),
  currency: z.string().trim().length(3, "3-letter code, e.g. USD").toUpperCase(),
  hero: z.object({
    eyebrow: optText(60),
    title: optText(80),
    sub: optText(300),
    image: optUrl,
    trustItems: z.array(z.object({ icon: z.string().trim().max(40), text: z.string().trim().max(120) })).optional(),
  }),
  howItWorks: z.array(z.object({ step: z.string().trim().max(20), title: z.string().trim().max(80), text: z.string().trim().max(300) })).optional(),
  branding: z.object({
    logo: optUrl,
    logoDark: optUrl,
    favicon: optUrl,
  }),
  contacts: z.object({
    phones: z.array(z.string().trim().regex(/^\+?[\d\s()-]{6,20}$/, "Enter a valid phone number")).min(1, "Add at least one phone"),
    whatsapp: z.string().trim().regex(/^\+?\d{6,15}$/, "Digits only, with country code"),
    email: z.email("Enter a valid email"),
    address: optText(300),
    city: optText(80),
    mapEmbed: optUrl,
  }),
  hours: z.array(z.object({ day: z.number().min(0).max(6), open: hhmm, close: hhmm, closed: z.boolean() })).length(7),
  serviceAreas: z.array(z.object({ name: z.string().trim().min(1, "Area name is required").max(80), slug, note: optText(300) })),
  bookingSlots: z.object({
    windows: z.array(window).min(1, "Add at least one time window"),
    leadTimeHours: z.coerce.number().min(0).max(168),
    maxPerSlot: z.coerce.number().int().min(1).max(100),
    daysAhead: z.coerce.number().int().min(1).max(90),
    closedDays: z.array(z.number().min(0).max(6)).default([]),
  }),
  emergency: z.object({
    enabled: z.boolean(),
    fee: z.coerce.number().min(0),
    responseMinutes: z.coerce.number().int().min(1).max(1440).optional(),
    title: optText(120),
    body: optText(300),
    hoursText: optText(80),
    statusText: optText(120),
    schedule: z
      .array(z.object({ day: z.number().min(0).max(6), enabled: z.boolean(), open: hhmm, close: hhmm, responseMinutes: z.coerce.number().int().min(1).max(1440) }))
      .length(7),
  }),
  alertEmails: z.array(z.email("Enter a valid email")).min(1, "Add at least one alert email"),
  notifications: z.object({ customerConfirmation: z.boolean(), statusUpdates: z.boolean() }),
  analytics: z.object({ ga4Id: optText(40), searchConsoleVerification: optText(200) }),
  socials: z.object({ facebook: optUrl, instagram: optUrl, tiktok: optUrl, youtube: optUrl, x: optUrl }),
  faqs: z.array(faq).max(30),
});
export type SettingsInput = z.input<typeof settingsInput>;

export const seoSettingsInput = z.object({
  titleTemplate: z.string().trim().min(1).max(80).refine((v) => v.includes("%s"), "Must contain %s for the page title"),
  description: z.string().trim().min(1).max(200),
  ogImage: optUrl,
});

export const bookingAdminInput = z.object({
  status: z.enum(["new", "confirmed", "on-the-way", "in-progress", "done", "cancelled"]).optional(),
  quotedPrice: optNumber,
  note: optText(2000),
  notifyCustomer: z.boolean().default(false),
});
