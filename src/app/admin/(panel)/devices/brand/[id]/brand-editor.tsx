"use client";

import { useRouter } from "next/navigation";
import { EditorShell, Section } from "@/components/admin/editor-shell";
import { SelectInput, SlugInput, TextInput, useEntityForm } from "@/components/admin/form";
import { ImageUrlInput } from "@/components/admin/image-input";
import { SeoPanel } from "@/components/admin/seo-panel";
import { DEVICE_TYPE_LABELS } from "@/lib/format";
import type { BrandT } from "@/lib/types";
import { brandInput } from "@/lib/validation/admin";
import { saveDoc } from "../../../actions";

export function BrandEditor({ brand, siteUrl, titleTemplate }: { brand: BrandT | null; siteUrl: string; titleTemplate: string }) {
  const router = useRouter();
  const form = useEntityForm({
    initial: brand ?? { name: "", slug: "", logo: "", deviceType: "phone", seo: { keywords: [] } },
    isNew: !brand,
    schema: brandInput,
    save: (v) => saveDoc("brand", brand?._id ?? null, v),
    onSaved: () => router.push("/admin/devices"),
  });
  return (
    <EditorShell
      form={form}
      title={brand ? form.values.name || "Brand" : "New brand"}
      backHref="/admin/devices"
      viewHref={`/devices/${form.values.slug}`}
      tabs={[
        {
          id: "content",
          label: "Details",
          content: (
            <Section className="max-w-2xl">
              <TextInput name="name" label="Brand name" placeholder="Apple" autoFocus={!brand} />
              <SlugInput source="name" prefix="/devices/" />
              <SelectInput name="deviceType" label="Device type" options={Object.entries(DEVICE_TYPE_LABELS).map(([value, label]) => ({ value, label }))} />
              <ImageUrlInput name="logo" label="Logo" folder="brands" />
            </Section>
          ),
        },
        { id: "seo", label: "SEO", content: <SeoPanel path={`/devices/${form.values.slug}`} titleField="name" siteUrl={siteUrl} titleTemplate={titleTemplate} /> },
      ]}
    />
  );
}
