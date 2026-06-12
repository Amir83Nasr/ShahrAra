/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Stats, RequestStatus } from '../types';
import {
  Alert01Icon,
  Idea01Icon,
  BarChartIcon,
  PieChart01Icon,
  Activity01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
} from 'hugeicons-react';
import { toPersianDigits } from '../utils/numberUtils';

interface StatsSectionProps {
  stats: Stats;
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const problemsPct =
    stats.totalCount > 0
      ? Math.round((stats.problemsCount / stats.totalCount) * 100)
      : 0;
  const ideasPct =
    stats.totalCount > 0
      ? Math.round((stats.ideasCount / stats.totalCount) * 100)
      : 0;

  const resolvedCount = stats.byStatus.resolved || 0;
  const progressCount = stats.byStatus.in_progress || 0;
  const reviewCount = stats.byStatus.under_review || 0;
  const submittedCount = stats.byStatus.submitted || 0;

  const resolvedPct =
    stats.totalCount > 0
      ? Math.round((resolvedCount / stats.totalCount) * 100)
      : 0;

  // Render nicely styled category rows
  const categories = Object.entries(stats.byCategory).sort(
    (a, b) => b[1] - a[1],
  );
  const maxCategoryCount =
    categories.length > 0 ? Math.max(...categories.map((c) => c[1])) : 1;

  // Status mapping
  const statusLabels: Record<RequestStatus, string> = {
    submitted: 'معلق فرآیند',
    under_review: 'در حال بررسی تخصصی',
    in_progress: 'اکیپ‌های فنی مشغول کار',
    resolved: 'تکمیل و برطرف شده',
    archived: 'بایگانی‌شده',
  };

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      id="shahr_ara_stats_grid"
    >
      {/* 1. Problem vs Idea Distribution Ring Cards (Bento style) */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-205 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-lg relative overflow-hidden flex flex-col justify-between transition-all">
        <div>
          <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-wider block uppercase mb-1">
            AGGREGATED TYPE RATIO
          </span>
          <h4 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5">
            <PieChart01Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            نسبت مشارکت‌های مردمی
          </h4>
        </div>

        <div className="my-6">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-bold mb-2">
            <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-extrabold">
              <Alert01Icon className="w-3.5 h-3.5" />
              خرابی‌ها و مشکلات معابر ({toPersianDigits(stats.problemsCount)})
            </span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
              <Idea01Icon className="w-3.5 h-3.5" />
              طرح‌ها و ایده‌ها ({toPersianDigits(stats.ideasCount)})
            </span>
          </div>

          {/* Combined Progress Bar */}
          <div className="w-full h-3.5 bg-slate-100 dark:bg-zinc-950 rounded-full overflow-hidden flex">
            {stats.totalCount > 0 ? (
              <>
                <div
                  className="bg-gradient-to-r from-red-600 to-red-400"
                  style={{ width: `${problemsPct}%` }}
                  title={`مشکلات: ${toPersianDigits(problemsPct)}%`}
                />
                <div
                  className="bg-gradient-to-r from-emerald-500 to-emerald-400"
                  style={{ width: `${ideasPct}%` }}
                  title={`ایده‌ها: ${toPersianDigits(ideasPct)}%`}
                />
              </>
            ) : (
              <div className="w-full bg-slate-150 dark:bg-zinc-800 text-center text-[9px] text-slate-500 flex items-center justify-center">
                داده‌ای یافت نشد
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <Activity01Icon className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
          <span className="font-bold">
            مجموعاً {toPersianDigits(stats.totalCount)} مورد فعال در سامانه ایده
            و نیاز شهری
          </span>
        </div>
      </div>

      {/* 2. Municipal Progress Counter */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-205 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-lg flex flex-col justify-between transition-all">
        <div>
          <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-wider block uppercase mb-1">
            MUNICIPAL RESOLUTION
          </span>
          <h4 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5">
            <CheckmarkCircle01Icon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            نرخ برطرف‌سازی مشکلات
          </h4>
        </div>

        <div className="my-6 flex items-center gap-4">
          {/* Big number indicator */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90 animate-fade-in">
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="rgba(0,0,0,0.04)"
                dark-stroke="rgba(255,255,255,0.03)"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#14b8a6"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - resolvedPct / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold text-slate-850 dark:text-white font-mono">
              {toPersianDigits(resolvedPct)}%
            </span>
          </div>

          <div className="flex-1 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-bold">
                برطرف شده و نهایی:
              </span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                {toPersianDigits(resolvedCount)} مورد
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-bold">
                اکیپ‌های فعال در معبر:
              </span>
              <strong className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                {toPersianDigits(progressCount)} مورد
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-bold">
                در حال بررسی فنی:
              </span>
              <strong className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                {toPersianDigits(reviewCount + submittedCount)} مورد
              </strong>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-zinc-800/80 pt-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-bold">
          <Clock01Icon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-500" />
          <span>پایش آنلاین سرعت عمل اکیپ‌های شهرداری</span>
        </div>
      </div>

      {/* 3. Category Breakdown Bars */}
      <div className="bg-white dark:bg-[#0f172a] border border-slate-205 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-lg flex flex-col justify-between transition-all">
        <div>
          <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 font-mono tracking-wider block uppercase mb-1">
            CATEGORICAL STATS
          </span>
          <h4 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5">
            <BarChartIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            تعداد گزارش‌ها به تفکیک موضوع
          </h4>
        </div>

        <div className="my-3 space-y-2.5 max-h-[140px] overflow-y-auto pr-1">
          {categories.length > 0 ? (
            categories.slice(0, 4).map(([cat, count], i) => {
              const widthPct = Math.max(
                12,
                Math.round((count / maxCategoryCount) * 100),
              );
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 font-bold">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {cat}
                    </span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-300 font-semibold">
                      {toPersianDigits(count)} گزارش
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-zinc-950 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-600 to-teal-400 h-full rounded-full"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-xs text-slate-500 text-center py-6">
              گزارشی ثبت نشده است.
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 font-semibold">
          * نمودار فوق شامل {toPersianDigits(4)} دسته‌بندی برتر مشارکت‌ مردمی
          است.
        </div>
      </div>
    </div>
  );
}
