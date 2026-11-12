import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-input)] px-5 text-[15px] font-semibold whitespace-nowrap disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-1",
        emergency: "bg-emergency text-white shadow-1",
        outline: "border border-border bg-background text-foreground",
        ghost: "text-foreground hover:bg-surface",
      },
      size: { md: "h-11", lg: "h-12 px-6 text-base", sm: "h-11 px-3 text-sm" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
