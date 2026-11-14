import { copy, fill } from "@/content/copy";
import type { PriceType } from "./types";

export function formatMoney(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

type Priced = { priceType: PriceType; priceMin?: number | null; priceMax?: number | null; showPrice: boolean };
type RepairPrice = { price?: number | null; priceType?: PriceType | null; showPrice?: boolean | null };

/**
 * The three price types an owner can choose: fixed, "from", or hidden.
 * Older documents may still hold `quote` (now hidden) or `range` (now "from" the lower figure).
 */
export function normalisePriceType(t: PriceType | null | undefined): "fixed" | "from" | "hidden" {
  if (t === "fixed" || t === "from") return t;
  if (t === "range") return "from";
  return "hidden";
}

/** A service's own price, or null when it is hidden ("Price after a free check"). */
export function priceLabel(p: Priced, currency: string): string | null {
  const type = normalisePriceType(p.priceType);
  if (!p.showPrice || type === "hidden" || p.priceMin == null) return null;
  const money = formatMoney(p.priceMin, currency);
  return type === "fixed" ? money : fill(copy.service.priceFrom, { price: money });
}

/** Price text that is always safe to show: the price, or the locked hidden-price wording. */
export function priceText(label: string | null): string {
  return label ?? copy.service.priceHidden;
}

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DEVICE_TYPE_LABELS: Record<string, string> = copy.deviceTypes;

export function readingTime(html = "") {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(iso?: string | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en", opts).format(new Date(iso));
}

/** Price type of a per-model repair row. Rows saved before `priceType` existed are fixed, or hidden when switched off. */
export function repairPriceType(repair: RepairPrice): "fixed" | "from" | "hidden" {
  if (repair.priceType) return normalisePriceType(repair.priceType);
  return repair.showPrice === false ? "hidden" : "fixed";
}

/** Price for a repair on a specific device: the model's own price wins, else the service default. */
export function repairPriceLabel(service: Priced, repair: RepairPrice | undefined, currency: string): string | null {
  if (!repair) return priceLabel(service, currency);
  const type = repairPriceType(repair);
  if (type === "hidden") return null;
  if (repair.price == null) return priceLabel(service, currency);
  const money = formatMoney(repair.price, currency);
  return type === "fixed" ? money : fill(copy.service.priceFrom, { price: money });
}

/** Lowest numeric price for schema.org offers, or undefined when hidden. */
export function offerPrice(p: Priced) {
  return p.showPrice && normalisePriceType(p.priceType) !== "hidden" && p.priceMin != null ? p.priceMin : undefined;
}

/** Numeric price of a repair on a device for schema.org offers, or undefined when hidden. */
export function repairOfferPrice(service: Priced, repair: RepairPrice | undefined) {
  if (!repair) return offerPrice(service);
  if (repairPriceType(repair) === "hidden") return undefined;
  return repair.price ?? offerPrice(service);
}

/**
 * Estimate for a set of repairs on a device. Sums the visible prices; any "from" price makes the
 * total a "from" figure. Returns null when nothing can be priced yet ("after a free check").
 * When only some repairs are priced, the figure is still a "from" price.
 */
export function estimateLabel(items: { service: Priced; repair?: RepairPrice }[], currency: string): string | null {
  let total = 0, known = 0, from = false;
  for (const { service, repair } of items) {
    const amount = repairOfferPrice(service, repair);
    if (amount == null) { from = true; continue; }
    known++;
    total += amount;
    const type = repair && repair.price != null ? repairPriceType(repair) : normalisePriceType(service.priceType);
    if (type === "from") from = true;
  }
  if (!known) return null;
  const money = formatMoney(total, currency);
  return from ? fill(copy.service.priceFrom, { price: money }) : money;
}
