"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { FileText, Home, UserRound } from "lucide-react";
import { useApp } from "../providers";
import UserProfile from "@/components/UserProfile";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { currentUser, authReady, requests, like, refresh } = useApp();

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
        <Button asChild size="lg" className="font-bold">
          <Link href="/">
            <Home className="h-4 w-4" />
            بازگشت به صفحه اصلی
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <UserProfile
      currentUser={currentUser}
      requests={requests}
      onLike={like}
      onRefresh={() => refresh({ force: true })}
    />
  );
}
