"use client";

import { useState } from "react";
import { GripVertical } from "lucide-react";
import type { GalleryItemT } from "@/lib/types";

interface BeforeAfterSliderProps {
  galleryItems?: GalleryItemT[];
}

export function BeforeAfterSlider({ galleryItems = [] }: BeforeAfterSliderProps) {
  const [sliderPos, setSliderPos] = useState<number>(50);

  // Default fallback tiles matching the uploaded design
  const defaultTiles = [
    { label: "MacBook Air · keyboard refresh" },
    { label: "PS5 · HDMI port replacement" },
    { label: "Apple Watch · battery renewal" },
    { label: "AirPods Pro · acoustic restoration" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
      {/* Interactive Before/After Split Card (Spans 2 rows) */}
      <figure
        className="relative min-h-[340px] md:min-h-[460px] md:row-span-2 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface select-none"
        id="ba-container"
      >
        {/* Before Layer (Base) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, var(--color-surface) 0 14px, var(--color-line) 14px 15px)`,
          }}
        />

        {/* After Layer (Clipped) */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-[clip-path] duration-75"
          style={{
            clipPath: `inset(0 0 0 ${sliderPos}%)`,
            backgroundImage: `repeating-linear-gradient(45deg, var(--color-mist) 0 14px, color-mix(in srgb, var(--color-mist) 70%, var(--color-bg)) 14px 15px)`,
          }}
        />

        {/* Tags */}
        <span className="absolute left-3 top-3 z-10 rounded-full border border-line bg-bg/90 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink shadow-xs backdrop-blur-sm">
          Before
        </span>
        <span className="absolute right-3 top-3 z-10 rounded-full border border-line bg-bg/90 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink shadow-xs backdrop-blur-sm">
          After
        </span>

        {/* Divider Handle */}
        <div
          className="pointer-events-none absolute bottom-0 top-0 z-20 w-0.5 -translate-x-1/2 bg-bg shadow-lg transition-[left] duration-75"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg text-ink shadow-card">
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
          aria-label="Compare before and after repair photo"
          className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
        />

        {/* Caption */}
        <figcaption className="absolute bottom-3 left-3 right-3 z-10 flex justify-between gap-2 text-xs">
          <span className="rounded-full border border-line bg-bg/95 px-3 py-1 font-medium text-ink shadow-xs backdrop-blur-sm">
            Galaxy S24 · shattered display vs pristine screen
          </span>
        </figcaption>
      </figure>

      {/* Other Recent Repair Tiles */}
      {defaultTiles.map((tile, idx) => {
        const item = galleryItems[idx];
        const caption = item?.caption || tile.label;
        return (
          <figure
            key={tile.label}
            className="relative min-h-[220px] overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface"
            style={{
              backgroundImage: item?.image?.url
                ? `url(${item.image.url})`
                : `repeating-linear-gradient(135deg, var(--color-surface) 0 14px, var(--color-line) 14px 15px)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <figcaption className="absolute bottom-3 left-3 right-3 flex justify-between gap-2 text-xs">
              <span className="rounded-full border border-line bg-bg/95 px-3 py-1 font-medium text-ink shadow-xs backdrop-blur-sm">
                {caption}
              </span>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
