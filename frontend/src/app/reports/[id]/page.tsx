"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertCircleIcon, ChevronRight } from "lucide-react";
import { useApp } from "../../providers";
import ReportDetail from "@/components/ReportDetail";
import { Button } from "@/components/ui/button";
import { LoadErrorState, ReportDetailSkeleton } from "@/components/skeletons";

export default function ReportPage() {
  const { requests, currentUser, like, refresh, theme, loading, loadError } =
    useApp();
  const params = useParams<{ id: string }>();

  // The provider loads the full request list, so a deep link resolves as soon
  // as that first fetch settles. Unknown ids get a friendly empty state.
  const item = requests.find((request) => request.id === params.id);

  if (item) {
    return (
      <ReportDetail
        item={item}
        currentUser={currentUser}
        onLike={like}
        theme={theme}
      />
    );
  }

  if (loading) {
    return <ReportDetailSkeleton />;
  }

  if (loadError && requests.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8">
        <LoadErrorState
          message={loadError}
          onRetry={() => refresh({ force: true })}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-20 text-center">
      <span className="bg-muted flex size-16 items-center justify-center rounded-full">
        <AlertCircleIcon className="text-muted-foreground size-8" />
      </span>
      <div className="space-y-2">
        <h1 className="text-foreground text-xl font-extrabold">
          گزارش مورد نظر یافت نشد
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed font-medium">
          ممکن است این گزارش حذف شده باشد یا نشانی آن درست نباشد.
        </p>
      </div>
      <Button asChild variant="outline" className="gap-1.5">
        <Link href="/reports">
          <ChevronRight className="size-4" />
          بازگشت به فهرست گزارش‌ها
        </Link>
      </Button>
    </div>
  );
}
