import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { ContactMessage } from "@/components/site/contact-message";
import { SuccessBody } from "@/components/site/success-body";
import { TrackedLink } from "@/components/site/tracked-link";
import { copy, fill } from "@/content/copy";
import { waLink } from "@/lib/links";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: copy.booking.success.title,
  robots: { index: false, follow: false },
};

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
    <section className="bg-bg py-16 md:py-24">
      <div className="container-page">
        <ContactMessage text={whatsappText} />
        <div className="mx-auto max-w-xl rounded-3xl border border-line bg-surface p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success/10 text-success">
            <svg
              viewBox="0 0 56 56"
              className="size-10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="28" cy="28" r="25" />
              <path className="draw-check" pathLength={1} d="M17 29l8 8 15-17" />
            </svg>
          </div>

          <h1 className="mt-6 font-heading text-3xl font-bold tracking-tight text-ink">
            {emergency ? copy.emergency.successTitle : c.title}
          </h1>
          <p className="mx-auto mt-3 max-w-[48ch] text-base leading-relaxed text-ink-soft">
            {emergency && minutes ? (
              fill(copy.emergency.success, { bookingNo, responseMinutes: minutes })
            ) : (
              <SuccessBody bookingNo={bookingNo} />
            )}
          </p>

          {bookingNo && (
            <div className="mt-6">
              <span className="num inline-flex items-center rounded-full border border-line bg-bg px-4 py-2 text-sm font-bold text-ink">
                {bookingNo}
              </span>
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <TrackedLink
              event="whatsapp_click"
              href={waLink(s.contacts.whatsapp, whatsappText)}
              target="_blank"
              rel="noopener"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-strong"
            >
              <MessageCircle size={16} />
              <span>{c.whatsapp}</span>
            </TrackedLink>
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-bg px-5 text-sm font-semibold text-ink transition-colors hover:border-line-strong"
            >
              <span>{c.home}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
