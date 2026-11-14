import type { Metadata } from "next";
import { requireOwnerPage } from "@/lib/admin-data";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { loadSettings } from "@/lib/settings";
import { SettingsEditor } from "./settings-editor";

export const metadata: Metadata = { title: "Settings" };

export default async function Page() {
  await requireOwnerPage();
  const s = await loadSettings();
  const initial = {
    shopName: s.shopName,
    tagline: s.tagline,
    timezone: s.timezone,
    currency: s.currency,
    hero: {
      eyebrow: s.hero.eyebrow ?? "",
      title: s.hero.title ?? "",
      sub: s.hero.sub ?? "",
      image: s.hero.image ?? "",
      trustItems: s.hero.trustItems ?? [],
    },
    howItWorks: s.howItWorks ?? [],
    branding: { logo: s.branding.logo ?? "", logoDark: s.branding.logoDark ?? "", favicon: s.branding.favicon ?? "" },
    contacts: { ...s.contacts, mapEmbed: s.contacts.mapEmbed ?? "" },
    hours: [0, 1, 2, 3, 4, 5, 6].map((day) => s.hours.find((h) => h.day === day) ?? { day, open: "09:00", close: "21:00", closed: false }),
    serviceAreas: s.serviceAreas.map((a) => ({ name: a.name, slug: a.slug, note: a.note ?? "" })),
    bookingSlots: s.bookingSlots,
    emergency: {
      enabled: s.emergency.enabled,
      fee: s.emergency.fee,
      responseMinutes: s.emergency.responseMinutes ?? 30,
      title: s.emergency.title ?? "",
      body: s.emergency.body ?? "",
      hoursText: s.emergency.hoursText ?? "",
      statusText: s.emergency.statusText ?? "",
      schedule: [0, 1, 2, 3, 4, 5, 6].map(
        (day) => s.emergency.schedule.find((d) => d.day === day) ?? { day, enabled: false, open: "08:00", close: "22:00", responseMinutes: 15 },
      ),
    },
    alertEmails: s.alertEmails,
    notifications: s.notifications,
    analytics: { ga4Id: s.analytics.ga4Id ?? "", searchConsoleVerification: s.analytics.searchConsoleVerification ?? "" },
    socials: { facebook: "", instagram: "", tiktok: "", youtube: "", x: "", ...s.socials },
    faqs: s.faqs,
  };
  return <SettingsEditor initial={initial} emailConfigured={Boolean(process.env.RESEND_API_KEY)} uploadsConfigured={cloudinaryConfigured()} />;
}
