import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import { ContactButtons } from "@/components/admin/contact-buttons";
import { Section } from "@/components/admin/editor-shell";
import { findBooking } from "@/lib/booking-admin";
import { connectDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { loadSettings } from "@/lib/settings";
import { BookingUpdateForm } from "./update-form";
import { EmergencyBadge, StatusBadge, STATUS_TEXT, whenLabel } from "../status-badge";
import type { BookingStatus } from "@/lib/types";

export const metadata: Metadata = { title: "Booking" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="grid gap-1 py-2.5 sm:grid-cols-[140px_1fr]">
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="text-[15px] break-words">{children}</dd>
    </div>
  );
}

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDb();
  const [b, s] = await Promise.all([findBooking(id), loadSettings()]);
  if (!b) notFound();
  const addr = [b.address.line, b.address.area, b.address.city].filter(Boolean).join(", ");
  const map = b.address.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-bg ">
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-8">
          <Link href="/admin/bookings" aria-label="Back to bookings" className="flex size-11 items-center justify-center rounded-lg text-ink-soft hover:bg-surface">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">
            {b.customer.name} <span className="font-normal text-ink-soft tabular-nums">· {b.bookingNo}</span>
          </h1>
          {b.type === "emergency" && <EmergencyBadge />}
          <StatusBadge status={b.status} />
          <ContactButtons phone={b.customer.phone} whatsapp={b.customer.whatsapp} name={b.customer.name} bookingNo={b.bookingNo} shopName={s.shopName} />
        </div>
      </header>
      <div className="grid gap-6 px-4 py-6 md:px-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Section title="Visit">
            <dl className="-my-2.5 divide-y divide-line">
              <Row label="When">{whenLabel(b)}</Row>
              <Row label="Address">
                <a href={map} target="_blank" rel="noopener" className="inline-flex items-start gap-1.5 text-primary underline-offset-4 hover:underline">
                  <MapPin size={16} className="mt-1 shrink-0" aria-hidden /> {addr || "Not given"}
                </a>
              </Row>
              <Row label="Device">{b.deviceLabel || b.customDevice}</Row>
              <Row label="Repairs">{b.serviceLabels?.join(", ") || "Not sure — needs diagnosis"}</Row>
              <Row label="Estimate">{b.estimate}</Row>
              <Row label="Customer notes">{b.issueNote && <span className="whitespace-pre-line">{b.issueNote}</span>}</Row>
            </dl>
          </Section>
          <Section title="Customer">
            <dl className="-my-2.5 divide-y divide-line">
              <Row label="Name">{b.customer.name}</Row>
              <Row label="Phone">{b.customer.phone}{b.customer.whatsapp ? " · WhatsApp" : ""}</Row>
              <Row label="Email">{b.customer.email && <a href={`mailto:${b.customer.email}`} className="text-primary">{b.customer.email}</a>}</Row>
              <Row label="Booked">{formatDate(b.createdAt, { dateStyle: "medium", timeStyle: "short" })}</Row>
              <Row label="From page">{b.source}</Row>
            </dl>
          </Section>
          {b.photos.length > 0 && (
            <Section title="Photos">
              <div className="flex flex-wrap gap-3">
                {b.photos.map((p) => (
                  <a key={p} href={p} target="_blank" rel="noopener" className="group relative block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p} alt="Customer photo" className="size-32 rounded-lg border border-line object-cover" />
                    <ExternalLink size={14} className="absolute top-2 right-2 text-on-primary opacity-0 drop-shadow group-hover:opacity-100" aria-hidden />
                  </a>
                ))}
              </div>
            </Section>
          )}
        </div>
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Section title="Update">
            <BookingUpdateForm id={b._id} status={b.status} quotedPrice={b.quotedPrice} currency={s.currency} canEmail={Boolean(b.customer.email) && s.notifications.statusUpdates} />
          </Section>
          <Section title="History">
            <ol className="space-y-3 text-sm">
              {[
                ...b.statusHistory.map((h) => ({ at: h.at, by: h.by, text: `Status → ${STATUS_TEXT[h.status as BookingStatus] ?? h.status}`, note: false })),
                ...b.adminNotes.map((n) => ({ at: n.at, by: n.by, text: n.text, note: true })),
              ]
                .sort((x, y) => +new Date(y.at) - +new Date(x.at))
                .map((e, i) => (
                  <li key={i} className="border-l-2 border-line pl-3">
                    <p className={e.note ? "whitespace-pre-line" : "font-medium"}>{e.text}</p>
                    <p className="text-xs text-ink-soft">{formatDate(e.at, { dateStyle: "medium", timeStyle: "short" })}{e.by ? ` · ${e.by}` : ""}</p>
                  </li>
                ))}
            </ol>
          </Section>
        </aside>
      </div>
    </>
  );
}
