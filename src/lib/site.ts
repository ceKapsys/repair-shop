/**
 * Build-time defaults. Every value here is a placeholder that the owner
 * overrides from /admin/settings; the settings document in MongoDB wins.
 */
export const siteDefaults = {
  name: "911 Mobile Repair Shop",
  shortName: "911 Mobile Repair",
  tagline: "Door-to-door and emergency device repair",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  primaryColor: "#0F766E",
  contacts: {
    phones: ["+10000000000"],
    whatsapp: "10000000000",
    email: "hello@example.com",
    address: "Shop address — set in admin",
  },
  hero: {
    title: "Phone or laptop broken? We come to you.",
    subtitle:
      "Doorstep and emergency repairs with the price shown before you book and a warranty on every fix.",
  },
  seo: {
    titleTemplate: "%s | 911 Mobile Repair Shop",
    description:
      "Door-to-door and emergency repair for phones, laptops, tablets, consoles and more. See the price, pick a time, and we come to you.",
  },
} as const;

export type SiteDefaults = typeof siteDefaults;
