"use client";

import Link from "next/link";
import { Siren } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableList } from "@/components/admin/sortable-list";
import { ToggleCell } from "@/components/admin/toggle-cell";
import { Badge } from "@/components/ui/field";
import { priceLabel } from "@/lib/format";
import type { CategoryT, ServiceT } from "@/lib/types";
import { reorderDocs } from "../actions";

export function ServiceList({ services, categories, currency }: { services: ServiceT[]; categories: CategoryT[]; currency: string }) {
  const cat = new Map(categories.map((c) => [c._id, c.name]));
  return (
    <SortableList
      items={services}
      onReorder={(ids) => reorderDocs("service", ids)}
      empty={<p className="rounded-card border border-dashed border-line p-10 text-center text-ink-soft">No services yet. Create your first one.</p>}
      render={(s) => (
        <div className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 py-2">
          <Link href={`/admin/services/${s._id}`} className="min-w-0 flex-1 font-medium hover:text-primary">
            {s.title}
            <span className="block text-sm font-normal text-ink-soft">
              {[s.categoryId && cat.get(s.categoryId), priceLabel(s, currency) ?? "Price hidden"].filter(Boolean).join(" · ")}
            </span>
          </Link>
          {s.isEmergencyAvailable && <Badge tone="emergency"><Siren size={12} /> Emergency</Badge>}
          <ToggleCell kind="service" id={s._id} field="showPrice" value={s.showPrice} label="Price" />
          <ToggleCell kind="service" id={s._id} field="isActive" value={s.isActive} label="Live" />
          <DeleteButton kind="service" id={s._id} label={s.title} compact />
        </div>
      )}
    />
  );
}
