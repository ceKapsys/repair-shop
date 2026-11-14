"use client";

import { useState } from "react";
import { copy } from "@/content/copy";

type Img = { url: string; alt: string };

/**
 * Before/after comparison. The "after" photo is revealed with clip-path: inset(), driven by a native
 * range input laid over the image, so dragging, touch and the arrow keys all work.
 */
export function BeforeAfter({ before, after }: { before: Img; after: Img }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line select-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={before.url} alt={before.alt} className="absolute inset-0 size-full object-cover" loading="lazy" draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={after.url} alt={after.alt} className="absolute inset-0 size-full object-cover" style={{ clipPath: `inset(0 0 0 ${pos}%)` }} loading="lazy" draggable={false} />
      <span className="absolute top-3 left-3 rounded-full bg-night px-3 py-1 text-xs font-medium text-on-primary">{copy.gallery.before}</span>
      <span className="absolute top-3 right-3 rounded-full bg-night px-3 py-1 text-xs font-medium text-on-primary">{copy.gallery.after}</span>
      <span className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-on-primary" style={{ left: `${pos}%` }} aria-hidden>
        <span className="absolute top-1/2 left-1/2 size-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-on-primary bg-night" />
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={copy.static.slider}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0 focus-visible:opacity-100 focus-visible:[&::-webkit-slider-runnable-track]:bg-transparent"
      />
    </div>
  );
}
