"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/dialog";
import { deleteDoc, restoreDoc } from "@/app/admin/(panel)/actions";
import type { Kind } from "@/app/admin/(panel)/registry";

/** Confirm → delete → toast with Undo (re-inserts the same document). */
export function DeleteButton({ kind, id, label, redirectTo, compact }: { kind: Kind; id: string; label: string; redirectTo?: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = () =>
    start(async () => {
      setOpen(false);
      const res = await deleteDoc(kind, id);
      if (!res.ok) return void toast.error(res.error);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
      toast.success(`Deleted “${label}”`, {
        duration: 8000,
        action: {
          label: "Undo",
          onClick: async () => {
            const r = await restoreDoc(kind, res.data);
            if (r.ok) {
              toast.success("Restored");
              router.refresh();
            } else toast.error(r.error);
          },
        },
      });
    });
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        aria-label={`Delete ${label}`}
        className={compact ? "flex size-11 items-center justify-center rounded-lg text-ink-soft hover:bg-emergency/10 hover:text-emergency" : "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-emergency hover:bg-emergency/10"}
      >
        <Trash2 size={18} strokeWidth={1.5} />
        {!compact && "Delete"}
      </button>
      <ConfirmDialog open={open} onCancel={() => setOpen(false)} onConfirm={run} title={`Delete “${label}”?`} body="You can undo this for a few seconds after deleting." />
    </>
  );
}
