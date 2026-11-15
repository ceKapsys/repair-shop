import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink, Zap } from "lucide-react";
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
  return pageMetadata("reviews", {
    title: c.title,
    path: "/reviews",
    description: fill(copy.meta.reviewsDesc, { shop: s.shopName }),
  });
}

export default async function ReviewsPage() {
  const [s, reviews] = await Promise.all([getSettings(), getReviews()]);
  const hasRating = Boolean(s.google.rating && s.google.ratingCount);

  return (
    <>
      <JsonLd data={localBusinessJsonLd(s)} />
      <PageHero
        eyebrow="Verified Customer Feedback"
        title={copy.home.reviews.title}
        crumbs={<Breadcrumbs items={[{ label: c.title, href: "/reviews" }]} />}
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
      >
        {hasRating && (
          <div className="mt-8 inline-flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-line bg-bg px-5 py-3.5 shadow-2xs">
            <span className="num font-heading text-3xl font-bold text-ink">{s.google.rating}</span>
            <Stars rating={s.google.rating!} size={20} />
            <span className="text-sm text-ink-soft">
              {fill(c.summary, { rating: s.google.rating, reviewCount: s.google.ratingCount })}
            </span>
            {s.google.mapsUri && (
              <a
                href={s.google.mapsUri}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-strong"
              >
                <span>{c.viewProfile}</span>
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        )}
      </PageHero>

      <section className="bg-bg py-12 md:py-16">
        <div className="container-page">
          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-8 text-center text-ink-soft">
              {c.empty}
            </div>
          ) : (
            <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {reviews.map((r) => (
                <li key={r._id} className="mb-5 break-inside-avoid">
                  <ReviewCard review={r} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
