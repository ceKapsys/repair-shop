/** Cache tags. Admin saves call revalidateTag() with these so public pages refresh within seconds. */
export const TAGS = {
  settings: "settings",
  services: "services",
  devices: "devices",
  posts: "posts",
  gallery: "gallery",
  reviews: "reviews",
  pages: "pages",
  redirects: "redirects",
} as const;
export type Tag = (typeof TAGS)[keyof typeof TAGS];
