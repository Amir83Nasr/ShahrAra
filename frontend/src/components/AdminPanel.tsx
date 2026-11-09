"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { RequestItem, RequestStatus, RequestType } from "../types";

// maplibre-gl touches `window` at import time; skip prerendering
const MapComponent = dynamic(() => import("./MapComponent"), {
  ssr: false,
  loading: () => <MapSkeleton />,
});
import {
  Shield,
  Search,
  Filter,
  MessageSquare,
  CalendarDays,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  X,
  RefreshCcw,
  Layers,
  ExternalLink,
  Heart,
  Hash,
} from "lucide-react";
import { toPersianDigits } from "../utils/numberUtils";
import { REGIONS } from "../utils/regionUtils";
import { CATEGORIES } from "../utils/categoryUtils";
import { filterRequests } from "../utils/requestFilters";
import {
  STATUS_LABELS,
  STATUS_ORDER,
  STATUS_BADGE_CLASS,
  TYPE_LABELS,
  TYPE_BADGE_CLASS,
} from "../utils/requestBadges";
import { formatPersian } from "../utils/persianDate";
import { cn } from "@/lib/utils";
import StatsStrip from "@/components/StatsStrip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  AdminRowsSkeleton,
  LoadErrorState,
  MapSkeleton,
} from "@/components/skeletons";

// compact page list with ellipsis: 1 … c-1 c c+1 … last
function buildPageRange(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current - 1, current, current + 1]);
  const middle = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const p of middle) {
    if (p - prev > 1) out.push("ellipsis");
    out.push(p);
    prev = p;
  }
  return out;
}

interface AdminPanelProps {
  requests: RequestItem[];
  onUpdateStatus: (
    id: string,
    status: RequestStatus,
    adminResponse: string,
  ) => Promise<void>;
  onRefresh: () => void;
  theme?: "light" | "dark";
  loading?: boolean;
  loadError?: string | null;
}

