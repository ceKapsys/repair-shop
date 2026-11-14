import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/admin/editor-shell";
import { buttonVariants } from "@/components/ui/button";
import { findBookings, type BookingFilters } from "@/lib/booking-admin";
import { connectDb } from "@/lib/db";
import { loadSettings } from "@/lib/settings";
import { BookingFiltersBar } from "./filters";
import { BookingList } from "./booking-list";

export const metadata: Metadata = { title: "Bookings" };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function BookingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const filters: BookingFilters = { status: one("status") ?? "open", type: one("type"), from: one("from"), to: one("to"), q: one("q"), area: one("area") };
  await connectDb();
  const [bookings, s] = await Promise.all([findBookings(filters), loadSettings()]);
  const exportQs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v) as [string, string][]).toString();
  return (
    <>
      <PageHeader
        title="Bookings"
        description={`${bookings.length}${bookings.length === 200 ? "+" : ""} matching`}
        actions={
          <a href={`/admin/bookings/export?${exportQs}`} className={buttonVariants({ variant: "outline" })}>
            <Download size={18} aria-hidden /> CSV
          </a>
        }
      />
      <div className="px-4 py-6 md:px-8">
        <BookingFiltersBar filters={filters} areas={s.serviceAreas.map((a) => a.name)} />
        <BookingList bookings={bookings} currency={s.currency} shopName={s.shopName} />
        {bookings.length === 0 && (
          <p className="rounded-card border border-dashed border-line p-10 text-center text-ink-soft">
            No bookings match. <Link href="/admin/bookings?status=all" className="text-primary">Show all</Link>
          </p>
        )}
      </div>
    </>
  );
}
