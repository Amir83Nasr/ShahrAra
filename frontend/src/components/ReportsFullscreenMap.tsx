"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { MapPin, X } from "lucide-react";
import { RequestItem } from "../types";
import { REGIONS } from "../utils/regionUtils";
import { toPersianDigits } from "../utils/numberUtils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapSkeleton } from "@/components/skeletons";

// maplibre-gl touches `window` at import time; skip prerendering
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

interface ReportsFullscreenMapProps {
  open: boolean;
  onClose: () => void;
  items: RequestItem[];
  onSelectItem: (item: RequestItem) => void;
  theme?: "light" | "dark";
  region: string;
  onRegionChange: (region: string) => void;
  /** Keep Escape for the report details dialog when it is open on top. */
  escapeDisabled?: boolean;
}

export default function ReportsFullscreenMap({
  open,
  onClose,
  items,
  onSelectItem,
  theme = "light",
  region,
  onRegionChange,
  escapeDisabled = false,
}: ReportsFullscreenMapProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !escapeDisabled) onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, escapeDisabled, onClose]);

  const mapItems = useMemo(
    () =>
      region === "all" ? items : items.filter((item) => item.region === region),
    [items, region],
  );

  if (!open) return null;

  return createPortal(
    <div
      className="bg-background fixed inset-0 z-50 flex flex-col pt-[env(safe-area-inset-top)]"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="نقشه گزارش‌ها"
    >
      {/* Toolbar */}
      <div className="border-border bg-background/90 supports-backdrop-filter:bg-background/70 z-20 flex items-center justify-between gap-3 border-b px-3 py-2.5 backdrop-blur-xl sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="text-primary size-4 shrink-0" />
          <span className="text-foreground truncate text-sm font-extrabold">
            نقشه گزارش‌ها
          </span>
          <span className="text-muted-foreground shrink-0 font-mono text-[11px] font-bold">
            {toPersianDigits(mapItems.length)} مورد
          </span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          aria-label="بستن نقشه"
          title="بستن نقشه"
          className="shrink-0 rounded-full"
        >
          <X />
        </Button>
      </div>

      {/* Map fills the rest of the viewport */}
      <div className="relative min-h-0 flex-1">
        <MapComponent
          pickerMode={false}
          items={mapItems}
          onSelectItem={onSelectItem}
          theme={theme}
          locateButton
        />

        {/* Region filter — click a region to see only its reports */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-black/35 to-transparent pt-3 pb-10">
          <div
            className="no-scrollbar pointer-events-auto flex gap-2 overflow-x-auto px-3 pb-0.5"
            role="group"
            aria-label="فیلتر گزارش‌ها بر اساس منطقه"
          >
            <button
              type="button"
              onClick={() => onRegionChange("all")}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md transition-colors",
                region === "all"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background/90 text-foreground hover:bg-background",
              )}
              aria-pressed={region === "all"}
            >
              همه مناطق
            </button>
            {REGIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => onRegionChange(r)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold whitespace-nowrap shadow-sm backdrop-blur-md transition-colors",
                  region === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background/90 text-foreground hover:bg-background",
                )}
                aria-pressed={region === r}
              >
                {toPersianDigits(r)}
              </button>
            ))}
          </div>
        </div>

        {mapItems.length === 0 && (
          <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center px-4">
            <div className="border-border bg-background/95 rounded-full border px-4 py-2 text-xs font-bold shadow-lg backdrop-blur">
              گزارشی در این منطقه ثبت نشده است.
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
