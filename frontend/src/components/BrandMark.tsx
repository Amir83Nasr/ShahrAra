import { cn } from "@/lib/utils";

/**
 * نشان سادهٔ برند به سبک اپ ChatGPT: دایرهٔ مشکی/سفید با حرف «ش».
 * جایگزین فایل لوگو شده تا در همهٔ اندازه‌ها شارپ و بدون وابستگی تصویری بماند.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-foreground text-background flex size-7 shrink-0 items-center justify-center rounded-full text-[13px] leading-none font-semibold select-none",
        className,
      )}
    >
      ش
    </span>
  );
}
