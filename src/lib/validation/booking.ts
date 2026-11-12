import { z } from "zod";

export const phone = z
  .string()
  .trim()
  .min(7, "Enter a phone number we can call")
  .max(20)
  .regex(/^[+\d][\d\s-]+$/, "Use digits, spaces or dashes only");

const objectId = z.string().regex(/^[a-f\d]{24}$/i);

const contact = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  phone,
  whatsapp: z.boolean().default(true),
  email: z.email("Enter a valid email").optional().or(z.literal("")),
});

const address = z.object({
  line: z.string().trim().min(5, "Enter the street address").max(200),
  area: z.string().trim().min(1, "Pick your area"),
  city: z.string().trim().max(80).optional(),
  mapLink: z.url().optional().or(z.literal("")),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

const device = z
  .object({ deviceId: objectId.optional(), customDevice: z.string().trim().max(120).optional() })
  .refine((d) => d.deviceId || d.customDevice, { message: "Pick your device or describe it" });

export const standardBookingInput = z.object({
  type: z.literal("standard"),
  device,
  serviceIds: z.array(objectId).min(1, "Pick at least one repair"),
  issueNote: z.string().max(1000).optional(),
  photos: z.array(z.url()).max(3).default([]),
  preferredSlot: z.object({ date: z.iso.date("Pick a date"), window: z.string().min(1, "Pick a time") }),
  address,
  customer: contact,
  turnstileToken: z.string().optional(),
});

export const emergencyBookingInput = z.object({
  type: z.literal("emergency"),
  device,
  serviceIds: z.array(objectId).default([]),
  issueNote: z.string().max(1000).optional(),
  address,
  customer: contact,
  turnstileToken: z.string().optional(),
});

export const bookingInput = z.discriminatedUnion("type", [
  standardBookingInput,
  emergencyBookingInput,
]);
export type BookingInput = z.infer<typeof bookingInput>;
