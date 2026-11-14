import { DAY_NAMES } from "./format";
import type { SiteSettings } from "./settings";
import { siteDefaults } from "./site";

/** LocalBusiness (ElectronicsRepair) JSON-LD. The rating is included only when it was synced from Google. */
export function localBusinessJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "ElectronicsRepair",
    "@id": `${siteDefaults.url}/#business`,
    name: s.shopName,
    url: siteDefaults.url,
    telephone: s.contacts.phones[0],
    email: s.contacts.email,
    image: s.branding.logo || s.hero.image || s.seoDefaults.ogImage,
    address: { "@type": "PostalAddress", streetAddress: s.contacts.address, addressLocality: s.contacts.city },
    areaServed: s.serviceAreas.map((a) => a.name),
    openingHoursSpecification: s.hours
      .filter((h) => !h.closed)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAY_NAMES[h.day], opens: h.open, closes: h.close })),
    aggregateRating:
      s.google.rating && s.google.ratingCount
        ? { "@type": "AggregateRating", ratingValue: s.google.rating, reviewCount: s.google.ratingCount }
        : undefined,
    sameAs: Object.values(s.socials).length ? Object.values(s.socials) : undefined,
  };
}
