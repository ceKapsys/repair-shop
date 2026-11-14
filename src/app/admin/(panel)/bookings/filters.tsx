"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { inputClass } from "@/components/ui/field";
import type { BookingFilters } from "@/lib/booking-admin";
import { cn } from "@/lib/utils";

const STATUS_TABS = [
  ["open", "Open"],
  ["new", "New"],
  ["confirmed", "Confirmed"],
  ["on-the-way", "On the way"],
  ["in-progress", "In progress"],
  ["done", "Done"],
  ["cancelled", "Cancelled"],
  ["all", "All"],
] as const;

export function BookingFiltersBar({ filters, areas }: { filters: BookingFilters; areas: string[] }) {
  const router = useRouter();
  const path = usePathname();
  const [q, setQ] = useState(filters.q ?? "");
  const push = (patch: Partial<BookingFilters>) => {
    const next = { ...filters, ...patch };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]);
    router.replace(`${path}?${qs}`, { scroll: false });
  };
  useEffect(() => {
    if ((filters.q ?? "") === q) return;
    const t = setTimeout(() => push({ q: q || undefined }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const sel = `${inputClass} mt-0 w-auto`;
  return (
    <div className="mb-5 space-y-3">
      <div role="tablist" aria-label="Status" className="-mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
        {STATUS_TABS.map(([v, label]) => (
          <button
            key={v}
            role="tab"
            aria-selected={(filters.status ?? "open") === v}
            onClick={() => push({ status: v })}
            className={cn("min-h-10 shrink-0 rounded-full px-3.5 text-sm", (filters.status ?? "open") === v ? "bg-ink text-bg" : "text-ink-soft hover:bg-bg")}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input aria-label="Search bookings" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone, booking no., device…" className={`${inputClass} mt-0 pl-9`} />
        </div>
        <select aria-label="Type" value={filters.type ?? ""} onChange={(e) => push({ type: e.target.value || undefined })} className={sel}>
          <option value="">All types</option>
          <option value="emergency">Emergency</option>
          <option value="standard">Standard</option>
        </select>
        {areas.length > 1 && (
          <select aria-label="Area" value={filters.area ?? ""} onChange={(e) => push({ area: e.target.value || undefined })} className={sel}>
            <option value="">All areas</option>
            {areas.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        )}
        <label className="flex items-center gap-1.5 text-sm text-ink-soft">
          From <input type="date" value={filters.from ?? ""} onChange={(e) => push({ from: e.target.value || undefined })} className={sel} />
        </label>
        <label className="flex items-center gap-1.5 text-sm text-ink-soft">
          To <input type="date" value={filters.to ?? ""} onChange={(e) => push({ to: e.target.value || undefined })} className={sel} />
        </label>
      </div>
    </div>
  );
}
