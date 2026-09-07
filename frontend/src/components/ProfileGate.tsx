"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { LogIn, UserRound } from "lucide-react";
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
      <div className="text-primary flex flex-col items-center justify-center gap-3 py-20">
        <span className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"></span>
        <span className="text-sm font-semibold">
          در حال بارگذاری اطلاعات شهرآرا...
        </span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 px-4 py-24 text-center">
        <div className="border-border bg-card flex h-20 w-20 items-center justify-center rounded-full border">
          <UserRound className="text-muted-foreground h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground text-2xl font-extrabold">
            ابتدا وارد حساب خود شوید
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-medium">
            برای مشاهده پروفایل و درخواست‌های خود باید وارد حساب کاربری شوید.
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="h-12 px-8 text-base font-bold"
        >
          <Link href="/login">
            <LogIn className="h-4 w-4" />
            ورود به حساب کاربری
          </Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
