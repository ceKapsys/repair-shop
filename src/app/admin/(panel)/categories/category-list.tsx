"use client";

import Link from "next/link";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableList } from "@/components/admin/sortable-list";
import type { CategoryT } from "@/lib/types";
import { reorderDocs } from "../actions";

export function CategoryList({ kind, items, counts, sortable }: { kind: "serviceCategory" | "postCategory"; items: CategoryT[]; counts: Record<string, number>; sortable?: boolean }) {
  const row = (c: CategoryT) => (
    <div className="flex min-h-14 items-center gap-3 py-2 pl-3">
      <Link href={`/admin/categories/${kind}/${c._id}`} className="min-w-0 flex-1 font-medium hover:text-primary">
        {c.name}
        <span className="block text-sm font-normal text-ink-soft">{counts[c._id] ?? 0} {kind === "serviceCategory" ? "services" : "posts"}</span>
      </Link>
      <DeleteButton kind={kind} id={c._id} label={c.name} compact />
    </div>
  );
  const empty = <p className="rounded-card border border-dashed border-line p-8 text-center text-sm text-ink-soft">No categories yet.</p>;
  if (sortable) return <SortableList items={items} onReorder={(ids) => reorderDocs(kind, ids)} render={row} empty={empty} />;
  if (!items.length) return empty;
  return <ul className="divide-y divide-line rounded-card border border-line bg-bg">{items.map((c) => <li key={c._id} className="pr-3">{row(c)}</li>)}</ul>;
}
