import { z } from "zod";
import { copy, fill } from "@/content/copy";

const e = copy.errors;
const need = (field: string) => fill(e.required, { field });

/**
 * US / North American phone numbers: 10 digits (e.g. 305-911-7372).
 * Spaces, dashes, parentheses, dots and a leading +1 / 1 are accepted.
 * Stored cleanly formatted as (NXX) NXX-XXXX or international +E164.
 */
export function normalisePhone(input: string): string | null {
  let d = input.replace(/[\s\-().+]/g, "");
  if (d.startsWith("1") && d.length === 11) d = d.slice(1);
  if (/^[2-9]\d{2}[2-9]\d{6}$/.test(d)) {
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  if (/^\d{10,15}$/.test(d)) {
    return `+${d}`;
  }
  return null;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export const phone = z
  .string()
  .trim()
  .min(1, need(copy.fields.phone))
  .refine((v) => normalisePhone(v) !== null, e.phone)
  .transform((v) => normalisePhone(v)!);

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

const contact = z.object({
  name: z.string().trim().min(2, need(copy.fields.name)).max(80),
  phone,
  whatsapp: z.boolean().default(true),
  email: z.string().trim().max(200).refine((v) => !v || EMAIL_RE.test(v), e.email).optional(),
});

const address = z.object({
  line: z.string().trim().min(5, need(copy.fields.address)).max(200),
  area: z.string().trim().min(1, e.pickArea),
  city: z.string().trim().max(80).optional(),
  mapLink: z.url().max(500).optional().or(z.literal("")),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const device = z
  .object({ deviceId: objectId.optional(), customDevice: z.string().trim().max(120).optional() })
  .refine((d) => d.deviceId || (d.customDevice ?? "").length >= 2, { message: e.pickDevice });

const shared = {
  device,
  serviceIds: z.array(objectId).max(10).default([]),
  photos: z.array(z.url()).max(3).default([]),
  address,
  customer: contact,
  turnstileToken: z.string().max(4000).optional(),
  website: z.string().max(0).optional(), // honeypot: real people never fill this
};

export const standardBookingInput = z.object({
  type: z.literal("standard"),
  ...shared,
  issueNote: z.string().trim().max(1000).optional(),
  preferredSlot: z.object({ date: z.iso.date(e.pickDate), window: z.string().min(1, e.pickWindow).max(20) }),
});

export const emergencyBookingInput = z.object({
  type: z.literal("emergency"),
  ...shared,
  issueNote: z.string().trim().max(1000).optional(),
});

export const bookingInput = z.discriminatedUnion("type", [standardBookingInput, emergencyBookingInput]).superRefine((v, ctx) => {
  if (!v.serviceIds.length && (v.issueNote ?? "").length < 3) ctx.addIssue({ code: "custom", path: ["serviceIds"], message: e.pickProblem });
});
export type BookingInput = z.infer<typeof bookingInput>;
