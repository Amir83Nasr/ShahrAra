import React, { useState } from 'react';
import { User } from '../types';
import { LogIn, LogOut, Shield, UserRound } from 'lucide-react';
import { toPersianDigits } from '../utils/numberUtils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import LogoutModal from '@/components/LogoutModal';

export function LogoIcon({ className = 'size-10' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 540.46 528.2"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M87.83,527.52c-41.46-7.98-77.26-42.52-83.26-84.74-6.04-48.97-5.38-117.72-2.13-169.05,1.82-21.5,7.68-43.36,19.71-61.74,4.07-6.47,8.7-12.67,13.46-18.55,38.54-45.64,90.49-96.76,135.83-138.99C225.89.76,284.1-24.12,348.55,31.11l.16.13c55.91,50.42,104.72,109.86,159.48,162.2,18.99,19.11,27.95,45.67,29.79,71.99,3.32,45.34,2.86,96.94,1.2,140.79-.43,40.07-11.46,79.85-46.07,103.66-13.84,9.9-30.78,16.52-47.99,18.32M304.16,462.3c3.24,8.01,13.63,5.8,23.85,6.24,13.91.03,28.58-.02,44.9,0,14.68-.02,27.87.02,40.21,0,12.54-.08,19.69.36,28.52-2.21,26.31-8.89,34.95-35.1,35.49-60.65,1.53-43.73,2.99-101.62-2.9-146.04-1.64-8.54-3.79-13.96-9.04-19.92-29.37-30.62-125.32-127.85-156.91-160.36-9.11-9.95-19.13-16.21-33.84-15.94-19.39-.03-34.85,13.95-48.74,26.09-46.6,42.97-98.78,92.53-139.03,140.84-17.35,21.61-20.22,42.48-20.29,69.28-.8,23.69-1.37,44.72-1.9,69.3.11,28.93-5.93,70.86,19.68,90.06,8.8,7,18.78,9.34,29.75,9.48,29.72.25,80.95,0,107.25.06,13.84.19,17.49-1.83,17.49-17.97.2-13.46.06-28.9.09-41.98-.32-10.92,1.03-21.92-6.1-30.2-21.32-22.11-55.35-52.49-80.35-77.2-9.67-9.56-14.79-17.13-10.45-28.47,4.97-13.51,22.39-29.75,37.1-27.44,6.3,1.24,12.5,6.42,19.88,13.21,6.63,6.14,13.41,12.56,20.03,18.72,4.33,3.26,17.26,18.82,19.09,9.25,1.91-19.15.29-48.15.81-68.94.05-10.95.14-18.84,3.62-23.89,7.1-9.02,20.59-8.8,31.26-8.79,10.94.77,25.05,2.43,26.87,14.45,1.86,34.41.07,91.82.74,128.2.38,4.24-.42,9.9,2.83,12.14,5.68.95,13.57-8.72,20.47-14.67,10.07-9.62,21.4-21.32,30.94-29.67,7.71-6.94,17.54-13.67,28.11-8.81,12.21,5.58,23.4,17.38,26.77,30.64,2.98,11.04-5.22,19.34-14.28,27.7-8.63,8.04-16.22,15.04-25.64,23.77-14.85,13.76-30.23,28.01-45.05,41.73-7.24,6.8-16.55,14.32-19.28,21.94-3.27,9.19-4.98,20.67-1.97,29.93l.04.11Z" />
    </svg>
  );
}

interface NavbarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  theme: 'light' | 'dark';
  toggleTheme: (theme: 'light' | 'dark') => void;
}

export default function Navbar({
  currentTab,
  setTab,
  currentUser,
  onLogout,
  onOpenAuth,
  theme,
  toggleTheme,
}: NavbarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            asChild
            className="h-auto bg-transparent p-0 hover:bg-transparent focus-visible:bg-transparent active:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
          >
            <button
              onClick={() => setTab('home')}
              className="flex cursor-pointer items-center gap-3"
            >
              <LogoIcon className="text-primary size-9 shrink-0 transition-transform duration-300 hover:scale-110" />
              <div className="flex flex-col items-start text-right">
                <span className="text-primary text-xl leading-tight font-black tracking-tight">
                  شهرآرا
                </span>
                <span className="mt-0.5 text-[10px] leading-tight font-bold text-muted-foreground">
                  سامانه هوشمند مشارکت مردمی
                </span>
              </div>
            </button>
          </Button>

          <div className="hidden items-center gap-1 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTab('home')}
              className={cn(
                'font-semibold',
                currentTab === 'home' && 'bg-accent text-primary',
              )}
            >
              خانه
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTab('reports')}
              className={cn(
                'font-bold',
                currentTab === 'reports' && 'bg-accent text-primary',
              )}
            >
              گزارش‌ها و ایده‌ها
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTab('submit')}
              className={cn(
                'font-bold',
                currentTab === 'submit' && 'bg-accent text-primary',
              )}
            >
              ثبت درخواست جدید
            </Button>

            {currentUser?.isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTab('admin')}
                className={cn(
                  'flex items-center gap-1.5 font-bold',
                  currentTab === 'admin' && 'bg-accent text-primary',
                )}
              >
                <Shield className="h-4 w-4" />
                پنل مدیریت شهری
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle theme={theme} onThemeChange={toggleTheme} />

            {currentUser ? (
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <UserRound className="h-4 w-4" />
                    <span className="font-extrabold">
                      {currentUser.firstName} {currentUser.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1 text-right">
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
                    variant="destructive"
                    onClick={() => {
                      setDropdownOpen(false);
                      setConfirmLogout(true);
                    }}
                    className="flex flex-row-reverse gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>خروج از حساب</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" size="sm" onClick={onOpenAuth}>
                <LogIn size={14} />
                <span>ورود / ثبت‌نام شهروند</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-around border-t border-border py-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTab('home')}
            className={cn(
              'text-xs font-bold',
              currentTab === 'home' && 'bg-accent text-primary',
            )}
          >
            خانه
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTab('reports')}
            className={cn(
              'text-xs font-bold',
              currentTab === 'reports' && 'bg-accent text-primary',
            )}
          >
            گزارش‌ها
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTab('submit')}
            className={cn(
              'text-xs font-bold',
              currentTab === 'submit' && 'bg-accent text-primary',
            )}
          >
            ثبت درخواست
          </Button>
          {currentUser?.isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTab('admin')}
              className={cn(
                'flex items-center gap-1 text-xs font-bold',
                currentTab === 'admin' && 'bg-accent text-primary',
              )}
            >
              <Shield className="h-3.5 w-3.5" />
              ادمین
            </Button>
          )}
        </div>
      </div>

      <LogoutModal
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        onConfirm={onLogout}
        userName={
          currentUser
            ? `${currentUser.firstName} ${currentUser.lastName}`
            : undefined
        }
      />
    </nav>
  );
}
