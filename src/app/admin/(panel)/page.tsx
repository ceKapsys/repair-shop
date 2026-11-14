import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, Inbox, MailWarning, Siren, TrendingUp } from "lucide-react";
import { ContactButtons } from "@/components/admin/contact-buttons";
import { PageHeader } from "@/components/admin/editor-shell";
import { buttonVariants } from "@/components/ui/button";
import { emergencyStatus } from "@/lib/availability";
import { connectDb } from "@/lib/db";
import { copy } from "@/content/copy";
import { pagesMissingSeo } from "@/lib/seo-health";
import { plain } from "@/lib/serialize";
import { loadSettings } from "@/lib/settings";
import { addDays, formatLocalDate, formatWindow, localNow } from "@/lib/time";
import type { BookingT } from "@/lib/types";
import { Booking, Review } from "@/models";
import { EmergencyBadge, StatusBadge } from "./bookings/status-badge";

export const metadata: Metadata = { title: "Dashboard" };

const OPEN = ["new", "confirmed", "on-the-way", "in-progress"];

function Stat({ icon: Icon, label, value, href, tone }: { icon: typeof Inbox; label: string; value: number; href: string; tone?: string }) {
  return (
    <Link href={href} className="rounded-card border border-line bg-bg p-4 hover:border-primary/40">
      <Icon size={18} strokeWidth={1.5} className={tone ?? "text-ink-soft"} aria-hidden />
      <p className="mt-3 text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-sm text-ink-soft">{label}</p>
    </Link>
  );
}

function BookingRow({ b, shopName }: { b: BookingT; shopName: string }) {
  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
      <Link href={`/admin/bookings/${b._id}`} className="min-w-0 flex-1 hover:text-primary">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{b.customer.name}</span>
          {b.type === "emergency" && <EmergencyBadge />}
          <StatusBadge status={b.status} />
        </span>
        <span className="block truncate text-sm text-ink-soft">
          {b.preferredSlot?.window ? `${formatWindow(b.preferredSlot.window)} · ` : ""}
          {b.deviceLabel || b.customDevice} · {b.address.area}
        </span>
      </Link>
      <ContactButtons phone={b.customer.phone} whatsapp={b.customer.whatsapp} name={b.customer.name} bookingNo={b.bookingNo} shopName={shopName} />
    </li>
  );
}

