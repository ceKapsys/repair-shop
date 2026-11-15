import type { Metadata } from "next";
import Link from "next/link";
import { Zap } from "lucide-react";
import { BookingForm } from "@/components/site/booking-form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { PageHero } from "@/components/site/page-hero";
import { copy, fill } from "@/content/copy";
import { getSlotDays } from "@/lib/availability";
import { bookingCatalog } from "@/lib/booking";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic"; // slot availability changes with every booking

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("book", {
    title: copy.booking.title,
    path: "/book",
    description: fill(copy.meta.bookDesc, { city: s.contacts.city }),
  });
}

type Props = { searchParams: Promise<{ device?: string; service?: string }> };

export default async function BookPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = await getSettings();
  const [catalog, slotDays] = await Promise.all([bookingCatalog(), getSlotDays(s)]);

  return (
    <>
      <PageHero
        eyebrow="60-Second Online Booking"
        title={copy.booking.title}
        intro={`Pick your device, issue, and a convenient 1-hour doorstep window in ${s.contacts.city}.`}
        crumbs={<Breadcrumbs items={[{ label: copy.booking.title, href: "/book" }]} />}
        actions={
          s.emergency.enabled ? (
            <Link
              href="/emergency"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emergency px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-emergency-strong"
            >
              <Zap size={16} />
              <span>{copy.emergency.h1}</span>
            </Link>
          ) : undefined
        }
      />

      <section className="bg-bg py-10 md:py-14">
        <div className="container-page">
          <BookingForm
            mode="standard"
            catalog={catalog}
            slotDays={slotDays}
            areas={s.serviceAreas}
            currency={s.currency}
            phone={s.contacts.phones[0]}
            initialDeviceId={typeof sp.device === "string" ? sp.device : undefined}
            initialServiceSlug={typeof sp.service === "string" ? sp.service : undefined}
            turnstileSiteKey={
              process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined
            }
            uploadsEnabled={cloudinaryConfigured()}
          />
        </div>
      </section>
    </>
  );
}
