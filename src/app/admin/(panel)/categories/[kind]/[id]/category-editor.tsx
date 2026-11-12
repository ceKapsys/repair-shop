"use client";

import { useRouter } from "next/navigation";
import { EditorShell, Section } from "@/components/admin/editor-shell";
import { SlugInput, TextInput, useEntityForm } from "@/components/admin/form";
import { SeoPanel } from "@/components/admin/seo-panel";
import type { CategoryT } from "@/lib/types";
import { categoryInput } from "@/lib/validation/admin";
import { saveDoc } from "../../../actions";

export function CategoryEditor({ kind, doc, siteUrl, titleTemplate }: { kind: "serviceCategory" | "postCategory"; doc: CategoryT | null; siteUrl: string; titleTemplate: string }) {
  const router = useRouter();
  const form = useEntityForm({
    initial: doc ?? { name: "", slug: "", icon: "", seo: { keywords: [] } },
    isNew: !doc,
    schema: categoryInput,
    save: (v) => saveDoc(kind, doc?._id ?? null, v),
    onSaved: () => router.push("/admin/categories"),
  });
  const prefix = kind === "postCategory" ? "/blog/category/" : "/services#";
  return (
    <EditorShell
      form={form}
      title={doc ? form.values.name || "Category" : "New category"}
      backHref="/admin/categories"
      viewHref={kind === "postCategory" ? `/blog/category/${form.values.slug}` : undefined}
      tabs={[
        {
          id: "content",
          label: "Details",
          content: (
            <Section className="max-w-2xl">
              <TextInput name="name" label="Name" autoFocus={!doc} />
              <SlugInput source="name" prefix={prefix} />
              {kind === "serviceCategory" && <TextInput name="icon" label="Icon (Lucide name)" placeholder="smartphone" />}
            </Section>
          ),
        },
        { id: "seo", label: "SEO", content: <SeoPanel path={`${prefix}${form.values.slug}`} titleField="name" siteUrl={siteUrl} titleTemplate={titleTemplate} /> },
      ]}
    />
  );
}
