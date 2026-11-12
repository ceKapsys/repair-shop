import "server-only";
import { unstable_cache } from "next/cache";
import { connectDb, isDbConfigured } from "./db";
import { DEFAULT_WINDOWS, siteDefaults } from "./site";
import { TAGS } from "./tags";
import { Settings } from "@/models/Settings";

export type DaySchedule = { day: number; enabled: boolean; open: string; close: string; responseMinutes: number };

export type SiteSettings = {
  shopName: string;
  tagline: string;
  timezone: string;
  currency: string;
  hero: { title: string; subtitle: string; image?: string };
  branding: { logo?: string; logoDark?: string; favicon?: string; primaryColor: string };
  contacts: {
    phones: string[];
    whatsapp: string;
    whatsappMessage: string;
    email: string;
    address: string;
    city: string;
    mapEmbed?: string;
  };
  hours: { day: number; open: string; close: string; closed: boolean }[];
  serviceAreas: { name: string; slug: string; note?: string }[];
  bookingSlots: { windows: string[]; leadTimeHours: number; maxPerSlot: number; daysAhead: number; closedDays: number[] };
  emergency: { enabled: boolean; fee: number; schedule: DaySchedule[] };
  alertEmails: string[];
  notifications: { customerConfirmation: boolean; statusUpdates: boolean };
  google: {
    connected: boolean;
    locationTitle?: string;
    placeId?: string;
    mapsUri?: string;
    rating?: number;
    ratingCount?: number;
    lastSyncAt?: string;
    lastSyncError?: string;
  };
  seoDefaults: { titleTemplate: string; description: string; ogImage?: string };
  analytics: { ga4Id?: string; searchConsoleVerification?: string };
  socials: Record<string, string>;
  faqs: { question: string; answer: string }[];
};

export const defaultSettings = (): SiteSettings => ({
  shopName: siteDefaults.name,
  tagline: "Door-to-door and emergency device repair",
  timezone: process.env.SHOP_TIMEZONE || "UTC",
  currency: process.env.SHOP_CURRENCY || "USD",
  hero: {
    title: "Phone or laptop broken? We come to you.",
    subtitle:
      "Doorstep and emergency repairs with the price shown before you book and a warranty on every fix.",
  },
  branding: { primaryColor: siteDefaults.primaryColor },
  contacts: {
    phones: ["+10000000000"],
    whatsapp: "10000000000",
    whatsappMessage: `Hi ${siteDefaults.name}, I need a repair.`,
    email: "hello@example.com",
    address: "Shop address — set in admin",
    city: "Your city",
  },
  hours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: "09:00", close: "21:00", closed: false })),
  serviceAreas: [{ name: "City centre", slug: "city-centre", note: "Set your areas in admin › Settings" }],
  bookingSlots: { windows: DEFAULT_WINDOWS, leadTimeHours: 2, maxPerSlot: 3, daysAhead: 14, closedDays: [] },
  emergency: {
    enabled: true,
    fee: 0,
    schedule: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, enabled: true, open: "08:00", close: "22:00", responseMinutes: 15 })),
  },
  alertEmails: process.env.ALERT_EMAIL ? [process.env.ALERT_EMAIL] : [],
  notifications: { customerConfirmation: true, statusUpdates: true },
  google: { connected: false },
  seoDefaults: {
    titleTemplate: `%s | ${siteDefaults.name}`,
    description:
      "Door-to-door and emergency repair for phones, laptops, tablets, consoles and more. See the price, pick a time, and we come to you.",
  },
  analytics: { ga4Id: process.env.NEXT_PUBLIC_GA4_ID || undefined },
  socials: {},
  faqs: [
    { question: "How much does a repair cost?", answer: "Each service shows its price before you book. If a price needs an inspection, we confirm it before starting." },
    { question: "Is there a warranty?", answer: "Yes. Every repair comes with a warranty; the length is shown on each service page." },
    { question: "Is my data safe during a doorstep repair?", answer: "We repair in front of you and never need your passcode for hardware repairs." },
  ],
});

