import { copy, fill } from "@/content/copy";
import type { EmergencyStatus } from "./availability";
import { DAY_NAMES, formatMoney } from "./format";
import type { SiteSettings } from "./settings";
import { addDays, formatWindow, localNow, weekday } from "./time";

/** The locked open / closed sentence for the emergency service, filled from today's schedule. */
export function emergencyLine(status: EmergencyStatus, s: SiteSettings, now = new Date()): string {
  if (status.open) {
    return status.fee > 0
      ? fill(copy.emergency.open, { responseMinutes: status.responseMinutes, fee: formatMoney(status.fee, s.currency) })
      : fill(copy.emergency.openNoFee, { responseMinutes: status.responseMinutes });
  }
  if (!status.opensAt) return copy.emergency.closedNoOpening;
  const today = localNow(s.timezone, now).date;
  const nextOpenDay =
    status.opensAt.date === today ? copy.emergency.today : status.opensAt.date === addDays(today, 1) ? copy.emergency.tomorrow : `on ${DAY_NAMES[weekday(status.opensAt.date)]}`;
  return fill(copy.emergency.closed, { nextOpenDay, openTime: formatWindow(status.opensAt.time) });
}
