"use client";

import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/field";
import { toggleDoc } from "@/app/admin/(panel)/actions";
import type { Kind } from "@/app/admin/(panel)/registry";

export function ToggleCell({ kind, id, field, value, label }: { kind: Kind; id: string; field: string; value: boolean; label: string }) {
  const [optimistic, set] = useOptimistic(value);
  const [, start] = useTransition();
  return (
    <Switch
      id={`${field}-${id}`}
      label={<span className="sr-only sm:not-sr-only sm:text-xs sm:font-normal sm:text-muted">{label}</span>}
      checked={optimistic}
      onChange={(v) =>
        start(async () => {
          set(v);
          const r = await toggleDoc(kind, id, field, v);
          if (!r.ok) toast.error(r.error);
        })
      }
      className="items-center gap-2"
    />
  );
}
