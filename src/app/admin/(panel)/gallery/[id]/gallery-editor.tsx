"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GripVertical, Sparkles } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { EditorShell, Section } from "@/components/admin/editor-shell";
import { ChipsInput, SelectInput, TextInput, Toggle, useEntityForm } from "@/components/admin/form";
import { ImageUrlInput } from "@/components/admin/image-input";
import type { GalleryItemT } from "@/lib/types";
import { galleryInput } from "@/lib/validation/admin";
import { saveDoc } from "../../actions";

type Opt = { value: string; label: string; url?: string };

export function GalleryEditor({
  item,
  others,
  services,
  devices,
}: {
  item: GalleryItemT;
  others: Opt[];
  services: Opt[];
  devices: Opt[];
}) {
  const router = useRouter();
  const [sliderPos, setSliderPos] = useState(50);

  const form = useEntityForm({
    initial: {
      ...item,
      image: item.image ?? { url: "" },
      afterImage: item.afterImage ?? { url: "" },
      deviceId: item.deviceId ?? "",
      serviceId: item.serviceId ?? "",
      pairId: item.pairId ?? "",
      caption: item.caption ?? "",
      tags: item.tags ?? [],
    },
    schema: galleryInput,
    save: (v) => {
      const payload: Record<string, unknown> = {
        ...v,
        afterImage: v.isBeforeAfter && v.afterImage?.url ? v.afterImage : undefined,
      };
      return saveDoc("gallery", item._id, payload);
    },
    onSaved: () => router.push("/admin/gallery"),
  });

  const v = form.values;

  // Resolve after image URL (from afterImage or linked pair)
  const pairMatch = others.find((o) => o.value === v.pairId);
  const afterUrl = v.afterImage?.url || pairMatch?.url || "";

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
          label: "Repair Photo",
          content: (
            <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
              {/* Left Column: Visual Preview */}
              <div className="space-y-4">
                {/* Real-time Slider Preview if Before/After is enabled and after photo is present */}
                {v.isBeforeAfter && v.image?.url && afterUrl ? (
                  <div className="rounded-xl border border-line bg-surface p-3 shadow-xs">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                        <Sparkles size={14} />
                        Live Slider Preview
                      </span>
                      <span className="text-xs text-ink-soft">Drag to test</span>
                    </div>

                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line bg-bg select-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.image.url} alt="Before" className="absolute inset-0 size-full object-cover" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={afterUrl}
                        alt="After"
                        className="absolute inset-0 size-full object-cover"
                        style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                      />

                      <span className="absolute left-2.5 top-2.5 rounded-full bg-night/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-on-primary">
                        Before
                      </span>
                      <span className="absolute right-2.5 top-2.5 rounded-full bg-night/90 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-on-primary">
                        After
                      </span>

                      <div
                        className="pointer-events-none absolute bottom-0 top-0 z-20 w-0.5 -translate-x-1/2 bg-on-primary shadow-lg"
                        style={{ left: `${sliderPos}%` }}
                      >
                        <div className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-on-primary bg-night text-on-primary shadow-card">
                          <GripVertical size={13} />
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderPos}
                        onChange={(e) => setSliderPos(Number(e.target.value))}
                        aria-label="Drag to test preview slider"
                        className="absolute inset-0 z-30 size-full cursor-ew-resize opacity-0"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-line bg-surface p-3 shadow-xs">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-soft">
                      {v.isBeforeAfter ? "Before Photo Preview" : "Photo Preview"}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={v.image?.url}
                      alt={v.alt || "Preview"}
                      className="aspect-[4/3] w-full rounded-lg border border-line bg-surface object-cover"
                    />
                  </div>
                )}

                {/* Before Photo Source */}
                <Section title="Before Photo Source">
                  <ImageUrlInput
                    name="image.url"
                    label="“Before” Photo URL"
                    folder="gallery"
                    hint="Primary photo of the device before repair."
                  />
                </Section>
              </div>

              {/* Right Column: Metadata & Controls */}
              <div className="space-y-6">
                <Section title="Repair Information">
                  <TextInput
                    name="caption"
                    label="Headline / Caption"
                    placeholder="e.g. iPhone 15 Pro · Screen & Glass Replacement in 25 mins"
                  />
                  <TextInput
                    name="alt"
                    label="Alt text (required)"
                    hint="Describe what the photo shows for search engines and accessibility."
                  />
                  <ChipsInput
                    name="tags"
                    label="Tags"
                    hint="Visitors filter the gallery by these tags."
                    placeholder="e.g. Screen replacement, iPhone, Apple"
                  />
                </Section>

                {/* Before & After Section */}
                <Section
                  title="Before & After Slider Comparison"
                  description="When enabled, this repair displays with a real-time comparison slider on the site."
                >
                  <Toggle
                    name="isBeforeAfter"
                    label="Enable Before &amp; After Comparison Slider"
                    hint="Displays with a real-time slider on the homepage and /gallery page."
                  />

                  {v.isBeforeAfter && (
                    <div className="mt-4 space-y-4 rounded-xl border border-line bg-surface/50 p-4">
                      <ImageUrlInput
                        name="afterImage.url"
                        label="“After” Photo"
                        folder="gallery"
                        hint="Upload or paste URL for the repaired device photo."
                      />

                      <div className="pt-2">
                        <SelectInput
                          name="pairId"
                          label="…or link to another gallery item as “After” photo"
                          placeholder="None (using uploaded after photo above)"
                          options={others}
                        />
                      </div>
                    </div>
                  )}
                </Section>

                <Section title="Linked Catalogue Items">
                  <SelectInput name="serviceId" label="Service" placeholder="None" options={services} />
                  <SelectInput name="deviceId" label="Device" placeholder="None" options={devices} />
                </Section>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
