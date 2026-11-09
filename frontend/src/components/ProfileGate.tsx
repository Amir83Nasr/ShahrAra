"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { useApp } from "@/app/providers";
import { Button } from "@/components/ui/button";
import {
  ProfileAuthSkeleton,
  ProfilePageSkeleton,
} from "@/components/skeletons";

function storedSessionSnapshot(): boolean {
  try {
    return Boolean(window.localStorage.getItem("shahr_ara_user"));
  } catch {
    return false;
  }
}

/**
 * Shared auth gate for profile pages: a session-shaped skeleton while the
 * session is restored, sign-in prompt when logged out, children when logged in.
 *
 * The server cannot know whether a visitor is signed in, so it renders the
 * neutral auth skeleton. The saved session is only read after the hydration
 * pass completes (useState starts as `false` on both sides, so the first
 * render always matches the server HTML); reading it in a layout effect then
 * swaps in the route-shaped profile skeleton before the first paint, so a
 * logged-out citizen never sees a fake logged-in profile flash before the
 * sign-in card.
 */
export default function ProfileGate({
  children,
  variant = "hub",
}: {
  children: React.ReactNode;
  variant?: "hub" | "list" | "settings";
}) {
  const { currentUser, authReady } = useApp();
  const [hasStoredSession, setHasStoredSession] = useState(false);

  useLayoutEffect(() => {
    // queueMicrotask keeps setState out of the effect body (eslint
    // react-hooks/set-state-in-effect) while still running before paint.
    queueMicrotask(() => {
      setHasStoredSession(storedSessionSnapshot());
    });
  }, []);

  // Wait for localStorage session restore before deciding
  if (!authReady) {
    return hasStoredSession ? (
      <ProfilePageSkeleton variant={variant} />
    ) : (
      <ProfileAuthSkeleton />
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
        <Button asChild>
          <Link href="/login">ورود به حساب کاربری</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
