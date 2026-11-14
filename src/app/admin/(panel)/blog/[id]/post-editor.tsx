"use client";

import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorShell, Section } from "@/components/admin/editor-shell";
import { ChipsInput, MultiCheck, SelectInput, SlugInput, TextArea, TextInput, useEntityForm, useForm } from "@/components/admin/form";
import { ImageListInput } from "@/components/admin/image-input";
import { RichTextInput } from "@/components/admin/rich-text-lazy";
import { SeoPanel } from "@/components/admin/seo-panel";
import { Field, inputClass } from "@/components/ui/field";
import type { CategoryT, PostT } from "@/lib/types";
import { postInput } from "@/lib/validation/admin";
import { saveDoc } from "../../actions";

/** datetime-local value in the browser's time zone. */
const toLocalInput = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

function PublishAt() {
  const f = useForm();
  const v = (f.get("publishAt") ?? "") as string;
  return (
    <Field id="publishAt" label="Publish date and time" hint="Required for scheduled posts. Leave empty to publish now." error={f.errors.publishAt}>
      <input id="publishAt" type="datetime-local" value={toLocalInput(v)} onChange={(e) => f.set("publishAt", e.target.value ? new Date(e.target.value).toISOString() : "")} className={inputClass} />
    </Field>
  );
}

export function PostEditor({ post, categories, siteUrl, titleTemplate }: { post: PostT | null; categories: CategoryT[]; siteUrl: string; titleTemplate: string }) {
  const router = useRouter();
  const form = useEntityForm({
    initial: post ?? { title: "", slug: "", excerpt: "", body: { html: "" }, coverImage: null, categoryIds: [], tags: [], status: "draft", publishAt: "", seo: { keywords: [] } },
    isNew: !post,
    schema: postInput,
    save: (v) => saveDoc("post", post?._id ?? null, v),
    // Drafts save themselves every 10 seconds once they have a title and slug.
    autosaveMs: 10_000,
    canAutosave: (v) => Boolean(post) && v.status === "draft" && Boolean(v.title && v.slug),
    onSaved: (r) => {
      if (!post && r.id) router.replace(`/admin/blog/${r.id}`);
      else router.refresh();
    },
  });
  const v = form.values;
  return (
    <EditorShell
      form={form}
      title={post ? v.title || "Untitled post" : "New post"}
      backHref="/admin/blog"
      viewHref={v.status !== "draft" ? `/blog/${v.slug}` : undefined}
      actions={post && <DeleteButton kind="post" id={post._id} label={post.title} redirectTo="/admin/blog" compact />}
      tabs={[
        {
          id: "content",
          label: "Content",
          fields: ["title", "slug", "excerpt", "body", "coverImage", "status", "publishAt", "categoryIds", "tags"],
          content: (
            <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
              <div className="space-y-6">
                <Section>
                  <TextInput name="title" label="Title" autoFocus={!post} />
                  <SlugInput source="title" prefix="/blog/" hint="Changing the address of a published post adds a redirect from the old one." />
                  <TextArea name="excerpt" label="Summary" hint="Shown on the blog list and in search results." counter={{ max: 400 }} />
                </Section>
                <Section>
                  <RichTextInput name="body" label="Post" folder="blog" minHeight={480} />
                </Section>
              </div>
              <aside className="space-y-6">
                <Section title="Publishing">
                  <SelectInput name="status" label="Status" options={[{ value: "draft", label: "Draft (private)" }, { value: "scheduled", label: "Scheduled" }, { value: "published", label: "Published" }]} />
                  <PublishAt />
                </Section>
                <Section title="Cover image">
                  <ImageListInput name="coverImage" label="Cover" folder="blog" single />
                </Section>
                <Section title="Organise">
                  <MultiCheck name="categoryIds" label="Categories" options={categories.map((c) => ({ value: c._id, label: c.name }))} />
                  <ChipsInput name="tags" label="Tags" placeholder="Add a tag and press Enter" />
                </Section>
              </aside>
            </div>
          ),
        },
        { id: "seo", label: "SEO", content: <SeoPanel path={`/blog/${v.slug}`} bodyField="body" descFallbackField="excerpt" siteUrl={siteUrl} titleTemplate={titleTemplate} /> },
      ]}
    />
  );
}
