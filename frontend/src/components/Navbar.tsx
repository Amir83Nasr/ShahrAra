/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from '../types';
import {
  Login03Icon,
  Logout01Icon,
  UserIcon,
  Shield01Icon,
  Sun03Icon,
  Moon02Icon,
} from 'hugeicons-react';
import { toPersianDigits } from '../utils/numberUtils';

export function LogoIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      className={`${className} stroke-current`}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      id="shahr_ara_logo_svg"
    >
      {/* House outline - styled exactly like the attached image */}
      <path
        d="M50 18 L82 46 C85.5 49 87 53.5 87 58 L87 76 C87 82 82 87 76 87 L24 87 C18 87 13 82 13 76 L13 58 C13 53.5 14.5 49 18 46 Z"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Minimal tree stem */}
      <path d="M50 87 L50 43" strokeWidth="9" strokeLinecap="round" />
      {/* Minimalist tree branch left */}
      <path d="M38 52 L50 63" strokeWidth="9" strokeLinecap="round" />
      {/* Minimalist tree branch right */}
      <path d="M62 52 L50 63" strokeWidth="9" strokeLinecap="round" />
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
  toggleTheme: () => void;
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
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setTab('home')}
          >
            <LogoIcon className="h-9 w-9 text-cyan-600 dark:text-cyan-200 transition-transform duration-300 hover:scale-110" />
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-cyan-600 dark:text-cyan-200">
                شهرآرا
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                سامانه هوشمند مشارکت مردمی
              </span>
            </div>
          </div>

          {/* Navigation Tabs (Theodorus Clarence style matching) */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setTab('home')}
              className={`px-4 py-2 text-sm font-bold transition-colors duration-200 rounded-lg ${
                currentTab === 'home'
                  ? 'bg-slate-150 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              خانه
            </button>
            <button
              onClick={() => setTab('reports')}
              className={`px-4 py-2 text-sm font-bold transition-colors duration-200 rounded-lg ${
                currentTab === 'reports'
                  ? 'bg-slate-150 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              گزارش‌ها و ایده‌ها
            </button>

            <button
              onClick={() => setTab('submit')}
              className={`px-4 py-2 text-sm font-bold transition-colors duration-200 rounded-lg ${
                currentTab === 'submit'
                  ? 'bg-slate-150 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-300'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-900'
              }`}
            >
              ثبت درخواست جدید
            </button>

            {currentUser?.isAdmin && (
              <button
                onClick={() => setTab('admin')}
                className={`px-4 py-2 text-sm font-bold transition-colors duration-200 rounded-lg flex items-center gap-1.5 ${
                  currentTab === 'admin'
                    ? 'bg-slate-150 dark:bg-zinc-800 text-cyan-600 dark:text-cyan-300 border border-amber-500/30'
                    : 'text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/10'
                }`}
              >
                <Shield01Icon className="w-4 h-4" />
                پنل مدیریت شهری
              </button>
            )}
          </div>

          {/* User Auth & Theme Toggle Controls */}
          <div className="flex items-center gap-3">
            {/* Elegant Theme Toggler */}
            <button
              onClick={toggleTheme}
              className="p-2.5 border border-slate-200 dark:border-zinc-800 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-850/75 text-slate-600 dark:text-amber-400 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 group"
              title={
                theme === 'light'
                  ? 'فعال‌سازی تم تاریک (شب)'
                  : 'فعال‌سازی تم روشن (روز)'
              }
            >
              {theme === 'light' ? (
                <Moon02Icon className="w-4 h-4 text-slate-600 transition-transform duration-500 transform group-hover:rotate-12" />
              ) : (
                <Sun03Icon className="w-4 h-4 text-amber-400 transition-transform duration-500 transform group-hover:rotate-90" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-sm">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    {currentUser.firstName} {currentUser.lastName}
                  </span>
                  <span
                    className="text-xs text-slate-500 dark:text-slate-400 font-mono"
                    dir="rtl"
                  >
                    {toPersianDigits(currentUser.phone)}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg transition-colors duration-200"
                  title="خروج از حساب"
                >
                  <Logout01Icon className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4.5 py-2.5 text-xs font-black rounded-full bg-cyan-600 hover:bg-cyan-500 text-white dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:text-zinc-950 transition-all duration-300 shadow-md hover:shadow-cyan-500/20 active:scale-95 hover:scale-[1.03] duration-300 group cursor-pointer"
              >
                <span className="transition-transform duration-300 transform group-hover:translate-x-0.5 flex items-center justify-center">
                  <Login03Icon size={16} />
                </span>
                <span>ورود / ثبت‌نام شهروند</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Submenu */}
        <div className="flex md:hidden items-center justify-around border-t border-slate-200 dark:border-zinc-800/60 py-2">
          <button
            onClick={() => setTab('home')}
            className={`text-xs px-2.5 py-1.5 font-bold rounded-md ${currentTab === 'home' ? 'text-cyan-600 dark:text-cyan-300 bg-slate-100 dark:bg-zinc-900' : 'text-slate-500 dark:text-slate-400'}`}
          >
            خانه
          </button>
          <button
            onClick={() => setTab('reports')}
            className={`text-xs px-2.5 py-1.5 font-bold rounded-md ${currentTab === 'reports' ? 'text-cyan-600 dark:text-cyan-300 bg-slate-100 dark:bg-zinc-900' : 'text-slate-500 dark:text-slate-400'}`}
          >
            گزارش‌ها
          </button>
          <button
            onClick={() => setTab('submit')}
            className={`text-xs px-2.5 py-1.5 font-bold rounded-md ${currentTab === 'submit' ? 'text-cyan-600 dark:text-cyan-300 bg-slate-100 dark:bg-zinc-900' : 'text-slate-500 dark:text-slate-400'}`}
          >
            ثبت درخواست
          </button>
          {currentUser?.isAdmin && (
            <button
              onClick={() => setTab('admin')}
              className={`text-xs px-2.5 py-1.5 font-bold rounded-md flex items-center gap-1 ${currentTab === 'admin' ? 'text-amber-600 dark:text-amber-400 bg-slate-100 dark:bg-zinc-900' : 'text-amber-600 dark:text-amber-500'}`}
            >
              <Shield01Icon className="w-3.5 h-3.5" />
              ادمین
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
