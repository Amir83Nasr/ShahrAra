"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, RequestItem } from "../types";
import {
  ClipboardList,
  House,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Shield,
  SquarePen,
  UserRound,
  X,
} from "lucide-react";
import { toPersianDigits } from "../utils/numberUtils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { FontToggle } from "@/components/font-toggle";
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
import { BrandMark } from "@/components/BrandMark";
import { useApp } from "@/app/providers";
import { FontOption } from "@/utils/fontUtils";

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  theme: "light" | "dark";
  toggleTheme: (theme: "light" | "dark") => void;
}

interface NavItem {
  href: string;
  label: string;
  Icon: typeof House;
}

interface SidebarBodyProps {
  collapsed: boolean;
  isMobile: boolean;
  pathname: string;
  currentUser: User | null;
  theme: "light" | "dark";
  toggleTheme: (theme: "light" | "dark") => void;
  font: FontOption;
  setFont: (font: FontOption) => void;
  recentItems: RequestItem[];
  onCollapse: () => void;
  onNavigate: () => void;
  onRequestLogout: () => void;
}

/**
 * محتوای مشترک سایدبار دسکتاپ و کشوی موبایل.
 * هر نمونه state مستقل خودش را دارد تا منوی کاربر در دو نسخه هم‌زمان باز نشود.
 */
