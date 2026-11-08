"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "group/toggle inline-flex cursor-pointer items-center justify-center gap-1 rounded-lg text-sm font-medium whitespace-nowrap outline-none transition duration-150 ease-out active:translate-y-px active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 aria-pressed:bg-muted [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-input bg-transparent hover:bg-muted",
      },
      size: {
        xs: "h-7 min-w-7 px-2 text-xs has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5",
        default:
          "h-10 min-w-10 px-3 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
        lg: "h-11 min-w-11 px-4 has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ToggleProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof toggleVariants> {
  pressed?: boolean;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  (
    { className, variant = "default", size = "default", pressed, ...props },
    ref,
  ) => (
    <button
      ref={ref}
      data-slot="toggle"
      aria-pressed={pressed}
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  ),
);
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };
