"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/** Native <dialog> modal: focus trap, Esc to close and inert background come for free. */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
  variant = "center",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  variant?: "center" | "drawer";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      className={cn(
        "bg-background text-foreground shadow-3 backdrop:bg-slate-950/40",
        variant === "center"
          ? "modal-pop m-auto w-[calc(100%-2rem)] max-w-lg rounded-[var(--radius-card)] p-0"
          : "drawer-slide my-0 mr-0 ml-auto h-dvh max-h-dvh w-full max-w-xl p-0",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-surface">
          <X size={20} strokeWidth={1.5} />
        </button>
      </div>
      <div className={cn("p-5", variant === "drawer" && "h-[calc(100dvh-77px)] overflow-y-auto")}>{open && children}</div>
    </dialog>
  );
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  body,
  confirmLabel = "Delete",
  destructive = true,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  body?: React.ReactNode;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      {body && <div className="text-muted">{body}</div>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button variant={destructive ? "emergency" : "primary"} onClick={onConfirm} autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
