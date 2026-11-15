import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
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
  return pageMetadata("gallery", {
    title: c.title,
    path: "/gallery",
    description: fill(copy.meta.galleryDesc, { shop: s.shopName, city: s.contacts.city }),
  });
}

export default async function GalleryPage() {
  const gallery = await getGallery();
  const byId = new Map(gallery.map((g) => [g._id, g]));
  // A "before" photo with a pairId is shown with its "after" as one slider; the paired "after" is not repeated.
  const afters = new Set(
    gallery.filter((g) => g.isBeforeAfter && g.pairId && byId.has(g.pairId)).map((g) => g.pairId!)
  );
  const items: GalleryEntry[] = gallery
    .filter((g) => !afters.has(g._id))
    .map((g) => {
      const pair = g.isBeforeAfter && g.pairId ? byId.get(g.pairId) : undefined;
      const after = g.afterImage?.url
        ? { url: g.afterImage.url, alt: g.afterImage.alt || g.alt }
        : pair
          ? { url: pair.image.url, alt: pair.alt }
          : undefined;
      return {
        id: g._id,
        url: g.image.url,
        alt: g.alt,
        caption: g.caption,
        tags: g.tags ?? [],
        after,
      };
    });

  return (
    <>
      <PageHero
        eyebrow="Real Repairs · Before & After"
        title={c.title}
        intro="Slide through real on-site repairs completed by our certified mobile technicians."
        crumbs={<Breadcrumbs items={[{ label: copy.footer.gallery, href: "/gallery" }]} />}
        actions={
          <>
            <Link
              href="/emergency"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emergency px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-emergency-strong"
            >
              <Zap size={16} />
              <span>Emergency Booking</span>
            </Link>
            <Link
              href="/book"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-strong"
            >
              <span>Book Online</span>
              <ArrowRight size={16} />
            </Link>
          </>
        }
      />

      <section className="bg-bg py-12 md:py-16">
        <div className="container-page">
          {items.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-soft">
              {c.empty}
            </div>
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </section>
    </>
  );
}
