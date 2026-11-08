import * as React from "react";

import { cn } from "@/lib/utils";

/** Placeholder block shown while a section's data is still loading. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "bg-muted/80 animate-pulse rounded-md motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
