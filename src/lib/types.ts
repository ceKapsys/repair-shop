/** Plain (JSON-serialised) shapes passed from server to client components. */

/** `range` and `quote` are legacy values still readable from older documents. */
export type PriceType = "fixed" | "from" | "hidden" | "range" | "quote";
export type DeviceType = "phone" | "laptop" | "tablet" | "console" | "smartwatch" | "audio" | "other";
export type BookingStatus = "new" | "confirmed" | "on-the-way" | "in-progress" | "done" | "cancelled";

export interface Seo {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
  schemaType?: string;
}

export interface Img {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface RichText {
  json?: unknown;
  html?: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface ServiceT {
  _id: string;
  title: string;
  slug: string;
  categoryId?: string;
  shortDesc?: string;
  verbPhrase?: string;
  body?: RichText;
  icon?: string;
  images: Img[];
  priceType: PriceType;
  priceMin?: number;
  priceMax?: number;
  showPrice: boolean;
  duration?: string;
  warrantyDays?: number;
  partsNote?: string;
  isEmergencyAvailable: boolean;
  isCommonRepair?: boolean;
  deviceIds: string[];
  faqs: Faq[];
  order: number;
  isActive: boolean;
  seo?: Seo;
  updatedAt?: string;
}

export interface CategoryT {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  order?: number;
  seo?: Seo;
  updatedAt?: string;
}

export interface BrandT {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  deviceType: DeviceType;
  order: number;
  seo?: Seo;
  updatedAt?: string;
}

export interface DeviceRepairT {
  serviceId: string;
  priceType?: PriceType;
  price?: number;
  showPrice: boolean;
  duration?: string;
}

export interface DeviceT {
  _id: string;
  brandId: string;
  model: string;
  slug: string;
  image?: string;
  releaseYear?: number;
  specs?: Record<string, string>;
  repairs: DeviceRepairT[];
  isActive: boolean;
  seo?: Seo;
  updatedAt?: string;
}

export interface PostT {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: RichText;
  coverImage?: Img;
  categoryIds: string[];
  tags: string[];
  authorId?: string;
  status: "draft" | "scheduled" | "published";
  publishAt?: string;
  readingTime?: number;
  seo?: Seo;
  updatedAt?: string;
}

export interface GalleryItemT {
  _id: string;
  image: { url: string; width?: number; height?: number };
  afterImage?: { url: string; width?: number; height?: number; alt?: string };
  caption?: string;
  alt: string;
  tags: string[];
  deviceId?: string;
  serviceId?: string;
  isBeforeAfter: boolean;
  pairId?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewT {
  _id: string;
  source: "google" | "manual";
  externalId?: string;
  authorName: string;
  authorPhoto?: string;
  rating: number;
  text?: string;
  publishedAt?: string;
  isVisible: boolean;
  isFeatured: boolean;
}

export interface PageT {
  _id: string;
  key: string;
  title: string;
  intro?: string;
  body?: RichText;
  seo?: Seo;
  updatedAt?: string;
}

export interface BookingT {
  _id: string;
  bookingNo: string;
  type: "standard" | "emergency";
  customer: { name: string; phone: string; whatsapp: boolean; email?: string };
  address: { line?: string; area?: string; city?: string; mapLink?: string; lat?: number; lng?: number };
  deviceId?: string;
  deviceLabel?: string;
  customDevice?: string;
  serviceIds: string[];
  serviceLabels?: string[];
  issueNote?: string;
  photos: string[];
  preferredSlot?: { date?: string; window?: string };
  status: BookingStatus;
  statusHistory: { status: string; at: string; by?: string }[];
  quotedPrice?: number;
  estimate?: string;
  adminNotes: { text: string; at: string; by?: string }[];
  source?: string;
  createdAt: string;
}

export interface UserT {
  _id: string;
  name: string;
  email: string;
  role: "owner" | "editor";
  has2fa?: boolean;
  lastLoginAt?: string;
}

export interface RedirectT {
  _id: string;
  from: string;
  to: string;
  code: 301 | 302;
}
