import "server-only";
import { unstable_cache } from "next/cache";
import { connectDb, isDbConfigured } from "./db";
import { plain } from "./serialize";
import { TAGS } from "./tags";
import type { BrandT, CategoryT, DeviceT, GalleryItemT, PageT, PostT, ReviewT, ServiceT } from "./types";
import { Brand, Device, GalleryItem, Page, Post, PostCategory, Redirect, Review, Service, ServiceCategory } from "@/models";

/** Wrap a DB read: cached by tag, and returns `fallback` when the DB is missing or down. */
function cached<A extends unknown[], R>(
  key: string,
  tags: string[],
  fallback: R,
  fn: (...args: A) => Promise<R>,
  revalidate: number | false = false,
) {
  return unstable_cache(
    async (...args: A): Promise<R> => {
      if (!isDbConfigured()) return fallback;
      try {
        await connectDb();
        return await fn(...args);
      } catch (err) {
        console.error(`[data:${key}]`, err);
        return fallback;
      }
    },
    [key],
    { tags, revalidate },
  );
}

// ---------- Services ----------
export const getServices = cached("services", [TAGS.services], [] as ServiceT[], async () =>
  plain<ServiceT[]>(await Service.find({ isActive: true }).sort({ order: 1, title: 1 }).lean()),
);

export const getServiceBySlug = cached("service", [TAGS.services], null as ServiceT | null, async (slug: string) =>
  plain<ServiceT | null>(await Service.findOne({ slug: String(slug), isActive: true }).lean()),
);

export const getServiceCategories = cached("service-categories", [TAGS.services], [] as CategoryT[], async () =>
  plain<CategoryT[]>(await ServiceCategory.find().sort({ order: 1, name: 1 }).lean()),
);

// ---------- Devices ----------
export const getBrands = cached("brands", [TAGS.devices], [] as BrandT[], async () =>
  plain<BrandT[]>(await Brand.find().sort({ order: 1, name: 1 }).lean()),
);

export const getBrandBySlug = cached("brand", [TAGS.devices], null as BrandT | null, async (slug: string) =>
  plain<BrandT | null>(await Brand.findOne({ slug: String(slug) }).lean()),
);

export const getDevicesByBrand = cached("devices-by-brand", [TAGS.devices], [] as DeviceT[], async (brandId: string) =>
  plain<DeviceT[]>(await Device.find({ brandId: String(brandId), isActive: true }).sort({ releaseYear: -1, model: 1 }).lean()),
);

export const getDevice = cached(
  "device",
  [TAGS.devices],
  null as DeviceT | null,
  async (brandId: string, slug: string) =>
    plain<DeviceT | null>(await Device.findOne({ brandId: String(brandId), slug: String(slug), isActive: true }).lean()),
);

export const getAllDevices = cached("devices-all", [TAGS.devices], [] as DeviceT[], async () =>
  plain<DeviceT[]>(await Device.find({ isActive: true }).sort({ model: 1 }).lean()),
);

// ---------- Blog ----------
const published = () => ({ status: { $in: ["published", "scheduled"] }, publishAt: { $lte: new Date() } });

export const getPosts = cached(
  "posts",
  [TAGS.posts],
  [] as PostT[],
  async (categoryId?: string) => {
    const q: Record<string, unknown> = published();
    if (categoryId) q.categoryIds = String(categoryId);
    return plain<PostT[]>(await Post.find(q).select("-body.json").sort({ publishAt: -1 }).lean());
  },
  300, // scheduled posts go live within 5 minutes
);

export const getPostBySlug = cached(
  "post",
  [TAGS.posts],
  null as PostT | null,
  async (slug: string) => plain<PostT | null>(await Post.findOne({ slug: String(slug), ...published() }).lean()),
  300,
);

export const getPostCategories = cached("post-categories", [TAGS.posts], [] as CategoryT[], async () =>
  plain<CategoryT[]>(await PostCategory.find().sort({ name: 1 }).lean()),
);

// ---------- Gallery, reviews, pages ----------
export const getGallery = cached("gallery", [TAGS.gallery], [] as GalleryItemT[], async () =>
  plain<GalleryItemT[]>(await GalleryItem.find().sort({ order: 1, createdAt: -1 }).lean()),
);

export const getReviews = cached("reviews", [TAGS.reviews], [] as ReviewT[], async () =>
  plain<ReviewT[]>(await Review.find({ isVisible: true }).sort({ isFeatured: -1, publishedAt: -1 }).lean()),
);

export const getPage = cached("page", [TAGS.pages], null as PageT | null, async (key: string) =>
  plain<PageT | null>(await Page.findOne({ key: String(key) }).lean()),
);

export const getRedirect = cached(
  "redirect",
  [TAGS.redirects],
  null as { to: string; code: number } | null,
  async (from: string) => {
    const r = await Redirect.findOne({ from: String(from) }).lean();
    return r ? { to: r.to, code: r.code } : null;
  },
);
