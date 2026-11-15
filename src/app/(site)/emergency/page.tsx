import type { Metadata } from "next";
import { Phone, Zap } from "lucide-react";
import { BookingForm } from "@/components/site/booking-form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PageHero } from "@/components/site/page-hero";
import { TrackedLink } from "@/components/site/tracked-link";
import { copy, fill } from "@/content/copy";
import { emergencyStatus, getSlotDays } from "@/lib/availability";
import { bookingCatalog } from "@/lib/booking";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { emergencyLine } from "@/lib/emergency-copy";
import { telLink } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic"; // open/closed depends on the current time

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("emergency", {
    title: copy.emergency.h1,
    path: "/emergency",
    description: fill(copy.meta.emergencyDesc, { city: s.contacts.city }),
  });
}

type Props = { searchParams: Promise<{ device?: string; service?: string }> };

export default async function EmergencyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = await getSettings();
  const status = emergencyStatus(s);
  const [catalog, slotDays] = await Promise.all([
    bookingCatalog(),
    status.open ? Promise.resolve([]) : getSlotDays(s),
  ]);
  const phone = s.contacts.phones[0];
  const shared = {
    catalog,
    areas: s.serviceAreas,
    currency: s.currency,
    phone,
    initialDeviceId: typeof sp.device === "string" ? sp.device : undefined,
    initialServiceSlug: typeof sp.service === "string" ? sp.service : undefined,
    turnstileSiteKey:
      process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined,
    uploadsEnabled: cloudinaryConfigured(),
  };

  return (
    <>
      <PageHero
        variant={status.open ? "emergency" : "default"}
        eyebrow={status.open ? "24/7 Priority Dispatch · Open Now" : "Emergency After-Hours"}
        title={copy.emergency.h1}
        intro={emergencyLine(status, s)}
        crumbs={<Breadcrumbs items={[{ label: copy.nav.emergency, href: "/emergency" }]} />}
        actions={
          <TrackedLink
            event="call_click"
            href={telLink(phone)}
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-sm transition-colors ${
              status.open
                ? "bg-emergency text-on-primary hover:bg-emergency-strong"
                : "border border-line bg-bg text-ink hover:border-line-strong"
            }`}
          >
            {status.open ? <Zap size={16} /> : <Phone size={16} />}
            <span>{fill(copy.emergency.call, { phone })}</span>
          </TrackedLink>
        }
      />

      <section className="bg-bg py-10 md:py-14">
        <div className="container-page">
          {status.open ? (
            <BookingForm
              mode="emergency"
              {...shared}
              emergencyFee={status.fee}
              responseMinutes={status.responseMinutes}
            />
          ) : (
            <BookingForm mode="standard" {...shared} slotDays={slotDays} />
          )}
        </div>
      </section>
    </>
  );
}
