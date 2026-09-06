import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Notification } from "../types";
import { Bell, LogIn, LogOut, Shield, UserRound } from "lucide-react";
import { toPersianDigits } from "../utils/numberUtils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LogoutModal from "@/components/LogoutModal";

// ponytail: logo removed from UI, add when new logo asset provided.

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  theme: "light" | "dark";
  toggleTheme: (theme: "light" | "dark") => void;
  notifications?: Notification[];
  unreadCount?: number;
  onNotificationClick?: (notification: Notification) => void;
}

const TABS = [
  { href: "/", label: "خانه" },
  { href: "/reports", label: "گزارش‌ها و ایده‌ها" },
  { href: "/submit", label: "ثبت درخواست جدید" },
] as const;

export default function Navbar({
  currentUser,
  onLogout,
  onOpenAuth,
  theme,
  toggleTheme,
  notifications = [],
  unreadCount = 0,
  onNotificationClick,
}: NavbarProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="border-border bg-background/90 sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            asChild
            className="h-auto bg-transparent p-0 hover:bg-transparent focus-visible:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          >
            <Link
              href="/"
              className="nav-logo flex cursor-pointer items-center gap-3"
            >
              <div className="flex flex-col items-start text-right">
                <span className="text-primary leading-tight font-extrabold tracking-tight">
                  شهرآرا
                </span>
                <span className="text-muted-foreground mt-0.5 text-[10px] leading-tight font-bold">
                  سامانه هوشمند مشارکت مردمی
                </span>
              </div>
            </Link>
          </Button>

          <div className="nav-tabs hidden items-center gap-1 md:flex">
            {TABS.map((tab) => (
              <Button
                key={tab.href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "font-semibold",
                  isActive(tab.href) && "bg-accent text-primary",
                )}
              >
                <Link href={tab.href}>{tab.label}</Link>
              </Button>
            ))}

            {currentUser?.isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "flex items-center gap-1.5 font-bold",
                  isActive("/admin") && "bg-accent text-primary",
                )}
              >
                <Link href="/admin">
                  <Shield className="h-4 w-4" />
                  پنل مدیریت شهری
                </Link>
              </Button>
            )}
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "flex items-center gap-1.5 font-bold",
                  isActive("/profile") && "bg-accent text-primary",
                )}
              >
                <Link href="/profile">
                  <UserRound />
                  پروفایل من
                </Link>
              </Button>
            )}
          </div>

          <div className="nav-actions flex items-center gap-3">
            <ModeToggle theme={theme} onThemeChange={toggleTheme} />

            {currentUser ? (
              <>
                {/* Notification bell */}
                <DropdownMenu dir="rtl">
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <Bell />
                      {unreadCount > 0 && (
                        <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] leading-tight font-bold">
                          {toPersianDigits(Math.min(unreadCount, 99))}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 border">
                    <DropdownMenuLabel>اعلان‌ها</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length > 0 ? (
                      notifications.slice(0, 5).map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          onClick={() => onNotificationClick?.(n)}
                          className={cn(
                            "flex flex-col items-start gap-1 py-3",
                            !n.isRead && "bg-accent/50",
                          )}
                        >
                          <span className="text-xs font-semibold">
                            {n.message}
                          </span>
                          {n.requestTitle && (
                            <span className="text-muted-foreground text-[10px]">
                              {n.requestTitle}
                            </span>
                          )}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="text-muted-foreground px-4 py-6 text-center text-xs">
                        هیچ اعلان جدیدی ندارید.
                      </div>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu
                  dir="rtl"
                  open={dropdownOpen}
                  onOpenChange={setDropdownOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                      <UserRound />
                      <span className="hidden max-w-[120px] truncate font-extrabold md:inline lg:max-w-none">
                        {currentUser.firstName} {currentUser.lastName}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 border">
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold">
                          {currentUser.firstName} {currentUser.lastName}
                        </span>
                        <span className="text-muted-foreground font-mono text-xs font-normal">
                          {toPersianDigits(currentUser.phone)}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setDropdownOpen(false);
                      }}
                      className="flex gap-2"
                      asChild
                    >
                      <Link href="/profile">
                        <UserRound />
                        <span>پروفایل من</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => {
                        setDropdownOpen(false);
                        setConfirmLogout(true);
                      }}
                      className="flex gap-2"
                    >
                      <LogOut />
                      <span>خروج از حساب</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={onOpenAuth}>
                <LogIn size={14} />
                <span className="hidden sm:inline">ورود / ثبت‌نام شهروند</span>
                <span className="sm:hidden">ورود</span>
              </Button>
            )}
          </div>
        </div>

        <div className="border-border flex items-center justify-around border-t py-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "flex-1 text-xs font-bold",
              isActive("/") && "bg-accent text-primary",
            )}
          >
            <Link href="/">خانه</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "flex-1 text-xs font-bold",
              isActive("/reports") && "bg-accent text-primary",
            )}
          >
            <Link href="/reports">گزارش‌ها</Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "flex-1 text-xs font-bold",
              isActive("/submit") && "bg-accent text-primary",
            )}
          >
            <Link href="/submit">ثبت درخواست</Link>
          </Button>
          {currentUser && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "flex-1 text-xs font-bold",
                isActive("/profile") && "bg-accent text-primary",
              )}
            >
              <Link href="/profile">پروفایل</Link>
            </Button>
          )}
          {currentUser?.isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "flex flex-1 items-center gap-1 text-xs font-bold",
                isActive("/admin") && "bg-accent text-primary",
              )}
            >
              <Link href="/admin">
                <Shield className="h-3.5 w-3.5" />
                ادمین
              </Link>
            </Button>
          )}
        </div>
      </div>

      <LogoutModal
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        onConfirm={onLogout}
      />
    </nav>
  );
}
