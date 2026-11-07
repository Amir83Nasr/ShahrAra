"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { UserRound } from "lucide-react";
import { useApp } from "@/app/providers";
import { Button } from "@/components/ui/button";

/**
 * Shared auth gate for profile pages: loading spinner while the session is
 * restored, sign-in prompt when logged out, children when logged in.
 */
export default function ProfileGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, authReady } = useApp();

  // Wait for localStorage session restore before deciding
  if (!authReady) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-20">
        <span className="border-muted border-t-foreground size-8 animate-spin rounded-full border-2"></span>
        <span className="text-sm">در حال بارگذاری اطلاعات شهرآرا...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <div className="bg-muted flex size-14 items-center justify-center rounded-full">
          <UserRound className="text-muted-foreground size-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground text-xl font-semibold tracking-tight">
            ابتدا وارد حساب خود شوید
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            برای مشاهده پروفایل و درخواست‌های خود باید وارد حساب کاربری شوید.
          </p>
        </div>
        <Button asChild>
          <Link href="/login">ورود به حساب کاربری</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
