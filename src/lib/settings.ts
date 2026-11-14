import "server-only";
import { unstable_cache } from "next/cache";
import { connectDb, isDbConfigured } from "./db";
import { DEFAULT_WINDOWS } from "./site";
import { TAGS } from "./tags";
import { Settings } from "@/models/Settings";

export type DaySchedule = { day: number; enabled: boolean; open: string; close: string; responseMinutes: number };

export type SiteSettings = {
  shopName: string;
  tagline: string;
  timezone: string;
  currency: string;
  /** Optional overrides for the home hero; empty means the locked copy in content/copy.ts is used. */
  hero: {
    eyebrow?: string;
    title?: string;
    sub?: string;
    image?: string;
    trustItems?: { icon?: string; text: string }[];
  };
  howItWorks?: { step: string; title: string; text: string }[];
  branding: { logo?: string; logoDark?: string; favicon?: string };
  contacts: {
    phones: string[];
    whatsapp: string;
    email: string;
    address: string;
    city: string;
    mapEmbed?: string;
  };
  hours: { day: number; open: string; close: string; closed: boolean }[];
  serviceAreas: { name: string; slug: string; note?: string }[];
  bookingSlots: { windows: string[]; leadTimeHours: number; maxPerSlot: number; daysAhead: number; closedDays: number[] };
  emergency: {
    enabled: boolean;
    fee: number;
    responseMinutes?: number;
    title?: string;
    body?: string;
    hoursText?: string;
    statusText?: string;
    schedule: DaySchedule[];
  };
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
  shopName: "911 Mobile Repair Shop",
  tagline: "Certified Doorstep & 24/7 Emergency Device Repair in Florida",
  timezone: process.env.SHOP_TIMEZONE || "America/New_York",
  currency: process.env.SHOP_CURRENCY || "USD",
  hero: {
    eyebrow: "Doorstep repair across South Florida",
    title: "Your device, fixed at your door.",
    sub: "Phones, laptops, tablets, consoles, watches and audio. A certified technician comes directly to your home or office in Miami, Fort Lauderdale & Orlando.",
    trustItems: [
      { icon: "shield", text: "Up to 180-day warranty" },
      { icon: "eye", text: "Repaired in front of you" },
      { icon: "tag", text: "Price agreed before we start" },
      { icon: "star", text: "4.9 on Google (340+ reviews)" },
    ],
  },
  howItWorks: [
    { step: "01", title: "Book in a minute.", text: "Choose your device and the problem, pick a time window." },
    { step: "02", title: "We come to you.", text: "A certified technician arrives at your door with OEM parts." },
    { step: "03", title: "Fixed on the spot.", text: "You inspect and test the repaired device, then pay." },
  ],
  branding: {},
  contacts: {
    phones: ["(305) 911-7372"],
    whatsapp: "13059117372",
    email: "support@911mobilerepair.com",
    address: "Margate, FL (Center Hub) & South Florida",
    city: "Margate, Broward & South Florida",
  },
  hours: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, open: "08:00", close: "21:00", closed: false })),
  serviceAreas: [
    { name: "Margate, Florida (Center Hub)", slug: "margate", note: "Center Hub · 15–25 min dispatch" },
    { name: "Pompano Beach", slug: "pompano-beach", note: "20–30 min dispatch" },
    { name: "Coconut Creek", slug: "coconut-creek", note: "15–25 min dispatch" },
    { name: "Coral Springs", slug: "coral-springs", note: "15–25 min dispatch" },
    { name: "North Lauderdale", slug: "north-lauderdale", note: "15–25 min dispatch" },
    { name: "Tamarac", slug: "tamarac", note: "20–30 min dispatch" },
    { name: "Parkland", slug: "parkland", note: "20–30 min dispatch" },
    { name: "Lighthouse Point", slug: "lighthouse-point", note: "20–35 min dispatch" },
    { name: "Deerfield Beach", slug: "deerfield-beach", note: "20–35 min dispatch" },
    { name: "Fort Lauderdale", slug: "fort-lauderdale", note: "25–40 min dispatch" },
    { name: "Sunrise", slug: "sunrise", note: "20–35 min dispatch" },
    { name: "Boca Raton", slug: "boca-raton", note: "25–40 min dispatch" },
    { name: "Fort Lauderdale (North)", slug: "fort-lauderdale-north", note: "20–35 min dispatch" },
    { name: "Hollywood", slug: "hollywood", note: "30–45 min dispatch" },
    { name: "Davie", slug: "davie", note: "25–40 min dispatch" },
    { name: "Plantation", slug: "plantation", note: "20–35 min dispatch" },
    { name: "West Palm Beach", slug: "west-palm-beach", note: "Doorstep mobile dispatch" },
    { name: "Miami", slug: "miami", note: "Doorstep mobile dispatch" },
  ],
  bookingSlots: { windows: DEFAULT_WINDOWS, leadTimeHours: 2, maxPerSlot: 4, daysAhead: 14, closedDays: [] },
  emergency: {
    enabled: true,
    fee: 35,
    responseMinutes: 30,
    title: "Can't wait until tomorrow?",
    body: "Emergency repairs today: a certified technician calls you within 30 minutes of booking.",
    hoursText: "8 AM–11 PM EST",
    statusText: "Emergency service open today until 11:00 PM EST",
    schedule: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day, enabled: true, open: "08:00", close: "23:00", responseMinutes: 30 })),
  },
  alertEmails: process.env.ALERT_EMAIL ? [process.env.ALERT_EMAIL] : [],
  notifications: { customerConfirmation: true, statusUpdates: true },
  google: { connected: false, rating: 4.9, ratingCount: 348 },
  seoDefaults: {
    titleTemplate: `%s | 911 Mobile Repair Shop`,
    description: "Doorstep and 24/7 emergency device repair in Florida. Certified technicians, OEM parts, and written warranty.",
  },
  analytics: { ga4Id: (process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GA4_ID) || undefined },
  socials: {},
  faqs: [
    { question: "How much will my repair cost?", answer: "Each repair shows its upfront price before you book. We never charge surprise diagnostic fees." },
    { question: "Do repairs come with a warranty?", answer: "Yes. Every repair includes up to a 180-day parts and labor warranty." },
    { question: "Is doorstep repair safe for my personal data?", answer: "100% safe. We repair right in front of you and never ask for passcodes, iCloud, or Google account passwords." },
    { question: "What payment methods do you accept?", answer: "We accept all major credit and debit cards (Visa, MasterCard, Amex, Discover), Apple Pay, Google Pay, and cash upon completed inspection." },
    { question: "Which areas in Florida do you cover?", answer: "We cover Miami-Dade, Broward County, Palm Beach, and the greater Orlando metropolitan area." },
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
    hero: {
      eyebrow: s.hero?.eyebrow || d.hero.eyebrow,
      title: s.hero?.title || d.hero.title,
      sub: s.hero?.sub || d.hero.sub,
      image: s.hero?.image || undefined,
      trustItems: arr(s.hero?.trustItems, d.hero.trustItems ?? []),
    },
    howItWorks: arr(s.howItWorks, d.howItWorks ?? []),
    branding: {
      logo: s.branding?.logo || undefined,
      logoDark: s.branding?.logoDark || undefined,
      favicon: s.branding?.favicon || undefined,
    },
    contacts: {
      phones: arr(s.contacts?.phones?.filter(Boolean), d.contacts.phones),
      whatsapp: pick(s.contacts?.whatsapp, d.contacts.whatsapp),
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
      responseMinutes: pick(s.emergency?.responseMinutes, d.emergency.responseMinutes),
      title: pick(s.emergency?.title, d.emergency.title),
      body: pick(s.emergency?.body, d.emergency.body),
      hoursText: pick(s.emergency?.hoursText, d.emergency.hoursText),
      statusText: pick(s.emergency?.statusText, d.emergency.statusText),
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
      // Only a rating that came from a Google sync is ever shown.
      rating: g.lastSyncAt ? (g.rating ?? undefined) : undefined,
      ratingCount: g.lastSyncAt ? (g.ratingCount ?? undefined) : undefined,
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
