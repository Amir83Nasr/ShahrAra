"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import { Map, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <div
      className="relative overflow-hidden py-12 sm:py-16 md:py-24"
      id="shahr_ara_hero"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        {/* Top welcome indicator */}
        <div className="border-primary/20 bg-primary/[0.04] text-muted-foreground dark:border-primary/15 dark:bg-primary/[0.03] mb-4 inline-flex max-w-full items-center gap-2.5 rounded-full border px-4 py-2 text-xs font-bold backdrop-blur-sm ">
          <span className="relative flex h-1.5 w-1.5">
            <span className="bg-primary/50 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-primary relative inline-flex h-1.5 w-1.5 rounded-full" />
          </span>
          <span className="hidden sm:inline">
            سامانه ثبت، پیگیری و همفکری مطالبات شهروندی
          </span>
          <span className="sm:hidden truncate">سامانه ثبت مطالبات شهروندی</span>
        </div>

        {/* Hero centered layout */}
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6">
          <h1 className="text-foreground relative text-2xl leading-snug font-extrabold sm:text-3xl sm:leading-snug lg:text-4xl lg:leading-normal">
            همراه با شهرداری در ساختن <br />
            <span className="text-primary font-extrabold">
              شهری پویاتر و زیباتر
            </span>
          </h1>

          <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed font-normal sm:text-base sm:leading-8">
            سامانه هوشمند{" "}
            <strong className="text-primary font-extrabold">شهرآرا</strong> پلی
            ارتباطی و دوسویه برای ارسال فوری گزارش مشکلات شهری (خرابی معابر، سد
            معابر، نارسایی روشنایی و پسماند) و همفکری پیرامون ایده‌های نوین
            زیباسازی محله‌ها است. ایده بدهید، مشکلات را ثبت کنید و به یاری
            مسئولان شهری بشتابید.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-5 w-full">
            <Button asChild className="w-full px-4 sm:w-auto">
              <Link href="/submit">
                <span>شروع مشارکت فردی و ثبت گزارش</span>
                <ArrowLeft className="h-4 w-4 shrink-0" />
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="w-full px-4 font-semibold sm:w-auto"
            >
              <Link href="/reports">
                <Map className="h-4 w-4 shrink-0" />
                <span>پایش زنده گزارش‌های قم</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
