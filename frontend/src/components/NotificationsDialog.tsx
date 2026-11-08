"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Inbox, MessageSquare } from "lucide-react";
import { useApp } from "@/app/providers";
import { NotificationItem } from "@/types";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { formatPersian } from "@/utils/persianDate";
import { toPersianDigits } from "@/utils/numberUtils";

interface NotificationsDialogProps {
  /** Close the mobile drawer when a notification opens another page. */
  onNavigate?: () => void;
}

export default function NotificationsDialog({
  onNavigate,
}: NotificationsDialogProps) {
  const router = useRouter();
  const {
    currentUser,
    notifications,
    notificationsLoading,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const [open, setOpen] = useState(false);

  if (!currentUser) return null;

  const unreadCount = notifications.length;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) void refreshNotifications();
  };

  const openNotification = (notification: NotificationItem) => {
    void markNotificationRead(notification.id);
    setOpen(false);
    onNavigate?.();
    if (notification.requestTitle) {
      router.push(
        `/reports?q=${encodeURIComponent(notification.requestTitle)}`,
      );
      return;
    }
    router.push("/profile/my");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleOpenChange(true)}
        aria-label={
          unreadCount > 0
            ? `اعلان‌ها، ${toPersianDigits(unreadCount)} خوانده‌نشده`
            : "اعلان‌ها"
        }
        className="relative"
      >
        <Bell />
        {unreadCount > 0 && (
          <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full px-1 font-mono text-[9px] leading-4">
            {unreadCount > 9 ? "۹+" : toPersianDigits(unreadCount)}
          </span>
        )}
      </Button>

      <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
        <ResponsiveDialogContent className="max-sm:p-4 sm:max-w-lg">
          <ResponsiveDialogHeader>
            <div className="flex items-center justify-between gap-3">
              <ResponsiveDialogTitle className="flex items-center gap-2 text-base">
                <Bell className="size-4" />
                اعلان‌ها
              </ResponsiveDialogTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-8 gap-1.5 px-2 text-xs font-normal"
                  onClick={() => void markAllNotificationsRead()}
                >
                  <CheckCheck className="size-3.5" />
                  خواندن همه
                </Button>
              )}
            </div>
            <ResponsiveDialogDescription className="sr-only">
              اعلان‌های خوانده‌نشدهٔ وضعیت درخواست‌های شما
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <div className="-mx-1 max-h-[60vh] overflow-y-auto px-1">
            {notificationsLoading && unreadCount === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-xs">
                <span className="border-muted border-t-foreground size-5 animate-spin rounded-full border-2" />
                در حال دریافت اعلان‌ها…
              </div>
            ) : unreadCount === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center gap-2 py-10 text-center">
                <Inbox className="size-8 opacity-60" />
                <p className="text-foreground text-sm font-medium">
                  اعلان جدیدی ندارید
                </p>
                <p className="text-xs">
                  تغییر وضعیت یا پاسخ رسمی درخواست‌ها اینجا نمایش داده می‌شود.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      type="button"
                      onClick={() => openNotification(notification)}
                      className="hover:bg-muted/60 flex w-full items-start gap-3 rounded-xl border p-3 text-start transition duration-150 ease-out active:translate-y-px active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:translate-y-0 motion-reduce:active:scale-100"
                    >
                      <span className="bg-muted text-foreground flex size-8 shrink-0 items-center justify-center rounded-full">
                        <MessageSquare className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col gap-1">
                        <span className="text-foreground text-[13px] leading-relaxed">
                          {notification.message}
                        </span>
                        {notification.requestTitle && (
                          <span className="text-muted-foreground truncate text-[11px]">
                            {notification.requestTitle}
                          </span>
                        )}
                        <span className="text-muted-foreground font-mono text-[10px]">
                          {toPersianDigits(
                            formatPersian(
                              notification.createdAt,
                              "yyyy/MM/dd HH:mm",
                            ),
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}
