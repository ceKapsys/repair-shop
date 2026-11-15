"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeftRight, GripVertical, ImagePlus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { DeleteButton } from "@/components/admin/delete-button";
import { Uploader } from "@/components/admin/image-input";
import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Badge, inputClass } from "@/components/ui/field";
import { copy } from "@/content/copy";
import type { GalleryItemT } from "@/lib/types";
import { reorderDocs, saveDoc } from "../actions";

type Pending = { url: string; width?: number; height?: number; alt: string; caption: string; error?: string };

type ImgSpec = { url: string; width?: number; height?: number };

/** Multi-upload with Before & After repair slider support and drag-to-reorder list. */
export function GalleryManager({ items, uploadsConfigured }: { items: GalleryItemT[]; uploadsConfigured: boolean }) {
  const router = useRouter();

  // Mode: "beforeAfter" (single repair with before & after photos) vs "single" (individual photos)
  const [mode, setMode] = useState<"beforeAfter" | "single">("beforeAfter");

  // Before & After state
  const [beforeImg, setBeforeImg] = useState<ImgSpec | null>(null);
  const [afterImg, setAfterImg] = useState<ImgSpec | null>(null);
  const [beforeUrlInput, setBeforeUrlInput] = useState("");
  const [afterUrlInput, setAfterUrlInput] = useState("");
  const [baCaption, setBaCaption] = useState("");
  const [baAlt, setBaAlt] = useState("");
  const [baTags, setBaTags] = useState("");
  const [sliderPos, setSliderPos] = useState(50);
  const [savingBA, setSavingBA] = useState(false);
  const [baError, setBaError] = useState("");

  // Single photos state
  const [pending, setPending] = useState<Pending[]>([]);
  const [savingSingle, setSavingSingle] = useState(false);
  const [singleUrl, setSingleUrl] = useState("");

  const patchPending = (i: number, p: Partial<Pending>) =>
    setPending((list) => list.map((x, j) => (j === i ? { ...x, ...p } : x)));

  const handleSaveBeforeAfter = async () => {
    setBaError("");
    if (!beforeImg?.url) {
      setBaError("Please upload or provide a Before photo.");
      return;
    }
    if (!afterImg?.url) {
      setBaError("Please upload or provide an After photo.");
      return;
    }
    const finalAlt = baAlt.trim() || baCaption.trim() || "Repair before and after";

    setSavingBA(true);
    try {
      const tags = baTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const r = await saveDoc("gallery", null, {
        image: { url: beforeImg.url, width: beforeImg.width, height: beforeImg.height },
        afterImage: { url: afterImg.url, width: afterImg.width, height: afterImg.height, alt: finalAlt },
        caption: baCaption.trim(),
        alt: finalAlt,
        tags,
        isBeforeAfter: true,
      });

      if (!r.ok) {
        setBaError(r.error || "Failed to save before and after repair");
        toast.error(r.error || "Failed to save");
      } else {
        toast.success("Before & after repair added to gallery!");
        setBeforeImg(null);
        setAfterImg(null);
        setBeforeUrlInput("");
        setAfterUrlInput("");
        setBaCaption("");
        setBaAlt("");
        setBaTags("");
        router.refresh();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "An error occurred";
      setBaError(msg);
      toast.error(msg);
    } finally {
      setSavingBA(false);
    }
  };

  const saveAllSingle = async () => {
    const missing = pending.map((p) => !p.alt.trim());
    if (missing.some(Boolean)) {
      setPending((list) =>
        list.map((p, i) => ({ ...p, error: missing[i] ? "Alt text is required" : undefined }))
      );
      return;
    }
    setSavingSingle(true);
    const left: Pending[] = [];
    for (const p of pending) {
      const r = await saveDoc("gallery", null, {
        image: { url: p.url, width: p.width, height: p.height },
        alt: p.alt,
        caption: p.caption,
        tags: [],
        isBeforeAfter: false,
      });
      if (!r.ok) left.push({ ...p, error: r.error });
    }
    setSavingSingle(false);
    setPending(left);
    if (left.length) toast.error("Some photos could not be saved");
    else toast.success(copy.admin.saved);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      {/* Upload Box with Mode Tabs */}
      <section className="rounded-card border border-line bg-bg p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 className="text-base font-semibold text-ink">Add to Gallery</h2>
            <p className="text-xs text-ink-soft">
              Showcase repairs to visitors. Upload a before/after repair comparison or individual workshop photos.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg border border-line bg-surface p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode("beforeAfter")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                mode === "beforeAfter"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <ArrowLeftRight size={14} />
              <span>Before &amp; After Repair</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("single")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors ${
                mode === "single"
                  ? "bg-primary text-on-primary shadow-xs"
                  : "text-ink-soft hover:text-ink"
              }`}
            >
              <ImagePlus size={14} />
              <span>Single Photos</span>
            </button>
          </div>
        </div>

        {/* MODE 1: Before & After Repair */}
        {mode === "beforeAfter" && (
          <div className="mt-5 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Before Photo */}
              <div className="space-y-3 rounded-xl border border-line bg-surface/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emergency/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emergency">
                    Before Repair <span className="text-emergency">*</span>
                  </span>
                  {beforeImg && (
                    <button
                      type="button"
                      onClick={() => setBeforeImg(null)}
                      className="text-xs text-emergency hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {beforeImg ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={beforeImg.url} alt="Before preview" className="size-full object-cover" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {uploadsConfigured && (
                      <Uploader
                        folder="gallery"
                        label="Upload Before Photo"
                        onDone={([file]) => file && setBeforeImg({ url: file.url, width: file.width, height: file.height })}
                      />
                    )}
                    <div className="flex gap-2">
                      <input
                        value={beforeUrlInput}
                        onChange={(e) => setBeforeUrlInput(e.target.value)}
                        placeholder="…or paste image URL"
                        className={`${inputClass} mt-0`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!/^(https?:\/\/|\/)/.test(beforeUrlInput.trim())}
                        onClick={() => {
                          setBeforeImg({ url: beforeUrlInput.trim() });
                          setBeforeUrlInput("");
                        }}
                      >
                        Set
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* After Photo */}
              <div className="space-y-3 rounded-xl border border-line bg-surface/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-success">
                    After Repair <span className="text-emergency">*</span>
                  </span>
                  {afterImg && (
                    <button
                      type="button"
                      onClick={() => setAfterImg(null)}
                      className="text-xs text-emergency hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {afterImg ? (
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-line bg-surface">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={afterImg.url} alt="After preview" className="size-full object-cover" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {uploadsConfigured && (
                      <Uploader
                        folder="gallery"
                        label="Upload After Photo"
                        onDone={([file]) => file && setAfterImg({ url: file.url, width: file.width, height: file.height })}
                      />
                    )}
                    <div className="flex gap-2">
                      <input
                        value={afterUrlInput}
                        onChange={(e) => setAfterUrlInput(e.target.value)}
                        placeholder="…or paste image URL"
                        className={`${inputClass} mt-0`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!/^(https?:\/\/|\/)/.test(afterUrlInput.trim())}
                        onClick={() => {
                          setAfterImg({ url: afterUrlInput.trim() });
                          setAfterUrlInput("");
                        }}
                      >
                        Set
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Live Slider Preview when both are present */}
            {beforeImg && afterImg && (
              <div className="rounded-xl border border-line bg-surface p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                    <Sparkles size={14} />
                    Live Comparison Slider Preview
                  </span>
                  <span className="text-xs text-ink-soft">Drag slider left &amp; right to test</span>
                </div>

                <div className="relative aspect-[16/9] max-h-[360px] w-full overflow-hidden rounded-lg border border-line bg-bg select-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={beforeImg.url} alt="Before preview" className="absolute inset-0 size-full object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={afterImg.url}
                    alt="After preview"
                    className="absolute inset-0 size-full object-cover"
                    style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
                  />

                  <span className="absolute left-3 top-3 rounded-full bg-night/90 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-on-primary shadow-xs">
                    Before
                  </span>
                  <span className="absolute right-3 top-3 rounded-full bg-night/90 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-on-primary shadow-xs">
                    After
                  </span>

                  <div
                    className="pointer-events-none absolute bottom-0 top-0 z-20 w-0.5 -translate-x-1/2 bg-on-primary shadow-lg"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute left-1/2 top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-on-primary bg-night text-on-primary shadow-card">
                      <GripVertical size={14} />
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    aria-label="Preview slider position"
                    className="absolute inset-0 z-30 size-full cursor-ew-resize opacity-0"
                  />
                </div>
              </div>
            )}

            {/* Repair Meta Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="ba-caption" className="text-sm font-medium text-ink">
                  Repair Title / Caption
                </label>
                <input
                  id="ba-caption"
                  value={baCaption}
                  onChange={(e) => setBaCaption(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro · Shattered OLED screen replaced in 25 mins"
                  className={inputClass}
                  maxLength={200}
                />
              </div>

              <div>
                <label htmlFor="ba-alt" className="text-sm font-medium text-ink">
                  Alt text <span className="text-emergency">*</span>
                </label>
                <input
                  id="ba-alt"
                  value={baAlt}
                  onChange={(e) => setBaAlt(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro OLED screen replacement before and after"
                  className={inputClass}
                  maxLength={200}
                />
              </div>
            </div>

            <div>
              <label htmlFor="ba-tags" className="text-sm font-medium text-ink">
                Tags (comma-separated)
              </label>
              <input
                id="ba-tags"
                value={baTags}
                onChange={(e) => setBaTags(e.target.value)}
                placeholder="e.g. iPhone, Screen replacement, Apple, Doorstep"
                className={inputClass}
                maxLength={200}
              />
            </div>

            {baError && <p role="alert" className="text-sm text-emergency">{baError}</p>}

            <Button
              type="button"
              disabled={savingBA || !beforeImg?.url || !afterImg?.url}
              onClick={handleSaveBeforeAfter}
              className="gap-2"
            >
              <Sparkles size={16} />
              <span>{savingBA ? "Saving Repair…" : "Save Before & After Repair"}</span>
            </Button>
          </div>
        )}

        {/* MODE 2: Single Photos */}
        {mode === "single" && (
          <div className="mt-5 space-y-4">
            <div className="space-y-3">
              {uploadsConfigured && (
                <Uploader
                  folder="gallery"
                  multiple
                  onDone={(files) =>
                    setPending((list) => [...list, ...files.map((f) => ({ ...f, alt: "", caption: "" }))])
                  }
                  label="Upload photos"
                />
              )}
              <div className="flex gap-2">
                <label htmlFor="single-url" className="sr-only">
                  Image URL
                </label>
                <input
                  id="single-url"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                  placeholder={uploadsConfigured ? "…or paste an image URL" : "Paste an image URL (uploads need Cloudinary keys)"}
                  className={`${inputClass} mt-0`}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={!/^(https?:\/\/|\/)/.test(singleUrl.trim())}
                  onClick={() => {
                    setPending((list) => [...list, { url: singleUrl.trim(), alt: "", caption: "" }]);
                    setSingleUrl("");
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {pending.length > 0 && (
              <>
                <ul className="mt-5 space-y-3">
                  {pending.map((p, i) => (
                    <li key={p.url + i} className="flex gap-3 rounded-input border border-line p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt="" className="size-20 shrink-0 rounded-lg bg-surface object-cover" />
                      <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2">
                        <div>
                          <label htmlFor={`alt-${i}`} className="text-sm font-medium">
                            Alt text <span className="text-emergency">*</span>
                          </label>
                          <input
                            id={`alt-${i}`}
                            value={p.alt}
                            aria-invalid={p.error ? true : undefined}
                            onChange={(e) => patchPending(i, { alt: e.target.value, error: undefined })}
                            placeholder="Describe the photo for people who can't see it"
                            className={inputClass}
                            maxLength={200}
                          />
                          {p.error && <p role="alert" className="mt-1 text-sm text-emergency">{p.error}</p>}
                        </div>
                        <div>
                          <label htmlFor={`cap-${i}`} className="text-sm font-medium">
                            Caption
                          </label>
                          <input
                            id={`cap-${i}`}
                            value={p.caption}
                            onChange={(e) => patchPending(i, { caption: e.target.value })}
                            className={inputClass}
                            maxLength={200}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPending((list) => list.filter((_, j) => j !== i))}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button type="button" className="mt-4" disabled={savingSingle} onClick={saveAllSingle}>
                  {savingSingle ? "Saving…" : `Save ${pending.length} photo${pending.length === 1 ? "" : "s"}`}
                </Button>
              </>
            )}
          </div>
        )}
      </section>

      {/* Gallery List (Drag to reorder) */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold text-ink">Gallery Photos &amp; Repairs</h3>
        <SortableList
          items={items}
          onReorder={(ids) => reorderDocs("gallery", ids)}
          empty={<p className="rounded-card border border-dashed border-line p-10 text-center text-ink-soft">No photos yet.</p>}
          render={(g) => {
            const hasAfter = Boolean(g.afterImage?.url || g.pairId);

            return (
              <div className="flex min-h-16 items-center gap-3 py-2">
                {/* Thumbnails */}
                {g.isBeforeAfter && g.afterImage?.url ? (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.image.url}
                      alt="Before"
                      title="Before"
                      className="size-12 rounded-lg border border-line bg-surface object-cover"
                    />
                    <ArrowLeftRight size={12} className="text-ink-soft shrink-0" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={g.afterImage.url}
                      alt="After"
                      title="After"
                      className="size-12 rounded-lg border border-line bg-surface object-cover"
                    />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={g.image.url} alt="" className="size-14 shrink-0 rounded-lg bg-surface object-cover" />
                )}

                <Link href={`/admin/gallery/${g._id}`} className="min-w-0 flex-1 font-medium hover:text-primary">
                  <span className="block truncate">{g.caption || g.alt}</span>
                  <span className="block truncate text-sm font-normal text-ink-soft">
                    {g.tags?.join(", ") || "No tags"}
                  </span>
                </Link>

                {g.isBeforeAfter && (
                  <Badge tone="primary">
                    {hasAfter ? "Before / After Slider" : "Needs its pair"}
                  </Badge>
                )}

                <DeleteButton kind="gallery" id={g._id} label={g.caption || g.alt} compact />
              </div>
            );
          }}
        />
      </section>
    </div>
  );
}
