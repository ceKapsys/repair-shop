import { Star } from "lucide-react";
import { copy } from "@/content/copy";
import { formatDate } from "@/lib/format";
import type { ReviewT } from "@/lib/types";

export function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  const full = Math.round(rating);
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${rating} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={size} strokeWidth={1.75} aria-hidden className={i < full ? "fill-warning text-warning" : "text-steel"} />
      ))}
    </span>
  );
}

/** One review, with its source shown. Google reviews carry the "Review from Google" attribution. */
export function ReviewCard({ review }: { review: ReviewT }) {
  return (
    <figure className="flex h-full flex-col rounded-card border border-line bg-bg p-6 shadow-card">
      <Stars rating={review.rating} />
      {review.text && <blockquote className="mt-4 text-[15px] leading-6">{review.text}</blockquote>}
      <figcaption className="mt-auto pt-5 text-sm leading-5">
        <span className="block font-medium">{review.authorName}</span>
        <span className="text-ink-soft">
          {review.source === "google" ? copy.reviews.fromGoogle : copy.static.manual}
          {review.publishedAt ? " · " : null}
          {review.publishedAt ? formatDate(review.publishedAt) : null}
        </span>
      </figcaption>
    </figure>
  );
}
