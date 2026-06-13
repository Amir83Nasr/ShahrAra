import { Map, ArrowLeft } from 'lucide-react';
import { User, Stats } from '../types';

import { Button } from '@/components/ui/button';
interface HeroProps {
  setTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  stats: Stats;
}

export default function Hero({ setTab }: HeroProps) {
  return (
    <div
      className="relative overflow-hidden py-16 md:py-24"
      id="shahr_ara_hero"
    >
      <div className="relative z-10 mx-auto max-w-7xl px-4 text-right sm:px-6 lg:px-8">
        {/* Top welcome indicator */}
        <div className="border-primary/20 bg-primary/[0.04] text-muted-foreground dark:border-primary/15 dark:bg-primary/[0.03] mb-4 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-[10px] font-bold backdrop-blur-sm sm:text-xs">
          <span className="relative flex h-1.5 w-1.5">
            <span className="bg-primary/50 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-primary relative inline-flex h-1.5 w-1.5 rounded-full" />
          </span>
          <span className="hidden sm:inline">
            سامانه ثبت، پیگیری و همفکری مطالبات شهروندی
          </span>
          <span className="sm:hidden">سامانه ثبت مطالبات شهروندی</span>
        </div>

        {/* Hero split layout */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          {/* Main Title content (7 columns) */}
          <div className="space-y-6 lg:col-span-7">
            <h1 className="text-foreground relative text-xl leading-tight font-extrabold sm:text-3xl sm:leading-snug lg:text-4xl lg:leading-normal">
              همراه با شهرداری در ساختن <br />
              <span className="shimmer-text from-primary via-primary/80 to-primary/60 dark:from-primary dark:via-primary/80 dark:to-primary/60 bg-linear-to-l bg-clip-text font-extrabold text-transparent">
                شهری پویاتر و زیباتر
              </span>
            </h1>

            <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed font-bold sm:text-base sm:leading-8">
              سامانه هوشمند{' '}
              <strong className="text-primary font-extrabold">شهرآرا</strong>{' '}
              پلی ارتباطی و دوسویه برای ارسال فوری گزارش مشکلات شهری (خرابی
              معابر، سد معابر، نارسایی روشنایی و پسماند) و همفکری پیرامون
              ایده‌های نوین زیباسازی محله‌ها است. ایده بدهید، مشکلات را ثبت کنید
              و به یاری مسئولان شهری بشتابید.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5">
              <Button
                onClick={() => setTab('submit')}
                className="w-full px-3 font-semibold sm:w-auto"
              >
                <span>شروع مشارکت فردی و ثبت گزارش</span>
                <ArrowLeft className="h-4 w-4 shrink-0" />
              </Button>

              <Button
                variant="outline"
                onClick={() => setTab('reports')}
                className="w-full px-3 font-semibold sm:w-auto"
              >
                <Map className="h-4 w-4 shrink-0" />
                <span>پایش زنده گزارش‌های قم</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
