"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  ArrowLeft,
  ArrowUpLeft,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Construction,
  Heart,
  Lightbulb,
  MapPin,
  PenLine,
  SearchCheck,
  Shapes,
  Sparkles,
  ThumbsUp,
  TrafficCone,
  Trash2,
  TreePine,
  TrendingUp,
  Users,
} from "lucide-react";

import Hero from "@/components/Hero";
import StatsStrip from "@/components/StatsStrip";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "./providers";
import { CATEGORIES } from "@/utils/categoryUtils";
import { toPersianDigits } from "@/utils/numberUtils";
import { formatPersian } from "@/utils/persianDate";
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  TYPE_LABELS,
  TYPE_BADGE_CLASS,
} from "@/utils/requestBadges";
import { cn } from "@/lib/utils";

// ── Shared section heading ───────────────────────────────────────

function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  className?: string;
}) {
  return (
    <div
      className={cn("mx-auto mb-8 max-w-2xl text-center sm:mb-11", className)}
    >
      <span className="border-primary/20 bg-primary/[0.06] text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold">
        <Sparkles className="size-3.5" />
        {eyebrow}
      </span>
      <h2 className="text-foreground mt-3 text-2xl leading-snug font-extrabold sm:text-3xl">
        {title}
      </h2>
      <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-[13px] leading-7 sm:text-sm sm:leading-7">
        {description}
      </p>
    </div>
  );
}

// ── Categories ───────────────────────────────────────────────────

const CATEGORY_META: Record<string, { icon: LucideIcon; tone: string }> = {
  "آسفالت و معابر": {
    icon: Construction,
    tone: "bg-chart-5/10 text-chart-5",
  },
  "زیباسازی و فضای سبز": {
    icon: TreePine,
    tone: "bg-type-idea/10 text-type-idea",
  },
  "روشنایی و برق شهری": {
    icon: Lightbulb,
    tone: "bg-status-in-progress/10 text-status-in-progress",
  },
  "مدیریت پسماند و بازیافت": {
    icon: Trash2,
    tone: "bg-chart-4/10 text-chart-4",
  },
  "ترافیک و حمل و نقل": {
    icon: TrafficCone,
    tone: "bg-chart-3/10 text-chart-3",
  },
  "مناسب‌سازی و خدمات اجتماعی": {
    icon: Accessibility,
    tone: "bg-primary/10 text-primary",
  },
  سایر: { icon: Shapes, tone: "bg-muted text-muted-foreground" },
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "آسفالت و معابر": "چاله، جدول، پیاده‌رو",
  "زیباسازی و فضای سبز": "درخت، گل‌کاری، المان شهری",
  "روشنایی و برق شهری": "چراغ خاموش، تیر برق",
  "مدیریت پسماند و بازیافت": "زباله، نظافت، بازیافت",
  "ترافیک و حمل و نقل": "خط‌کشی، ایستگاه، ترافیک",
  "مناسب‌سازی و خدمات اجتماعی": "معلولان، سالمندان، خدمات",
  سایر: "هر موضوع دیگری",
};

