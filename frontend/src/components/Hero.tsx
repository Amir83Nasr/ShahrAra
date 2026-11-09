"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  Map,
  PenLine,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";

import { useApp } from "@/app/providers";
import { toPersianDigits } from "@/utils/numberUtils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ── Hero visual: a lightweight, decorative “live map” card ───────

const MAP_PINS = [
  {
    label: "روشنایی معابر",
    icon: Lightbulb,
    top: "26%",
    left: "32%",
    tone: "bg-status-in-progress",
    fg: "text-amber-950",
    glow: "bg-status-in-progress/30",
  },
  {
    label: "ایده زیباسازی",
    icon: Sparkles,
    top: "45%",
    left: "66%",
    tone: "bg-type-idea",
    fg: "text-white",
    glow: "bg-type-idea/30",
  },
  {
    label: "گزارش حل‌شده",
    icon: CheckCircle2,
    top: "70%",
    left: "40%",
    tone: "bg-status-resolved",
    fg: "text-white",
    glow: "bg-status-resolved/30",
  },
] as const;

function HeroMapVisual() {
  const { stats } = useApp();

  const miniStats = [
    {
      label: "حل‌شده",
      value: stats.byStatus.resolved ?? 0,
      icon: CheckCircle2,
      tone: "text-status-resolved",
    },
    {
      label: "در حال انجام",
      value: stats.byStatus.in_progress ?? 0,
      icon: Wrench,
      tone: "text-status-in-progress",
    },
    {
      label: "ایده",
      value: stats.ideasCount,
      icon: Lightbulb,
      tone: "text-type-idea",
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-md select-none lg:max-w-none">
      {/* Soft glow behind the card */}
      <div
        aria-hidden
        className="from-primary/25 via-chart-3/15 to-chart-5/20 absolute -inset-3 -z-10 rounded-[2.75rem] bg-gradient-to-br blur-2xl"
      />

      <div className="border-border/70 bg-card/90 shadow-primary/10 relative overflow-hidden rounded-[2rem] border shadow-2xl backdrop-blur">
        {/* Card header */}
        <div className="border-border/60 flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2.5">
              <span className="bg-status-resolved/60 absolute inline-flex h-full w-full animate-ping rounded-full" />
              <span className="bg-status-resolved relative inline-flex size-2.5 rounded-full" />
            </span>
            <span className="text-foreground text-xs font-extrabold">
              پایش زنده شهر
            </span>
            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
              قم
            </span>
          </div>
          <Map className="text-muted-foreground size-4" />
        </div>

        {/* Faux map */}
        <div className="bg-muted/30 relative aspect-[4/3] overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                "linear-gradient(to right, color-mix(in oklch, var(--primary) 13%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--primary) 13%, transparent) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage:
                "radial-gradient(ellipse at center, #000 52%, transparent 82%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, #000 52%, transparent 82%)",
            }}
          />

          {/* Roads / paths */}
          <svg
            aria-hidden
            viewBox="0 0 400 300"
            preserveAspectRatio="none"
            className="text-primary/25 absolute inset-0 h-full w-full"
          >
            <g fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M-10 72 C 70 52, 118 122, 196 100 S 322 58, 410 96" />
              <path d="M64 -10 C 84 78, 42 172, 94 310" />
              <path d="M302 -10 C 280 82, 334 182, 292 310" />
              <path d="M-10 214 C 104 190, 184 244, 410 200" />
            </g>
            <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55">
              <path d="M-10 138 C 96 126, 190 152, 410 134" />
              <path d="M178 -10 C 164 70, 190 180, 168 310" />
            </g>
          </svg>

          {/* Pins */}
          {MAP_PINS.map(({ label, icon: Icon, top, left, tone, fg, glow }) => (
            <span
              key={label}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top, left }}
            >
              <span className="relative flex flex-col items-center gap-1">
                <span className="relative flex items-center justify-center">
                  <span
                    className={cn(
                      "absolute inline-flex size-9 animate-ping rounded-full opacity-60",
                      glow,
                    )}
                  />
                  <span
                    className={cn(
                      "border-background flex size-8 items-center justify-center rounded-full border-2 shadow-lg",
                      tone,
                      fg,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                </span>
                <span className="border-border/60 bg-card/90 text-foreground rounded-full border px-2 py-0.5 text-[9px] font-bold whitespace-nowrap shadow-sm backdrop-blur">
                  {label}
                </span>
              </span>
            </span>
          ))}

          {/* Floating “status” card */}
          <div className="border-border/60 bg-card/90 absolute inset-x-3 bottom-3 rounded-2xl border p-3 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="bg-status-resolved/15 text-status-resolved flex size-9 shrink-0 items-center justify-center rounded-full">
                  <CheckCircle2 className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="text-foreground truncate text-[11px] font-extrabold">
                    گزارش شما در مسیر حل شدن است
                  </div>
                  <div className="text-muted-foreground truncate text-[10px]">
                    از ثبت تا اجرا، همه‌چیز شفاف است
                  </div>
                </div>
              </div>
              <span className="bg-status-resolved/15 text-status-resolved shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold">
                زنده
              </span>
            </div>
          </div>
        </div>

        {/* Mini stats footer */}
        <div className="divide-border/60 grid grid-cols-3 divide-x border-t">
          {miniStats.map(({ label, value, icon: Icon, tone }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-0.5 px-2 py-3"
            >
              <div className="flex items-baseline gap-1">
                <span className="text-foreground text-lg font-extrabold tabular-nums">
                  {toPersianDigits(value)}
                </span>
                <Icon className={cn("size-3.5", tone)} />
              </div>
              <span className="text-muted-foreground text-[10px] font-medium">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating badge — total reports */}
      <div className="border-border/60 bg-card/95 absolute -end-4 top-24 hidden items-center gap-2.5 rounded-2xl border px-3 py-2 shadow-xl backdrop-blur sm:flex">
        <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full">
          <Users className="size-4" />
        </span>
        <div>
          <div className="text-foreground text-xs font-extrabold tabular-nums">
            {toPersianDigits(stats.totalCount)} گزارش
          </div>
          <div className="text-muted-foreground text-[9px]">
            ثبت‌شده توسط شهروندان
          </div>
        </div>
      </div>

      {/* Floating badge — process */}
      <div className="border-border/60 bg-card/95 absolute -start-4 top-24 hidden items-center gap-2.5 rounded-2xl border px-3 py-2 shadow-xl backdrop-blur sm:flex">
        <span className="bg-status-in-progress/15 text-status-in-progress flex size-8 items-center justify-center rounded-full">
          <TrendingUp className="size-4" />
        </span>
        <div>
          <div className="text-foreground text-xs font-extrabold">
            پیگیری شفاف
          </div>
          <div className="text-muted-foreground text-[9px]">
            وضعیت لحظه‌ای هر گزارش
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────

const TRUST_POINTS = [
  { icon: PenLine, label: "ثبت در چند دقیقه" },
  { icon: SearchCheck, label: "پیگیری با کد رهگیری" },
  { icon: ShieldCheck, label: "پاسخ‌گویی شهرداری" },
];

export default function Hero() {
  return (
    <section id="shahr_ara_hero" className="relative overflow-hidden">
      {/* Ambient background decoration */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="bg-primary/15 absolute start-[8%] -top-28 size-72 rounded-full blur-3xl" />
        <div className="bg-chart-3/10 absolute end-[4%] top-16 size-64 rounded-full blur-3xl" />
        <div className="bg-chart-5/10 absolute start-1/3 -bottom-24 size-72 rounded-full blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pt-10 pb-14 sm:px-6 sm:pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-8 lg:pt-16 lg:pb-20">
        {/* Copy */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
          <div className="border-primary/20 bg-primary/[0.06] text-primary dark:border-primary/20 dark:bg-primary/10 inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-bold backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="bg-primary/60 absolute inline-flex h-full w-full animate-ping rounded-full" />
              <span className="bg-primary relative inline-flex size-2 rounded-full" />
            </span>
            <span className="truncate">
              سامانه هوشمند مشارکت شهروندی شهرآرا
            </span>
            <Sparkles className="size-3.5 shrink-0" />
          </div>

          <h1 className="text-foreground mt-5 text-[28px] leading-[1.35] font-extrabold sm:text-4xl sm:leading-[1.3] lg:text-[46px] lg:leading-[1.25]">
            شهر را با هم
            <span className="from-primary to-chart-3 bg-gradient-to-l bg-clip-text text-transparent">
              {" "}
              می‌سازیم
            </span>
          </h1>

          <p className="text-muted-foreground mt-4 max-w-xl text-[13px] leading-7 font-normal sm:text-[15px] sm:leading-8">
            از گزارش یک مشکل شهری تا ثبت یک ایده برای زیباتر شدن محله؛ صدای شما
            روی نقشه قم ثبت می‌شود و تا رسیدن به نتیجه، قابل پیگیری می‌ماند.
            <span className="text-foreground font-bold">
              {" "}
              بدون مراجعه حضوری، بدون کاغذبازی.
            </span>
          </p>

          <div className="mt-7 flex w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3 lg:justify-start">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/submit">
                <PenLine />
                <span>شروع مشارکت و ثبت گزارش</span>
                <ArrowLeft />
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/reports">
                <Map />
                <span>پایش زنده گزارش‌ها</span>
              </Link>
            </Button>
          </div>

          <div className="text-muted-foreground mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] font-medium lg:justify-start">
            {TRUST_POINTS.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="bg-status-resolved/10 text-status-resolved flex size-5 items-center justify-center rounded-full">
                  <Icon className="size-3" />
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Visual */}
        <HeroMapVisual />
      </div>

      {/* Bottom fade into the page */}
      <div
        aria-hidden
        className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent"
      />

      {/* Screen-reader hint for the decorative card */}
      <span className="sr-only">
        تصویری نمادین از نقشه شهر قم و وضعیت گزارش‌های شهروندان
      </span>
    </section>
  );
}
