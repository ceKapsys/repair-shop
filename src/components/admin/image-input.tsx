"use client";

import { useId, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/upload-client";
import { Field, inputClass } from "@/components/ui/field";
import { useForm } from "./form";

function Uploader({ folder, onDone, multiple, label = "Upload" }: { folder: string; onDone: (u: { url: string; width?: number; height?: number }[]) => void; multiple?: boolean; label?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const out = [];
      for (const file of Array.from(files)) out.push(await uploadImage(file, folder));
      onDone(out);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); void handle(e.dataTransfer.files); }}
      className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-[var(--radius-input)] border-2 border-dashed p-4 text-center text-sm ${drag ? "border-primary bg-primary/5" : "border-border"}`}
    >
      <input ref={ref} type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={(e) => handle(e.target.files)} tabIndex={-1} />
      <button type="button" onClick={() => ref.current?.click()} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 font-medium text-primary hover:bg-primary/5">
        {busy ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} strokeWidth={1.5} />}
        {busy ? "Uploading…" : label}
      </button>
      <span className="text-muted">or drag {multiple ? "images" : "an image"} here</span>
    </div>
  );
}

/** Single image URL field (string) with upload. */
export function ImageUrlInput({ name, label, folder, hint }: { name: string; label: string; folder: string; hint?: string }) {
  const f = useForm();
  const id = useId();
  const url = (f.get(name) ?? "") as string;
  return (
    <Field id={id} label={label} hint={hint} error={f.errors[name]}>
      <div className="mt-1.5 flex gap-3">
        {url && (
          <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="size-full object-contain" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <Uploader folder={folder} onDone={([u]) => f.set(name, u.url)} label={url ? "Replace" : "Upload"} />
          <div className="flex gap-2">
            <input id={id} value={url} onChange={(e) => f.set(name, e.target.value)} placeholder="…or paste an image URL" className={`${inputClass} mt-0`} />
            {url && (
              <button type="button" aria-label="Remove image" onClick={() => f.set(name, "")} className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface">
                <Trash2 size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Field>
  );
}

/** Array of {url, alt} images with required alt text. */
export function ImageListInput({ name, label, folder, max = 12, single }: { name: string; label: string; folder: string; max?: number; single?: boolean }) {
  const f = useForm();
  const raw = f.get(name);
  const items = (single ? (raw ? [raw] : []) : raw ?? []) as { url: string; alt: string; width?: number; height?: number }[];
  const write = (next: typeof items) => f.set(name, single ? next[0] ?? null : next);
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <div className="mt-2 space-y-3">
        {items.map((img, i) => (
          <div key={img.url + i} className="flex gap-3 rounded-[var(--radius-input)] border border-border p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt="" className="size-20 shrink-0 rounded-lg bg-surface object-cover" />
            <div className="min-w-0 flex-1">
              <label className="text-sm font-medium" htmlFor={`${name}-alt-${i}`}>Alt text <span className="text-emergency">*</span></label>
              <input
                id={`${name}-alt-${i}`}
                value={img.alt ?? ""}
                aria-invalid={f.errors[`${name}${single ? "" : `.${i}`}.alt`] ? true : undefined}
                onChange={(e) => write(items.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                onBlur={() => f.blur(`${name}${single ? "" : `.${i}`}.alt`)}
                placeholder="Describe the photo, e.g. “Cracked iPhone 13 screen before repair”"
                className={inputClass}
              />
              {f.errors[`${name}${single ? "" : `.${i}`}.alt`] && <p className="mt-1 text-sm text-emergency">{f.errors[`${name}${single ? "" : `.${i}`}.alt`]}</p>}
            </div>
            <button type="button" aria-label="Remove image" onClick={() => write(items.filter((_, j) => j !== i))} className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface">
              <Trash2 size={18} strokeWidth={1.5} />
            </button>
          </div>
        ))}
        {items.length < (single ? 1 : max) && (
          <>
            <Uploader folder={folder} multiple={!single} onDone={(ups) => write([...items, ...ups.map((u) => ({ ...u, alt: "" }))].slice(0, single ? 1 : max))} />
            <UrlAdder onAdd={(url) => write([...items, { url, alt: "" }])} />
          </>
        )}
      </div>
    </fieldset>
  );
}

function UrlAdder({ onAdd }: { onAdd: (url: string) => void }) {
  const [v, setV] = useState("");
  return (
    <div className="flex gap-2">
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder="…or paste an image URL" aria-label="Image URL" className={`${inputClass} mt-0`} />
      <button type="button" disabled={!/^https?:\/\//.test(v)} onClick={() => { onAdd(v); setV(""); }} className="min-h-11 shrink-0 rounded-lg border border-border px-4 text-sm font-medium disabled:opacity-40">Add</button>
    </div>
  );
}

export { Uploader };
