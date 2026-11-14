"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { copy, fill } from "@/content/copy";
import { inputClass } from "@/components/ui/field";

type Model = { id: string; name: string; href: string; year?: number };

/** Searchable model list for a brand. */
export function ModelSearch({ brand, models }: { brand: string; models: Model[] }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = needle ? models.filter((m) => m.name.toLowerCase().includes(needle)) : models;
  const label = fill(copy.misc.searchModels, { brand });
  return (
    <div>
      {models.length > 6 && (
        <label className="relative block max-w-md">
          <span className="sr-only">{label}</span>
          <Search size={20} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-steel" aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={copy.booking.device.searchPlaceholder} className={`${inputClass} mt-0 h-12 pl-10`} />
        </label>
      )}
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
        {shown.map((m) => (
          <li key={m.id}>
            <Link href={m.href} className="pressable flex min-h-16 items-center justify-between gap-3 rounded-card border border-line bg-bg px-5 py-3 hover:border-steel">
              <span className="font-medium">{m.name}</span>
              {m.year ? <span className="num text-ink-soft">{m.year}</span> : null}
            </Link>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="mt-2 text-ink-soft">{copy.misc.noModelMatch}</p>}
    </div>
  );
}
