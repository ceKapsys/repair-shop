"use client";

import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import type { ZodType } from "zod";
import { toast } from "sonner";
import { zodErrors, type ActionResult } from "@/lib/action";
import { getPath, setPath } from "@/lib/path";
import { slugify } from "@/lib/utils";
import { Field, inputClass, Switch, textareaClass } from "@/components/ui/field";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Values = Record<string, any>;

type FormApi = {
  values: Values;
  get: (path: string) => any;
  set: (path: string, value: unknown) => void;
  errors: Record<string, string | undefined>;
  blur: (path: string) => void;
  isNew: boolean;
  dirty: boolean;
  saving: boolean;
  savedAt?: Date;
  submit: (opts?: { silent?: boolean }) => Promise<ActionResult | undefined>;
};

const Ctx = createContext<FormApi | null>(null);
export const useForm = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useForm outside <FormProvider>");
  return c;
};
export function FormProvider({ form, children }: { form: FormApi; children: React.ReactNode }) {
  return <Ctx.Provider value={form}>{children}</Ctx.Provider>;
}

/**
 * Client form state for admin editors: shared Zod schema for on-blur + on-save validation,
 * dirty tracking with an unsaved-changes guard, Ctrl/Cmd+S, and optional autosave.
 */
export function useEntityForm({
  initial,
  schema,
  save,
  isNew = false,
  autosaveMs,
  canAutosave,
  onSaved,
}: {
  initial: Values;
  schema: ZodType;
  save: (values: Values) => Promise<ActionResult>;
  isNew?: boolean;
  autosaveMs?: number;
  canAutosave?: (v: Values) => boolean;
  onSaved?: (r: ActionResult & { ok: true }) => void;
}): FormApi {
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date>();
  const ref = useRef(values);
  ref.current = values;
  const savingRef = useRef(false);

  const set = useCallback((path: string, value: unknown) => {
    setValues((v) => setPath(v, path, value));
    setDirty(true);
  }, []);

  const blur = useCallback(
    (path: string) => {
      const r = schema.safeParse(ref.current);
      const msg = r.success ? undefined : zodErrors(r.error)[path];
      setErrors((e) => (e[path] === msg ? e : { ...e, [path]: msg }));
    },
    [schema],
  );

  const submit = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (savingRef.current) return;
      const r = schema.safeParse(ref.current);
      if (!r.success) {
        const errs = zodErrors(r.error);
        setErrors(errs);
        if (!opts?.silent) {
          toast.error("Please fix the highlighted fields", { description: Object.values(errs)[0] });
          requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
        }
        return;
      }
      savingRef.current = true;
      setSaving(true);
      const snapshot = ref.current;
      try {
        const res = await save(snapshot);
        if (res.ok) {
          setErrors({});
          if (ref.current === snapshot) setDirty(false);
          setSavedAt(new Date());
          if (!opts?.silent) toast.success(res.message ?? "Saved");
          onSaved?.(res);
        } else {
          setErrors(res.fieldErrors ?? {});
          if (!opts?.silent) toast.error(res.error);
        }
        return res;
      } catch (err) {
        if (!opts?.silent) toast.error(err instanceof Error ? err.message : "Save failed");
      } finally {
        savingRef.current = false;
        setSaving(false);
      }
    },
    [save, schema, onSaved],
  );

  // Ctrl/Cmd + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [submit]);

  // Unsaved-changes guard: tab close/reload, and in-app link clicks.
  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.href.startsWith("tel:") || a.href.startsWith("mailto:")) return;
      if (!window.confirm("You have unsaved changes. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  // Autosave (drafts only, decided by canAutosave)
  useEffect(() => {
    if (!autosaveMs || !dirty || isNew) return;
    const t = setTimeout(() => {
      if (!canAutosave || canAutosave(ref.current)) void submit({ silent: true });
    }, autosaveMs);
    return () => clearTimeout(t);
  }, [autosaveMs, dirty, values, isNew, canAutosave, submit]);

  return { values, get: (p) => getPath(values, p), set, errors, blur, isNew, dirty, saving, savedAt, submit };
}

/* ---------------------------------------------------------------- fields */

function useBind(name: string) {
  const f = useForm();
  const id = useId() + name;
  const error = f.errors[name];
  return {
    f,
    id,
    error,
    a11y: {
      id,
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${id}-error` : `${id}-hint`,
      onBlur: () => f.blur(name),
    },
  };
}

function Counter({ len, min, max }: { len: number; min?: number; max: number }) {
  const tone = len > max ? "text-emergency" : min && len >= min ? "text-success" : "text-ink-soft";
  return <span className={`text-xs tabular-nums ${tone}`}>{len}/{max}</span>;
}

export function TextInput({
  name,
  label,
  hint,
  placeholder,
  type = "text",
  counter,
  className,
  autoFocus,
}: {
  name: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  placeholder?: string;
  type?: string;
  counter?: { min?: number; max: number };
  className?: string;
  autoFocus?: boolean;
}) {
  const { f, id, error, a11y } = useBind(name);
  const v = (f.get(name) ?? "") as string;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className} counter={counter && <Counter len={v.length} {...counter} />}>
      <input {...a11y} type={type} value={v} placeholder={placeholder} autoFocus={autoFocus} onChange={(e) => f.set(name, e.target.value)} className={inputClass} />
    </Field>
  );
}

export function TextArea({
  name,
  label,
  hint,
  rows = 3,
  counter,
  className,
  placeholder,
}: {
  name: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  rows?: number;
  counter?: { min?: number; max: number };
  className?: string;
  placeholder?: string;
}) {
  const { f, id, error, a11y } = useBind(name);
  const v = (f.get(name) ?? "") as string;
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className} counter={counter && <Counter len={v.length} {...counter} />}>
      <textarea {...a11y} rows={rows} value={v} placeholder={placeholder} onChange={(e) => f.set(name, e.target.value)} className={textareaClass} />
    </Field>
  );
}

export function NumberInput({ name, label, hint, className, step = "any", prefix }: { name: string; label: React.ReactNode; hint?: React.ReactNode; className?: string; step?: string; prefix?: string }) {
  const { f, id, error, a11y } = useBind(name);
  const v = f.get(name);
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute top-1/2 left-3 mt-0.75 -translate-y-1/2 text-sm text-ink-soft">{prefix}</span>}
        <input
          {...a11y}
          type="number"
          inputMode="decimal"
          step={step}
          min={0}
          value={v ?? ""}
          onChange={(e) => f.set(name, e.target.value === "" ? undefined : Number(e.target.value))}
          className={`${inputClass} ${prefix ? "pl-12" : ""}`}
        />
      </div>
    </Field>
  );
}

export function Toggle({ name, label, hint, className }: { name: string; label: React.ReactNode; hint?: React.ReactNode; className?: string }) {
  const f = useForm();
  const id = useId() + name;
  return <Switch id={id} label={label} hint={hint} checked={Boolean(f.get(name))} onChange={(v) => f.set(name, v)} className={className} />;
}

export function SelectInput({
  name,
  label,
  options,
  hint,
  className,
  placeholder,
}: {
  name: string;
  label: React.ReactNode;
  options: { value: string; label: string }[];
  hint?: React.ReactNode;
  className?: string;
  placeholder?: string;
}) {
  const { f, id, error, a11y } = useBind(name);
  return (
    <Field id={id} label={label} hint={hint} error={error} className={className}>
      <select {...a11y} value={(f.get(name) ?? "") as string} onChange={(e) => f.set(name, e.target.value)} className={inputClass}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  );
}

/** Slug that follows the source field for new docs until edited by hand. */
export function SlugInput({ name = "slug", source, prefix, hint }: { name?: string; source: string; prefix: string; hint?: string }) {
  const { f, id, error, a11y } = useBind(name);
  const manual = useRef(!f.isNew);
  const src = (f.get(source) ?? "") as string;
  useEffect(() => {
    if (!manual.current) f.set(name, slugify(src));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
  return (
    <Field id={id} label="URL slug" error={error} hint={hint ?? (f.isNew ? undefined : "Changing the slug of a live page adds a 301 redirect from the old URL.")}>
      <div className="mt-1.5 flex items-stretch overflow-hidden rounded-input border border-line">
        <span className="hidden items-center bg-surface px-3 text-sm text-ink-soft sm:flex">{prefix}</span>
        <input
          {...a11y}
          value={(f.get(name) ?? "") as string}
          onChange={(e) => {
            manual.current = true;
            f.set(name, slugify(e.target.value) + (e.target.value.endsWith("-") ? "-" : ""));
          }}
          className="h-11 min-w-0 flex-1 bg-bg px-3 text-base outline-offset-[-2px]"
        />
      </div>
    </Field>
  );
}

export function ChipsInput({ name, label, hint, placeholder }: { name: string; label: React.ReactNode; hint?: React.ReactNode; placeholder?: string }) {
  const { f, id, error } = useBind(name);
  const chips = (f.get(name) ?? []) as string[];
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) f.set(name, Array.from(new Set([...chips, ...parts])));
    setDraft("");
  };
  return (
    <Field id={id} label={label} hint={hint ?? "Press Enter or comma to add"} error={error}>
      <div className="mt-1.5 flex min-h-11 flex-wrap items-center gap-1.5 rounded-input border border-line bg-bg px-2 py-1.5">
        {chips.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 rounded-full bg-surface py-0.5 pr-1 pl-2.5 text-sm">
            {c}
            <button type="button" aria-label={`Remove ${c}`} onClick={() => f.set(name, chips.filter((x) => x !== c))} className="flex size-6 items-center justify-center rounded-full text-ink-soft hover:bg-line">×</button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          placeholder={chips.length ? "" : placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && chips.length) f.set(name, chips.slice(0, -1));
          }}
          onBlur={add}
          className="h-8 min-w-24 flex-1 bg-transparent px-1 text-base outline-none"
        />
      </div>
    </Field>
  );
}

/** Searchable multi-select for ids (e.g. devices a service supports). */
export function MultiCheck({ name, label, options, hint }: { name: string; label: React.ReactNode; options: { value: string; label: string; group?: string }[]; hint?: React.ReactNode }) {
  const f = useForm();
  const id = useId();
  const selected = new Set((f.get(name) ?? []) as string[]);
  const [q, setQ] = useState("");
  const shown = options.filter((o) => !q || `${o.group ?? ""} ${o.label}`.toLowerCase().includes(q.toLowerCase()));
  const toggle = (v: string) => {
    const next = new Set(selected);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    f.set(name, Array.from(next));
  };
  return (
    <Field id={id} label={<>{label} <span className="font-normal text-ink-soft">({selected.size} selected)</span></>} hint={hint}>
      <input id={id} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className={inputClass} />
      <div className="mt-2 max-h-64 overflow-y-auto rounded-input border border-line">
        {shown.length === 0 && <p className="p-3 text-sm text-ink-soft">Nothing found.</p>}
        {shown.map((o) => (
          <label key={o.value} className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-line px-3 last:border-0 hover:bg-surface">
            <input type="checkbox" checked={selected.has(o.value)} onChange={() => toggle(o.value)} className="size-4 accent-primary" />
            <span className="text-sm">{o.group && <span className="text-ink-soft">{o.group} · </span>}{o.label}</span>
          </label>
        ))}
      </div>
    </Field>
  );
}

export function FaqList({ name, label = "FAQs" }: { name: string; label?: string }) {
  const f = useForm();
  const items = (f.get(name) ?? []) as { question: string; answer: string }[];
  return (
    <fieldset>
      <legend className="text-sm font-medium">{label}</legend>
      <p className="text-sm text-ink-soft">Use real customer questions. Shown on the page and marked up for Google.</p>
      <div className="mt-3 space-y-4">
        {items.map((_, i) => (
          <div key={i} className="rounded-input border border-line p-4">
            <TextInput name={`${name}.${i}.question`} label={`Question ${i + 1}`} />
            <TextArea name={`${name}.${i}.answer`} label="Answer" className="mt-3" />
            <button type="button" className="mt-2 min-h-11 text-sm text-emergency" onClick={() => f.set(name, items.filter((__, j) => j !== i))}>
              Remove question
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="mt-3 min-h-11 text-sm font-medium text-primary" onClick={() => f.set(name, [...items, { question: "", answer: "" }])}>
        + Add question
      </button>
    </fieldset>
  );
}
