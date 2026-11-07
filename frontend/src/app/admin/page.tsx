"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { Home, ShieldAlert } from "lucide-react";
import { useApp } from "../providers";
import AdminPanel from "@/components/AdminPanel";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const { currentUser, authReady, requests, updateStatus, refresh, theme } =
    useApp();

  // Wait for localStorage session restore before deciding
  if (!authReady) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-20">
        <span className="border-muted border-t-foreground size-8 animate-spin rounded-full border-2"></span>
        <span className="text-sm">در حال بررسی دسترسی...</span>
      </div>
    );
  }

  if (!currentUser?.isAdmin) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <div className="bg-muted flex size-14 items-center justify-center rounded-full">
          <ShieldAlert className="text-muted-foreground size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground text-xl font-semibold tracking-tight">
            دسترسی غیرمجاز
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            دسترسی به پنل مدیریت نیازمند ورود با حساب کاربری مدیر است.
          </p>
        </div>
        <Button asChild>
          <Link href="/">
            <Home />
            بازگشت به صفحه اصلی
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <AdminPanel
      requests={requests}
      onUpdateStatus={updateStatus}
      onRefresh={() => refresh({ force: true })}
      theme={theme}
    />
  );
}
