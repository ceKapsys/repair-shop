import "server-only";
import { isValidObjectId } from "mongoose";
import type { BookingStatus, BookingT } from "./types";
import { plain } from "./serialize";
import { Booking } from "@/models";

export const STATUS_LABELS: Record<BookingStatus, string> = {
  new: "New",
  confirmed: "Confirmed",
  "on-the-way": "On the way",
  "in-progress": "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

export type BookingFilters = { status?: string; type?: string; from?: string; to?: string; q?: string; area?: string };

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Mongo query from list filters. Dates filter on the visit date for standard bookings and created date otherwise. */
export function bookingQuery(f: BookingFilters) {
  const q: Record<string, unknown> = {};
  if (f.status === "open") q.status = { $in: ["new", "confirmed", "on-the-way", "in-progress"] };
  else if (f.status && f.status in STATUS_LABELS) q.status = f.status;
  if (f.type === "standard" || f.type === "emergency") q.type = f.type;
  if (f.area) q["address.area"] = String(f.area);
  const and: Record<string, unknown>[] = [];
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  if ((f.from && iso.test(f.from)) || (f.to && iso.test(f.to))) {
    const slot: Record<string, string> = {};
    const created: Record<string, Date> = {};
    if (f.from && iso.test(f.from)) { slot.$gte = f.from; created.$gte = new Date(`${f.from}T00:00:00Z`); }
    if (f.to && iso.test(f.to)) { slot.$lte = f.to; created.$lte = new Date(`${f.to}T23:59:59Z`); }
    and.push({ $or: [{ "preferredSlot.date": slot }, { type: "emergency", createdAt: created }] });
  }
  const text = f.q?.trim().slice(0, 80);
  if (text) {
    const re = new RegExp(escapeRe(text), "i");
    const digits = text.replace(/\D/g, "");
    and.push({
      $or: [
        { bookingNo: re },
        { "customer.name": re },
        { "customer.email": re },
        { deviceLabel: re },
        { "address.line": re },
        ...(digits.length >= 4 ? [{ "customer.phone": new RegExp(digits.split("").join("\\D*")) }] : []),
      ],
    });
  }
  if (and.length) q.$and = and;
  return q;
}

export async function findBookings(f: BookingFilters, limit = 200): Promise<BookingT[]> {
  const rows = await Booking.find(bookingQuery(f)).sort({ createdAt: -1 }).limit(limit).lean();
  return plain<BookingT[]>(rows);
}

export async function findBooking(id: string): Promise<BookingT | null> {
  if (!isValidObjectId(id)) return null;
  return plain<BookingT | null>(await Booking.findById(id).lean());
}