function CategoriesSection() {
  const { stats } = useApp();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <SectionHeading
        eyebrow="دسته‌بندی موضوعی"
        title="دنبال چه موضوعی هستید؟"
        description="موضوع مورد نظر خود را انتخاب کنید و گزارش‌ها و ایده‌های همان دسته را روی نقشه ببینید."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {CATEGORIES.map((name) => {
          const meta = CATEGORY_META[name] ?? CATEGORY_META["سایر"];
          const Icon = meta.icon;
          const count = stats.byCategory[name] ?? 0;

          return (
            <Link
              key={name}
              href={`/reports?category=${encodeURIComponent(name)}`}
              className="group border-border/70 bg-card hover:border-primary/30 relative flex flex-col gap-3 overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div
                aria-hidden
                className="bg-primary/5 absolute -end-8 -top-8 size-20 rounded-full blur-2xl transition-opacity group-hover:opacity-100"
              />

              <div className="relative flex items-start justify-between gap-2">
                <span
                  className={cn(
                    "flex size-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110",
                    meta.tone,
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="bg-muted/70 text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums">
                  {toPersianDigits(count)} مورد
                </span>
              </div>

              <div className="relative">
                <div className="text-foreground group-hover:text-primary text-[12px] font-extrabold transition-colors sm:text-[13px]">
                  {name}
                </div>
                <div className="text-muted-foreground mt-1 text-[10px] leading-5 sm:text-[11px]">
                  {CATEGORY_DESCRIPTIONS[name] ?? "موضوع دیگر"}
                </div>
              </div>

              <ArrowUpLeft className="text-primary absolute end-3 bottom-3 size-3.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          );
        })}

        {/* Fills the 4-column grid and gives a clear “see all” exit */}
        <Link
          href="/reports"
          className="group from-primary via-primary to-chart-3 text-primary-foreground relative flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div
            aria-hidden
            className="absolute -end-8 -top-8 size-24 rounded-full bg-white/20 blur-2xl"
          />
          <div className="relative flex size-11 items-center justify-center rounded-2xl bg-white/15">
            <ThumbsUp className="size-5" />
          </div>
          <div className="relative">
            <div className="text-[12px] font-extrabold sm:text-[13px]">
              همه گزارش‌ها
            </div>
            <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-white/80 sm:text-[11px]">
              مشاهده روی نقشه
              <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: PenLine,
    title: "ثبت آسان و سریع",
    description:
      "در چند دقیقه ثبت کنید: یک توضیح کوتاه، یک نقطه روی نقشه و تمام. بدون فرم‌های طولانی.",
  },
  {
    icon: MapPin,
    title: "موقعیت دقیق روی نقشه",
    description:
      "هر گزارش به مکان دقیق و منطقه شهری مربوط متصل می‌شود تا واحد اجرایی سریع‌تر اقدام کند.",
  },
  {
    icon: SearchCheck,
    title: "پیگیری شفاف",
    description:
      "با کد رهگیری و اعلان‌های پنل کاربری، هر تغییر وضعیت را از بررسی تا اجرا دنبال کنید.",
  },
  {
    icon: Users,
    title: "همفکری شهروندی",
    description:
      "ایده‌های زیباسازی محله را به اشتراک بگذارید و با حمایت سایر شهروندان به اجرا برسانید.",
  },
];

function FeaturesSection() {
  return (
    <section className="border-border/70 bg-muted/30 border-y py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="چرا شهرآرا؟"
          title="پلی دوسویه میان شهروند و شهرداری"
          description="صدای شما مستقیم به دستگاه‌های مسئول می‌رسد و نتیجه، شفاف به شما اعلام می‌شود."
        />

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group border-border/70 bg-card hover:border-primary/25 relative h-full overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6"
            >
              <div
                aria-hidden
                className="bg-primary/5 group-hover:bg-primary/10 absolute -end-10 -top-10 size-24 rounded-full blur-2xl transition-colors"
              />
              <div className="from-primary to-chart-3 shadow-primary/20 relative flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg">
                <Icon className="size-5" />
              </div>
              <h3 className="text-foreground relative mt-4 text-sm font-extrabold">
                {title}
              </h3>
              <p className="text-muted-foreground relative mt-2 text-xs leading-6">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── How it works ─────────────────────────────────────────────────

const STEPS = [
  {
    icon: PenLine,
    title: "ثبت گزارش یا ایده",
    description:
      "مشکل شهری یا ایده خود را همراه با موقعیت نقشه ثبت کنید و کد رهگیری بگیرید.",
  },
  {
    icon: SearchCheck,
    title: "بررسی توسط شهرداری",
    description:
      "کارشناسان شهرداری گزارش شما را بررسی می‌کنند و نتیجه در پنل کاربری اعلام می‌شود.",
  },
  {
    icon: TrendingUp,
    title: "اجرا و اطلاع‌رسانی",
    description:
      "پس از تأیید، گزارش وارد مرحله اجرا می‌شود و پیشرفت آن تا حل نهایی قابل پیگیری است.",
  },
];

function HowItWorksSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <SectionHeading
        eyebrow="فرآیند کار"
        title="از یک گزارش تا یک اتفاق"
        description="تنها سه گام تا شهری بهتر؛ مشارکت شما، پایداری شهر است."
      />

      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-8">
        <div
          aria-hidden
          className="border-primary/20 absolute inset-x-[18%] top-8 hidden border-t-2 border-dashed md:block"
        />

        {STEPS.map(({ icon: Icon, title, description }, idx) => (
          <div
            key={title}
            className="group relative flex flex-col items-center text-center"
          >
            <div className="relative">
              <div className="border-border/70 bg-card group-hover:border-primary/30 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
                <Icon className="text-primary h-7 w-7" />
              </div>
              <span className="bg-primary text-primary-foreground ring-background absolute -end-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full text-[11px] font-extrabold shadow-sm ring-2">
                {toPersianDigits(idx + 1)}
              </span>
            </div>
            <h3 className="text-foreground mt-4 text-sm font-extrabold">
              {title}
            </h3>
            <p className="text-muted-foreground mt-2 max-w-xs text-xs leading-6">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Recent activity ──────────────────────────────────────────────

function RecentReportsSection() {
  const { requests, loading } = useApp();

  const recent = [...requests]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3);

  return (
    <section className="border-border/70 bg-muted/30 border-y py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:mb-11 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="border-primary/20 bg-primary/[0.06] text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold">
              <TrendingUp className="size-3.5" />
              تازه‌ترین فعالیت‌ها
            </span>
            <h2 className="text-foreground mt-3 text-2xl leading-snug font-extrabold sm:text-3xl">
              شهروندان چه می‌گویند؟
            </h2>
            <p className="text-muted-foreground mt-2 max-w-xl text-[13px] leading-7 sm:text-sm">
              آخرین گزارش‌ها و ایده‌های ثبت‌شده روی نقشه قم؛ همین حالا ببینید
              شهر در چه مسیری حرکت می‌کند.
            </p>
          </div>

          <Button variant="outline" asChild className="shrink-0">
            <Link href="/reports">
              <span>مشاهده همه</span>
              <ArrowLeft />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {loading && recent.length === 0
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="h-full">
                  <CardContent className="flex flex-col gap-3 px-4 sm:px-5">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="mt-2 flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))
            : recent.map((item) => (
                <Link
                  key={item.id}
                  href={`/reports/${encodeURIComponent(item.id)}`}
                  className="group block h-full"
                >
                  <Card className="hover:border-primary/25 h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                    <CardContent className="flex h-full flex-col gap-3 px-4 sm:px-5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-semibold",
                            TYPE_BADGE_CLASS[item.type],
                          )}
                        >
                          {TYPE_LABELS[item.type]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-semibold",
                            STATUS_BADGE_CLASS[item.status],
                          )}
                        >
                          {STATUS_LABELS[item.status]}
                        </Badge>
                      </div>

                      <CardTitle className="group-hover:text-primary line-clamp-1 text-sm font-extrabold transition-colors">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 min-h-[2lh] text-xs leading-6">
                        {item.description}
                      </CardDescription>

                      <div className="text-muted-foreground border-border/60 mt-auto flex items-center justify-between gap-2 border-t pt-3 text-[10px]">
                        <span className="flex min-w-0 items-center gap-1">
                          <MapPin className="size-3.5 shrink-0" />
                          <span className="truncate">
                            {toPersianDigits(item.region)}
                          </span>
                        </span>
                        <span className="flex shrink-0 items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="size-3.5" />
                            {toPersianDigits(item.likes)}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays className="size-3.5" />
                            {toPersianDigits(
                              formatPersian(item.createdAt, "yyyy/MM/dd"),
                            )}
                          </span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

          {!loading && recent.length === 0 && (
            <div className="border-border/70 bg-card col-span-full flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-12 text-center">
              <span className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                <ClipboardList className="size-5" />
              </span>
              <div className="text-foreground text-sm font-extrabold">
                هنوز گزارشی ثبت نشده است
              </div>
              <p className="text-muted-foreground max-w-sm text-xs leading-6">
                اولین نفری باشید که مشکل یا ایده خود را برای شهر ثبت می‌کند.
              </p>
              <Button asChild className="mt-2">
                <Link href="/submit">ثبت اولین گزارش</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "ثبت گزارش یا ایده چه هزینه‌ای دارد؟",
    a: "هیچ؛ ثبت گزارش و ایده کاملاً رایگان است. فقط کافی است با شماره موبایل خود وارد حساب کاربری شوید.",
  },
  {
    q: "چطور از نتیجه گزارش باخبر شوم؟",
    a: "هر گزارش یک کد رهگیری دارد و وضعیت آن در پنل کاربری شما به‌روزرسانی می‌شود. با هر تغییر وضعیت، اعلان دریافت می‌کنید.",
  },
  {
    q: "آیا اطلاعات شخصی من محرمانه می‌ماند؟",
    a: "بله. شماره تماس و مشخصات هویتی شما در نمایش عمومی گزارش‌ها به‌صورت پوشیده نمایش داده می‌شود.",
  },
  {
    q: "بررسی گزارش‌ها چقدر طول می‌کشد؟",
    a: "کارشناسان شهرداری گزارش را بررسی می‌کنند و وضعیت آن را در پنل شما به‌روز می‌کنند. زمان دقیق به نوع و حجم درخواست بستگی دارد.",
  },
];

function FaqSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <SectionHeading
        eyebrow="پرسش‌های پرتکرار"
        title="هر چیزی که باید بدانید"
        description="پاسخ کوتاه به سؤال‌هایی که بیشتر شهروندان قبل از شروع می‌پرسند."
      />

      <div className="mx-auto max-w-3xl space-y-3">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group border-border/70 bg-card open:border-primary/25 rounded-2xl border shadow-sm transition-colors [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="text-foreground flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[13px] font-extrabold select-none sm:text-sm">
              <span>{q}</span>
              <span className="bg-muted text-muted-foreground group-open:bg-primary group-open:text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-open:rotate-180">
                <ChevronDown className="size-4" />
              </span>
            </summary>
            <div className="text-muted-foreground px-5 pb-5 text-xs leading-7 sm:text-[13px]">
              {a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

// ── CTA ──────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
      <div className="from-primary via-primary to-chart-3 text-primary-foreground shadow-primary/20 relative overflow-hidden rounded-[2rem] bg-gradient-to-br px-6 py-12 shadow-2xl sm:px-12 sm:py-16">
        {/* Decorative layers */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage:
              "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
          }}
        />
        <div
          aria-hidden
          className="absolute -end-16 -top-20 size-64 rounded-full bg-white/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -start-16 -bottom-24 size-72 rounded-full bg-white/15 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <span className="border-primary-foreground/25 bg-primary-foreground/10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold backdrop-blur-sm">
            <CheckCircle2 className="size-3.5" />
            همین امروز شروع کنید
          </span>

          <h2 className="mt-4 text-2xl leading-snug font-extrabold sm:text-3xl md:text-4xl">
            شهر بهتر، از یک گزارش شروع می‌شود
          </h2>
          <p className="text-primary-foreground/85 mx-auto mt-3 max-w-xl text-[13px] leading-7 font-medium sm:mt-4 sm:text-sm sm:leading-8">
            هر گزارش، گامی برای بهبود شهر است. مشکل محله خود را ثبت کنید یا
            ایده‌ای برای زیباتر شدن قم به اشتراک بگذارید.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              asChild
              size="lg"
              className="w-full bg-white text-slate-900 hover:bg-white/90 sm:w-auto"
            >
              <Link href="/submit">
                <PenLine />
                <span>ثبت گزارش یا ایده</span>
                <ArrowLeft />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              size="lg"
              className="text-primary-foreground border-primary-foreground/40 bg-primary-foreground/10 hover:bg-primary-foreground/20 hover:text-primary-foreground w-full sm:w-auto"
            >
              <Link href="/reports">
                <MapPin />
                <span>مشاهده گزارش‌ها</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 pt-2 pb-6 sm:px-6 sm:pb-10 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-foreground text-sm font-extrabold">
            شهرآرا در یک نگاه
          </h2>
          <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
            <span className="bg-status-resolved size-1.5 rounded-full" />
            به‌روزرسانی خودکار
          </span>
        </div>
        <StatsStrip />
      </section>

      <CategoriesSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RecentReportsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
