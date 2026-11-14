import { cn } from "@/lib/utils";

export const inputClass =
  "mt-1.5 block h-11 w-full rounded-input border border-line bg-bg px-3 text-base text-ink placeholder:text-ink-soft/70 aria-[invalid=true]:border-emergency disabled:opacity-60";
export const textareaClass = inputClass.replace("h-11", "min-h-24 py-2.5");

export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
  counter,
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  className?: string;
  counter?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {counter}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-emergency">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-soft">{hint}</p>
      ) : null}
    </div>
  );
}

export function Switch({
  id,
  checked,
  onChange,
  label,
  hint,
  className,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  hint?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {hint && <p className="text-sm text-ink-soft">{hint}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-150",
          checked ? "bg-primary" : "bg-line",
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full bg-on-primary shadow-card transition-transform duration-150 [transition-timing-function:var(--ease-out)]",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: "neutral" | "primary" | "success" | "warning" | "emergency"; className?: string }) {
  const tones = {
    neutral: "bg-surface text-ink-soft border-line",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    emergency: "bg-emergency/10 text-emergency border-emergency/20",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-line/60", className)} />;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-card border border-line bg-bg p-5 shadow-card", className)}>{children}</div>;
}
