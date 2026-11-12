"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { DeleteButton } from "@/components/admin/delete-button";
import { SortableList } from "@/components/admin/sortable-list";
import { ToggleCell } from "@/components/admin/toggle-cell";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { textareaClass } from "@/components/ui/field";
import { DEVICE_TYPE_LABELS } from "@/lib/format";
import type { BrandT, DeviceT } from "@/lib/types";
import { cn } from "@/lib/utils";
import { reorderDocs } from "../actions";
import { bulkAddModels } from "./actions";

export function DeviceTree({ brands, devices }: { brands: BrandT[]; devices: DeviceT[] }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState<BrandT | null>(null);
  const byBrand = new Map<string, DeviceT[]>();
  for (const d of devices) byBrand.set(d.brandId, [...(byBrand.get(d.brandId) ?? []), d]);

  return (
    <>
      <SortableList
        items={brands}
        onReorder={(ids) => reorderDocs("brand", ids)}
        empty={<p className="rounded-[var(--radius-card)] border border-dashed border-border p-10 text-center text-muted">No brands yet. Add Apple, Samsung, Dell…</p>}
        render={(b) => {
          const models = byBrand.get(b._id) ?? [];
          const isOpen = open.has(b._id);
          return (
            <div>
              <div className="flex min-h-14 items-center gap-2">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-label={`${isOpen ? "Collapse" : "Expand"} ${b.name}`}
                  onClick={() => setOpen((s) => { const n = new Set(s); if (n.has(b._id)) n.delete(b._id); else n.add(b._id); return n; })}
                  className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-surface"
                >
                  <ChevronRight size={18} className={cn("transition-transform duration-150", isOpen && "rotate-90")} />
                </button>
                <Link href={`/admin/devices/brand/${b._id}`} className="min-w-0 flex-1 font-medium hover:text-primary">
                  {b.name}
                  <span className="block text-sm font-normal text-muted">{DEVICE_TYPE_LABELS[b.deviceType]} · {models.length} models</span>
                </Link>
                <Link href={`/admin/devices/model/new?brand=${b._id}`} className="hidden min-h-11 items-center gap-1 rounded-lg px-3 text-sm text-primary hover:bg-primary/5 sm:inline-flex"><Plus size={16} /> Model</Link>
                <button type="button" onClick={() => setBulk(b)} className="min-h-11 rounded-lg px-3 text-sm text-muted hover:bg-surface">Bulk add</button>
                <DeleteButton kind="brand" id={b._id} label={b.name} compact />
              </div>
              {isOpen && (
                <ul className="mb-3 ml-11 divide-y divide-border rounded-lg border border-border">
                  {models.length === 0 && <li className="p-3 text-sm text-muted">No models yet.</li>}
                  {models.map((d) => (
                    <li key={d._id} className="flex min-h-12 items-center gap-3 px-3">
                      <Link href={`/admin/devices/model/${d._id}`} className="min-w-0 flex-1 text-sm hover:text-primary">
                        {d.model} <span className="text-muted">· {d.repairs?.length ?? 0} repairs</span>
                      </Link>
                      <ToggleCell kind="device" id={d._id} field="isActive" value={d.isActive} label="Live" />
                      <DeleteButton kind="device" id={d._id} label={d.model} compact />
                    </li>
                  ))}
                  <li className="sm:hidden"><Link href={`/admin/devices/model/new?brand=${b._id}`} className="flex min-h-11 items-center px-3 text-sm text-primary">+ Add model</Link></li>
                </ul>
              )}
            </div>
          );
        }}
      />
      <BulkAdd brand={bulk} onClose={() => setBulk(null)} />
    </>
  );
}

function BulkAdd({ brand, onClose }: { brand: BrandT | null; onClose: () => void }) {
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Modal open={Boolean(brand)} onClose={onClose} title={`Add ${brand?.name ?? ""} models`}>
      <label htmlFor="bulk-models" className="text-sm font-medium">One model per line</label>
      <textarea id="bulk-models" rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder={"iPhone 15 Pro\niPhone 15\niPhone 14"} className={textareaClass} />
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button
          disabled={pending || !text.trim()}
          onClick={() =>
            start(async () => {
              const r = await bulkAddModels({ brandId: brand?._id, names: text });
              if (!r.ok) return void toast.error(r.error);
              toast.success(r.message);
              setText("");
              onClose();
              router.refresh();
            })
          }
        >
          {pending ? "Adding…" : "Add models"}
        </Button>
      </div>
    </Modal>
  );
}