export default async function Dashboard() {
  await connectDb();
  const s = await loadSettings();
  const today = localNow(s.timezone).date;
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [emergencies, todays, upcoming, counts, week, newReviews, missingSeo, emailFailures, perDay] = await Promise.all([
    Booking.find({ type: "emergency", status: { $in: OPEN } }).sort({ createdAt: 1 }).limit(20).lean(),
    Booking.find({ type: "standard", status: { $in: OPEN }, "preferredSlot.date": today }).sort({ "preferredSlot.window": 1 }).lean(),
    Booking.find({ type: "standard", status: { $in: OPEN }, "preferredSlot.date": { $gt: today, $lte: addDays(today, 7) } })
      .sort({ "preferredSlot.date": 1, "preferredSlot.window": 1 })
      .limit(30)
      .lean(),
    Booking.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    Booking.countDocuments({ createdAt: { $gte: weekAgo } }),
    Review.countDocuments({ createdAt: { $gte: weekAgo } }),
    pagesMissingSeo(),
    Booking.find({ createdAt: { $gte: weekAgo }, $or: [{ "emailStatus.admin": "failed" }, { "emailStatus.customer": "failed" }] }).select("bookingNo emailStatus").sort({ createdAt: -1 }).limit(10).lean<{ _id: unknown; bookingNo: string; emailStatus?: { error?: string } }[]>(),
    Booking.aggregate<{ _id: string; n: number }>([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: s.timezone } }, n: { $sum: 1 } } },
    ]),
  ]);
  const dayCount = new Map(perDay.map((d) => [d._id, d.n]));
  const chart = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6)).map((date) => ({ date, n: dayCount.get(date) ?? 0 }));
  const chartMax = Math.max(1, ...chart.map((d) => d.n));
  const c = Object.fromEntries(counts.map((x) => [x._id, x.n])) as Record<string, number>;
  const em = emergencyStatus(s);
  const byDay = new Map<string, BookingT[]>();
  for (const b of plain<BookingT[]>(upcoming)) {
    const d = b.preferredSlot?.date ?? "";
    byDay.set(d, [...(byDay.get(d) ?? []), b]);
  }

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={
          <span className="inline-flex items-center gap-2">
            {formatLocalDate(today)} ·
            <span className={em.open ? "text-success" : "text-ink-soft"}>Emergency line {em.open ? "open" : "closed"}</span>
          </span>
        }
        actions={<Link href="/admin/bookings" className={buttonVariants({ variant: "outline" })}>All bookings</Link>}
      />
      <div className="space-y-6 px-4 py-6 md:px-8">
        {emailFailures.length > 0 && (
          <section role="alert" className="rounded-card border border-emergency bg-bg p-4">
            <h2 className="flex items-center gap-2 text-base leading-6 font-semibold text-emergency"><MailWarning size={18} aria-hidden /> Warning: {emailFailures.length} booking email{emailFailures.length === 1 ? "" : "s"} failed to send this week</h2>
            <p className="mt-1 text-sm text-ink-soft">The bookings are saved. Check them here, and check the alert addresses and email settings.</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {emailFailures.map((b) => (
                <li key={String(b._id)}><Link href={`/admin/bookings/${b._id}`} className="num text-primary underline-offset-4 hover:underline" title={b.emailStatus?.error}>{b.bookingNo}</Link></li>
              ))}
            </ul>
          </section>
        )}
        {emergencies.length > 0 && (
          <section className="overflow-hidden rounded-card border border-emergency/40 bg-bg">
            <h2 className="flex items-center gap-2 border-b border-emergency/20 bg-emergency/5 px-4 py-3 text-base leading-6 font-semibold text-emergency">
              <Siren size={18} aria-hidden /> Emergency queue
            </h2>
            <ul className="divide-y divide-line">{plain<BookingT[]>(emergencies).map((b) => <BookingRow key={b._id} b={b} shopName={s.shopName} />)}</ul>
          </section>
        )}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={Inbox} label="New, to confirm" value={c.new ?? 0} href="/admin/bookings?status=new" tone="text-warning" />
          <Stat icon={Siren} label="Open emergencies" value={emergencies.length} href="/admin/bookings?type=emergency" tone="text-emergency" />
          <Stat icon={CalendarDays} label="Visits today" value={todays.length} href={`/admin/bookings?from=${today}&to=${today}`} tone="text-primary" />
          <Stat icon={TrendingUp} label="Bookings, last 7 days" value={week} href="/admin/bookings?status=all" />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="overflow-hidden rounded-card border border-line bg-bg">
            <h2 className="border-b border-line px-4 py-3 text-base leading-6 font-semibold">Today</h2>
            {todays.length ? (
              <ul className="divide-y divide-line">{plain<BookingT[]>(todays).map((b) => <BookingRow key={b._id} b={b} shopName={s.shopName} />)}</ul>
            ) : (
              <p className="px-4 py-6 text-sm text-ink-soft">{copy.admin.noBookingsToday}</p>
            )}
          </section>
          <section className="overflow-hidden rounded-card border border-line bg-bg">
            <h2 className="border-b border-line px-4 py-3 text-base leading-6 font-semibold">Next 7 days</h2>
            {byDay.size ? (
              [...byDay].map(([d, list]) => (
                <div key={d}>
                  <p className="bg-surface px-4 py-1.5 text-xs font-medium text-ink-soft">{formatLocalDate(d)} · {list.length}</p>
                  <ul className="divide-y divide-line">{list.map((b) => <BookingRow key={b._id} b={b} shopName={s.shopName} />)}</ul>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-ink-soft">Nothing booked yet.</p>
            )}
          </section>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-card border border-line bg-bg p-4">
            <h2 className="text-base leading-6 font-semibold">All time</h2>
            <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
              {[["Confirmed", c.confirmed], ["On the way", c["on-the-way"]], ["In progress", c["in-progress"]], ["Done", c.done], ["Cancelled", c.cancelled]].map(([l, n]) => (
                <div key={l as string}><dt className="text-ink-soft">{l}</dt><dd className="text-lg font-semibold tabular-nums">{(n as number) ?? 0}</dd></div>
              ))}
              <div><dt className="text-ink-soft">New reviews (7d)</dt><dd className="text-lg font-semibold tabular-nums">{newReviews}</dd></div>
            </dl>
          </section>
          <section className="rounded-card border border-line bg-bg p-4">
            <h2 className="text-base leading-6 font-semibold">Bookings, last 7 days</h2>
            <ol className="mt-4 flex h-32 items-end gap-2" aria-label="Bookings per day">
              {chart.map((d) => (
                <li key={d.date} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs tabular-nums text-ink-soft">{d.n}</span>
                  <span className="w-full rounded-t bg-primary" style={{ height: `${Math.max(d.n ? 6 : 2, (d.n / chartMax) * 100)}%`, opacity: d.n ? 1 : 0.25 }} aria-hidden />
                  <span className="text-xs text-ink-soft">{formatLocalDate(d.date).split(",")[0]}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="rounded-card border border-line bg-bg p-4 xl:col-span-2">
            <h2 className="text-base leading-6 font-semibold">Pages missing SEO</h2>
            <p className="mt-2 text-sm text-ink-soft">
              {missingSeo === 0 ? "Every page has a meta title and description." : `${missingSeo} page${missingSeo === 1 ? " has" : "s have"} no meta title or description.`}{" "}
              <Link href="/admin/seo" className="text-primary underline-offset-4 hover:underline">Open SEO health</Link>
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
