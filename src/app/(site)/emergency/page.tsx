import type { Metadata } from "next";
import { buttonVariants } from "@/components/ui/button";
import { BookingForm } from "@/components/site/booking-form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
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
  return pageMetadata("emergency", { title: copy.emergency.h1, path: "/emergency", description: fill(copy.meta.emergencyDesc, { city: s.contacts.city }) });
}

type Props = { searchParams: Promise<{ device?: string; service?: string }> };

export default async function EmergencyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = await getSettings();
  const status = emergencyStatus(s);
  const [catalog, slotDays] = await Promise.all([bookingCatalog(), status.open ? Promise.resolve([]) : getSlotDays(s)]);
  const phone = s.contacts.phones[0];
  const shared = {
    catalog,
    areas: s.serviceAreas,
    currency: s.currency,
    phone,
    initialDeviceId: typeof sp.device === "string" ? sp.device : undefined,
    initialServiceSlug: typeof sp.service === "string" ? sp.service : undefined,
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined,
    uploadsEnabled: cloudinaryConfigured(),
  };

  return (
    <section className="container-page pt-8 pb-16 md:pt-12 md:pb-24">
      <Breadcrumbs items={[{ label: copy.nav.emergency, href: "/emergency" }]} />
      <div className="mt-6 mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="max-w-[18ch]">{copy.emergency.h1}</h1>
          <p className="mt-4 flex max-w-[60ch] items-start gap-3">
            <span className={`mt-2.5 size-2 shrink-0 rounded-full ${status.open ? "bg-emergency" : "bg-steel"}`} aria-hidden />
            <span>{emergencyLine(status, s)}</span>
          </p>
        </div>
        {/* "Call now" stays visible throughout: it is repeated in the header on every step. */}
        <TrackedLink event="call_click" href={telLink(phone)} className={buttonVariants({ variant: status.open ? "emergency" : "outline", size: "lg" })}>
          {fill(copy.emergency.call, { phone })}
        </TrackedLink>
      </div>
      {status.open ? (
        <BookingForm mode="emergency" {...shared} emergencyFee={status.fee} responseMinutes={status.responseMinutes} />
      ) : (
        <BookingForm mode="standard" {...shared} slotDays={slotDays} />
      )}
    </section>
  );
}
