import { LogoIcon } from './Navbar';
import {
  Sparkles,
  ArrowLeft,
  AlertTriangle,
  Lightbulb,
  Shield,
} from 'lucide-react';
import { User, Stats } from '../types';
import { toPersianDigits } from '../utils/numberUtils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface HeroProps {
  setTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  stats: Stats;
}

export default function Hero({
  setTab,
  currentUser,
  onOpenAuth,
  stats,
}: HeroProps) {
  return (
    <div
      className="relative overflow-hidden py-16 md:py-24"
      id="shahr_ara_hero"
    >
      {/* Decorative ambient glowing backdrops */}
      <div className="pointer-events-none absolute top-1/4 right-1/4 h-100 w-100 rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/3 left-1/4 h-75 w-75 rounded-full bg-primary/5 blur-[100px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-right sm:px-6 lg:px-8">
        {/* Top welcome indicator */}
        <Badge
          variant="outline"
          className="mb-5 rounded-full px-3 py-1.5 text-xs font-bold shadow-sm"
        >
          <Sparkles className="ml-1.5 h-3.5 w-3.5 animate-pulse text-primary" />
          سامانه ثبت، پیگیری و همفکری مطالبات شهروندی
        </Badge>

        {/* Hero split layout */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Main Title content (7 columns) */}
          <div className="space-y-8 lg:col-span-7">
            <h1 className="text-2xl leading-tight font-black text-foreground sm:text-3xl sm:leading-snug lg:text-4xl lg:leading-normal">
              همراه با شهرداری در ساختن <br />
              <span className="bg-linear-to-l from-primary to-primary/60 bg-clip-text font-black text-transparent dark:from-primary dark:to-primary/60">
                شهری پویاتر و زیباتر
              </span>
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed font-bold text-muted-foreground sm:text-base sm:leading-8">
              سامانه هوشمند{' '}
              <strong className="text-primary font-extrabold">شهرآرا</strong>{' '}
              پلی ارتباطی و دوسویه برای ارسال فوری گزارش مشکلات شهری (خرابی
              معابر، سد معابر، نارسایی روشنایی و پسماند) و همفکری پیرامون
              ایده‌های نوین زیباسازی محله‌ها است. ایده بدهید، مشکلات را ثبت کنید
              و به یاری مسئولان شهری بشتابید.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-5 pt-6">
              <Button
                onClick={() => setTab('submit')}
                size="lg"
                className="font-black"
              >
                <span>شروع مشارکت فردی و ثبت گزارش</span>
                <ArrowLeft className="h-4 w-4 shrink-0" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setTab('reports')}
                className="font-black"
              >
                <span>پایش زنده گزارش‌های قم</span>
              </Button>

              {!currentUser && (
                <Button
                  variant="link"
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-xs"
                >
                  ورود به حساب کاربری شهروندی
                </Button>
              )}
            </div>

            {/* Micro stats banner */}
            <div className="grid max-w-lg grid-cols-3 gap-4 border-t border-border pt-8 font-mono">
              <div className="rounded-lg border border-border bg-card p-3.5 shadow-sm transition-colors">
                <span className="block text-sm font-black text-foreground">
                  {toPersianDigits(stats.totalCount)} مورد
                </span>
                <span className="font-sans text-[10px] text-muted-foreground">
                  کل درخواست‌های ثبت شده
                </span>
              </div>
              <div className="rounded-lg border border-border bg-card p-3.5 shadow-sm transition-colors">
                <span className="block text-sm font-black text-type-problem">
                  {toPersianDigits(stats.problemsCount)} مورد
                </span>
                <span className="font-sans text-[10px] text-muted-foreground">
                  گزارش فرورفتگی و خرابی
                </span>
              </div>
              <div className="rounded-lg border border-border bg-card p-3.5 shadow-sm transition-colors">
                <span className="block text-sm font-black text-type-idea">
                  {toPersianDigits(stats.ideasCount)} طرح خلاق
                </span>
                <span className="font-sans text-[10px] text-muted-foreground">
                  ایده ارسالی زیباسازی
                </span>
              </div>
            </div>
          </div>

          {/* Large Decorative Illustration Card (5 columns) */}
          <div className="flex justify-center lg:col-span-5">
            <div className="group relative flex min-h-90 w-full max-w-sm flex-col items-center justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-xl transition-all dark:shadow-2xl">
              <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/5 to-transparent" />

              <LogoIcon className="text-primary mt-4 h-20 w-20 transition-transform duration-500 group-hover:scale-110" />

              <div className="my-6 flex flex-col items-center space-y-2.5">
                <h3 className="text-2xl leading-tight font-black text-foreground">
                  سامانه هوشمند شهرآرا
                </h3>
                <p className="px-4 text-xs leading-relaxed font-bold text-muted-foreground">
                  طراحی شده جهت تسهیل امور اداری و اتصال مستقیم شهروندان مناطق
                  پنج‌گانه شهر قم به اکیپ‌های فنی و زیباسازی معابر شهرداری.
                </p>
              </div>

              {/* Status metrics indicators */}
              <div className="flex w-full justify-around rounded-xl border border-border bg-muted p-3 text-center text-xs transition-colors">
                <div>
                  <span className="block font-mono font-black text-foreground">
                    ۳۵ ثانیه
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    زمان میانگین ثبت
                  </span>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-auto self-stretch"
                />
                <div>
                  <span className="block font-mono font-black text-primary">
                    ۱۰۰٪ برخط
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    پایش ۲۴ ساعته
                  </span>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-auto self-stretch"
                />
                <div>
                  <span className="block font-mono font-black text-status-in-progress">
                    پیگیری پیامکی
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    اطلاع‌رسانی بلادرنگ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Section Divider with Features (Bento layout, 3 cards in row) */}
        <div className="mt-16 grid grid-cols-1 gap-6 border-t border-border pt-12 md:grid-cols-3">
          <Card className="border-border shadow-sm ring-0 transition-all hover:border-muted-foreground/30">
            <CardHeader>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg border-type-problem/20 bg-type-problem/10 text-right text-type-problem">
                <AlertTriangle className="mx-auto h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-black">
                گزارش سریع معایب معبر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs leading-relaxed">
                شکستگی‌های آسفالت، موانع فیزیکی پیاده‌رو، سوختگی لامپ‌های عابر و
                انباشت غیر مجاز پسماندهای ساختمانی را به صورت مکان‌یافته اطلاع
                دهید.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm ring-0 transition-all hover:border-muted-foreground/30">
            <CardHeader>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg border-type-idea/20 bg-type-idea/10 text-right text-type-idea">
                <Lightbulb className="mx-auto h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-black">
                طرح ایده‌های تلطیف شهری
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs leading-relaxed">
                ایده‌های نوآورانه در حوزه ایجاد دیوار سبز، سطل زباله هوشمند
                الکترونیک، نورپردازی مدرن تقاطع‌ها و فضاهای پارکی را به گوش
                مدیران شهری برسانید.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm ring-0 transition-all hover:border-muted-foreground/30">
            <CardHeader>
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg border-status-in-progress/20 bg-status-in-progress/10 text-right text-status-in-progress">
                <Shield className="mx-auto h-5 w-5" strokeWidth={2.5} />
              </div>
              <CardTitle className="text-sm font-black">
                پاسخگویی رسمی مسئولان
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs leading-relaxed">
                پرونده به مجرد بررسی تخصصی با پاسخ کتبی مستند شده و اکیپ‌های فنی
                به محل ارجاع می‌شوند تا درصد حل مشکلات ارتقا یابد.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
