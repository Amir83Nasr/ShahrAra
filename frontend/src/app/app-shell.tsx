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

// Shared chrome + global auth modal + API error alert.
// Every page renders inside this shell via the root layout.
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, theme, setTheme, apiError, dismissError, logout } =
    useApp();
  const pathname = usePathname();

  // صفحات بدون پوسته (مثل لاگین) — فقط محتوا
  const isChromeless = pathname.startsWith("/login");

  return (
    <TooltipProvider delayDuration={400}>
      <div
        className="bg-background text-foreground relative z-0 flex min-h-dvh flex-col transition-colors duration-300 md:flex-row"
        id="shahr_ara_app_root"
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

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>

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
