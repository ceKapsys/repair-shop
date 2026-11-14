/** Slim catalogue shapes sent to the booking form (no rich text, SEO or images). */
import type { PriceType } from "./types";

export type BookingService = {
  id: string;
  slug: string;
  title: string;
  icon?: string;
  shortDesc?: string;
  priceType: PriceType;
  priceMin?: number;
  priceMax?: number;
  showPrice: boolean;
  duration?: string;
  isEmergencyAvailable: boolean;
  deviceIds: string[];
};
export type BookingBrand = { id: string; name: string; deviceType: string; logo?: string };
export type BookingDevice = { id: string; brandId: string; model: string; image?: string; repairs: { serviceId: string; priceType?: PriceType; price?: number; showPrice: boolean; duration?: string }[] };
export type BookingCatalog = { services: BookingService[]; brands: BookingBrand[]; devices: BookingDevice[] };
