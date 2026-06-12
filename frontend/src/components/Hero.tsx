/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LogoIcon } from './Navbar';
import {
  SparklesIcon,
  ArrowLeft01Icon,
  Alert01Icon,
  Idea01Icon,
  Shield01Icon,
} from 'hugeicons-react';
import { User, Stats } from '../types';
import { toPersianDigits } from '../utils/numberUtils';

interface HeroProps {
  setTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  stats: Stats;
  theme?: 'light' | 'dark';
}

export default function Hero({
  setTab,
  currentUser,
  onOpenAuth,
  stats,
  theme = 'light',
}: HeroProps) {
  return (
    <div
      className="relative overflow-hidden dark-dotted-grid py-12 md:py-20"
      id="shahr_ara_hero"
    >
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] bg-teal-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-right">
        {/* Top welcome indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs text-cyan-600 dark:text-cyan-300 font-bold mb-6 transition-colors shadow-sm">
          <SparklesIcon className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
          <span>سامانه ثبت، پیگیری و همفکری مطالبات شهروندی</span>
        </div>

        {/* Hero split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Title content (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 dark:text-white tracking-tight leading-tight sm:leading-none">
              همراه با شهرداری در ساختن <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-cyan-600 to-teal-500 dark:from-cyan-300 dark:to-teal-200 font-black">
                شهری پویاتر و زیباتر
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed max-w-2xl font-bold">
              سامانه هوشمند{' '}
              <strong className="text-cyan-600 dark:text-cyan-200 font-extrabold">
                شهرآرا
              </strong>{' '}
              پلی ارتباطی و دوسویه برای ارسال فوری گزارش مشکلات شهری (خرابی
              معابر، سد معابر، نارسایی روشنایی و پسماند) و همفکری پیرامون
              ایده‌های نوین زیباسازی محله‌ها است. ایده بدهید، مشکلات را ثبت کنید
              و به یاری مسئولان شهری بشتابید.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3.5">
              <button
                onClick={() => setTab('submit')}
                className="px-6 py-3 font-black rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-zinc-950 transition-all duration-300 shadow-[0_0_15px_rgba(8,145,178,0.15)] dark:shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center gap-1.5 text-sm cursor-pointer"
              >
                <span>شروع مشارکت فردی و ثبت گزارش</span>
                <ArrowLeft01Icon className="w-4 h-4 shrink-0" />
              </button>

              <button
                onClick={() => setTab('reports')}
                className="px-6 py-3 font-black rounded-lg bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-zinc-700 transition-all text-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>پایش زنده گزارش‌های تهران</span>
              </button>

              {!currentUser && (
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-xs font-black text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 cursor-pointer"
                >
                  ورود به حساب کاربری شهروندی
                </button>
              )}
            </div>

            {/* Micro stats banner (Theodorus Clarence style) */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-slate-200 dark:border-zinc-800/80 max-w-lg font-mono">
              <div className="p-3.5 bg-white dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/60 rounded-xl shadow-sm transition-colors">
                <span className="text-sm font-black text-slate-800 dark:text-white block">
                  {toPersianDigits(stats.totalCount)} مورد
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  کل درخواست‌های ثبت شده
                </span>
              </div>
              <div className="p-3.5 bg-white dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/60 rounded-xl shadow-sm transition-colors">
                <span className="text-sm font-black text-red-500 dark:text-red-400 block">
                  {toPersianDigits(stats.problemsCount)} مورد
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  گزارش فرورفتگی و خرابی
                </span>
              </div>
              <div className="p-3.5 bg-white dark:bg-zinc-950/40 border border-slate-200 dark:border-zinc-800/60 rounded-xl shadow-sm transition-colors">
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                  {toPersianDigits(stats.ideasCount)} طرح خلاق
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  ایده ارسالی زیباسازی
                </span>
              </div>
            </div>
          </div>

          {/* Large Decorative Illustration Card (5 columns) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-zinc-800/80 hover:border-slate-350 dark:hover:border-zinc-700 transition-all shadow-xl dark:shadow-2xl relative group overflow-hidden flex flex-col items-center justify-between text-center min-h-[360px]">
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

              <LogoIcon className="w-24 h-24 text-cyan-600 dark:text-cyan-200 mt-4 transition-transform duration-500 group-hover:scale-110" />

              <div className="space-y-2.5 my-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-white">
                  سامانه هوشمند شهرآرا
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 px-4 leading-relaxed font-bold">
                  طراحی شده جهت تسهیل امور اداری و اتصال مستقیم شهروندان مناطق
                  ۲۲‌گانه کلانشهرها به اکیپ‌های فنی و زیباسازی معابر شهرداری.
                </p>
              </div>

              {/* Status metrics indicators */}
              <div className="w-full bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800/60 rounded-xl p-3 flex justify-around text-center text-xs transition-colors">
                <div>
                  <span className="font-black text-slate-800 dark:text-white font-mono block">
                    ۳۵ ثانیه
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-500">
                    زمان میانگین ثبت
                  </span>
                </div>
                <div className="w-px bg-slate-200 dark:bg-zinc-800 self-stretch" />
                <div>
                  <span className="font-black text-teal-600 dark:text-teal-400 font-mono block">
                    ۱۰۰٪ برخط
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-500">
                    پایش ۲۴ ساعته
                  </span>
                </div>
                <div className="w-px bg-slate-200 dark:bg-zinc-800 self-stretch" />
                <div>
                  <span className="font-black text-amber-600 dark:text-amber-400 font-mono block">
                    پیگیری پیامکی
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-500">
                    اطلاع‌رسانی بلادرنگ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Section Divider with Features (Bento layout, 3 cards in row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-slate-200 dark:border-zinc-800/60">
          <div className="text-right p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm transition-all">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/20 border border-red-500/20 text-red-500 dark:text-red-400 flex items-center justify-center mb-4 text-right">
              <Alert01Icon className="w-5 h-5 mx-auto" />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white">
              گزارش سریع معایب معبر
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              شکستگی‌های آسفالت، موانع فیزیکی پیاده‌رو، سوختگی لامپ‌های عابر و
              انباشت غیر مجاز پسماندهای ساختمانی را به صورت مکان‌یافته اطلاع
              دهید.
            </p>
          </div>

          <div className="text-right p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm transition-all">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 text-right">
              <Idea01Icon className="w-5 h-5 mx-auto" />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white">
              طرح ایده‌های تلطیف شهری
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              ایده‌های نوآورانه در حوزه ایجاد دیوار سبز، سطل زباله هوشمند
              الکترونیک، نورپردازی مدرن تقاطع‌ها و فضاهای پارکی را به گوش مدیران
              شهری برسانید.
            </p>
          </div>

          <div className="text-right p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/20 hover:border-slate-300 dark:hover:border-zinc-700 shadow-sm transition-all">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/20 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 text-right">
              <Shield01Icon className="w-5 h-5 mx-auto" strokeWidth={2.5} />
            </div>
            <h4 className="text-sm font-black text-slate-800 dark:text-white">
              پاسخگویی رسمی مسئولان
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              پرونده به مجرد بررسی تخصصی با پاسخ کتبی مستند شده و اکیپ‌های فنی
              به محل ارجاع می‌شوند تا درصد حل مشکلات ارتقا یابد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
