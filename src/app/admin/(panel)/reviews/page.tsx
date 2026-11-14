import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@/auth";
import { DeleteButton } from "@/components/admin/delete-button";
import { PageHeader } from "@/components/admin/editor-shell";
import { ToggleCell } from "@/components/admin/toggle-cell";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/field";
import { Stars } from "@/components/site/review-card";
import { connectDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { googleOAuthConfigured, placesConfigured } from "@/lib/google-reviews";
import { plain } from "@/lib/serialize";
import { loadSettings } from "@/lib/settings";
import type { ReviewT } from "@/lib/types";
import { Review } from "@/models";
import { GooglePanel } from "./google-panel";

export const metadata: Metadata = { title: "Reviews" };

const notices: Record<string, string> = {
  connected: "Google is connected. Choose your location below, then sync.",
  denied: "Google sign-in was cancelled or expired. Try again.",
  failed: "Google sign-in failed. Check the client ID, secret and redirect URL, then try again.",
  "not-configured": "Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to connect Google.",
};

export default async function ReviewsAdminPage({ searchParams }: { searchParams: Promise<{ google?: string }> }) {
  const [{ google }, user, s] = await Promise.all([searchParams, currentUser(), loadSettings()]);
  await connectDb();
  const reviews = plain<ReviewT[]>(await Review.find().sort({ publishedAt: -1 }).lean());
  return (
    <>
      <PageHeader title="Reviews" description="Reviews come from your Google Business Profile. You can hide any of them or add your own testimonials." actions={<Link href="/admin/reviews/new" className={buttonVariants({ variant: "outline" })}>Add testimonial</Link>} />
      <div className="space-y-6 px-4 py-6 md:px-8">
        {google && notices[google] && <p role="status" className="rounded-input border border-line bg-surface p-4 text-sm">{notices[google]}</p>}
        <GooglePanel
          isOwner={user?.role === "owner"}
          oauthConfigured={googleOAuthConfigured()}
          placesConfigured={placesConfigured()}
          google={s.google}
        />
        {reviews.length === 0 ? (
          <p className="rounded-card border border-dashed border-line p-10 text-center text-ink-soft">No reviews yet. Connect Google and sync, or add a testimonial.</p>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-bg">
            {reviews.map((r) => (
              <li key={r._id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                <div className="min-w-0 flex-1 basis-64">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {r.source === "manual" ? <Link href={`/admin/reviews/${r._id}`} className="hover:text-primary">{r.authorName}</Link> : r.authorName}
                    <Stars rating={r.rating} size={14} />
                    <Badge tone={r.source === "google" ? "primary" : "neutral"}>{r.source === "google" ? "Google" : "Testimonial"}</Badge>
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{r.text || "No text"}</p>
                  {r.publishedAt && <p className="mt-1 text-xs text-ink-soft">{formatDate(r.publishedAt)}</p>}
                </div>
                <ToggleCell kind="review" id={r._id} field="isVisible" value={r.isVisible} label="Shown" />
                <ToggleCell kind="review" id={r._id} field="isFeatured" value={r.isFeatured} label="Featured" />
                <DeleteButton kind="review" id={r._id} label={`review by ${r.authorName}`} compact />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
