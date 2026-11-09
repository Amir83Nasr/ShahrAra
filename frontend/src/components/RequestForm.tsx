"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RequestItem, RequestType, User } from "../types";
import { apiErrorMessage, apiFetch, authHeaders } from "@/lib/api";

// maplibre-gl touches `window` at import time; skip prerendering
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});
import { determineRegion, REGIONS } from "../utils/regionUtils";
import { CATEGORIES } from "../utils/categoryUtils";
import {
  AlertCircleIcon,
  AlertTriangle,
  AlignRight,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Lightbulb,
  MapPin,
  MapPinned,
  Send,
  Tag,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { MapSkeleton } from "@/components/skeletons";

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

  const defaultCoords = { lat: 34.641, lng: 50.88 };
  const [region, setRegion] = useState(
    determineRegion(defaultCoords.lat, defaultCoords.lng),
  );

  const [coords, setCoords] = useState<{ lat: number; lng: number }>(
    defaultCoords,
  );

  // Location picker: the map lives in a fullscreen dialog and only commits the
  // chosen point when the user confirms it there.
  const [mapOpen, setMapOpen] = useState(false);
  const [draftCoords, setDraftCoords] = useState<{ lat: number; lng: number }>(
    defaultCoords,
  );
  const [locationPicked, setLocationPicked] = useState(false);

  const [helperOpen, setHelperOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const openLocationPicker = () => {
    setDraftCoords(coords);
    setMapOpen(true);
  };

  const handleLocationConfirm = (
    newCoords: { lat: number; lng: number },
    computedRegion: string,
  ) => {
    setCoords(newCoords);
    setRegion(computedRegion);
    setLocationPicked(true);
    setMapOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError(null);
    setSuccess(false);
    setTrackingCode(null);

    if (!title.trim() || !description.trim()) {
      setError("لطفا تمامی فیلدهای الزامی را پر کنید.");
      return;
    }

    setLoading(true);

    try {
      const result = await apiFetch<{ success: boolean; request: RequestItem }>(
        "/api/v1/requests",
        {
          method: "POST",
          headers: authHeaders(currentUser.token, true),
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            type,
            category: CATEGORIES[0],
            coordinates: coords,
            region: region || "منطقه ۲ (مرکز قم)",
          }),
        },
      );

      setSuccess(true);
      setTrackingCode(result.request.id);
      setTitle("");
      setDescription("");

      setTimeout(() => {
        onSubmitSuccess();
      }, 2500);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, "خطا در برقراری ارتباط با سرور."));
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="border-border bg-card flex min-h-[400px] flex-col items-center justify-center rounded-2xl border p-8 transition-colors md:p-12">
          <div className="text-primary border-primary/20 bg-primary/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full border">
            <MapPin className="h-8 w-8" />
          </div>
          <h2 className="text-foreground mb-3 text-2xl font-extrabold">
            ثبت گزارش مشکل یا ایده شهری
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-md text-sm leading-relaxed font-medium">
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
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Helper Instructions Column */}
        <div className="form-helper form-section order-last lg:order-first lg:col-span-4">
          <div className="border-border bg-card overflow-hidden rounded-2xl border transition-colors">
            <button
              type="button"
              onClick={() => setHelperOpen((open) => !open)}
              aria-expanded={helperOpen}
              aria-controls="request-form-help"
              className="hover:bg-muted/40 flex w-full items-center justify-between gap-3 p-5 text-start transition-colors"
            >
              <span className="text-primary flex items-center gap-2 text-sm font-extrabold">
                <CircleHelp className="text-primary h-4 w-4" />
                راهنمایی و سوالات متداول
              </span>
              <ChevronDown
                className={cn(
                  "text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200",
                  helperOpen && "rotate-180",
                )}
              />
            </button>

            {helperOpen && (
              <div
                id="request-form-help"
                className="border-border space-y-4 border-t p-5"
              >
                <div>
                  <h3 className="text-primary mb-2.5 flex items-center gap-2 text-xs font-extrabold">
                    <Lightbulb className="text-primary h-4 w-4" />
                    تفاوت گزارش مشکل و ایده چیست؟
                  </h3>

                  <div className="space-y-3">
                    <div className="border-destructive/10 bg-destructive/5 rounded-xl border p-3.5">
                      <span className="text-destructive flex items-center gap-1.5 text-xs font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        گزارش مشکلات شهری
                      </span>
                      <p className="text-muted-foreground mt-1 text-[11.5px] leading-relaxed font-normal">
                        مسائلی که نیاز به تعمیر فوری شهرداری دارند؛ مانند
                        نارسایی آسفالت، خاموشی چراغ خیابان‌ها، تجمیع زباله،
                        خرابی سطل‌ها و سد معبر.
                      </p>
                    </div>

                    <div className="border-type-idea/10 bg-type-idea/5 rounded-xl border p-3.5">
                      <span className="text-type-idea flex items-center gap-1.5 text-xs font-medium">
                        <Lightbulb className="h-3.5 w-3.5" />
                        ارسال ایده‌های نوآورانه
                      </span>
                      <p className="text-muted-foreground mt-1 text-[11.5px] leading-relaxed font-normal">
                        پیشنهادها و طرح‌های خلاقانه‌ای که هوشمندسازی و زیبایی
                        بصری شهرآرا را ارتقا می‌دهد؛ مانند دیوار سبز، سطل‌های
                        پلاستیکی هوشمند، بهبود مبلمان شهری و مناسب‌سازی عبور
                        توان‌یابان.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-border bg-muted/30 rounded-xl border p-3.5">
                  <h4 className="text-foreground text-xs font-semibold">
                    چگونه لوکیشن دقیق را انتخاب کنیم؟
                  </h4>
                  <p className="text-muted-foreground mt-1.5 text-[11px] leading-relaxed font-normal">
                    روی دکمه «ثبت موقعیت روی نقشه» بزنید تا نقشه تمام‌صفحه باز
                    شود. سپس پین را روی محل دقیق عارضه یا اجرای ایده قرار دهید و
                    تایید کنید؛ منطقه شهرداری به صورت خودکار مشخص می‌شود.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Container Column */}
        <div className="form-main form-section border-border bg-card relative overflow-hidden rounded-2xl border p-4 transition-all sm:p-6 md:p-8 lg:col-span-8">
          <div className="bg-primary/5 absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl" />
          <div className="bg-primary/5 absolute bottom-0 left-0 h-28 w-28 rounded-full blur-3xl" />

          <div className="form-main-section border-border mb-6 pb-5">
            <span className="text-primary font-mono text-[10px] font-semibold tracking-wide uppercase sm:text-xs">
              سامانه مشارکت شهری
            </span>
            <h2 className="text-foreground mt-1 text-lg font-bold sm:text-2xl">
              ثبت پیگیری و مشارکت جدید
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
                  {trackingCode && (
                    <span className="mt-1 block font-mono text-[11px]">
                      کد رهگیری: {trackingCode}
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Request Type Selector */}
            <div className="form-main-section flex flex-col gap-2">
              <label className="text-muted-foreground text-xs font-bold">
                نوع گزارش خود را مشخص کنید
              </label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as RequestType)}
                className="mt-1 grid grid-cols-2 gap-3 sm:gap-4"
              >
                <label
                  className={cn(
                    "relative flex cursor-pointer items-center justify-center rounded-xl border px-9 py-2.5 text-xs font-semibold transition-all duration-200 sm:py-3 sm:text-sm",
                    type === "problem"
                      ? "border-destructive/50 bg-destructive/10 text-destructive ring-destructive/10 ring-1"
                      : "border-border text-muted-foreground hover:border-muted-foreground",
                  )}
                >
                  <RadioGroupItem value="problem" className="sr-only" />
                  <AlertTriangle className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <span className="text-center">گزارش مشکل</span>
                </label>
                <label
                  className={cn(
                    "relative flex cursor-pointer items-center justify-center rounded-xl border px-9 py-2.5 text-xs font-semibold transition-all duration-200 sm:py-3 sm:text-sm",
                    type === "idea"
                      ? "border-type-idea/50 bg-type-idea/10 text-type-idea ring-type-idea/10 ring-1"
                      : "border-border text-muted-foreground hover:border-muted-foreground",
                  )}
                >
                  <RadioGroupItem value="idea" className="sr-only" />
                  <Lightbulb className="absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <span className="text-center">ارائه ایده شهری</span>
                </label>
              </RadioGroup>
            </div>

            {/* Title */}
            <div className="form-main-section flex flex-col gap-1.5">
              <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <Tag className="text-primary h-3.5 w-3.5" />
                موضوع درخواست
              </label>
              <Input
                type="text"
                required
                placeholder="مثال: روکش نامناسب آسفالت کوچه پنجم"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description Area */}
            <div className="form-main-section flex flex-col gap-1.5">
              <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <AlignRight className="text-primary h-3.5 w-3.5" />
                توضیحات تکمیلی
              </label>
              <Textarea
                required
                rows={4}
                placeholder="لطفاً جزئیات دقیق مسئله یا ابعاد و پتانسیل‌های ایده ارسالی خود را با شهرداری در میان بگذارید..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Location Picker Trigger */}
            <div className="form-main-section flex flex-col gap-2">
              <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <MapPin className="text-primary h-4 w-4" />
                موقعیت جغرافیایی روی نقشه
              </label>

              <button
                type="button"
                onClick={openLocationPicker}
                className="group border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 flex w-full items-center gap-3 rounded-xl border border-dashed p-3.5 text-start transition-colors"
              >
                <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <MapPinned className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block text-sm font-semibold">
                    {locationPicked
                      ? "موقعیت انتخاب شد"
                      : "ثبت موقعیت روی نقشه"}
                  </span>
                  <span className="text-muted-foreground mt-0.5 block truncate text-[11px]">
                    {locationPicked ? (
                      <>
                        {region}
                        <span dir="ltr" className="font-mono">
                          {" "}
                          · {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                        </span>
                      </>
                    ) : (
                      "برای انتخاب دقیق محل، نقشه تمام‌صفحه را باز کنید"
                    )}
                  </span>
                </span>
                <ChevronLeft className="text-muted-foreground h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
              </button>
            </div>

            {/* Detected Region — auto-filled from map, user can override */}
            <div className="form-main-section flex flex-col gap-1.5">
              <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <MapPin className="text-primary h-3.5 w-3.5" />
                منطقه شهری
              </label>
              <Select dir="rtl" value={region} onValueChange={setRegion}>
                <SelectTrigger>
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
              disabled={loading || success}
              className="h-12 w-full"
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

      {/* Fullscreen Location Picker */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "bg-background text-foreground inset-0 h-dvh max-h-dvh w-screen max-w-none translate-x-0 translate-y-0 gap-0 overflow-hidden rounded-none border-0 p-0",
            "max-sm:inset-0 max-sm:right-0 max-sm:bottom-0 max-sm:left-0 max-sm:h-dvh max-sm:max-w-none max-sm:rounded-none max-sm:border-0 max-sm:pb-0",
            "sm:inset-0 sm:start-0 sm:top-0 sm:max-w-none sm:translate-x-0 sm:translate-y-0 sm:gap-0 sm:rounded-none sm:border-0 sm:p-0 sm:rtl:translate-x-0",
            "md:max-w-none lg:max-w-none",
          )}
        >
          <DialogTitle className="sr-only">انتخاب موقعیت روی نقشه</DialogTitle>
          <DialogDescription className="sr-only">
            پین را روی محل دقیق مورد نظر قرار دهید و سپس تایید کنید.
          </DialogDescription>

          <div className="relative h-dvh w-full">
            <MapComponent
              pickerMode
              selectedCoordinates={draftCoords}
              onCoordinatesChange={(newCoords) => setDraftCoords(newCoords)}
              onConfirm={handleLocationConfirm}
              theme={theme}
            />

            <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="rounded-full shadow-md"
                >
                  <X />
                  <span className="sr-only">بستن نقشه</span>
                </Button>
              </DialogClose>
              <span className="bg-background/90 text-foreground rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">
                ثبت موقعیت روی نقشه
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
