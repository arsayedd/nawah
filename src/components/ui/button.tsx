import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cobalt/40 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-cobalt text-white hover:bg-[#1d4ed8] shadow-sm",
        mint: "bg-mint text-navy hover:bg-[#14c09c]",
        navy: "bg-navy text-white hover:bg-[#0b2752]",
        coral: "bg-coral text-white hover:bg-[#f06648]",
        outline:
          "border border-navy/10 bg-white text-navy hover:bg-navy/[0.03]",
        ghost: "text-navy/80 hover:bg-navy/[0.06]",
        darkGhost: "text-white/80 hover:bg-white/10",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-5",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
