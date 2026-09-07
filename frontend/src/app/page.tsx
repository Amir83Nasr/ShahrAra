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
  ArrowLeft,
} from "lucide-react";

import Hero from "@/components/Hero";
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
      "هر گزارش به مکان دقیق در مناطق هشت‌گانه قم متصل می‌شود تا Units اجرایی شهرداری سریع‌تر اقدام کنند.",
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
    <section className="bg-muted/30 border-t border-b py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-foreground text-2xl font-extrabold">
            چرا شهرآرا؟
          </h2>
          <p className="text-muted-foreground mx-auto mt-2 max-w-2xl text-sm leading-relaxed">
            شهرآرا پلی دوسویه میان شهروندان و شهرداری است؛ صدای شما مستقیم به
            دستگاه‌های مسئول می‌رسد و نتیجه، شفاف به شما اعلام می‌شود.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-border bg-card h-full py-6">
              <CardContent className="flex h-full flex-col gap-3 px-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-foreground text-sm font-extrabold">
                    {title}
                  </CardTitle>
                </div>
                <CardDescription className="text-muted-foreground text-xs leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
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
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="text-foreground text-2xl font-extrabold">
          فرآیند کار چگونه است؟
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-2xl text-sm leading-relaxed">
          تنها سه گام تا شهری بهتر؛ مشارکت شما، پایداری شهر است.
        </p>
      </div>

      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, title, description }, idx) => (
          <div
            key={title}
            className="relative flex flex-col items-center text-center"
          >
            <div className="relative">
              <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-full">
                <Icon className="h-7 w-7" />
              </div>
              <span className="bg-primary text-primary-foreground absolute -top-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold">
                {toPersianDigits(idx + 1)}
              </span>
            </div>
            <h3 className="text-foreground mt-4 text-sm font-extrabold">
              {title}
            </h3>
            <p className="text-muted-foreground mt-2 max-w-xs text-xs leading-relaxed">
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
    <section className="mx-auto max-w-3xl px-4 pb-24 text-center sm:px-6 lg:px-8">
      <h2 className="text-foreground text-2xl font-extrabold sm:text-3xl">
        امروز شهروند اثرگذار شوید
      </h2>
      <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-sm leading-relaxed sm:text-base">
        هر گزارش، گامی برای بهبود شهر است. همین حالا مشکل محله خود را ثبت کنید
        یا ایده‌ای برای زیباتر شدن قم به اشتراک بگذارید.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          size="lg"
          asChild
          className="h-12 w-full text-base font-semibold sm:w-auto"
        >
          <Link href="/submit">
            <span>ثبت گزارش یا ایده</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          asChild
          className="h-12 w-full text-base font-semibold sm:w-auto"
        >
          <Link href="/reports">
            <span>مشاهده گزارش‌ها</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}

// ── PAGE ─────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
    </>
  );
}
