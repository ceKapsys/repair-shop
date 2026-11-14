"use client";

import { useRouter } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorShell, Section } from "@/components/admin/editor-shell";
import { ChipsInput, SelectInput, TextInput, Toggle, useEntityForm } from "@/components/admin/form";
import type { GalleryItemT } from "@/lib/types";
import { galleryInput } from "@/lib/validation/admin";
import { saveDoc } from "../../actions";

type Opt = { value: string; label: string };

export function GalleryEditor({ item, others, services, devices }: { item: GalleryItemT; others: Opt[]; services: Opt[]; devices: Opt[] }) {
  const router = useRouter();
  const form = useEntityForm({
    initial: { ...item, deviceId: item.deviceId ?? "", serviceId: item.serviceId ?? "", pairId: item.pairId ?? "", caption: item.caption ?? "" },
    schema: galleryInput,
    save: (v) => saveDoc("gallery", item._id, v),
    onSaved: () => router.push("/admin/gallery"),
  });
  const v = form.values;
  return (
    <EditorShell
      form={form}
      title={v.caption || v.alt || "Photo"}
      backHref="/admin/gallery"
      viewHref="/gallery"
      actions={<DeleteButton kind="gallery" id={item._id} label={item.caption || item.alt} redirectTo="/admin/gallery" compact />}
      tabs={[
        {
          id: "content",
          label: "Photo",
          content: (
            <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v.image.url} alt={v.alt} className="w-full rounded-card border border-line bg-surface object-cover" />
              <div className="space-y-6">
                <Section>
                  <TextInput name="alt" label="Alt text (required)" hint="Describe what the photo shows, for screen readers and search engines." />
                  <TextInput name="caption" label="Caption" />
                  <ChipsInput name="tags" label="Tags" hint="Visitors filter the gallery by these." placeholder="e.g. Screen replacement" />
                </Section>
                <Section title="Linked to">
                  <SelectInput name="serviceId" label="Service" placeholder="None" options={services} />
                  <SelectInput name="deviceId" label="Device" placeholder="None" options={devices} />
                </Section>
                <Section title="Before and after">
                  <Toggle name="isBeforeAfter" label="This is the “before” photo of a pair" hint="Shown on the site as a slider with its “after” photo." />
                  {v.isBeforeAfter && <SelectInput name="pairId" label="“After” photo" placeholder="Choose the after photo" options={others} />}
                </Section>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
