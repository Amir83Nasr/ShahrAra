"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import {
  ArrowUp,
  Lightbulb,
  Map,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/utils/categoryUtils";

const SUGGESTIONS = [
  { label: "خرابی آسفالت", category: CATEGORIES[0], Icon: MapPin },
  { label: "روشنایی خیابان", category: CATEGORIES[2], Icon: Lightbulb },
  { label: "پسماند و بازیافت", category: CATEGORIES[3], Icon: Sparkles },
  { label: "همه گزارش‌ها", category: null, Icon: Search },
];

export default function Hero() {
  return (
    <section
      className="flex min-h-[calc(100dvh-3.5rem)] flex-col justify-center px-4 py-10 sm:px-6 md:min-h-dvh"
      id="shahr_ara_hero"
    >
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-foreground text-[26px] leading-tight font-semibold tracking-tight sm:text-4xl">
            امروز چه خبر از شهر؟
          </h1>
          <p className="text-muted-foreground mx-auto mt-2.5 max-w-md text-sm leading-relaxed">
            مشکل یا ایده‌ات را با شهرآرا در میان بگذار؛ مستقیم به شهرداری قم
            می‌رسد و مراحل رسیدگی شفاف قابل پیگیری است.
          </p>
        </div>

        {/* Composer — same visual language as the ChatGPT app input */}
        <div className="border-border bg-card rounded-[28px] border p-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)] dark:bg-[#303030] dark:shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
          <Link
            href="/submit"
            className="flex min-h-[72px] items-start rounded-3xl px-2 pt-1.5 pb-2 text-start"
          >
            <span className="text-muted-foreground text-[15px] leading-relaxed">
              مشکل شهری یا ایده‌ات را اینجا بنویس…
            </span>
          </Link>

          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                asChild
                aria-label="مشاهده گزارش‌ها روی نقشه"
              >
                <Link href="/reports">
                  <Map className="size-[18px]" />
                </Link>
              </Button>
            </div>

            <Button
              size="icon-lg"
              asChild
              aria-label="ثبت گزارش جدید"
              className="rounded-full"
            >
              <Link href="/submit">
                <ArrowUp className="size-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Suggestion chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {SUGGESTIONS.map(({ label, category, Icon }) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground h-8 gap-1.5 rounded-full bg-transparent px-3 text-[12px] font-normal"
            >
              <Link
                href={
                  category
                    ? `/reports?category=${encodeURIComponent(category)}`
                    : "/reports"
                }
              >
                <Icon className="size-3.5" />
                <span>{label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
