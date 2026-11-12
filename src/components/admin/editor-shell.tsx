"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormProvider, useForm } from "./form";

type FormApi = ReturnType<typeof useForm>;

function SaveState({ form }: { form: FormApi }) {
  if (form.saving) return <span className="text-sm text-muted">Saving…</span>;
  if (form.dirty) return <span className="text-sm text-warning">Unsaved changes</span>;
  if (form.savedAt) return <span className="text-sm text-muted">Saved {form.savedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span>;
  return null;
}

/** Page frame for every admin editor: back link, title, save state, tabs (Content / SEO / …). */
export function EditorShell({
  form,
  title,
  backHref,
  viewHref,
  tabs,
  actions,
  saveLabel = "Save",
}: {
  form: FormApi;
  title: string;
  backHref: string;
  viewHref?: string;
  tabs: { id: string; label: string; content: React.ReactNode }[];
  actions?: React.ReactNode;
  saveLabel?: string;
}) {
  const [tab, setTab] = useState(tabs[0].id);
  const tabErrors = (id: string) => (id === "seo" ? Object.keys(form.errors).some((k) => k.startsWith("seo.") && form.errors[k]) : false);
  return (
    <FormProvider form={form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.submit();
        }}
        noValidate
      >
        <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-8">
            <Link href={backHref} aria-label="Back" className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-surface">
              <ArrowLeft size={20} strokeWidth={1.5} />
            </Link>
            <h1 className="min-w-0 flex-1 truncate text-lg font-semibold">{title}</h1>
            <SaveState form={form} />
            {viewHref && !form.isNew && (
              <a href={viewHref} target="_blank" rel="noopener" className="hidden min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm text-muted hover:bg-surface sm:inline-flex">
                View <ExternalLink size={16} strokeWidth={1.5} />
              </a>
            )}
            {actions}
            <Button type="submit" disabled={form.saving}>
              {form.saving && <Loader2 size={18} className="animate-spin" />}
              {saveLabel}
            </Button>
          </div>
          {tabs.length > 1 && (
            <div role="tablist" className="flex gap-1 overflow-x-auto px-4 md:px-8">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => setTab(t.id)}
                  className={cn("relative min-h-11 px-3 text-sm whitespace-nowrap text-muted", tab === t.id && "font-medium text-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary")}
                >
                  {t.label}
                  {tabErrors(t.id) && <span className="ml-1.5 inline-block size-2 rounded-full bg-emergency" aria-label="has errors" />}
                </button>
              ))}
            </div>
          )}
        </header>
        <div className="px-4 py-6 md:px-8">
          {tabs.map((t) => (
            <div key={t.id} role="tabpanel" hidden={tab !== t.id}>
              {t.content}
            </div>
          ))}
        </div>
      </form>
    </FormProvider>
  );
}

export function Section({ title, description, children, className }: { title?: string; description?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[var(--radius-card)] border border-border bg-background p-5 md:p-6", className)}>
      {title && <h2 className="text-base font-semibold">{title}</h2>}
      {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      <div className={cn("space-y-5", title && "mt-5")}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 px-4 pt-6 md:px-8 md:pt-8">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
