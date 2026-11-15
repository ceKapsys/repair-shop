"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import type { GalleryItemT } from "@/lib/types";

interface BeforeAfterSliderProps {
  galleryItems?: GalleryItemT[];
}

export function BeforeAfterSlider({ galleryItems = [] }: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState<number>(50);

  // Find a before/after repair from the uploaded gallery items
  const byId = new Map(galleryItems.map((g) => [g._id, g]));
  const beforeAfterItem = galleryItems.find(
    (g) => g.isBeforeAfter && (Boolean(g.afterImage?.url) || (Boolean(g.pairId) && byId.has(g.pairId!)))
  );

  const pairItem = beforeAfterItem?.pairId ? byId.get(beforeAfterItem.pairId) : undefined;

  // Real images or fallback high-resolution repair photos
  const beforeUrl =
    beforeAfterItem?.image?.url ||
    "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1200&q=80";
  const beforeAlt = beforeAfterItem?.alt || "Shattered phone screen before repair";

  const afterUrl =
    beforeAfterItem?.afterImage?.url ||
    pairItem?.image?.url ||
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80";
  const afterAlt =
    beforeAfterItem?.afterImage?.alt || pairItem?.alt || "Repaired pristine screen after service";

  const featuredCaption =
    beforeAfterItem?.caption || "iPhone 15 Pro · Shattered OLED replaced with OEM-grade panel";

  // Filter out the paired after item so it's not repeated in other tiles
  const pairedAfterIds = new Set(
    galleryItems.filter((g) => g.isBeforeAfter && g.pairId).map((g) => g.pairId!)
  );

  const otherItems = galleryItems.filter(
    (g) => g._id !== beforeAfterItem?._id && !pairedAfterIds.has(g._id)
  );

  // Default fallback tiles if fewer than 4 other photos exist
  const defaultTiles = [
    {
      label: "MacBook Pro · battery renewal & cooling overhaul",
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
    },
    {
      label: "Camera module replacement after drop",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
    },
    {
      label: "Mobile antistatic diagnostic workbench setup",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    },
    {
      label: "iPad Pro · digitizer glass restoration",
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
      {/* Interactive Before/After Comparison Card (Spans 2 rows) */}
      <figure
        className="relative min-h-[340px] md:min-h-[460px] md:row-span-2 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface select-none shadow-xs group"
        id="ba-container"
      >
        {/* Before Layer (Base) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeUrl}
          alt={beforeAlt}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
          draggable={false}
        />

        {/* After Layer (Clipped to slider position) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={afterUrl}
          alt={afterAlt}
          className="absolute inset-0 size-full object-cover transition-[clip-path] duration-75"
          style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
          loading="lazy"
          draggable={false}
        />

        {/* Badges */}
        <span className="absolute left-3.5 top-3.5 z-10 rounded-full border border-line bg-bg/95 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-xs backdrop-blur-sm">
          Before
        </span>
        <span className="absolute right-3.5 top-3.5 z-10 rounded-full border border-line bg-bg/95 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-ink shadow-xs backdrop-blur-sm">
          After
        </span>

        {/* Divider Handle */}
        <div
          className="pointer-events-none absolute bottom-0 top-0 z-20 w-0.5 -translate-x-1/2 bg-on-primary shadow-lg transition-[left] duration-75"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-on-primary bg-night text-on-primary shadow-card">
            <GripVertical size={16} />
          </div>
        </div>

        {/* Native Range Slider over the image for smooth mouse & touch dragging */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          aria-label="Drag to compare before and after repair"
          className="absolute inset-0 z-30 size-full cursor-ew-resize opacity-0 focus-visible:opacity-100"
        />

        {/* Interactive hint on hover */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-12 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:block hidden">
          <span className="rounded-full bg-night/85 px-3 py-1 text-[11px] font-medium text-on-primary shadow-xs backdrop-blur-sm">
            Drag slider to compare
          </span>
        </div>

        {/* Caption */}
        <figcaption className="absolute bottom-3.5 left-3.5 right-3.5 z-10">
          <span className="inline-block max-w-full truncate rounded-full border border-line bg-bg/95 px-3.5 py-1.5 text-xs font-semibold text-ink shadow-xs backdrop-blur-sm">
            {featuredCaption}
          </span>
        </figcaption>
      </figure>

      {/* Other Recent Repair Tiles */}
      {[0, 1, 2, 3].map((idx) => {
        const item = otherItems[idx];
        const tile = defaultTiles[idx];
        const imageUrl = item?.image?.url || tile?.image;
        const caption = item?.caption || item?.alt || tile?.label;

        return (
          <figure
            key={item?._id || idx}
            className="group relative min-h-[220px] overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-xs transition-transform duration-200 hover:-translate-y-0.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={caption}
              className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent opacity-80" />
            <figcaption className="absolute bottom-3 left-3 right-3 flex justify-between gap-2 text-xs">
              <span className="truncate rounded-full border border-line/40 bg-bg/95 px-3 py-1 font-medium text-ink shadow-xs backdrop-blur-sm">
                {caption}
              </span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
