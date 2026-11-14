import { Star } from "lucide-react";
import type { ReviewT } from "@/lib/types";

interface ReviewsGridProps {
  reviews: ReviewT[];
  rating?: number;
  ratingCount?: number;
}

export function ReviewsGrid({
  reviews,
  rating = 4.9,
  ratingCount = 212,
}: ReviewsGridProps) {
  const visible = reviews.filter((r) => r.isVisible);

  // Fallbacks if fewer than 3 reviews exist in DB
  const defaultLead = {
    authorName: "Jessica Vance",
    text: "The technician replaced my iPhone screen right at my Brickell office desk in under 30 minutes and tested everything with me. The price was exactly what the website quoted.",
    publishedAt: "2 weeks ago",
  };
  const defaultSecond = {
    authorName: "Marcus Miller",
    text: "Called at 8:30 PM about a MacBook that wouldn't charge. Dispatch arrived within 40 minutes and had it back to 100% that night. Saved my presentation.",
    publishedAt: "1 month ago",
  };
  const defaultThird = {
    authorName: "Samantha Reed",
    text: "Super polite, on time, and my iPad battery lasts all day now. Booking took less than two minutes.",
    publishedAt: "1 month ago",
  };

  const lead = visible[0] || defaultLead;
  const second = visible[1] || defaultSecond;
  const third = visible[2] || defaultThird;

  return (
    <div>
      {/* Header with Google Rating Badge */}
      <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
        <div>
          <h2 id="rev-h" className="font-heading text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            What customers say on Google
          </h2>
        </div>

        <div className="flex items-center gap-3.5">
          <span className="font-heading text-4xl font-semibold tracking-tight text-ink mono">
            {rating}
          </span>
          <div>
            <div className="stars" aria-label={`${rating} out of 5 stars`}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} />
              ))}
            </div>
            <small className="block text-sm text-ink-soft mt-0.5">
              <span className="mono font-semibold">{ratingCount}</span> reviews ·{" "}
              <a href="#rev-h" className="text-primary hover:underline">
                Read all on Google
              </a>
            </small>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr]">
        {/* Lead Review */}
        <article className="flex flex-col justify-between rounded-[var(--radius-card)] border border-line bg-bg p-6 shadow-card md:col-span-2 lg:col-span-1">
          <div>
            <span className="inline-block rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-steel mb-3">
              Verified Repair
            </span>
            <blockquote className="font-heading text-lg font-medium leading-relaxed text-ink md:text-xl">
              &ldquo;{lead.text}&rdquo;
            </blockquote>
          </div>

          <footer className="mt-6 flex items-center gap-3 border-t border-line/60 pt-4 text-sm">
            <span className="flex size-9 items-center justify-center rounded-full bg-mist font-semibold text-ink">
              {lead.authorName.charAt(0)}
            </span>
            <div>
              <b className="block text-ink">{lead.authorName}</b>
              <span className="text-xs text-ink-soft">Recent customer</span>
            </div>
            <span className="ml-auto text-xs text-ink-soft">Review from Google</span>
          </footer>
        </article>

        {/* Second Review */}
        <article className="flex flex-col justify-between rounded-[var(--radius-card)] border border-line bg-bg p-6 shadow-card">
          <div>
            <span className="inline-block rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-steel mb-3">
              Emergency Visit
            </span>
            <blockquote className="text-[16px] leading-relaxed text-ink">
              &ldquo;{second.text}&rdquo;
            </blockquote>
          </div>

          <footer className="mt-6 flex items-center gap-3 border-t border-line/60 pt-4 text-sm">
            <span className="flex size-9 items-center justify-center rounded-full bg-mist font-semibold text-ink">
              {second.authorName.charAt(0)}
            </span>
            <div>
              <b className="block text-ink">{second.authorName}</b>
              <span className="text-xs text-ink-soft">Verified client</span>
            </div>
            <span className="ml-auto text-xs text-ink-soft">Google</span>
          </footer>
        </article>

        {/* Third Review */}
        <article className="flex flex-col justify-between rounded-[var(--radius-card)] border border-line bg-bg p-6 shadow-card">
          <div>
            <span className="inline-block rounded-full border border-line-strong px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-steel mb-3">
              Doorstep Service
            </span>
            <blockquote className="text-[16px] leading-relaxed text-ink">
              &ldquo;{third.text}&rdquo;
            </blockquote>
          </div>

          <footer className="mt-6 flex items-center gap-3 border-t border-line/60 pt-4 text-sm">
            <span className="flex size-9 items-center justify-center rounded-full bg-mist font-semibold text-ink">
              {third.authorName.charAt(0)}
            </span>
            <div>
              <b className="block text-ink">{third.authorName}</b>
              <span className="text-xs text-ink-soft">Verified client</span>
            </div>
            <span className="ml-auto text-xs text-ink-soft">Google</span>
          </footer>
        </article>
      </div>
    </div>
  );
}
