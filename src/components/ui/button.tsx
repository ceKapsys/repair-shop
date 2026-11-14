import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * One primary button per view. Secondary is the ink outline; tertiary is a text link.
 * Emergency red is only for emergency and destructive actions.
 */
export const buttonVariants = cva(
  "pressable inline-flex min-h-11 items-center justify-center gap-2 rounded-input px-5 text-[15px] leading-5 font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-strong dark:hover:bg-primary",
        emergency: "bg-emergency text-on-primary dark:text-night",
        outline: "border border-ink bg-transparent text-ink hover:bg-surface",
        ghost: "text-ink hover:bg-surface",
        link: "min-h-11 px-0 text-primary underline-offset-4 hover:text-primary-strong hover:underline",
        onNight: "border border-on-primary bg-transparent text-on-primary",
      },
      size: { md: "h-12", lg: "h-12 px-6 max-md:h-[52px]", sm: "h-11 px-4 text-sm" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
