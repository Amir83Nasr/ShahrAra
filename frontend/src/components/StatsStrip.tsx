"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AlertCircle,
  CheckCircle,
  ClipboardList,
  Lightbulb,
  SearchCheck,
  Wrench,
} from "lucide-react";
import { useApp } from "@/app/providers";
import { toPersianDigits } from "@/utils/numberUtils";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsStripProps {
  /** Public view highlights outcomes; the admin view highlights the queue. */
  variant?: "public" | "admin";
  className?: string;
}

interface StatItem {
  label: string;
  value: number;
  hint: string;
  Icon: typeof ClipboardList;
  tone: string;
  glow: string;
}

export default function StatsStrip({
  variant = "public",
  className,
}: StatsStripProps) {
  const { stats, loading } = useApp();

  const resolved = stats.byStatus.resolved ?? 0;
  const resolvedPercent =
    stats.totalCount > 0 ? Math.round((resolved / stats.totalCount) * 100) : 0;

  const items: StatItem[] =
    variant === "admin"
      ? [
          {
            label: "کل درخواست‌ها",
            value: stats.totalCount,
            hint: "در سامانه",
            Icon: ClipboardList,
            tone: "bg-primary/10 text-primary",
            glow: "bg-primary/25",
          },
          {
            label: "در انتظار بررسی",
            value: stats.byStatus.submitted ?? 0,
            hint: "صف بررسی",
            Icon: AlertCircle,
            tone: "bg-status-submitted/10 text-status-submitted",
            glow: "bg-status-submitted/25",
          },
          {
            label: "در حال بررسی",
            value: stats.byStatus.under_review ?? 0,
            hint: "کارشناسان",
            Icon: SearchCheck,
            tone: "bg-status-under-review/10 text-status-under-review",
            glow: "bg-status-under-review/25",
          },
          {
            label: "حل‌شده",
            value: resolved,
            hint: `${toPersianDigits(resolvedPercent)}٪`,
            Icon: CheckCircle,
            tone: "bg-status-resolved/10 text-status-resolved",
            glow: "bg-status-resolved/25",
          },
        ]
      : [
          {
            label: "کل گزارش‌ها",
            value: stats.totalCount,
            hint: "در قم",
            Icon: ClipboardList,
            tone: "bg-primary/10 text-primary",
            glow: "bg-primary/25",
          },
          {
            label: "حل‌شده",
            value: resolved,
            hint: `${toPersianDigits(resolvedPercent)}٪ از کل`,
            Icon: CheckCircle,
            tone: "bg-status-resolved/10 text-status-resolved",
            glow: "bg-status-resolved/25",
          },
          {
            label: "در حال انجام",
            value: stats.byStatus.in_progress ?? 0,
            hint: "در مسیر اجرا",
            Icon: Wrench,
            tone: "bg-status-in-progress/10 text-status-in-progress",
            glow: "bg-status-in-progress/25",
          },
          {
            label: "ایده‌های ثبت‌شده",
            value: stats.ideasCount,
            hint: "پیشنهاد شهروندی",
            Icon: Lightbulb,
            tone: "bg-type-idea/10 text-type-idea",
            glow: "bg-type-idea/25",
          },
        ];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3.5",
        className,
      )}
      aria-label="آمار مشارکت شهروندان"
      aria-busy={loading}
    >
      {items.map(({ label, value, hint, Icon, tone, glow }) => (
        <div
          key={label}
          className="group border-border/70 bg-card/85 hover:border-primary/25 relative overflow-hidden rounded-2xl border p-3.5 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-4"
        >
          <div
            aria-hidden
            className={cn(
              "absolute -end-7 -top-7 size-16 rounded-full opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
              glow,
            )}
          />

          <div className="relative flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-muted-foreground truncate text-[11px] font-medium">
                {label}
              </div>
              {loading ? (
                <Skeleton className="mt-2 h-7 w-12" />
              ) : (
                <div className="text-foreground mt-1.5 text-[22px] leading-none font-extrabold tabular-nums sm:text-2xl">
                  {toPersianDigits(value)}
                </div>
              )}
            </div>

            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:size-9",
                tone,
              )}
            >
              <Icon className="size-4" />
            </div>
          </div>

          <div className="text-muted-foreground relative mt-1.5 truncate text-[10px] font-medium">
            {loading ? "در حال دریافت…" : hint}
          </div>
        </div>
      ))}
    </div>
  );
}
