"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { copy, fill } from "@/content/copy";
import { drawerSpring, dur, ease } from "@/lib/motion";
import { BeforeAfter } from "./before-after";

export type GalleryEntry = {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  tags: string[];
  /** Set when this entry is a before/after pair. */
  after?: { url: string; alt: string };
};

/** Filterable photo grid with a keyboard-operable lightbox (Esc, arrows) that can be dragged away. */
export function GalleryGrid({ items }: { items: GalleryEntry[] }) {
  const reduce = useReducedMotion();
  const tags = [...new Set(items.flatMap((i) => i.tags))].sort();
  const [tag, setTag] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const shown = tag ? items.filter((i) => i.tags.includes(tag)) : items;
  const photos = shown.filter((i) => !i.after);
  const index = photos.findIndex((p) => p.id === open);
  const current = index >= 0 ? photos[index] : null;

  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);
  const step = useCallback((d: number) => setOpen((id) => {
    const i = photos.findIndex((p) => p.id === id);
    return i < 0 ? id : photos[(i + d + photos.length) % photos.length].id;
  }), [photos]);

  useEffect(() => {
    if (!current) return;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [current, close, step]);

  const chip = (on: boolean) => `inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium ${on ? "border-mist bg-mist text-ink" : "border-line bg-bg hover:bg-surface"}`;
  const round = "flex size-11 items-center justify-center rounded-full bg-night text-on-primary";

  return (
    <>
      {tags.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button type="button" aria-pressed={!tag} onClick={() => setTag(null)} className={chip(!tag)}>{copy.gallery.all}</button>
          {tags.map((t) => (
            <button key={t} type="button" aria-pressed={tag === t} onClick={() => setTag(t)} className={chip(tag === t)}>{t}</button>
          ))}
        </div>
      )}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((g) => (
            <m.li key={g.id} layout={!reduce} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: dur.small, ease: ease.out }} className={g.after ? "col-span-2" : ""}>
              {g.after ? (
                <figure>
                  <BeforeAfter before={{ url: g.url, alt: g.alt }} after={g.after} />
                  {g.caption && <figcaption className="mt-2 text-sm leading-5 text-ink-soft">{g.caption}</figcaption>}
                </figure>
              ) : (
                <button type="button" onClick={(e) => { opener.current = e.currentTarget; setOpen(g.id); }} className="pressable block w-full" aria-label={g.alt}>
                  <m.img layoutId={reduce ? undefined : `photo-${g.id}`} src={g.url} alt="" loading="lazy" className="aspect-[4/3] w-full rounded-card border border-line object-cover" />
                </button>
              )}
            </m.li>
          ))}
        </AnimatePresence>
      </ul>

      <AnimatePresence>
        {current && (
          <m.div
            role="dialog"
            aria-modal="true"
            aria-label={fill(copy.static.photoOf, { index: index + 1, total: photos.length })}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-scrim p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: dur.small } }}
            transition={{ duration: dur.medium }}
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <m.figure
              drag={reduce ? false : "y"}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.6}
              onDragEnd={(_, info) => (Math.abs(info.offset.y) > 120 || Math.abs(info.velocity.y) > 500) && close()}
              className="max-h-full max-w-5xl"
            >
              <m.img layoutId={reduce ? undefined : `photo-${current.id}`} transition={drawerSpring} src={current.url} alt={current.alt} className="max-h-[78dvh] w-auto rounded-card object-contain" draggable={false} />
              {current.caption && <figcaption className="mt-3 text-center text-[15px] leading-6 text-on-primary">{current.caption}</figcaption>}
            </m.figure>
            <button ref={closeBtn} type="button" onClick={close} aria-label={copy.gallery.close} className={`${round} absolute top-4 right-4`}><X size={24} strokeWidth={1.75} aria-hidden /></button>
            {photos.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label={copy.gallery.previous} className={`${round} absolute top-1/2 left-4 -translate-y-1/2`}><ChevronLeft size={24} strokeWidth={1.75} aria-hidden /></button>
                <button type="button" onClick={() => step(1)} aria-label={copy.gallery.next} className={`${round} absolute top-1/2 right-4 -translate-y-1/2`}><ChevronRight size={24} strokeWidth={1.75} aria-hidden /></button>
              </>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
