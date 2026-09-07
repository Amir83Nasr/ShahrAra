"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, Send } from "lucide-react";
import { useApp } from "./providers";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toPersianDigits } from "@/utils/numberUtils";

// Shared chrome + global auth modal + API error alert.
// Every page renders inside this shell via the root layout.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, theme, setTheme, apiError, dismissError, logout } =
    useApp();
  const pathname = usePathname();

  // صفحات بدون هدر/فوتر (مثل لاگین) — فقط محتوا
  const isChromeless = pathname.startsWith("/login");

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="bg-background text-foreground relative z-0 flex min-h-screen flex-col justify-between transition-colors duration-300"
        id="shahr_ara_app_root"
        // جلوگیری از درگ تصاویر و لوگوها (Firefox از -webkit-user-drag پیروی نمی‌کند)
        onDragStart={(e) => e.preventDefault()}
      >
      {!isChromeless && (
        <Navbar
          currentUser={currentUser}
          onLogout={logout}
          theme={theme}
          toggleTheme={setTheme}
        />
      )}

      <main className="flex-1">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

      {!isChromeless && (
        <footer className="bg-background/90 text-muted-foreground border-t text-xs backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-stretch gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {/* Brand */}
              <div className="flex flex-col gap-3 sm:px-6 sm:py-1 sm:first:ps-0">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-base font-extrabold">
                    شهرآرا
                  </span>
                </div>
                <p className="text-muted-foreground/80 leading-relaxed">
                  سامانه الکترونیکی ثبت و ارتقای مطالبات و ایده‌های مردمی.
                  مشکلات شهری را ثبت کنید، به ایده‌های دیگران رأی بدهید و در
                  بهبود شهر خود سهیم باشید.
                </p>
              </div>

              {/* Quick links */}
              <nav
                aria-label="دسترسی سریع"
                className="flex flex-col gap-2.5 sm:px-6"
              >
                <h3 className="text-foreground mb-1 text-sm font-bold">
                  دسترسی سریع
                </h3>
                <Link
                  href="/"
                  className="hover:text-foreground w-fit transition-colors"
                >
                  خانه
                </Link>
                <Link
                  href="/reports"
                  className="hover:text-foreground w-fit transition-colors"
                >
                  گزارش‌ها و ایده‌ها
                </Link>
                <Link
                  href="/submit"
                  className="hover:text-foreground w-fit transition-colors"
                >
                  ثبت درخواست جدید
                </Link>
              </nav>

              {/* Account */}
              <nav
                aria-label="حساب کاربری"
                className="flex flex-col gap-2.5 sm:px-6"
              >
                <h3 className="text-foreground mb-1 text-sm font-bold">
                  حساب کاربری
                </h3>
                {currentUser ? (
                  <>
                    <Link
                      href="/profile"
                      className="hover:text-foreground w-fit transition-colors"
                    >
                      پروفایل من
                    </Link>
                    {currentUser.isAdmin && (
                      <Link
                        href="/admin"
                        className="hover:text-foreground w-fit transition-colors"
                      >
                        پنل مدیریت شهری
                      </Link>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="hover:text-foreground w-fit transition-colors"
                  >
                    ورود / ثبت‌نام
                  </Link>
                )}
              </nav>

              {/* Contact */}
              <div className="flex flex-col gap-2.5 sm:px-6">
                <h3 className="text-foreground mb-1 text-sm font-bold">
                  ارتباط با ما
                </h3>
                <a
                  href="tel:+989306853363"
                  className="hover:text-foreground flex w-fit items-center gap-2 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {toPersianDigits("09306853363")}
                </a>
                <a
                  href="mailto:amirhossein.nasrollahi.main@gmail.com"
                  className="hover:text-foreground flex w-fit items-center gap-2 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span dir="ltr">amirhossein.nasrollahi.main@gmail.com</span>
                </a>
                <a
                  href="https://ble.ir/Amir83Nasr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground flex w-fit items-center gap-2 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  بله
                </a>
              </div>
            </div>
            <div className="text-muted-foreground/50 mt-8">
              &copy; {toPersianDigits(new Date().getFullYear())} شهرآرا —
              سامانه هوشمند مشارکت مردمی. کلیه حقوق محفوظ است.
            </div>
          </div>
        </footer>
      )}

      {!isChromeless && (
        <div
          className="h-[calc(4.25rem+env(safe-area-inset-bottom))] md:hidden"
          aria-hidden
        />
      )}

      <AlertDialog
        open={!!apiError}
        onOpenChange={(open) => {
          if (!open) dismissError();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>خطا</AlertDialogTitle>
            <AlertDialogDescription>{apiError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter >
            <AlertDialogAction className="w-full" onClick={dismissError}>باشه</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
