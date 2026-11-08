import Link from "next/link";
import { ClipboardList, House, MapPinOff, PenLine } from "lucide-react";

import { Button } from "@/components/ui/button";

// صفحه ۴۰۴ سراسری — برای آدرس‌های ناشناخته و notFound() در کل اپ.
export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[calc(100dvh-9rem)] w-full max-w-lg flex-col items-center justify-center px-4 py-10 text-center md:min-h-[calc(100dvh-5rem)]">
      <div className="border-primary/15 bg-primary/[0.06] text-primary ring-primary/10 mb-5 flex size-16 items-center justify-center rounded-3xl border ring-1 ring-inset">
        <MapPinOff className="size-7" strokeWidth={1.8} />
      </div>

      <span className="text-primary/85 text-[42px] leading-none font-extrabold tracking-tight tabular-nums sm:text-5xl">
        ۴۰۴
      </span>

      <h1 className="text-foreground mt-3 text-lg font-extrabold sm:text-xl">
        این مسیر در شهرآرا پیدا نشد
      </h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-[13px] leading-7 sm:text-sm">
        نشانی واردشده معتبر نیست یا جابه‌جا شده است. از یکی از مسیرهای زیر ادامه
        دهید.
      </p>

      <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
        <Button asChild className="h-11 w-full sm:flex-1">
          <Link href="/">
            <House />
            <span>بازگشت به خانه</span>
          </Link>
        </Button>
        <Button variant="outline" asChild className="h-11 w-full sm:flex-1">
          <Link href="/reports">
            <ClipboardList />
            <span>مشاهده گزارش‌ها</span>
          </Link>
        </Button>
      </div>

      <Link
        href="/submit"
        className="text-muted-foreground hover:text-foreground mt-4 inline-flex items-center gap-1 text-xs font-medium transition-colors"
      >
        <PenLine className="size-3.5" />
        <span>ثبت گزارش یا ایده جدید</span>
      </Link>
    </section>
  );
}
