import "server-only";
import { connectDb, isDbConfigured } from "./db";
import type { SiteSettings } from "./settings";
import { addDays, localNow, localStamp, toMinutes, weekday } from "./time";
import { Booking } from "@/models/Booking";

export type SlotDay = { date: string; windows: { window: string; available: boolean }[] };

/** Bookable windows for the next N days, with full or past-lead-time slots marked unavailable. */
export async function getSlotDays(s: SiteSettings, now = new Date()): Promise<SlotDay[]> {
  const { windows, leadTimeHours, maxPerSlot, daysAhead, closedDays } = s.bookingSlots;
  const today = localNow(s.timezone, now);
  const last = addDays(today.date, daysAhead);

  const counts = new Map<string, number>();
  if (isDbConfigured()) {
    try {
      await connectDb();
      const rows = await Booking.aggregate<{ _id: { d: string; w: string }; n: number }>([
        { $match: { type: "standard", status: { $ne: "cancelled" }, "preferredSlot.date": { $gte: today.date, $lte: last } } },
        { $group: { _id: { d: "$preferredSlot.date", w: "$preferredSlot.window" }, n: { $sum: 1 } } },
      ]);
      for (const r of rows) counts.set(`${r._id.d}|${r._id.w}`, r.n);
    } catch (err) {
      console.error("[availability]", err);
    }
  }

  const days: SlotDay[] = [];
  for (let i = 0; i <= daysAhead; i++) {
    const date = addDays(today.date, i);
    if (closedDays.includes(weekday(date))) continue;
    const ws = windows.map((window) => {
      const start = toMinutes(window.split("-")[0]);
      const leadOk = localStamp(date, start) - today.stamp >= leadTimeHours * 60;
      const full = (counts.get(`${date}|${window}`) ?? 0) >= maxPerSlot;
      return { window, available: leadOk && !full };
    });
    if (ws.some((w) => w.available)) days.push({ date, windows: ws });
  }
  return days;
}

export async function isSlotAvailable(s: SiteSettings, date: string, window: string) {
  const days = await getSlotDays(s);
  return days.some((d) => d.date === date && d.windows.some((w) => w.window === window && w.available));
}

export type EmergencyStatus =
  | { open: true; responseMinutes: number; fee: number; closesAt: string }
  | { open: false; reason: "disabled" | "closed"; opensAt?: { date: string; time: string } };

/** Whether the emergency path is open right now, per the weekday schedule set in admin. */
export function emergencyStatus(s: SiteSettings, now = new Date()): EmergencyStatus {
  if (!s.emergency.enabled) return { open: false, reason: "disabled" };
  const t = localNow(s.timezone, now);
  const today = s.emergency.schedule.find((d) => d.day === t.day);
  if (today?.enabled && t.minutes >= toMinutes(today.open) && t.minutes < toMinutes(today.close)) {
    return { open: true, responseMinutes: today.responseMinutes, fee: s.emergency.fee, closesAt: today.close };
  }
  for (let i = 0; i < 8; i++) {
    const date = addDays(t.date, i);
    const d = s.emergency.schedule.find((x) => x.day === weekday(date));
    if (!d?.enabled) continue;
    if (i === 0 && t.minutes >= toMinutes(d.open)) continue;
    return { open: false, reason: "closed", opensAt: { date, time: d.open } };
  }
  return { open: false, reason: "closed" };
}
