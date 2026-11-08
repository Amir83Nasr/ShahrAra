"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { AlertCircle, Loader2, Map as MapIcon, RefreshCcw } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Report / request cards ───────────────────────────────────────

export function ReportCardSkeleton() {
  return (
    <div className="border-border bg-card flex flex-col gap-2.5 rounded-2xl border px-4 py-5 sm:px-5">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="mt-1 flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

/** Skeleton cards laid out exactly like the report/profile grids. */
export function ReportCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <ReportCardSkeleton key={index} />
      ))}
    </>
  );
}

/** Compact card skeleton used by the admin queue. */
export function AdminRowSkeleton() {
  return (
    <div className="border-border bg-card flex flex-col gap-2.5 rounded-xl border px-4 py-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-2/3" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function AdminRowsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, index) => (
        <AdminRowSkeleton key={index} />
      ))}
    </>
  );
}

// ── Profile ──────────────────────────────────────────────────────

export function ProfilePageSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="در حال بارگذاری پروفایل"
    >
      <div className="bg-card mb-6 rounded-2xl border p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        <ReportCardsSkeleton count={6} />
      </div>
    </div>
  );
}

// ── Notifications ────────────────────────────────────────────────

export function NotificationsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul
      className="flex flex-col gap-2"
      aria-busy="true"
      aria-label="در حال دریافت اعلان‌ها"
    >
      {Array.from({ length: count }, (_, index) => (
        <li
          key={index}
          className="flex items-start gap-3 rounded-xl border p-3"
        >
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ── Full-page shells ─────────────────────────────────────────────

/** Submit form shell shown while the saved session is restored. */
export function FormPageSkeleton() {
  return (
    <div
      className="mx-auto max-w-5xl px-4 py-6 sm:py-8"
      aria-busy="true"
      aria-label="در حال بارگذاری فرم ثبت گزارش"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="order-last flex flex-col gap-6 lg:order-first lg:col-span-4">
          <div className="bg-card flex flex-col gap-3 rounded-2xl border p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-3/4" />
          </div>
          <div className="bg-card flex flex-col gap-3 rounded-2xl border p-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
        <div className="bg-card flex flex-col gap-5 rounded-2xl border p-4 sm:p-6 md:p-8 lg:col-span-8">
          <Skeleton className="h-5 w-48" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-11 w-full rounded-full" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Admin dashboard shell shown while the manager session is restored. */
export function AdminPageSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8"
      aria-busy="true"
      aria-label="در حال بارگذاری پنل مدیریت"
    >
      <div className="mb-8 flex items-center gap-4">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-64 max-w-full" />
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="border-border bg-card rounded-2xl border px-3.5 py-3 sm:px-4"
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-2 h-6 w-10" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-7">
          <div className="bg-card flex flex-col gap-4 rounded-2xl border p-4 sm:p-5">
            <Skeleton className="h-11 w-full rounded-full" />
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-11 w-full" />
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <AdminRowsSkeleton count={4} />
          </div>
        </div>
        <div className="bg-card hidden h-72 rounded-2xl border lg:col-span-5 lg:block" />
      </div>
    </div>
  );
}

// ── Map ──────────────────────────────────────────────────────────

/** Shown while the lazy maplibre chunk is downloaded. */
export function MapSkeleton() {
  return (
    <div
      className="bg-muted/30 flex h-full min-h-40 w-full flex-col items-center justify-center gap-2"
      aria-busy="true"
      aria-label="در حال بارگذاری نقشه"
    >
      <MapIcon className="text-muted-foreground/40 size-8 animate-pulse motion-reduce:animate-none" />
      <span className="text-muted-foreground text-xs font-semibold">
        در حال بارگذاری نقشه…
      </span>
    </div>
  );
}

// ── Shared states ────────────────────────────────────────────────

export function RefreshIndicator({
  show,
  label = "در حال بروزرسانی…",
  className,
}: {
  show: boolean;
  label?: string;
  className?: string;
}) {
  if (!show) return null;
  return (
    <span
      role="status"
      aria-live="polite"
      className={cn(
        "text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium",
        className,
      )}
    >
      <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" />
      {label}
    </span>
  );
}

/** Inline failure state with a retry button, used when a list has no data. */
export function LoadErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "border-border bg-card col-span-full flex flex-col items-center rounded-2xl border p-10 text-center",
        className,
      )}
    >
      <AlertCircle className="text-destructive/70 mx-auto mb-3 h-9 w-9" />
      <p className="text-foreground text-sm font-extrabold">
        بارگذاری اطلاعات انجام نشد
      </p>
      <p className="text-muted-foreground mt-1 max-w-sm text-xs leading-relaxed font-medium">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          <RefreshCcw />
          تلاش دوباره
        </Button>
      )}
    </div>
  );
}
