/** Time-zone helpers. Slots and emergency hours are evaluated in the shop's time zone. */

export type LocalNow = { date: string; day: number; minutes: number; stamp: number };

function parts(d: Date, timeZone: string) {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short",
  });
  const p = Object.fromEntries(f.formatToParts(d).map((x) => [x.type, x.value]));
  return p as Record<string, string>;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function safeZone(tz: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

/** Current wall-clock time in a zone. `stamp` is a naive minute counter comparable with localStamp(). */
export function localNow(timeZone: string, now = new Date()): LocalNow {
  const p = parts(now, safeZone(timeZone));
  const date = `${p.year}-${p.month}-${p.day}`;
  const minutes = Number(p.hour) * 60 + Number(p.minute);
  return { date, day: WEEKDAYS.indexOf(p.weekday), minutes, stamp: localStamp(date, minutes) };
}

export function localStamp(date: string, minutes: number) {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 60000 + minutes;
}

export function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function addDays(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}

export function weekday(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function formatWindow(w: string) {
  const [a, b] = w.split("-");
  const fmt = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const ampm = h >= 12 ? "pm" : "am";
    const h12 = h % 12 || 12;
    return m ? `${h12}:${String(m).padStart(2, "0")}${ampm}` : `${h12}${ampm}`;
  };
  return b ? `${fmt(a)}–${fmt(b)}` : fmt(a);
}

export function formatLocalDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function formatTime12(hhmm: string): string {
  if (!hhmm) return "";
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export type EmergencyTodayInfo = {
  isCurrentlyOpen: boolean;
  isOpenToday: boolean;
  todayHours: string;
  statusText: string;
  responseMinutes: number;
  feeFormatted: string;
  dayName: string;
  tzAbbr: string;
};

export function getEmergencyTodayInfo(
  emergency: {
    enabled: boolean;
    fee: number;
    responseMinutes?: number;
    hoursText?: string;
    statusText?: string;
    schedule: { day: number; enabled: boolean; open: string; close: string; responseMinutes: number }[];
  },
  timezone: string,
  currency = "USD",
  now = new Date(),
): EmergencyTodayInfo {
  const tz = safeZone(timezone || "America/New_York");
  const local = localNow(tz, now);

  const tzAbbr =
    new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "short",
    })
      .formatToParts(now)
      .find((p) => p.type === "timeZoneName")?.value || "EST";

  const todaySchedule = emergency?.schedule?.find((item) => item.day === local.day);
  const isEmergencyEnabled = Boolean(emergency?.enabled);
  const isTodayEnabled = Boolean(todaySchedule?.enabled);

  let isCurrentlyOpen = false;
  let dynamicTodayHours = "Closed today";
  let dynamicStatusText = "Emergency service closed today";

  if (isEmergencyEnabled && isTodayEnabled && todaySchedule) {
    const openTime12 = formatTime12(todaySchedule.open);
    const closeTime12 = formatTime12(todaySchedule.close);
    dynamicTodayHours = `${openTime12} – ${closeTime12} ${tzAbbr}`;

    const openMin = toMinutes(todaySchedule.open);
    const closeMin = toMinutes(todaySchedule.close);

    if (local.minutes >= openMin && local.minutes < closeMin) {
      isCurrentlyOpen = true;
      dynamicStatusText = `Emergency service open today until ${closeTime12} ${tzAbbr}`;
    } else if (local.minutes < openMin) {
      dynamicStatusText = `Emergency service opens today at ${openTime12} ${tzAbbr}`;
    } else {
      const tomorrowDay = (local.day + 1) % 7;
      const tomorrowSchedule = emergency?.schedule?.find((item) => item.day === tomorrowDay);
      if (tomorrowSchedule?.enabled) {
        dynamicStatusText = `Emergency service closed today · Opens tomorrow at ${formatTime12(tomorrowSchedule.open)} ${tzAbbr}`;
      } else {
        dynamicStatusText = "Emergency service closed today";
      }
    }
  }

  // Detect if an existing hoursText in settings is actually a multi-day schedule string (e.g. "Tue: ... · Wed-Mon: ...")
  const isMultiDayScheduleString =
    Boolean(emergency?.hoursText) &&
    (/[·|,]/.test(emergency?.hoursText || "") ||
      /(Mon|Tue|Wed|Thu|Fri|Sat|Sun):/i.test(emergency?.hoursText || ""));

  // If hoursText is provided and is NOT a multi-day schedule dump, use it as override; otherwise use dynamic today's hours
  const todayHours =
    emergency?.hoursText && !isMultiDayScheduleString
      ? emergency.hoursText
      : dynamicTodayHours;

  const statusText =
    emergency?.statusText && !emergency.statusText.includes("·")
      ? emergency.statusText
      : dynamicStatusText;

  const responseMinutes = todaySchedule?.responseMinutes || emergency?.responseMinutes || 30;

  const feeFormatted =
    typeof emergency?.fee === "number"
      ? emergency.fee === 0
        ? "Free"
        : `${currency === "USD" || !currency ? "$" : `${currency} `}${emergency.fee}`
      : "$35";

  const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return {
    isCurrentlyOpen,
    isOpenToday: isEmergencyEnabled && isTodayEnabled,
    todayHours,
    statusText,
    responseMinutes,
    feeFormatted,
    dayName: DAY_NAMES[local.day] || "Today",
    tzAbbr,
  };
}
