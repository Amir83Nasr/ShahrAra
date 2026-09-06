"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { useApp } from "./providers";
import AuthModal from "@/components/AuthModal";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { toPersianDigits } from "@/utils/numberUtils";
import { AlertTriangle, Mail, Phone, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Shared chrome + global auth modal + API error banner.
// Every page renders inside this shell via the root layout.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const {
    currentUser,
    theme,
    setTheme,
    apiError,
    dismissError,
    isAuthOpen,
    openAuth,
    closeAuth,
    loginSuccess,
    logout,
  } = useApp();

  return (
    <div
      className="bg-background text-foreground relative z-0 flex min-h-screen flex-col justify-between transition-colors duration-300"
      id="shahr_ara_app_root"
    >
      <Navbar
        currentUser={currentUser}
        onLogout={logout}
        onOpenAuth={openAuth}
        theme={theme}
        toggleTheme={setTheme}
      />

      <main className="flex-1">
        {/* API / Auth Error Banner */}
        {apiError && (
          <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
            <Alert variant="destructive">
              <AlertTriangle />
              <AlertDescription className="flex items-start justify-between gap-3">
                <span className="leading-relaxed font-medium">{apiError}</span>
                <button
                  onClick={dismissError}
                  className="text-destructive/60 hover:text-destructive shrink-0 cursor-pointer text-xs font-bold transition-colors"
                >
                  بستن
                </button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <ErrorBoundary>{children}</ErrorBoundary>
      </main>

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
                سامانه الکترونیکی ثبت و ارتقای مطالبات و ایده‌های مردمی. مشکلات
                شهری را ثبت کنید، به ایده‌های دیگران رأی بدهید و در بهبود شهر
                خود سهیم باشید.
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
                <button
                  onClick={openAuth}
                  className="hover:text-foreground w-fit cursor-pointer text-start transition-colors"
                >
                  ورود / ثبت‌نام
                </button>
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
            &copy; {toPersianDigits(new Date().getFullYear())} شهرآرا — سامانه
            هوشمند مشارکت مردمی. کلیه حقوق محفوظ است.
          </div>
        </div>
      </footer>

      {/* فاصله برای نوار پایین — فقط موبایل */}
      <div
        className="h-[calc(4.25rem+env(safe-area-inset-bottom))] md:hidden"
        aria-hidden
      />

      <AuthModal
        open={isAuthOpen}
        onClose={closeAuth}
        onLoginSuccess={loginSuccess}
      />
    </div>
  );
}
