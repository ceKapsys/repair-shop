"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

/** Multi-upload with required alt text per photo, then a drag-to-reorder list. */
export function GalleryManager({ items, uploadsConfigured }: { items: GalleryItemT[]; uploadsConfigured: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<Pending[]>([]);
  const [saving, setSaving] = useState(false);
  const [url, setUrl] = useState("");
  const patch = (i: number, p: Partial<Pending>) => setPending((list) => list.map((x, j) => (j === i ? { ...x, ...p } : x)));

  const saveAll = async () => {
    const missing = pending.map((p) => !p.alt.trim());
    if (missing.some(Boolean)) return setPending((list) => list.map((p, i) => ({ ...p, error: missing[i] ? "Alt text is required" : undefined })));
    setSaving(true);
    const left: Pending[] = [];
    for (const p of pending) {
      const r = await saveDoc("gallery", null, { image: { url: p.url, width: p.width, height: p.height }, alt: p.alt, caption: p.caption, tags: [], isBeforeAfter: false });
      if (!r.ok) left.push({ ...p, error: r.error });
    }
    setSaving(false);
    setPending(left);
    if (left.length) toast.error("Some photos could not be saved");
    else toast.success(copy.admin.saved);
    router.refresh();
  };

  return (
    <div className="space-y-8">
      <section className="rounded-card border border-line bg-bg p-5">
        <h2 className="text-base leading-6 font-semibold">Add photos</h2>
        <div className="mt-3 space-y-3">
          {uploadsConfigured && <Uploader folder="gallery" multiple onDone={(files) => setPending((list) => [...list, ...files.map((f) => ({ ...f, alt: "", caption: "" }))])} label="Upload photos" />}
          <div className="flex gap-2">
            <label htmlFor="gallery-url" className="sr-only">Image URL</label>
            <input id="gallery-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder={uploadsConfigured ? "…or paste an image URL" : "Paste an image URL (uploads need Cloudinary keys)"} className={`${inputClass} mt-0`} />
            <Button type="button" variant="outline" disabled={!/^(https:\/\/|\/)/.test(url.trim())} onClick={() => { setPending((list) => [...list, { url: url.trim(), alt: "", caption: "" }]); setUrl(""); }}>Add</Button>
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
                      <label htmlFor={`alt-${i}`} className="text-sm font-medium">Alt text <span className="text-emergency">*</span></label>
                      <input id={`alt-${i}`} value={p.alt} aria-invalid={p.error ? true : undefined} onChange={(e) => patch(i, { alt: e.target.value, error: undefined })} placeholder="Describe the photo for people who can't see it" className={inputClass} maxLength={200} />
                      {p.error && <p role="alert" className="mt-1 text-sm text-emergency">{p.error}</p>}
                    </div>
                    <div>
                      <label htmlFor={`cap-${i}`} className="text-sm font-medium">Caption</label>
                      <input id={`cap-${i}`} value={p.caption} onChange={(e) => patch(i, { caption: e.target.value })} className={inputClass} maxLength={200} />
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setPending((list) => list.filter((_, j) => j !== i))}>Remove</Button>
                </li>
              ))}
            </ul>
            <Button type="button" className="mt-4" disabled={saving} onClick={saveAll}>{saving ? "Saving…" : `Save ${pending.length} photo${pending.length === 1 ? "" : "s"}`}</Button>
          </>
        )}
      </section>

      <SortableList
        items={items}
        onReorder={(ids) => reorderDocs("gallery", ids)}
        empty={<p className="rounded-card border border-dashed border-line p-10 text-center text-ink-soft">No photos yet.</p>}
        render={(g) => (
          <div className="flex min-h-16 items-center gap-3 py-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={g.image.url} alt="" className="size-14 shrink-0 rounded-lg bg-surface object-cover" />
            <Link href={`/admin/gallery/${g._id}`} className="min-w-0 flex-1 font-medium hover:text-primary">
              <span className="block truncate">{g.caption || g.alt}</span>
              <span className="block truncate text-sm font-normal text-ink-soft">{g.tags?.join(", ") || "No tags"}</span>
            </Link>
            {g.isBeforeAfter && <Badge tone="primary">{g.pairId ? "Before / after" : "Needs its pair"}</Badge>}
            <DeleteButton kind="gallery" id={g._id} label={g.caption || g.alt} compact />
          </div>
        )}
      />
    </div>
  );
}
