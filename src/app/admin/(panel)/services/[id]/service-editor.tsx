"use client";

import { useRouter } from "next/navigation";
import { Clock, ShieldCheck } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorShell, Section } from "@/components/admin/editor-shell";
import { FaqList, MultiCheck, NumberInput, SelectInput, SlugInput, TextArea, TextInput, Toggle, useEntityForm } from "@/components/admin/form";
import { ImageListInput } from "@/components/admin/image-input";
import { SeoPanel } from "@/components/admin/seo-panel";
import { RichTextInput } from "@/components/admin/rich-text-lazy";
import { priceLabel } from "@/lib/format";
import type { CategoryT, ServiceT } from "@/lib/types";
import { serviceInput } from "@/lib/validation/admin";
import { saveDoc } from "../../actions";

const blank = {
  title: "", slug: "", categoryId: "", shortDesc: "", body: { html: "" }, icon: "", images: [], priceType: "from", priceMin: undefined, priceMax: undefined,
  showPrice: true, duration: "", warrantyDays: 90, partsNote: "", isEmergencyAvailable: false, deviceIds: [], faqs: [], isActive: true, seo: { keywords: [] },
};

export function ServiceEditor({
  service, categories, devices, siteUrl, titleTemplate, currency,
}: {
  service: ServiceT | null; categories: CategoryT[]; devices: { value: string; label: string; group: string }[]; siteUrl: string; titleTemplate: string; currency: string;
}) {
  const router = useRouter();
  const form = useEntityForm({
    initial: service ?? blank,
    isNew: !service,
    schema: serviceInput,
    save: (v) => saveDoc("service", service?._id ?? null, v),
    onSaved: (r) => {
      if (!service && r.id) router.replace(`/admin/services/${r.id}`);
      else router.refresh();
    },
  });
  const v = form.values;
  const price = priceLabel({ priceType: v.priceType, priceMin: v.priceMin, priceMax: v.priceMax, showPrice: v.showPrice }, currency);

  return (
    <EditorShell
      form={form}
      title={service ? v.title || "Untitled service" : "New service"}
      backHref="/admin/services"
      viewHref={`/services/${v.slug}`}
      actions={service && <DeleteButton kind="service" id={service._id} label={service.title} redirectTo="/admin/services" compact />}
      tabs={[
        {
          id: "content",
          label: "Content",
          content: (
            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <div className="space-y-6">
                <Section>
                  <TextInput name="title" label="Service name" placeholder="e.g. Screen replacement" autoFocus={!service} />
                  <SlugInput source="title" prefix="/services/" />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <SelectInput name="categoryId" label="Category" placeholder="No category" options={categories.map((c) => ({ value: c._id, label: c.name }))} />
                    <TextInput name="icon" label="Icon (Lucide name)" placeholder="smartphone" hint="Any icon name from lucide.dev" />
                  </div>
                  <TextArea name="shortDesc" label="Short description" hint="Shown on service cards (1–2 sentences)." counter={{ max: 300 }} />
                </Section>
                <Section title="Price and time">
                  <SelectInput
                    name="priceType"
                    label="How to show the price"
                    options={[
                      { value: "fixed", label: "Fixed price" },
                      { value: "from", label: "“From” price" },
                      { value: "range", label: "Price range" },
                      { value: "quote", label: "Quote only (no price)" },
                    ]}
                  />
                  {v.priceType !== "quote" && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <NumberInput name="priceMin" label={v.priceType === "range" ? "Min price" : "Price"} prefix={currency} />
                      {v.priceType === "range" && <NumberInput name="priceMax" label="Max price" prefix={currency} />}
                    </div>
                  )}
                  <Toggle name="showPrice" label="Show price on the website" hint="Turn off to show “Get a quote” instead." />
                  <div className="grid gap-5 sm:grid-cols-2">
                    <TextInput name="duration" label="Typical time" placeholder="45–60 min" />
                    <NumberInput name="warrantyDays" label="Warranty (days)" step="1" />
                  </div>
                  <TextInput name="partsNote" label="Parts note" placeholder="Genuine-grade OLED panel" />
                  <Toggle name="isEmergencyAvailable" label="Available as emergency repair" hint="Shows the red emergency button on this service." />
                </Section>
                <Section title="Details">
                  <RichTextInput name="body" label="Full description" folder="services" />
                </Section>
                <Section title="Photos">
                  <ImageListInput name="images" label="Service photos" folder="services" />
                </Section>
                <Section title="Devices">
                  <MultiCheck name="deviceIds" label="Supported devices" options={devices} hint="Leave empty if this service applies to any device." />
                </Section>
                <Section>
                  <FaqList name="faqs" />
                </Section>
              </div>
              <aside className="space-y-4 xl:sticky xl:top-36 xl:self-start">
                <Section>
                  <Toggle name="isActive" label="Live on website" />
                </Section>
                <div>
                  <p className="mb-2 text-sm font-medium">Card preview</p>
                  <div className="rounded-[var(--radius-card)] border border-border bg-background p-5 shadow-1">
                    <p className="font-semibold">{v.title || "Service name"}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{v.shortDesc || "Short description"}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">{price ?? "Get a quote"}</span>
                      {v.duration && <span className="flex items-center gap-1 text-muted"><Clock size={14} /> {v.duration}</span>}
                      {v.warrantyDays ? <span className="flex items-center gap-1 text-muted"><ShieldCheck size={14} /> {v.warrantyDays}-day warranty</span> : null}
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          ),
        },
        {
          id: "seo",
          label: "SEO",
          content: <SeoPanel path={`/services/${v.slug}`} bodyField="body" descFallbackField="shortDesc" siteUrl={siteUrl} titleTemplate={titleTemplate} imagesField="images" />,
        },
      ]}
    />
  );
}
