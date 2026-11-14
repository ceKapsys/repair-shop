import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadForEdit } from "@/lib/admin-data";
import type { ReviewT } from "@/lib/types";
import { Review } from "@/models";
import { TestimonialEditor } from "./testimonial-editor";

export const metadata: Metadata = { title: "Testimonial" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await loadForEdit<ReviewT>(Review, id);
  // Google reviews are synced, not edited.
  if (review && review.source !== "manual") notFound();
  return <TestimonialEditor review={review} />;
}
