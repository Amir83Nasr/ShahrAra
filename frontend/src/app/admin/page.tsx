"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { ClipboardList, Home, ShieldAlert } from "lucide-react";
import { useApp } from "../providers";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";
import { AdminPageSkeleton } from "@/components/skeletons";

export default function AdminPage() {
  const {
    currentUser,
    authReady,
    requests,
    updateStatus,
    refresh,
    theme,
    loading,
    loadError,
  } = useApp();

  // Wait for localStorage session restore before deciding
  if (!authReady) {
    return <AdminPageSkeleton />;
  }

  if (!currentUser?.isAdmin) {
    return (
      <section className="mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-lg flex-col items-center justify-center px-4 py-10 text-center md:min-h-[calc(100dvh-5rem)]">
        <div className="border-destructive/15 bg-destructive/[0.06] text-destructive ring-destructive/10 mb-5 flex size-16 items-center justify-center rounded-3xl border ring-1 ring-inset">
          <ShieldAlert className="size-7" strokeWidth={1.8} />
        </div>

        <h1 className="text-foreground text-lg font-extrabold sm:text-xl">
          دسترسی غیرمجاز
        </h1>
        <p className="text-muted-foreground mt-2 max-w-sm text-[13px] leading-7 sm:text-sm">
          دسترسی به پنل مدیریت نیازمند ورود با حساب کاربری مدیر است. اگر مدیر
          سامانه هستید، دوباره وارد شوید.
        </p>

        <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
          <Button asChild className="h-11 w-full sm:flex-1">
            <Link href="/">
              <Home />
              <span>بازگشت به خانه</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-11 w-full sm:flex-1">
            <Link href="/reports">
              <ClipboardList />
              <span>مشاهده گزارش‌ها</span>
            </Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <AdminPanel
      requests={requests}
      onUpdateStatus={updateStatus}
      onRefresh={() => refresh({ force: true })}
      theme={theme}
      loading={loading}
      loadError={loadError}
    />
  );
}
