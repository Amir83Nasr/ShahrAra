import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "../types";
import {
  CirclePlus,
  ClipboardList,
  House,
  LogOut,
  Shield,
  UserRound,
} from "lucide-react";
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
import NotificationsDialog from "@/components/NotificationsDialog";

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  theme: "light" | "dark";
  toggleTheme: (theme: "light" | "dark") => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  theme,
  toggleTheme,
}: NavbarProps) {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLinks = [
    { href: "/", label: "خانه", Icon: House },
    { href: "/reports", label: "گزارش‌ها", Icon: ClipboardList },
    { href: "/submit", label: "ثبت", Icon: CirclePlus },
    ...(currentUser
      ? [{ href: "/profile", label: "پروفایل", Icon: UserRound }]
      : []),
    ...(currentUser?.isAdmin
      ? [{ href: "/admin", label: "ادمین", Icon: Shield }]
      : []),
  ];

  return (
    <>
      {/* هدر بالا — فقط دسکتاپ؛ موبایل فقط نوار پایین */}
      <nav className="border-border/70 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 hidden border-b backdrop-blur-2xl md:block">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-2 md:h-16">
            {/* لینک‌ها — فقط دسکتاپ */}
            <div className="nav-links hidden items-center gap-1 md:flex">
              {navLinks.map(({ href, label, Icon }) => (
                <Button
                  key={href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "h-10 gap-2 rounded-full px-4 text-sm font-semibold",
                    isActive(href)
                      ? "bg-secondary text-secondary-foreground hover:bg-secondary"
                      : "text-muted-foreground",
                  )}
                >
                  <Link
                    href={href}
                    aria-current={isActive(href) ? "page" : undefined}
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </Link>
                </Button>
              ))}
            </div>

            <div className="nav-actions flex items-center gap-1.5 sm:gap-2">
              <NotificationsDialog />
              <ModeToggle theme={theme} onThemeChange={toggleTheme} />

              {/* یوزر / ورود — فقط دسکتاپ؛ موبایل از تب «حساب کاربری» نوار پایین میره پروفایل */}
              <div className="hidden items-center gap-2 md:flex">
                {currentUser ? (
                  <DropdownMenu
                    dir="rtl"
                    open={dropdownOpen}
                    onOpenChange={setDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-10 gap-2 px-3">
                        <UserRound className="size-4" />
                        <span className="max-w-30 truncate text-sm font-semibold lg:max-w-none">
                          {currentUser.firstName} {currentUser.lastName}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60 border">
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
                        asChild
                      >
                        <Link href="/profile">
                          <UserRound />
                          <span>پروفایل من</span>
                        </Link>
                      </DropdownMenuItem>
                      {currentUser.isAdmin && (
                        <DropdownMenuItem
                          onClick={() => {
                            setDropdownOpen(false);
                          }}
                          className="flex gap-2"
                          asChild
                        >
                          <Link href="/admin">
                            <Shield />
                            <span>پنل مدیریت</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => {
                          setDropdownOpen(false);
                          setConfirmLogout(true);
                        }}
                      >
                        <LogOut />
                        <span>خروج از حساب</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="default" asChild className="h-10">
                    <Link href="/login">
                      <span>ورود / ثبت‌نام</span>
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* نوار پایین موبایل — سبک اپ ChatGPT: تمام‌عرض، شیشه‌ای، تَب فعال قرصی */}
      <nav
        aria-label="ناوبری اصلی موبایل"
        className="border-border/70 bg-background/90 supports-[backdrop-filter]:bg-background/75 fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-2xl md:hidden"
      >
        <div className="pb-safe mx-auto flex max-w-md items-stretch justify-around px-2 pt-1.5">
          {[
            { href: "/", label: "خانه", Icon: House },
            { href: "/reports", label: "گزارش‌ها", Icon: ClipboardList },
            { href: "/submit", label: "ثبت", Icon: CirclePlus },
            { href: "/profile", label: "حساب", Icon: UserRound },
            ...(currentUser?.isAdmin
              ? [{ href: "/admin", label: "ادمین", Icon: Shield }]
              : []),
          ].map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1 transition-colors duration-150",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-14 items-center justify-center rounded-full transition-colors duration-200",
                    active ? "bg-foreground/10" : "bg-transparent",
                  )}
                >
                  <Icon
                    className={cn(
                      "size-[22px] transition-transform duration-150 group-active:scale-90",
                      active ? "stroke-[2.25]" : "stroke-[1.75]",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "truncate text-[10px] leading-none",
                    active ? "font-bold" : "font-medium",
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <LogoutModal
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        onConfirm={onLogout}
      />
    </>
  );
}
