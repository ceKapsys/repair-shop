"use client";

import { useRouter } from "next/navigation";
import { EditorShell, Section } from "@/components/admin/editor-shell";
import { TextArea, useEntityForm } from "@/components/admin/form";
import { RichTextInput } from "@/components/admin/rich-text-lazy";
import { SeoPanel } from "@/components/admin/seo-panel";
import type { PageT } from "@/lib/types";
import { pageInput } from "@/lib/validation/admin";
import { saveDoc } from "../../../actions";

export function PageEditor({ pageKey, path, name, doc, withBody, siteUrl, titleTemplate }: { pageKey: string; path: string; name: string; doc: PageT | null; withBody: boolean; siteUrl: string; titleTemplate: string }) {
  const router = useRouter();
  const form = useEntityForm({
    initial: doc ?? { key: pageKey, title: name, intro: "", body: { html: "" }, seo: { keywords: [] } },
    schema: pageInput,
    save: (v) => saveDoc("page", doc?._id ?? null, { ...v, key: pageKey, title: v.title || name }),
    onSaved: () => router.refresh(),
  });
  const seo = <SeoPanel path={path} bodyField={withBody ? "body" : undefined} descFallbackField="intro" siteUrl={siteUrl} titleTemplate={titleTemplate} />;
  return (
    <EditorShell
      form={form}
      title={name}
      backHref="/admin/seo?tab=pages"
      viewHref={path}
      tabs={
        withBody
          ? [
              {
                id: "content",
                label: "Content",
                content: (
                  <div className="max-w-3xl space-y-6">
                    <Section>
                      <TextArea name="intro" label="Introduction" hint="One or two sentences under the page heading." counter={{ max: 600 }} />
                    </Section>
                    <Section>
                      <RichTextInput name="body" label="Page text" folder="pages" minHeight={420} />
                    </Section>
                  </div>
                ),
              },
              { id: "seo", label: "SEO", content: seo },
            ]
          : [{ id: "seo", label: "SEO", content: seo }]
      }
    />
  );
}