const pick = <T,>(v: T | null | undefined | "", fb: T): T => (v === undefined || v === null || v === "" ? fb : v);
const arr = <T,>(v: T[] | undefined | null, fb: T[]) => (v && v.length ? v : fb);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mergeSettings(s: any): SiteSettings {
  const d = defaultSettings();
  if (!s) return d;
  const g = s.googleBusiness ?? {};
  return {
    shopName: pick(s.shopName, d.shopName),
    tagline: pick(s.tagline, d.tagline),
    timezone: pick(s.timezone, d.timezone),
    currency: pick(s.currency, d.currency),
    hero: { title: pick(s.hero?.title, d.hero.title), subtitle: pick(s.hero?.subtitle, d.hero.subtitle), image: s.hero?.image || undefined },
    branding: {
      logo: s.branding?.logo || undefined,
      logoDark: s.branding?.logoDark || undefined,
      favicon: s.branding?.favicon || undefined,
      primaryColor: pick(s.branding?.primaryColor, d.branding.primaryColor),
    },
    contacts: {
      phones: arr(s.contacts?.phones?.filter(Boolean), d.contacts.phones),
      whatsapp: pick(s.contacts?.whatsapp, d.contacts.whatsapp),
      whatsappMessage: pick(s.contacts?.whatsappMessage, d.contacts.whatsappMessage),
      email: pick(s.contacts?.email, d.contacts.email),
      address: pick(s.contacts?.address, d.contacts.address),
      city: pick(s.contacts?.city, d.contacts.city),
      mapEmbed: s.contacts?.mapEmbed || undefined,
    },
    hours: arr(s.hours, d.hours),
    serviceAreas: arr(s.serviceAreas, d.serviceAreas),
    bookingSlots: {
      windows: arr(s.bookingSlots?.windows, d.bookingSlots.windows),
      leadTimeHours: pick(s.bookingSlots?.leadTimeHours, d.bookingSlots.leadTimeHours),
      maxPerSlot: pick(s.bookingSlots?.maxPerSlot, d.bookingSlots.maxPerSlot),
      daysAhead: pick(s.bookingSlots?.daysAhead, d.bookingSlots.daysAhead),
      closedDays: s.bookingSlots?.closedDays ?? d.bookingSlots.closedDays,
    },
    emergency: {
      enabled: s.emergency?.enabled ?? d.emergency.enabled,
      fee: pick(s.emergency?.fee, d.emergency.fee),
      schedule: arr(s.emergency?.schedule, d.emergency.schedule),
    },
    alertEmails: arr(s.alertEmails, d.alertEmails),
    notifications: {
      customerConfirmation: s.notifications?.customerConfirmation ?? true,
      statusUpdates: s.notifications?.statusUpdates ?? true,
    },
    google: {
      connected: Boolean(g.tokensEncrypted),
      locationTitle: g.locationTitle || undefined,
      placeId: g.placeId || undefined,
      mapsUri: g.mapsUri || undefined,
      rating: g.rating ?? undefined,
      ratingCount: g.ratingCount ?? undefined,
      lastSyncAt: g.lastSyncAt ? new Date(g.lastSyncAt).toISOString() : undefined,
      lastSyncError: g.lastSyncError || undefined,
    },
    seoDefaults: {
      titleTemplate: pick(s.seoDefaults?.titleTemplate, d.seoDefaults.titleTemplate),
      description: pick(s.seoDefaults?.description, d.seoDefaults.description),
      ogImage: s.seoDefaults?.ogImage || undefined,
    },
    analytics: {
      ga4Id: s.analytics?.ga4Id || d.analytics.ga4Id,
      searchConsoleVerification: s.analytics?.searchConsoleVerification || undefined,
    },
    socials: Object.fromEntries(Object.entries(s.socials ?? {}).filter(([, v]) => Boolean(v))) as Record<string, string>,
    faqs: s.faqs ?? d.faqs,
  };
}

/** Uncached read, for admin screens and server actions. */
export async function loadSettings(): Promise<SiteSettings> {
  if (!isDbConfigured()) return defaultSettings();
  await connectDb();
  return mergeSettings(await Settings.findById("site").lean());
}

/**
 * Cached read for public pages, invalidated by revalidateTag("settings").
 * Falls back to defaults when no database is configured, so the site builds without one.
 */
export const getSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    try {
      return await loadSettings();
    } catch (err) {
      console.error("[settings] falling back to defaults:", err);
      return defaultSettings();
    }
  },
  ["site-settings"],
  { tags: [TAGS.settings] },
);
