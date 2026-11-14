"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { DeleteButton } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { Badge, inputClass } from "@/components/ui/field";
import { copy } from "@/content/copy";
import type { RedirectT } from "@/lib/types";
import { saveDoc } from "../actions";

/** Redirects. Changing a published slug adds one here automatically. */
export function RedirectsManager({ redirects }: { redirects: RedirectT[] }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  const [v, setV] = useState({ from: "", to: "", code: "301" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const add = () =>
    start(async () => {
      const r = await saveDoc("redirect", null, v);
      if (!r.ok) {
        setErrors(r.fieldErrors ?? {});
        return void toast.error(r.error);
      }
      setV({ from: "", to: "", code: "301" });
      setErrors({});
      toast.success(copy.admin.saved);
      router.refresh();
    });
  return (
    <div className="space-y-6">
      <form className="rounded-card border border-line bg-bg p-5" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <h2 className="text-base leading-6 font-semibold">Add a redirect</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_140px_auto] md:items-start">
          <div>
            <label htmlFor="r-from" className="text-sm font-medium">Old address</label>
            <input id="r-from" value={v.from} onChange={(e) => setV({ ...v, from: e.target.value })} placeholder="/old-page" aria-invalid={errors.from ? true : undefined} className={inputClass} />
            {errors.from && <p role="alert" className="mt-1 text-sm text-emergency">{errors.from}</p>}
          </div>
          <div>
            <label htmlFor="r-to" className="text-sm font-medium">New address</label>
            <input id="r-to" value={v.to} onChange={(e) => setV({ ...v, to: e.target.value })} placeholder="/services/screen-replacement" aria-invalid={errors.to ? true : undefined} className={inputClass} />
            {errors.to && <p role="alert" className="mt-1 text-sm text-emergency">{errors.to}</p>}
          </div>
          <div>
            <label htmlFor="r-code" className="text-sm font-medium">Type</label>
            <select id="r-code" value={v.code} onChange={(e) => setV({ ...v, code: e.target.value })} className={inputClass}>
              <option value="301">Permanent (301)</option>
              <option value="302">Temporary (302)</option>
            </select>
          </div>
          <Button type="submit" disabled={busy || !v.from || !v.to} className="md:mt-[26px]">Add</Button>
        </div>
      </form>
      {redirects.length === 0 ? (
        <p className="rounded-card border border-dashed border-line p-10 text-center text-ink-soft">No redirects. One is added for you whenever you change the address of a published page.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-bg">
          {redirects.map((r) => (
            <li key={r._id} className="flex min-h-14 flex-wrap items-center gap-3 px-4 py-2 text-sm">
              <code className="min-w-0 truncate">{r.from}</code>
              <ArrowRight size={16} className="shrink-0 text-ink-soft" aria-label="redirects to" />
              <code className="min-w-0 flex-1 truncate">{r.to}</code>
              <Badge>{r.code}</Badge>
              <DeleteButton kind="redirect" id={r._id} label={`redirect from ${r.from}`} compact />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
