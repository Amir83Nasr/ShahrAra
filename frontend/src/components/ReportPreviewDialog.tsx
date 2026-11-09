"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { ArrowLeft, CalendarDays, Heart, MapPin } from "lucide-react";
import { RequestItem } from "../types";
import { toPersianDigits } from "../utils/numberUtils";
import {
  STATUS_BADGE_CLASS,
  STATUS_LABELS,
  TYPE_BADGE_CLASS,
  TYPE_LABELS,
} from "../utils/requestBadges";
import { formatPersian } from "../utils/persianDate";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

interface ReportPreviewDialogProps {
  item: RequestItem | null;
  onClose: () => void;
}

/**
 * Quick summary shown when a marker is picked on the map. It deliberately
 * stays lightweight (no map, no tracking code) and sends the reader to the
 * report's own page for the full story.
 */
export default function ReportPreviewDialog({
  item,
  onClose,
}: ReportPreviewDialogProps) {
  return (
    <ResponsiveDialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent className="z-[60] max-sm:p-4 sm:max-w-lg">
        {item && (
          <>
            <ResponsiveDialogHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn("font-semibold", TYPE_BADGE_CLASS[item.type])}
                >
                  {TYPE_LABELS[item.type]}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold",
                    STATUS_BADGE_CLASS[item.status],
                  )}
                >
                  {STATUS_LABELS[item.status] ?? item.status}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {item.category}
                </Badge>
              </div>

              <ResponsiveDialogTitle className="text-start text-base leading-snug font-extrabold">
                {item.title}
              </ResponsiveDialogTitle>

              <ResponsiveDialogDescription className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-start text-[11px] font-bold">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5 shrink-0" />
                  {toPersianDigits(item.region)}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="size-3.5 shrink-0" />
                  {toPersianDigits(formatPersian(item.createdAt, "yyyy/MM/dd"))}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="size-3.5 shrink-0" />
                  {toPersianDigits(item.likes)} حمایت
                </span>
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            <p className="bg-muted text-foreground/75 line-clamp-4 rounded-2xl border p-3.5 text-xs leading-relaxed font-semibold whitespace-pre-wrap">
              {item.description}
            </p>

            <p className="text-muted-foreground text-center text-[10.5px] font-semibold">
              برای دیدن توضیحات کامل، موقعیت روی نقشه و پاسخ رسمی، صفحهٔ گزارش
              را باز کنید.
            </p>

            <ResponsiveDialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                بستن
              </Button>
              <Button asChild onClick={onClose} className="w-full sm:w-auto">
                <Link href={`/reports/${encodeURIComponent(item.id)}`}>
                  مشاهده گزارش کامل
                  <ArrowLeft />
                </Link>
              </Button>
            </ResponsiveDialogFooter>
          </>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
