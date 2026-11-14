"use client";

import { useRouter } from "next/navigation";
import { EditorShell, Section } from "@/components/admin/editor-shell";
import { SelectInput, TextArea, TextInput, Toggle, useEntityForm } from "@/components/admin/form";
import type { ReviewT } from "@/lib/types";
import { reviewInput } from "@/lib/validation/admin";
import { saveDoc } from "../../actions";

export function TestimonialEditor({ review }: { review: ReviewT | null }) {
  const router = useRouter();
  const form = useEntityForm({
    initial: review ? { ...review, rating: String(review.rating), publishedAt: review.publishedAt ?? "" } : { authorName: "", authorPhoto: "", rating: "5", text: "", publishedAt: "", isVisible: true, isFeatured: false },
    isNew: !review,
    schema: reviewInput,
    save: (v) => saveDoc("review", review?._id ?? null, v),
    onSaved: () => router.push("/admin/reviews"),
  });
  return (
    <EditorShell
      form={form}
      title={review ? form.values.authorName || "Testimonial" : "New testimonial"}
      backHref="/admin/reviews"
      tabs={[
        {
          id: "content",
          label: "Testimonial",
          content: (
            <Section className="max-w-2xl" description="Only add words a real customer gave you. Testimonials are shown as “Customer testimonial”, never as Google reviews.">
              <TextInput name="authorName" label="Customer name" autoFocus={!review} />
              <SelectInput name="rating" label="Rating" options={[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${n} star${n === 1 ? "" : "s"}` }))} />
              <TextArea name="text" label="What they said" rows={5} counter={{ max: 3000 }} />
              <Toggle name="isVisible" label="Show on the website" />
              <Toggle name="isFeatured" label="Feature near the top" />
            </Section>
          ),
        },
      ]}
    />
  );
}
