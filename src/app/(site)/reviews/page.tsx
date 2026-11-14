import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { ReviewCard, Stars } from "@/components/site/review-card";
import { copy, fill } from "@/content/copy";
import { getReviews } from "@/lib/data";
import { localBusinessJsonLd } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

const c = copy.reviews;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return pageMetadata("reviews", { title: c.title, path: "/reviews", description: fill(copy.meta.reviewsDesc, { shop: s.shopName }) });
}

export default async function ReviewsPage() {
  const [s, reviews] = await Promise.all([getSettings(), getReviews()]);
  const hasRating = Boolean(s.google.rating && s.google.ratingCount);
  return (
    <>
      <JsonLd data={localBusinessJsonLd(s)} />
      <PageHero title={copy.home.reviews.title} crumbs={<Breadcrumbs items={[{ label: c.title, href: "/reviews" }]} />}>
        {hasRating && (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="num text-[28px] leading-9 font-semibold">{s.google.rating}</span>
            <Stars rating={s.google.rating!} size={20} />
            <span className="text-ink-soft">{fill(c.summary, { rating: s.google.rating, reviewCount: s.google.ratingCount })}</span>
          </div>
        )}
        {s.google.mapsUri && (
          <a href={s.google.mapsUri} target="_blank" rel="noopener" className="mt-2 inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:text-primary-strong hover:underline">{c.viewProfile}</a>
        )}
      </PageHero>
      <div className="container-page pb-16 md:pb-24">
        {reviews.length === 0 ? (
          <p className="text-ink-soft">{c.empty}</p>
        ) : (
          <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {reviews.map((r) => (
              <li key={r._id} className="mb-4 break-inside-avoid"><ReviewCard review={r} /></li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
