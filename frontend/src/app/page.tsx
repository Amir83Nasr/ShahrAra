"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Link from "next/link";
import {
  PenLine,
  SearchCheck,
  TrendingUp,
  MapPin,
  Users,
  ArrowUpLeft,
} from "lucide-react";

import Hero from "@/components/Hero";
import StatsStrip from "@/components/StatsStrip";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toPersianDigits } from "@/utils/numberUtils";

// ── FEATURES ─────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: PenLine,
    title: "ثبت آسان و سریع",
    description:
      "مشکل یا ایده خود را در چند دقیقه ثبت کنید؛ کافی است روی نقشه محل را مشخص کنید و توضیحات را بنویسید.",
  },
  {
    icon: MapPin,
    title: "موقعیت دقیق روی نقشه",
    description:
      "هر گزارش به مکان دقیق در مناطق هشت‌گانه قم متصل می‌شود تا واحدهای اجرایی شهرداری سریع‌تر اقدام کنند.",
  },
  {
    icon: SearchCheck,
    title: "پیگیری شفاف",
    description:
      "با کد رهگیری اختصاصی، مراحل رسیدگی را لحظه‌به‌لحظه دنبال کنید: از بررسی تا اجرا و نتیجه نهایی.",
  },
  {
    icon: Users,
    title: "همفکری شهروندی",
    description:
      "ایده‌های زیباسازی محله را به اشتراک بگذارید و با لایک و بازخورد سایر شهروندان، به تصمیم‌سازان برسید.",
  },
];

function FeaturesSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mb-8">
        <h2 className="text-foreground text-lg font-semibold">چرا شهرآرا؟</h2>
        <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
          شهرآرا پلی دوسویه میان شهروندان و شهرداری است؛ صدای شما مستقیم به
          دستگاه‌های مسئول می‌رسد و نتیجه، شفاف به شما اعلام می‌شود.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="bg-card h-full py-5">
            <CardContent className="flex h-full flex-col gap-3 px-5">
              <div className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-xl">
                <Icon className="size-[18px]" />
              </div>
              <CardTitle className="text-foreground text-sm font-medium">
                {title}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-[13px] leading-relaxed">
                {description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ── HOW IT WORKS ─────────────────────────────────────────────────

const STEPS = [
  {
    icon: PenLine,
    title: "ثبت گزارش یا ایده",
    description:
      "مشکل شهری یا ایده خود را همراه با موقعیت نقشه ثبت کنید و کد رهگیری دریافت کنید.",
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
      "پس از تأیید، گزارش وارد مرحله اجرا می‌شود و روند پیشرفت آن تا حل نهایی قابل پیگیری است.",
  },
];

function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
      <div className="mb-8">
        <h2 className="text-foreground text-lg font-semibold">
          فرآیند کار چگونه است؟
        </h2>
        <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
          تنها سه گام تا شهری بهتر؛ مشارکت شما، پایداری شهر است.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, description }, idx) => (
          <div
            key={title}
            className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-5"
          >
            <div className="flex items-center justify-between">
              <div className="bg-muted text-foreground flex size-9 items-center justify-center rounded-xl">
                <Icon className="size-[18px]" />
              </div>
              <span className="text-muted-foreground font-mono text-xs tabular-nums">
                {toPersianDigits(idx + 1)}
              </span>
            </div>
            <h3 className="text-foreground text-sm font-medium">{title}</h3>
            <p className="text-muted-foreground text-[13px] leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── CTA ──────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
      <div className="border-border bg-card flex flex-col items-start justify-between gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-foreground text-base font-semibold">
            امروز شهروند اثرگذار شوید
          </h2>
          <p className="text-muted-foreground mt-1 max-w-lg text-[13px] leading-relaxed">
            هر گزارش، گامی برای بهبود شهر است. همین حالا مشکل محله خود را ثبت
            کنید یا ایده‌ای برای زیباتر شدن قم به اشتراک بگذارید.
          </p>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
          <Button asChild>
            <Link href="/submit">
              <span>ثبت گزارش یا ایده</span>
              <ArrowUpLeft />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/reports">
              <span>مشاهده گزارش‌ها</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Hero />
      <section className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">
        <StatsStrip />
      </section>
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </>
  );
}
