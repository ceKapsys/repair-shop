import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { GalleryGrid, type GalleryEntry } from "@/components/site/gallery-grid";
import { PageHero } from "@/components/site/page-hero";
import { copy, fill } from "@/content/copy";
import { getGallery } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

const c = copy.gallery;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("gallery", { title: c.title, path: "/gallery", description: fill(copy.meta.galleryDesc, { shop: s.shopName, city: s.contacts.city }) });
}

export default async function GalleryPage() {
  const gallery = await getGallery();
  const byId = new Map(gallery.map((g) => [g._id, g]));
  // A "before" photo with a pairId is shown with its "after" as one slider; the paired "after" is not repeated.
  const afters = new Set(gallery.filter((g) => g.isBeforeAfter && g.pairId && byId.has(g.pairId)).map((g) => g.pairId!));
  const items: GalleryEntry[] = gallery
    .filter((g) => !afters.has(g._id))
    .map((g) => {
      const pair = g.isBeforeAfter && g.pairId ? byId.get(g.pairId) : undefined;
      return { id: g._id, url: g.image.url, alt: g.alt, caption: g.caption, tags: g.tags ?? [], after: pair ? { url: pair.image.url, alt: pair.alt } : undefined };
    });
  return (
    <>
      <PageHero title={c.title} crumbs={<Breadcrumbs items={[{ label: copy.footer.gallery, href: "/gallery" }]} />} />
      <div className="container-page pb-16 md:pb-24">
        {items.length === 0 ? <p className="text-ink-soft">{c.empty}</p> : <GalleryGrid items={items} />}
      </div>
    </>
  );
}
