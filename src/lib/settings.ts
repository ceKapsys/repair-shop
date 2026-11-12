import "server-only";
import { unstable_cache } from "next/cache";
import { connectDb, isDbConfigured } from "./db";
import { siteDefaults } from "./site";
import { Settings } from "@/models/Settings";

export const SETTINGS_TAG = "settings";

export type PublicSettings = {
  shopName: string;
  hero: { title: string; subtitle: string };
  primaryColor: string;
  logo?: string;
  phones: string[];
  whatsapp: string;
  whatsappMessage: string;
  email: string;
  address: string;
  seo: { titleTemplate: string; description: string; ogImage?: string };
};

function fromDefaults(): PublicSettings {
  return {
    shopName: siteDefaults.name,
    hero: { ...siteDefaults.hero },
    primaryColor: siteDefaults.primaryColor,
    phones: [...siteDefaults.contacts.phones],
    whatsapp: siteDefaults.contacts.whatsapp,
    whatsappMessage: `Hi ${siteDefaults.name}, I need a repair.`,
    email: siteDefaults.contacts.email,
    address: siteDefaults.contacts.address,
    seo: { ...siteDefaults.seo },
  };
}

/**
 * Site settings merged over build-time defaults. Cached and invalidated with
 * revalidateTag(SETTINGS_TAG) whenever the admin saves Settings. Falls back to
 * defaults when no database is configured, so the site builds without one.
 */
export const getSettings = unstable_cache(
  async (): Promise<PublicSettings> => {
    const base = fromDefaults();
    if (!isDbConfigured()) return base;
    try {
      await connectDb();
      const s = await Settings.findById("site").lean();
      if (!s) return base;
      return {
        shopName: s.shopName || base.shopName,
        hero: {
          title: s.hero?.title || base.hero.title,
          subtitle: s.hero?.subtitle || base.hero.subtitle,
        },
        primaryColor: s.branding?.primaryColor || base.primaryColor,
        logo: s.branding?.logo ?? undefined,
        phones: s.contacts?.phones?.length ? s.contacts.phones : base.phones,
        whatsapp: s.contacts?.whatsapp || base.whatsapp,
        whatsappMessage: s.contacts?.whatsappMessage || base.whatsappMessage,
        email: s.contacts?.email || base.email,
        address: s.contacts?.address || base.address,
        seo: {
          titleTemplate: s.seoDefaults?.titleTemplate || base.seo.titleTemplate,
          description: s.seoDefaults?.description || base.seo.description,
          ogImage: s.seoDefaults?.ogImage ?? undefined,
        },
      };
    } catch (err) {
      console.error("[settings] falling back to defaults:", err);
      return base;
    }
  },
  ["site-settings"],
  { tags: [SETTINGS_TAG] },
);