function SidebarBody({
  collapsed,
  isMobile,
  pathname,
  currentUser,
  theme,
  toggleTheme,
  font,
  setFont,
  recentItems,
  onCollapse,
  onNavigate,
  onRequestLogout,
}: SidebarBodyProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const workspaceItems: NavItem[] = [
    { href: "/", label: "خانه", Icon: House },
    { href: "/reports", label: "گزارش‌ها", Icon: ClipboardList },
  ];

  const accountItems: NavItem[] = [
    ...(currentUser
      ? [{ href: "/profile", label: "پروفایل من", Icon: UserRound }]
      : []),
    ...(currentUser?.isAdmin
      ? [{ href: "/admin", label: "پنل مدیریت", Icon: Shield }]
      : []),
  ];

  const initials =
    `${currentUser?.firstName?.[0] ?? ""}${
      currentUser?.lastName?.[0] ?? ""
    }`.trim() || "ش";

  const navigate = () => {
    setDropdownOpen(false);
    onNavigate();
  };

  return (
    <>
      {/* Brand */}
      {!isMobile && (
        <div
          className={cn(
            "flex items-center gap-1 px-3 pt-3 pb-1",
            collapsed && "justify-center px-2",
          )}
        >
          <Link
            href="/"
            onClick={navigate}
            aria-label="شهرآرا"
            className={cn(
              "hover:bg-accent flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1 py-1.5 transition-colors",
              collapsed && "flex-none justify-center",
            )}
          >
            <BrandMark className="size-6 text-[12px]" />
            {!collapsed && (
              <span className="text-foreground truncate text-[15px] font-semibold tracking-tight">
                شهرآرا
              </span>
            )}
          </Link>
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onCollapse}
              aria-label="جمع کردن نوار کناری"
            >
              <PanelRightClose />
            </Button>
          )}
        </div>
      )}

      {/* New report */}
      <div className="px-2 py-2">
        <Button
          variant="ghost"
          asChild
          className={cn(
            "h-10 w-full justify-start rounded-xl px-2.5 font-medium",
            collapsed && "justify-center px-0",
          )}
        >
          <Link href="/submit" aria-label="ثبت گزارش جدید" onClick={onNavigate}>
            <SquarePen className="size-[18px]" />
            {!collapsed && <span>ثبت گزارش جدید</span>}
          </Link>
        </Button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {!collapsed && (
          <div className="text-muted-foreground px-2.5 pt-2 pb-1.5 text-[11px] font-medium">
            فضای کاری
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          {workspaceItems.map(({ href, label, Icon }) => (
            <Button
              key={href}
              variant="ghost"
              asChild
              className={cn(
                "h-9 w-full justify-start gap-2.5 rounded-lg px-2.5 text-[13px] font-medium",
                collapsed && "justify-center px-0",
                isActive(href) && "bg-sidebar-accent text-foreground",
              )}
              title={collapsed ? label : undefined}
            >
              <Link href={href} onClick={onNavigate}>
                <Icon className="size-[18px]" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            </Button>
          ))}
        </div>

        {accountItems.length > 0 && (
          <>
            {!collapsed && (
              <div className="text-muted-foreground px-2.5 pt-5 pb-1.5 text-[11px] font-medium">
                حساب کاربری
              </div>
            )}
            {collapsed && <div className="bg-border my-2 h-px" />}
            <div className="flex flex-col gap-0.5">
              {accountItems.map(({ href, label, Icon }) => (
                <Button
                  key={href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "h-9 w-full justify-start gap-2.5 rounded-lg px-2.5 text-[13px] font-medium",
                    collapsed && "justify-center px-0",
                    isActive(href) && "bg-sidebar-accent text-foreground",
                  )}
                  title={collapsed ? label : undefined}
                >
                  <Link href={href} onClick={onNavigate}>
                    <Icon className="size-[18px]" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                </Button>
              ))}
            </div>
          </>
        )}
        {!collapsed && recentItems.length > 0 && (
          <>
            <div className="text-muted-foreground px-2.5 pt-5 pb-1.5 text-[11px] font-medium">
              اخیر
            </div>
            <div className="flex flex-col gap-0.5">
              {recentItems.slice(0, 5).map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  asChild
                  className="text-muted-foreground hover:text-foreground h-8 w-full justify-start gap-2.5 rounded-lg px-2.5 text-[12px] font-normal"
                >
                  <Link
                    href={`/reports?q=${encodeURIComponent(item.title)}`}
                    onClick={onNavigate}
                    title={item.title}
                  >
                    <MessageSquare className="size-4 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-sidebar-border border-t p-2">
        <div
          className={cn(
            "mb-1 flex items-center",
            collapsed ? "flex-col gap-1" : "justify-end gap-1",
          )}
        >
          <NotificationsDialog onNavigate={onNavigate} />
          <ModeToggle theme={theme} onThemeChange={toggleTheme} />
          <FontToggle font={font} onFontChange={setFont} />
        </div>

        {currentUser ? (
          <DropdownMenu
            dir="rtl"
            open={dropdownOpen}
            onOpenChange={setDropdownOpen}
          >
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "hover:bg-accent flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-2 text-start transition-colors",
                  collapsed && "justify-center",
                )}
              >
                <span className="bg-secondary text-secondary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium">
                  {initials}
                </span>
                {!collapsed && (
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-foreground truncate text-[13px] font-medium">
                      {currentUser.firstName} {currentUser.lastName}
                    </span>
                    <span className="text-muted-foreground truncate font-mono text-[11px]">
                      {toPersianDigits(currentUser.phone)}
                    </span>
                  </span>
                )}
                {!collapsed && (
                  <span className="text-muted-foreground text-lg leading-none">
                    ⋯
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" side="top" align="start">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-0.5">
                  <span className="text-foreground text-sm font-medium">
                    {currentUser.firstName} {currentUser.lastName}
                  </span>
                  <span className="text-muted-foreground font-mono text-xs font-normal">
                    {toPersianDigits(currentUser.phone)}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" onClick={navigate}>
                  <UserRound />
                  <span>پروفایل من</span>
                </Link>
              </DropdownMenuItem>
              {currentUser.isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin" onClick={navigate}>
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
                  onRequestLogout();
                }}
              >
                <LogOut />
                <span>خروج از حساب</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            asChild
            className={cn(
              "w-full justify-start gap-2.5",
              collapsed && "justify-center px-0",
            )}
          >
            <Link href="/login" onClick={onNavigate}>
              <LogIn className="size-[18px]" />
              {!collapsed && <span>ورود / ثبت‌نام</span>}
            </Link>
          </Button>
        )}
      </div>
    </>
  );
}

export default function Navbar({
  currentUser,
  onLogout,
  theme,
  toggleTheme,
}: NavbarProps) {
  const pathname = usePathname();
  const { font, setFont, requests } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────────── */}
      <aside
        className={cn(
          "bg-sidebar text-sidebar-foreground border-sidebar-border sticky top-0 hidden h-dvh shrink-0 flex-col border-e transition-[width] duration-200 md:flex",
          collapsed ? "w-[60px]" : "w-[260px]",
        )}
      >
        <SidebarBody
          collapsed={collapsed}
          isMobile={false}
          pathname={pathname}
          currentUser={currentUser}
          theme={theme}
          toggleTheme={toggleTheme}
          font={font}
          setFont={setFont}
          recentItems={requests}
          onCollapse={() => setCollapsed(true)}
          onNavigate={() => {}}
          onRequestLogout={() => setConfirmLogout(true)}
        />
      </aside>

      {/* بازکردن مجدد سایدبار جمع‌شده */}
      {collapsed && (
        <div className="fixed top-3 right-[68px] z-50 hidden md:block">
          <Button
            variant="ghost"
            size="icon-sm"
            className="bg-sidebar border-sidebar-border hover:bg-accent border shadow-sm"
            onClick={() => setCollapsed(false)}
            aria-label="باز کردن نوار کناری"
          >
            <PanelRightOpen />
          </Button>
        </div>
      )}

      {/* ── Mobile header ───────────────────────────────────────────── */}
      <header className="bg-background/90 border-border sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b px-2 backdrop-blur-xl md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          aria-label="باز کردن منو"
        >
          <Menu className="size-5" />
        </Button>

        <Link
          href="/"
          className="absolute start-1/2 flex -translate-x-1/2 items-center gap-2 rtl:translate-x-1/2"
        >
          <BrandMark className="size-5 text-[11px]" />
          <span className="text-foreground text-[15px] font-semibold">
            شهرآرا
          </span>
        </Link>

        <Button variant="ghost" size="icon" asChild aria-label="ثبت گزارش جدید">
          <Link href="/submit">
            <SquarePen className="size-5" />
          </Link>
        </Button>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="بستن منو"
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={closeMobile}
          />
          <div className="bg-sidebar text-sidebar-foreground border-sidebar-border mobile-drawer-in absolute inset-y-0 right-0 flex w-[86%] max-w-[320px] flex-col border-l shadow-2xl">
            <div className="border-sidebar-border flex h-14 items-center justify-between border-b px-3">
              <Link
                href="/"
                onClick={closeMobile}
                className="flex items-center gap-2.5"
              >
                <BrandMark className="size-6 text-[12px]" />
                <span className="text-[15px] font-semibold">شهرآرا</span>
              </Link>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={closeMobile}
                aria-label="بستن"
              >
                <X className="size-5" />
              </Button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              <SidebarBody
                collapsed={false}
                isMobile
                pathname={pathname}
                currentUser={currentUser}
                theme={theme}
                toggleTheme={toggleTheme}
                font={font}
                setFont={setFont}
                recentItems={requests}
                onCollapse={() => {}}
                onNavigate={closeMobile}
                onRequestLogout={() => {
                  closeMobile();
                  setConfirmLogout(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <LogoutModal
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        onConfirm={onLogout}
      />
    </>
  );
}
