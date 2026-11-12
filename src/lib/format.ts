import type { PriceType } from "./types";

export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/** Human price label honouring the admin's "show price" toggle. */
export function priceLabel(
  p: { priceType: PriceType; priceMin?: number | null; priceMax?: number | null; showPrice: boolean },
  currency: string,
): string | null {
  if (!p.showPrice || p.priceType === "quote") return null;
  const min = p.priceMin ?? undefined;
  const max = p.priceMax ?? undefined;
  if (min == null) return null;
  if (p.priceType === "fixed") return formatMoney(min, currency);
  if (p.priceType === "range" && max != null) return `${formatMoney(min, currency)}–${formatMoney(max, currency)}`;
  return `From ${formatMoney(min, currency)}`;
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DEVICE_TYPE_LABELS: Record<string, string> = {
  phone: "Phones",
  laptop: "Laptops & PCs",
  tablet: "Tablets",
  console: "Game consoles",
  smartwatch: "Smartwatches",
  audio: "Audio devices",
  other: "Other devices",
};

export function readingTime(html = "") {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(iso?: string | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en", opts).format(new Date(iso));
}