export default function AdminPanel({
  requests,
  onUpdateStatus,
  onRefresh,
  theme = "light",
  loading = false,
  loadError = null,
}: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<RequestType | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "all">(
    "all",
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [statusVal, setStatusVal] = useState<RequestStatus>("submitted");

  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const detailRef = useRef<HTMLDivElement | null>(null);
  const listTopRef = useRef<HTMLDivElement | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always render the freshest copy from the shared list: after an admin
  // update the provider re-fetches, and keeping a snapshot here used to leave
  // the detail panel showing the old status/response.
  const selectedItem = requests.find((item) => item.id === selectedId) ?? null;

  const clearSuccessTimer = () => {
    if (successTimer.current) {
      clearTimeout(successTimer.current);
      successTimer.current = null;
    }
  };

  const openItem = (item: RequestItem) => {
    setSelectedId(item.id);
    setAdminResponse(item.adminResponse ?? "");
    setStatusVal(item.status);
    setSaveSuccess(false);
    setSaveError(null);
    clearSuccessTimer();
  };

  const closeItem = () => {
    setSelectedId(null);
    setSaveSuccess(false);
    setSaveError(null);
    clearSuccessTimer();
  };

  // The detail panel sits below the list on mobile. Scroll it into view so
  // tapping a request visibly opens the answer form instead of doing nothing.
  useEffect(() => {
    if (!selectedId) return;
    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(max-width: 1023.98px)").matches
    ) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedId]);

  useEffect(
    () => () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    },
    [],
  );

  // Filter list
  const filteredItems = filterRequests(requests, {
    searchTerm,
    searchFields: ["title", "description", "userName", "userPhone"],
    type: selectedType,
    category: selectedCategory,
    status: selectedStatus,
    region: selectedRegion,
  });

  // Reset pagination on filter change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [
    searchTerm,
    selectedType,
    selectedCategory,
    selectedStatus,
    selectedRegion,
  ]);

  const totalAdminPages = Math.max(
    1,
    Math.ceil(filteredItems.length / PAGE_SIZE),
  );
  const safeAdminPage = Math.min(currentPage, totalAdminPages);
  const pageItems = filteredItems.slice(
    (safeAdminPage - 1) * PAGE_SIZE,
    safeAdminPage * PAGE_SIZE,
  );

  const isInitialLoading = loading && requests.length === 0;
  const isRefreshing = loading && requests.length > 0;

  const goToAdminPage = (page: number) => {
    const next = Math.min(Math.max(1, page), totalAdminPages);
    if (next === safeAdminPage) return;
    setCurrentPage(next);
    requestAnimationFrame(() => {
      listTopRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await onUpdateStatus(selectedItem.id, statusVal, adminResponse.trim());
      setSaveSuccess(true);
      clearSuccessTimer();
      successTimer.current = setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error(err);
      setSaveError(
        err instanceof Error ? err.message : "خطا در بروزرسانی وضعیت.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="mx-auto max-w-7xl px-4 py-6 sm:py-8"
      id="shahr_ara_admin_panel"
    >
      <div className="mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
        <div className="border-primary/25 bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-2xl border sm:size-12 sm:rounded-full">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0">
          <span className="text-primary block font-mono text-[10px] font-bold tracking-wider">
            پنل مدیریت شهری
          </span>
          <h1 className="text-foreground mt-0.5 text-base leading-snug font-extrabold sm:text-2xl">
            پنل پاسخگویی و مدیریت شهرداری شهرآرا
          </h1>
          <p className="text-muted-foreground mt-1 hidden text-xs leading-relaxed sm:block">
            شما وارد حساب کاربری مدیر سامانه شده‌اید. پاسخ به شهروندان و تغییرات
            زیر نظر سیستم یکپارچه مستند می‌شود.
          </p>
        </div>
      </div>

      <StatsStrip variant="admin" className="mb-5" />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: List with Filters (7 columns on large desktop) */}
        <div className="flex min-w-0 flex-col gap-6 lg:col-span-7">
          {/* Active Filters / Search */}
          <div
            ref={listTopRef}
            className="border-border/70 bg-card flex scroll-mt-4 flex-col gap-3.5 rounded-2xl border p-4 sm:gap-4 sm:p-5"
          >
            {/* Search + refresh */}
            <div className="flex w-full items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 right-3.5 size-4 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="جستجوی عنوان، توضیحات یا نام شهروند..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-11 rounded-full pr-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={onRefresh}
                disabled={loading}
                aria-label="بروزرسانی فهرست درخواست‌ها"
                className="h-11 w-11 shrink-0 px-0 sm:w-auto sm:px-4"
              >
                <RefreshCcw
                  className={cn(
                    loading && "animate-spin motion-reduce:animate-none",
                  )}
                />
                <span className="hidden sm:inline">
                  {isRefreshing ? "در حال بروزرسانی…" : "بروزرسانی"}
                </span>
              </Button>
            </div>

            {/* Quick Filters Group */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {/* Type selector */}
              <div className="flex min-w-0 flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold">
                  <Filter className="text-primary h-3 w-3" />
                  نوع مشارکت
                </span>
                <Select
                  dir="rtl"
                  value={selectedType}
                  onValueChange={(v) =>
                    setSelectedType(v as "all" | "problem" | "idea")
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      <SelectLabel>نوع مشارکت</SelectLabel>
                      <SelectItem value="all">
                        همه دسته‌ها (مشکل و ایده)
                      </SelectItem>
                      <SelectItem value="problem">
                        فقط گزارش مشکلات شهری
                      </SelectItem>
                      <SelectItem value="idea">
                        فقط ایده‌های نوآورانه
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Category selector */}
              <div className="flex min-w-0 flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold">
                  <Layers className="text-primary h-3 w-3" />
                  موضوع خدمت
                </span>
                <Select
                  dir="rtl"
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    <SelectGroup>
                      <SelectLabel>موضوع خدمت</SelectLabel>
                      <SelectItem value="all">همه موضوعات خدمتی</SelectItem>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Status selector */}
              <div className="flex min-w-0 flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold">
                  <CheckCircle className="text-primary h-3 w-3" />
                  وضعیت فرآیند
                </span>
                <Select
                  dir="rtl"
                  value={selectedStatus}
                  onValueChange={(v) => setSelectedStatus(v as RequestStatus)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    <SelectGroup>
                      <SelectLabel>وضعیت فرآیند</SelectLabel>
                      <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                      {STATUS_ORDER.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Region selector */}
              <div className="flex min-w-0 flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold">
                  <MapPin className="text-primary h-3 w-3" />
                  منطقه شهری
                </span>
                <Select
                  dir="rtl"
                  value={selectedRegion}
                  onValueChange={setSelectedRegion}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" align="end">
                    <SelectGroup>
                      <SelectLabel>منطقه</SelectLabel>
                      <SelectItem value="all">همه مناطق</SelectItem>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-3 p-0.5">
            {isInitialLoading ? (
              <AdminRowsSkeleton count={5} />
            ) : loadError && requests.length === 0 ? (
              <LoadErrorState message={loadError} onRetry={onRefresh} />
            ) : filteredItems.length > 0 ? (
              pageItems.map((item) => {
                const isSelected = selectedId === item.id;
                const dateString = formatPersian(item.createdAt);

                return (
                  <Card
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`انتخاب درخواست ${item.title}`}
                    className={cn(
                      "focus-visible:ring-ring cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none",
                      isSelected
                        ? "border-primary ring-primary/30 ring-2"
                        : "border-border/70 bg-card hover:border-primary/25 hover:shadow-sm",
                    )}
                    onClick={() => openItem(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openItem(item);
                      }
                    }}
                  >
                    <CardContent className="flex flex-col gap-2.5 px-4 sm:px-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={TYPE_BADGE_CLASS[item.type]}
                          >
                            {TYPE_LABELS[item.type]}
                          </Badge>
                        </div>
                        <Badge
                          variant="outline"
                          className={STATUS_BADGE_CLASS[item.status]}
                        >
                          {STATUS_LABELS[item.status]}
                        </Badge>
                      </div>

                      <CardTitle className="text-foreground text-sm font-bold">
                        {item.title}
                      </CardTitle>

                      <CardDescription className="text-muted-foreground line-clamp-2 min-h-[2lh] text-xs leading-relaxed">
                        {item.description}
                      </CardDescription>

                      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-[10px]">
                        <span className="flex items-center gap-1">
                          <User className="text-muted-foreground h-3 w-3" />
                          {item.userName} - {toPersianDigits(item.region)}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarDays className="text-muted-foreground h-3 w-3" />
                          {toPersianDigits(dateString)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="border-border/70 bg-card text-muted-foreground rounded-2xl border border-dashed p-10 text-center">
                <Filter className="text-muted-foreground mx-auto mb-3 h-8 w-8" />
                <p className="text-xs font-semibold">
                  {requests.length === 0
                    ? "هنوز درخواستی از سوی شهروندان ثبت نشده است."
                    : "هیچ موردی منطبق با فیلترهای بالا یافت نشد."}
                </p>
              </div>
            )}

            {totalAdminPages > 1 && (
              <div className="no-scrollbar -mx-1 overflow-x-auto px-1 pt-2">
                <Pagination aria-label="صفحه‌بندی درخواست‌ها">
                  <PaginationContent className="gap-0.5 sm:gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => goToAdminPage(safeAdminPage - 1)}
                        disabled={safeAdminPage <= 1}
                      />
                    </PaginationItem>

                    {buildPageRange(safeAdminPage, totalAdminPages).map(
                      (p, i) =>
                        p === "ellipsis" ? (
                          <PaginationItem key={`e${i}`}>
                            <PaginationEllipsis className="text-muted-foreground" />
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={p === safeAdminPage}
                              onClick={() => goToAdminPage(p)}
                              className="size-9 sm:size-10"
                            >
                              {toPersianDigits(p)}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => goToAdminPage(safeAdminPage + 1)}
                        disabled={safeAdminPage >= totalAdminPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Response Dashboard (5 columns on desktop) */}
        <div
          ref={detailRef}
          className="min-w-0 scroll-mt-4 lg:sticky lg:top-20 lg:col-span-5 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain"
        >
          {selectedItem ? (
            <Card className="border-border/70 bg-card rounded-2xl border">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-(--card-spacing)">
                <div className="min-w-0 space-y-1">
                  <span className="text-primary block font-mono text-[10px] font-bold tracking-wider">
                    جزئیات درخواست
                  </span>
                  <h3 className="text-foreground text-base font-extrabold">
                    بررسی درخواست برگزیده
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    asChild
                    aria-label="مشاهده صفحه گزارش"
                    title="مشاهده صفحه گزارش"
                  >
                    <Link
                      href={`/reports/${encodeURIComponent(selectedItem.id)}`}
                    >
                      <ExternalLink />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={closeItem}
                    aria-label="بستن"
                  >
                    <X />
                  </Button>
                </div>
              </div>

              {/* Category & Region */}
              <div className="text-muted-foreground flex flex-wrap items-center gap-2 px-(--card-spacing) text-xs font-bold">
                <Badge
                  variant="outline"
                  className={TYPE_BADGE_CLASS[selectedItem.type]}
                >
                  {TYPE_LABELS[selectedItem.type]}
                </Badge>
                <Badge variant="outline">{selectedItem.category}</Badge>
              </div>

              {/* Metadata */}
              <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1.5 px-(--card-spacing) text-[10px] font-bold">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {toPersianDigits(selectedItem.region)}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3 shrink-0" />
                  {toPersianDigits(formatPersian(selectedItem.createdAt))}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3 shrink-0" />
                  {toPersianDigits(selectedItem.likes)} حمایت
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Hash className="h-3 w-3 shrink-0" />
                  {toPersianDigits(selectedItem.id)}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-3 px-(--card-spacing)">
                <CardTitle className="text-foreground text-base font-extrabold">
                  {selectedItem.title}
                </CardTitle>
                <div className="border-border/70 bg-muted/30 text-foreground/80 rounded-2xl border p-3.5 text-xs leading-relaxed whitespace-pre-line">
                  {selectedItem.description}
                </div>
              </div>

              {/* Status */}
              <div className="px-(--card-spacing)">
                <Badge
                  variant="outline"
                  className={cn(
                    "px-3 py-1 text-[10px]",
                    STATUS_BADGE_CLASS[selectedItem.status],
                  )}
                >
                  {STATUS_LABELS[selectedItem.status]}
                </Badge>
              </div>

              {/* Citizen Info */}
              <div className="border-border/70 bg-muted/20 mx-(--card-spacing) rounded-2xl border p-3.5">
                <div className="flex items-center gap-2 pb-2">
                  <User className="text-primary h-4 w-4" />
                  <span className="text-foreground text-xs font-bold">
                    اطلاعات تماس شهروند
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">
                      نام:
                    </span>
                    <span className="text-foreground text-xs font-bold">
                      {selectedItem.userName}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">
                      شماره همراه:
                    </span>
                    <span
                      className="text-foreground font-mono text-xs"
                      dir="rtl"
                    >
                      {toPersianDigits(selectedItem.userPhone)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="space-y-2 px-(--card-spacing)">
                <span className="text-muted-foreground flex items-center gap-1 text-xs font-bold">
                  <MapPin className="text-primary h-3.5 w-3.5" />
                  موقعیت جغرافیایی
                </span>
                <div className="border-border/70 bg-background h-44 overflow-hidden rounded-2xl border sm:h-52">
                  <MapComponent
                    pickerMode={false}
                    items={[selectedItem]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Admin Response Form */}
              <form
                onSubmit={handleUpdate}
                className="space-y-3 px-(--card-spacing)"
              >
                {saveError && (
                  <Alert variant="destructive" className="text-xs">
                    <AlertCircle />
                    <AlertTitle>خطا در بروزرسانی</AlertTitle>
                    <AlertDescription>{saveError}</AlertDescription>
                  </Alert>
                )}

                {saveSuccess && (
                  <div
                    role="status"
                    aria-live="polite"
                    className="border-status-resolved/20 bg-status-resolved/10 text-status-resolved flex items-center gap-2 rounded-xl border p-2.5 text-xs"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>بروزرسانی با موفقیت اعمال شد!</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="admin-status"
                    className="text-muted-foreground text-xs font-bold"
                  >
                    تغییر وضعیت درخواست
                  </label>
                  <Select
                    dir="rtl"
                    value={statusVal}
                    onValueChange={(v) => setStatusVal(v as RequestStatus)}
                  >
                    <SelectTrigger id="admin-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="end">
                      <SelectGroup>
                        <SelectLabel>تغییر وضعیت</SelectLabel>
                        {STATUS_ORDER.map((status) => (
                          <SelectItem key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="admin-response"
                    className="text-muted-foreground text-xs font-bold"
                  >
                    پاسخ رسمی شهرداری
                  </label>
                  <Textarea
                    id="admin-response"
                    rows={3}
                    required
                    placeholder="پاسخ رسمی که به اطلاع شهروند و عموم خواهد رسید..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "در حال انتشار…" : "ثبت و انتشار پاسخ"}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="border-border/70 bg-card hidden h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border text-center lg:flex">
              <CardContent className="p-6">
                <MessageSquare className="text-muted-foreground/50 mx-auto mb-4 h-10 w-10" />
                <h3 className="text-foreground mb-1 text-sm font-bold">
                  پنجره اقدام اداری
                </h3>
                <p className="text-muted-foreground max-w-xs text-xs leading-relaxed">
                  برای مشاهده جزئیات و پاسخ‌دهی، یک درخواست از لیست انتخاب کنید.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
