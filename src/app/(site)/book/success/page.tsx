import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ContactMessage } from "@/components/site/contact-message";
import { SuccessBody } from "@/components/site/success-body";
import { TrackedLink } from "@/components/site/tracked-link";
import { copy, fill } from "@/content/copy";
import { waLink } from "@/lib/links";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: copy.booking.success.title, robots: { index: false, follow: false } };

type Props = { searchParams: Promise<{ no?: string; type?: string; m?: string }> };

export default async function SuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  const s = await getSettings();
  const bookingNo = typeof sp.no === "string" && /^RS-\d{4}-\d{4,}$/.test(sp.no) ? sp.no : "";
  const emergency = sp.type === "emergency";
  const minutes = typeof sp.m === "string" && /^\d{1,3}$/.test(sp.m) ? sp.m : undefined;
  const whatsappText = fill(copy.whatsapp.booking, { shop: s.shopName, bookingNo });
  const c = copy.booking.success;
  return (
    <section className="container-page py-16 text-center md:py-24">
      <ContactMessage text={whatsappText} />
      <svg viewBox="0 0 56 56" className="mx-auto size-14 text-success" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="28" cy="28" r="25" />
        <path className="draw-check" pathLength={1} d="M17 29l8 8 15-17" />
      </svg>
      <h1 className="mt-6">{emergency ? copy.emergency.successTitle : c.title}</h1>
      <p className="mx-auto mt-4 max-w-[52ch] text-ink-soft">
        {emergency && minutes ? fill(copy.emergency.success, { bookingNo, responseMinutes: minutes }) : <SuccessBody bookingNo={bookingNo} />}
      </p>
      {bookingNo && <p className="num mx-auto mt-6 inline-flex rounded-full bg-mist px-4 py-2 text-ink">{bookingNo}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <TrackedLink event="whatsapp_click" href={waLink(s.contacts.whatsapp, whatsappText)} target="_blank" rel="noopener" className={buttonVariants({ size: "lg" })}>
          {c.whatsapp}
        </TrackedLink>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>{c.home}</Link>
      </div>
    </section>
  );
}
