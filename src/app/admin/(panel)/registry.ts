import "server-only";
import type { ZodType } from "zod";
import { TAGS, type Tag } from "@/lib/tags";
import {
  brandInput, categoryInput, deviceInput, galleryInput, pageInput, postInput, redirectInput, reviewInput, serviceInput,
} from "@/lib/validation/admin";
import { Brand, Device, GalleryItem, Page, Post, PostCategory, Redirect, Review, Service, ServiceCategory, type AnyModel } from "@/models";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type Entity = {
  model: AnyModel;
  schema: ZodType;
  tags: Tag[];
  label: string;
  ordered?: boolean;
  toggles?: string[];
  /** Public URL of a saved doc, used for slug-change redirects. */
  path?: (doc: any) => Promise<string | null> | string | null;
};

export const registry = {
  service: { model: Service, schema: serviceInput, tags: [TAGS.services], label: "Service", ordered: true, toggles: ["isActive", "showPrice", "isEmergencyAvailable"], path: (d) => `/services/${d.slug}` },
  serviceCategory: { model: ServiceCategory, schema: categoryInput, tags: [TAGS.services], label: "Service category", ordered: true },
  postCategory: { model: PostCategory, schema: categoryInput, tags: [TAGS.posts], label: "Blog category", path: (d) => `/blog/category/${d.slug}` },
  brand: { model: Brand, schema: brandInput, tags: [TAGS.devices], label: "Brand", ordered: true, path: (d) => `/devices/${d.slug}` },
  device: {
    model: Device,
    schema: deviceInput,
    tags: [TAGS.devices],
    label: "Device",
    toggles: ["isActive"],
    path: async (d) => {
      const b = await Brand.findById(d.brandId).select("slug").lean<{ slug: string }>();
      return b ? `/devices/${b.slug}/${d.slug}` : null;
    },
  },
  post: { model: Post, schema: postInput, tags: [TAGS.posts], label: "Post", path: (d) => (d.status === "draft" ? null : `/blog/${d.slug}`) },
  gallery: { model: GalleryItem, schema: galleryInput, tags: [TAGS.gallery], label: "Photo", ordered: true },
  review: { model: Review, schema: reviewInput, tags: [TAGS.reviews], label: "Review", toggles: ["isVisible", "isFeatured"] },
  redirect: { model: Redirect, schema: redirectInput, tags: [TAGS.redirects], label: "Redirect" },
  page: { model: Page, schema: pageInput, tags: [TAGS.pages], label: "Page" },
} satisfies Record<string, Entity>;

export type Kind = keyof typeof registry;

export function entity(kind: string): Entity {
  if (!Object.hasOwn(registry, kind)) throw new Error("Unknown type");
  return registry[kind as Kind];
}
