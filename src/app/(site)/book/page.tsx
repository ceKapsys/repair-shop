import type { Metadata } from "next";
import Link from "next/link";
import { BookingForm } from "@/components/site/booking-form";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { copy, fill } from "@/content/copy";
import { getSlotDays } from "@/lib/availability";
import { bookingCatalog } from "@/lib/booking";
import { cloudinaryConfigured } from "@/lib/cloudinary";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic"; // slot availability changes with every booking

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("book", { title: copy.booking.title, path: "/book", description: fill(copy.meta.bookDesc, { city: s.contacts.city }) });
}

type Props = { searchParams: Promise<{ device?: string; service?: string }> };

export default async function BookPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = await getSettings();
  const [catalog, slotDays] = await Promise.all([bookingCatalog(), getSlotDays(s)]);
  return (
    <section className="container-page pt-8 pb-16 md:pt-12 md:pb-24">
      <Breadcrumbs items={[{ label: copy.booking.title, href: "/book" }]} />
      <div className="mt-6 mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <h1>{copy.booking.title}</h1>
        {s.emergency.enabled && (
          <Link href="/emergency" className="inline-flex min-h-11 items-center gap-2 font-medium text-emergency underline-offset-4 hover:underline">
            <span className="size-2 rounded-full bg-emergency" aria-hidden /> {copy.emergency.h1}
          </Link>
        )}
      </div>
      <BookingForm
        mode="standard"
        catalog={catalog}
        slotDays={slotDays}
        areas={s.serviceAreas}
        currency={s.currency}
        phone={s.contacts.phones[0]}
        initialDeviceId={typeof sp.device === "string" ? sp.device : undefined}
        initialServiceSlug={typeof sp.service === "string" ? sp.service : undefined}
        turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined}
        uploadsEnabled={cloudinaryConfigured()}
      />
    </section>
  );
}
