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

interface StatsStripProps {
  /** Public view highlights outcomes; the admin view highlights the queue. */
  variant?: "public" | "admin";
  className?: string;
}

export default function StatsStrip({
  variant = "public",
  className,
}: StatsStripProps) {
  const { stats, loading } = useApp();

  const items =
    variant === "admin"
      ? [
          {
            label: "کل درخواست‌ها",
            value: stats.totalCount,
            Icon: ClipboardList,
          },
          {
            label: "در انتظار بررسی",
            value: stats.byStatus.submitted ?? 0,
            Icon: AlertCircle,
          },
          {
            label: "در حال بررسی",
            value: stats.byStatus.under_review ?? 0,
            Icon: SearchCheck,
          },
          {
            label: "حل‌شده",
            value: stats.byStatus.resolved ?? 0,
            Icon: CheckCircle,
          },
        ]
      : [
          {
            label: "کل گزارش‌ها",
            value: stats.totalCount,
            Icon: ClipboardList,
          },
          {
            label: "حل‌شده",
            value: stats.byStatus.resolved ?? 0,
            Icon: CheckCircle,
          },
          {
            label: "در حال انجام",
            value: stats.byStatus.in_progress ?? 0,
            Icon: Wrench,
          },
          {
            label: "ایده‌های ثبت‌شده",
            value: stats.ideasCount,
            Icon: Lightbulb,
          },
        ];

  return (
    <div
      className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}
      aria-label="آمار مشارکت شهروندان"
    >
      {items.map(({ label, value, Icon }) => (
        <div
          key={label}
          className="border-border bg-card rounded-2xl border px-4 py-3"
        >
          <div className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </div>
          <div className="text-foreground mt-1.5 font-mono text-xl font-semibold tabular-nums">
            {loading ? "…" : toPersianDigits(value)}
          </div>
        </div>
      ))}
    </div>
  );
}
