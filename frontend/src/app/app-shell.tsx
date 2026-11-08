"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { usePathname } from "next/navigation";
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

// Shared chrome + global API error alert.
// Every page renders inside this shell via the root layout.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, theme, setTheme, apiError, dismissError, logout } =
    useApp();
  const pathname = usePathname();

  // صفحات بدون هدر (مثل لاگین) — فقط محتوا
  const isChromeless = pathname.startsWith("/login");

  return (
    <TooltipProvider delayDuration={800}>
      <div
        className="bg-background text-foreground relative z-0 flex min-h-dvh flex-col justify-between pt-[env(safe-area-inset-top)] transition-colors duration-300"
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
          <div
            className="h-[calc(4.75rem+env(safe-area-inset-bottom))] md:hidden"
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
            <AlertDialogFooter>
              <AlertDialogAction className="w-full" onClick={dismissError}>
                باشه
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  );
}
