"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * دکمه‌های اپ ChatGPT:
 * - همهٔ دکمه‌ها قرصی‌شکل (rounded-full) با گردی کامل
 * - ارتفاع ۴۰px پیش‌فرض، ۳۲px کوچک و ۴۸px بزرگ برای لمس راحت در موبایل
 * - دکمه‌های آیکونی دایره‌ای و هم‌اندازه
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-transparent bg-clip-padding text-sm leading-none font-medium whitespace-nowrap outline-none select-none transition duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ring/40 active:translate-y-px active:scale-[0.96] disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/75",
        outline:
          "border-border bg-background text-foreground hover:bg-muted active:bg-accent dark:bg-transparent dark:hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent active:bg-accent/80",
        ghost:
          "text-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 aria-expanded:bg-accent",
        destructive:
          "text-destructive hover:bg-destructive/10 active:bg-destructive/15 focus-visible:ring-destructive/30",
        link: "h-auto rounded-none px-0 text-foreground underline-offset-4 hover:underline active:scale-100 active:translate-y-0",
      },
      size: {
        default:
          "h-10 px-4 has-data-[icon=inline-end]:pe-3 has-data-[icon=inline-start]:ps-3",
        sm: "h-8 px-3 text-xs has-data-[icon=inline-end]:pe-2.5 has-data-[icon=inline-start]:ps-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 px-6 text-[15px] has-data-[icon=inline-end]:pe-5 has-data-[icon=inline-start]:ps-5",
        icon: "size-10 p-0",
        "icon-xs": "size-7 p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
