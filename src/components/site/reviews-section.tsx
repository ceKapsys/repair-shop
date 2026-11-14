import { Star, CheckCircle } from "lucide-react";
import type { ReviewT } from "@/lib/types";

interface ReviewsSectionProps {
  reviews: ReviewT[];
  rating?: number;
  ratingCount?: number;
}

export function ReviewsSection({
  reviews,
  rating = 4.9,
  ratingCount = 348,
}: ReviewsSectionProps) {
  const visible = reviews.filter((r) => r.isVisible);
  if (!visible.length) return null;

  return (
    <section aria-labelledby="reviews-heading" className="py-20 md:py-28 bg-surface/50 border-y border-line/60">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header with Google Rating Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-4 py-1.5 ">
            <span className="flex text-warning">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" stroke="none" />
              ))}
            </span>
            <span className="text-sm font-semibold text-ink">{rating} out of 5</span>
            <span className="text-xs text-ink-soft">({ratingCount}+ Google reviews)</span>
          </div>

          <h2 id="reviews-heading" className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
            Loved By Customers Across The City
          </h2>
          <p className="mt-2 max-w-xl text-base text-ink-soft">
            See what real customers say after experiencing our transparent, on-site doorstep repair service.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {visible.slice(0, 6).map((rev) => (
            <div
              key={rev._id}
              className="flex flex-col justify-between rounded-2xl border border-line/80 bg-bg p-6 shadow-card transition-all hover:border-primary/30 hover:shadow-card"
            >
              <div>
                {/* Rating & Verified Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex text-warning">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" stroke="none" />
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-success">
                    <CheckCircle size={11} /> Verified Customer
                  </span>
                </div>

                {/* Review Text */}
                <p className="mt-4 text-sm leading-relaxed text-ink/90 italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-6 flex items-center gap-3 border-t border-line/60 pt-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {rev.authorName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-ink">{rev.authorName}</div>
                  <div className="text-xs text-ink-soft">
                    {rev.source === "google" ? "Google Review" : "Verified Doorstep Client"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Guarantees Row */}
        <div className="mt-14 grid grid-cols-2 gap-4 rounded-2xl border border-line bg-bg p-6 shadow-card sm:grid-cols-4">
          <div className="text-center sm:text-left">
            <div className=" text-2xl font-semibold text-ink">30 Mins</div>
            <div className="text-xs text-ink-soft mt-0.5">Average repair duration</div>
          </div>
          <div className="text-center sm:text-left">
            <div className=" text-2xl font-semibold text-ink">90 Days</div>
            <div className="text-xs text-ink-soft mt-0.5">Comprehensive warranty</div>
          </div>
          <div className="text-center sm:text-left">
            <div className=" text-2xl font-semibold text-ink">100% Private</div>
            <div className="text-xs text-ink-soft mt-0.5">Zero passcode required</div>
          </div>
          <div className="text-center sm:text-left">
            <div className=" text-2xl font-semibold text-ink">$0 Advance</div>
            <div className="text-xs text-ink-soft mt-0.5">Pay only when tested</div>
          </div>
        </div>
      </div>
    </section>
  );
}
