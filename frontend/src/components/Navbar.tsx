import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User } from "../types";
import {
  CirclePlus,
  ClipboardList,
  House,
  LogIn,
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

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  theme: "light" | "dark";
  toggleTheme: (theme: "light" | "dark") => void;
}

export default function Navbar({
  currentUser,
  onLogout,
  onOpenAuth,
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
                <Image
                  src="/assets/logo.svg"
                  alt="لوگوی شهرآرا"
                  width={32}
                  height={31}
                  className="h-8 w-auto"
                />
                <span className="text-primary text-xl leading-tight font-extrabold tracking-tight">
                  شهرآرا
                </span>
              </Link>
            </Button>

            {/* لینک‌ها — فقط دسکتاپ */}
            <div className="nav-links hidden items-center gap-2 md:flex">
              {navLinks.map(({ href, label, Icon }) => (
                <Button
                  key={href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "gap-2 font-bold",
                    isActive(href)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground",
                  )}
                >
                  <Link href={href}>
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                </Button>
              ))}
            </div>

            <div className="nav-actions flex items-center gap-3">
              <ModeToggle theme={theme} onThemeChange={toggleTheme} />

              {currentUser ? (
                <>
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
                  <span className="hidden sm:inline">
                    ورود / ثبت‌نام شهروند
                  </span>
                  <span className="sm:hidden">ورود</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* نوار پایین — فقط موبایل */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="flex items-stretch justify-around">
          {[
            { href: "/", label: "خانه", Icon: House },
            { href: "/reports", label: "گزارش‌ها", Icon: ClipboardList },
            { href: "/submit", label: "ثبت", Icon: CirclePlus },
          ].map(({ href, label, Icon }) => (
            <Button
              key={href}
              variant="ghost"
              asChild
              className={cn(
                "h-auto flex-1 flex-col gap-1 rounded-none py-2 font-bold",
                isActive(href) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Link href={href}>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    isActive(href) && "bg-primary/10",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-[10px]">{label}</span>
              </Link>
            </Button>
          ))}
          {currentUser && (
            <Button
              variant="ghost"
              asChild
              className={cn(
                "h-auto flex-1 flex-col gap-1 rounded-none py-2 font-bold",
                isActive("/profile") ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Link href="/profile">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    isActive("/profile") && "bg-primary/10",
                  )}
                >
                  <UserRound className="h-5 w-5" />
                </span>
                <span className="text-[10px]">پروفایل</span>
              </Link>
            </Button>
          )}
          {currentUser?.isAdmin && (
            <Button
              variant="ghost"
              asChild
              className={cn(
                "h-auto flex-1 flex-col gap-1 rounded-none py-2 font-bold",
                isActive("/admin") ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Link href="/admin">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    isActive("/admin") && "bg-primary/10",
                  )}
                >
                  <Shield className="h-5 w-5" />
                </span>
                <span className="text-[10px]">ادمین</span>
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
    </>
  );
}
