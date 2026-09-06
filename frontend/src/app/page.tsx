"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import {
  ClipboardList,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  MapPin,
  Heart,
  ArrowLeft,
} from "lucide-react";

import Hero from "@/components/Hero";
import { useApp } from "./providers";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/utils/numberUtils";
import { formatPersian } from "@/utils/persianDate";
import { CATEGORIES } from "@/utils/categoryUtils";
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  TYPE_LABELS,
  TYPE_BADGE_CLASS,
} from "@/utils/requestBadges";
import { cn } from "@/lib/utils";

// ── STATS / OVERVIEW ─────────────────────────────────────────────

function StatsSection() {
  const { stats, loading } = useApp();

  const cards = [
    {
      label: "کل گزارش‌ها",
      value: stats.totalCount,
      icon: ClipboardList,
      color: "text-primary",
    },
    {
      label: "مشکلات ثبت‌شده",
      value: stats.problemsCount,
      icon: AlertCircle,
      color: "text-type-problem",
    },
    {
      label: "ایده‌های شهری",
      value: stats.ideasCount,
      icon: Lightbulb,
      color: "text-type-idea",
    },
    {
      label: "حل‌شده",
      value: stats.byStatus.resolved,
      icon: CheckCircle,
      color: "text-status-resolved",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted",
                  color,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                {loading ? (
                  <div className="bg-muted h-7 w-10 animate-pulse rounded" />
                ) : (
                  <div className="text-foreground text-2xl font-extrabold">
                    {toPersianDigits(value ?? 0)}
                  </div>
                )}
                <div className="text-muted-foreground mt-0.5 text-xs font-semibold">
                  {label}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ── RECENT REPORTS ───────────────────────────────────────────────

function RecentReportsSection() {
  const { requests, loading } = useApp();

  const recent = requests
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 4);

  if (!loading && recent.length === 0) return null;

  return (
    <section className="border-t bg-muted/30 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-xl font-extrabold">
              آخرین گزارش‌های شهروندان
            </h2>
            <p className="text-muted-foreground mt-1 text-xs">
              تازه‌ترین مطالبات ثبت‌شده از سراسر مناطق قم
            </p>
          </div>
          <Button variant="ghost" asChild className="gap-1">
            <Link href="/reports">
              مشاهده همه
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-border bg-card">
                  <CardContent className="flex flex-col gap-2.5 px-5">
                    <div className="bg-muted h-5 w-24 animate-pulse rounded" />
                    <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
                    <div className="bg-muted h-3 w-full animate-pulse rounded" />
                    <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))
            : recent.map((item) => (
                <Link key={item.id} href="/reports" className="group">
                  <Card className="border-border bg-card h-full transition-all duration-300 group-hover:shadow-sm">
                    <CardContent className="flex h-full flex-col gap-2.5 px-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
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
                            "text-xs font-semibold",
                            STATUS_BADGE_CLASS[item.status],
                          )}
                        >
                          {STATUS_LABELS[item.status]}
                        </Badge>
                      </div>

                      <CardTitle className="text-foreground line-clamp-1 text-sm font-extrabold">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground line-clamp-2 min-h-[2lh] text-xs leading-relaxed">
                        {item.description}
                      </CardDescription>

                      <div className="text-muted-foreground mt-auto flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {toPersianDigits(item.region)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3.5 w-3.5" />
                          {toPersianDigits(item.likes)}
                        </span>
                      </div>
                      <div className="text-muted-foreground/70 text-[10px]">
                        {formatPersian(item.createdAt)}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}

// ── CATEGORIES ───────────────────────────────────────────────────

function CategoriesSection() {
  const { stats } = useApp();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h2 className="text-foreground text-xl font-extrabold">
          دسته‌بندی موضوعی
        </h2>
        <p className="text-muted-foreground mt-1 text-xs">
          گزارش‌ها و ایده‌های خود را بر اساس موضوع دنبال کنید
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {CATEGORIES.map((cat) => {
          const count = stats.byCategory[cat] ?? 0;
          return (
            <Link
              key={cat}
              href={`/reports?category=${encodeURIComponent(cat)}`}
              className="border-border bg-card hover:border-primary/40 hover:bg-muted/50 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors"
            >
              {cat}
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-extrabold">
                {toPersianDigits(count)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsSection />
      <RecentReportsSection />
      <CategoriesSection />
    </>
  );
}
