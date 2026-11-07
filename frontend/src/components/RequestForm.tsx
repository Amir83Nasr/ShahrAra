"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RequestType, User } from "../types";

// maplibre-gl touches `window` at import time; skip prerendering
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });
import { determineRegion, REGIONS } from "../utils/regionUtils";
import { CATEGORIES } from "../utils/categoryUtils";
import {
  AlertCircleIcon,
  AlertTriangle,
  AlignRight,
  CheckCircle,
  Lightbulb,
  MapPin,
  MessageSquare,
  Send,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RequestFormProps {
  currentUser: User | null;
  onSubmitSuccess: () => void;
  theme?: "light" | "dark";
}

export default function RequestForm({
  currentUser,
  onSubmitSuccess,
  theme = "light",
}: RequestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<RequestType>("problem");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);

  const defaultCoords = { lat: 34.641, lng: 50.88 };
  const [region, setRegion] = useState(
    determineRegion(defaultCoords.lat, defaultCoords.lng),
  );

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    defaultCoords,
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCoordsChange = (
    newCoords: { lat: number; lng: number },
    computedRegion: string,
  ) => {
    setCoords(newCoords);
    setRegion(computedRegion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError(null);
    setSuccess(false);

    if (!title.trim() || !description.trim()) {
      setError("لطفا تمامی فیلدهای الزامی را پر کنید.");
      return;
    }

    setLoading(true);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (currentUser.token) {
        headers["Authorization"] = `Bearer ${currentUser.token}`;
      }

      const response = await fetch("/api/v1/requests", {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          category,
          coordinates: coords,
          region: region || "منطقه ۲ (مرکز قم)",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در ثبت درخواست شهری.");
      }

      setSuccess(true);
      setTitle("");
      setDescription("");

      setTimeout(() => {
        onSubmitSuccess();
      }, 1500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "خطا در برقراری ارتباط با سرور.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-16 text-center sm:px-6">
        <div className="border-border bg-card flex min-h-[380px] w-full flex-col items-center justify-center rounded-2xl border p-8 md:p-12">
          <div className="text-foreground bg-muted mb-6 flex size-14 items-center justify-center rounded-full">
            <MapPin className="size-7" />
          </div>
          <h2 className="text-foreground mb-2 text-xl font-semibold tracking-tight">
            ثبت گزارش مشکل یا ایده شهری
          </h2>
          <p className="text-muted-foreground mx-auto mb-7 max-w-md text-sm leading-relaxed">
            برای مشارکت در زیباتر کردن شهرمان و گزارش مسائل معابر، فضای سبز،
            روشنایی یا دیگر خدمات شهری، ابتدا باید وارد حساب کاربری خود شوید تا
            درخواستتان مستقیماً به دست مسئولان مربوطه برسد.
          </p>
          <Button asChild>
            <Link href="/login">ورود / ثبت‌نام شهروندان</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Helper Instructions Column */}
        <div className="form-helper form-section order-last flex flex-col gap-4 lg:order-first lg:col-span-4">
          <div className="border-border bg-card rounded-2xl border p-4 transition-colors">
            <h3 className="text-foreground mb-3 flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="text-muted-foreground size-4" />
              تفاوت گزارش مشکل و ایده چیست؟
            </h3>

            <div className="space-y-3">
              <div className="bg-muted/50 rounded-xl border p-3">
                <span className="text-destructive flex items-center gap-1.5 text-xs font-medium">
                  <AlertTriangle className="size-3.5" />
                  گزارش مشکلات شهری
                </span>
                <p className="text-muted-foreground mt-1 text-[11.5px] leading-relaxed">
                  مسائلی که نیاز به تعمیر فوری شهرداری دارند؛ مانند نارسایی
                  آسفالت، خاموشی چراغ خیابان‌ها، تجمیع زباله، خرابی سطل‌ها و سد
                  معبر.
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl border p-3">
                <span className="text-type-idea flex items-center gap-1.5 text-xs font-medium">
                  <Lightbulb className="size-3.5" />
                  ارسال ایده‌های نوآورانه
                </span>
                <p className="text-muted-foreground mt-1 text-[11.5px] leading-relaxed">
                  پیشنهادها و طرح‌های خلاقانه‌ای که هوشمندسازی و زیبایی بصری
                  شهرآرا را ارتقا می‌دهد؛ مانند دیوار سبز، سطل‌های پلاستیکی
                  هوشمند، بهبود مبلمان شهری و مناسب‌سازی عبور توان‌یابان.
                </p>
              </div>
            </div>
          </div>

          <div className="border-border bg-card rounded-2xl border p-4 transition-all">
            <span className="text-muted-foreground mb-2 block text-[11px] font-medium">
              مرحله ۲: انتخاب موقعیت
            </span>
            <h4 className="text-foreground text-xs font-medium">
              چگونه لوکیشن دقیق را انتخاب کنیم؟
            </h4>
            <p className="text-muted-foreground mt-2 text-[11px] leading-relaxed">
              با استفاده از نقشه روبرو، دکمه نشانگر را به سمت محل دقیق عارضه یا
              اجرای ایده جابجا کنید. پس از رها کردن پین، منطقه شهرداری مربوطه به
              صورت کاملاً خودکار مشخص خواهد شد.
            </p>
          </div>
        </div>

        {/* Form Container Column */}
        <div className="form-main form-section border-border bg-card relative overflow-hidden rounded-2xl border p-4 transition-all sm:p-6 lg:col-span-8">
          <div className="border-border mb-5 border-b pb-4">
            <span className="text-muted-foreground text-[11px] font-medium">
              سامانه مشارکت شهری
            </span>
            <h2 className="text-foreground mt-1 text-lg font-semibold tracking-tight sm:text-xl">
              ثبت گزارش یا ایده جدید
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="text-xs">
                <AlertCircleIcon />
                <AlertTitle>خطا در ثبت درخواست</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-type-idea/20 bg-type-idea/10 text-type-idea">
                <CheckCircle className="text-type-idea" />
                <AlertTitle>درخواست ثبت شد</AlertTitle>
                <AlertDescription className="text-type-idea/90">
                  درخواست شما با موفقیت ثبت گردید و در اسرع وقت رسیدگی خواهد شد!
                </AlertDescription>
              </Alert>
            )}

            {/* Request Type Selector */}
            <div className="form-main-section flex flex-col gap-2">
              <label className="text-muted-foreground text-xs font-medium">
                نوع گزارش خود را مشخص کنید
              </label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as RequestType)}
                className="mt-1 grid grid-cols-2 gap-3 sm:gap-4"
              >
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition-colors duration-150 sm:gap-2.5 sm:px-4 sm:text-sm",
                    type === "problem"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <RadioGroupItem value="problem" className="sr-only" />
                  <AlertTriangle className="size-4 shrink-0" />
                  <span>گزارش مشکل</span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-3 py-3 text-xs font-medium transition-colors duration-150 sm:gap-2.5 sm:px-4 sm:text-sm",
                    type === "idea"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:bg-muted",
                  )}
                >
                  <RadioGroupItem value="idea" className="sr-only" />
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <span>ارائه ایده شهری</span>
                </label>
              </RadioGroup>
            </div>

            {/* Category and title Row */}
            <div className="form-main-section grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                  <Tag className="text-muted-foreground size-3.5" />
                  موضوع درخواست <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="مثال: روکش نامناسب آسفالت کوچه پنجم"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                  <MessageSquare className="text-muted-foreground size-3.5" />
                  دسته‌بندی مربوطه <span className="text-destructive">*</span>
                </label>
                <Select dir="rtl" value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    <SelectGroup>
                      <SelectLabel>دسته‌بندی</SelectLabel>
                      {CATEGORIES.map((c, i) => (
                        <SelectItem key={i} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description Area */}
            <div className="form-main-section flex flex-col gap-1.5">
              <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <AlignRight className="text-muted-foreground size-3.5" />
                توضیحات تکمیلی <span className="text-destructive">*</span>
              </label>
              <Textarea
                required
                rows={4}
                placeholder="لطفاً جزئیات دقیق مسئله یا ابعاد و پتانسیل‌های ایده ارسالی خود را با شهرداری در میان بگذارید..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Interactive Picker Map */}
            <div className="form-main-section flex flex-col gap-2">
              <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <MapPin className="text-muted-foreground size-4" />
                موقعیت جغرافیایی روی نقشه{" "}
                <span className="text-destructive">*</span>
              </label>

              <div className="border-border bg-card relative h-[400px] w-full overflow-hidden rounded-2xl border">
                <MapComponent
                  pickerMode={true}
                  selectedCoordinates={coords}
                  onCoordinatesChange={handleCoordsChange}
                  theme={theme}
                />
              </div>
            </div>

            {/* Detected Region — auto-filled from map, user can override */}
            <div className="form-main-section flex flex-col gap-1.5">
              <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <MapPin className="text-muted-foreground size-3.5" />
                منطقه شهری <span className="text-destructive">*</span>
              </label>
              <Select dir="rtl" value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="end">
                  <SelectGroup>
                    <SelectLabel>منطقه شهرداری</SelectLabel>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-[10px]">
                منطقه به صورت خودکار از موقعیت روی نقشه تعیین شده است. در صورت
                نیاز می‌توانید دستی تغییر دهید.
              </p>
            </div>

            {/* Action Submit */}

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={loading || success}
            >
              <Send />
              <span>
                {loading
                  ? "در حال ثبت درخواست..."
                  : "ارسال نهایی گزارش به شهرداری"}
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
