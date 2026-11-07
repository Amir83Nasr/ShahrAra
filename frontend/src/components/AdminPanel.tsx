"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { RequestItem, RequestStatus, RequestType } from "../types";

// maplibre-gl touches `window` at import time; skip prerendering
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });
import {
  Shield,
  Search,
  Filter,
  MessageSquare,
  Calendar,
  MapPin,
  User,
  CheckCircle,
  X,
  RefreshCcw,
  Layers,
} from "lucide-react";
import { toPersianDigits } from "../utils/numberUtils";
import { REGIONS } from "../utils/regionUtils";
import { CATEGORIES } from "../utils/categoryUtils";
import { filterRequests } from "../utils/requestFilters";
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  TYPE_LABELS,
  TYPE_BADGE_CLASS,
} from "../utils/requestBadges";
import { cn } from "@/lib/utils";
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
}

export default function AdminPanel({
  requests,
  onUpdateStatus,
  onRefresh,
  theme = "light",
}: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<RequestType | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | "all">(
    "all",
  );

  const [selectedItem, setSelectedItem] = useState<RequestItem | null>(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [statusVal, setStatusVal] = useState<RequestStatus>("submitted");

  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Sync selected item inputs when selected item changes
  useEffect(() => {
    if (selectedItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdminResponse(selectedItem.adminResponse || "");

      setStatusVal(selectedItem.status);
    }
  }, [selectedItem]);

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

  const goToAdminPage = (page: number) =>
    setCurrentPage(Math.min(Math.max(1, page), totalAdminPages));

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await onUpdateStatus(selectedItem.id, statusVal, adminResponse.trim());
      setSaveSuccess(true);

      // Update local item
      setSelectedItem({
        ...selectedItem,
        status: statusVal,
        adminResponse: adminResponse.trim(),
      });

      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
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
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6"
      id="shahr_ara_admin_panel"
    >
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="bg-muted text-foreground flex size-10 items-center justify-center rounded-full">
            <Shield className="size-5" />
          </div>
          <div>
            <span className="text-muted-foreground text-[11px] font-medium">
              پنل مدیریت شهری
            </span>
            <h2 className="text-foreground mt-0.5 text-lg font-semibold tracking-tight sm:text-xl">
              پاسخگویی و مدیریت شهرداری
            </h2>
            <p className="text-muted-foreground mt-1 hidden text-xs sm:block">
              شما وارد حساب کاربری مدیر سامانه شده‌اید. پاسخ به شهروندان و
              تغییرات زیر نظر سیستم یکپارچه مستند می‌شود.
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={onRefresh}>
          <RefreshCcw />
          بروزرسانی لیست
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* Left Column: List with Filters (7 columns on large desktop) */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          {/* Active Filters / Search */}
          <div className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-3">
            {/* Search row */}
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="جستجوی درخواست‌ها (عنوان، توضیحات، نام شهروند...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-muted/60 focus-visible:bg-background h-11 rounded-full border-transparent pr-10"
              />
            </div>

            {/* Quick Filters Group */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Type selector */}
              <div className="flex flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
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
                      <SelectItem value="all">همه انواع</SelectItem>
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
              <div className="flex flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
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
                      <SelectItem value="all">همه موضوعات</SelectItem>
                      {CATEGORIES.map((c, i) => (
                        <SelectItem key={i} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Status selector */}
              <div className="flex flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
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
                      <SelectItem value="submitted">
                        مورد ارسالی جدید
                      </SelectItem>
                      <SelectItem value="under_review">
                        در حال بررسی تخصصی
                      </SelectItem>
                      <SelectItem value="in_progress">
                        اکیپ‌های مشغول به کار
                      </SelectItem>
                      <SelectItem value="resolved">
                        برطرف شده و نهایی
                      </SelectItem>
                      <SelectItem value="archived">بایگانی شده</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Region selector */}
              <div className="flex flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-medium">
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
            {filteredItems.length > 0 ? (
              pageItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const dateString = new Date(item.createdAt).toLocaleDateString(
                  "fa-IR",
                );

                return (
                  <Card
                    key={item.id}
                    size="sm"
                    className={cn(
                      "admin-card cursor-pointer rounded-2xl transition-colors",
                      isSelected
                        ? "border-foreground ring-foreground/15 ring-2"
                        : "border-border bg-card hover:bg-muted/40",
                    )}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="flex flex-col gap-2.5 px-4">
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

                      <CardTitle className="text-foreground text-[14px] font-medium">
                        {item.title}
                      </CardTitle>

                      <CardDescription className="text-muted-foreground line-clamp-2 min-h-[2lh] text-[13px] leading-relaxed">
                        {item.description}
                      </CardDescription>

                      <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <User className="size-3.5" />
                          {item.userName} - {toPersianDigits(item.region)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="size-3.5" />
                          {dateString}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="border-border bg-card text-muted-foreground rounded-2xl border p-10 text-center">
                <Filter className="text-muted-foreground mx-auto mb-3 size-8" />
                <p className="text-xs">
                  هیچ موردی منطبق با فیلترهای بالا یافت نشد.
                </p>
              </div>
            )}

            {totalAdminPages > 1 && (
              <Pagination className="pt-2">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => goToAdminPage(safeAdminPage - 1)}
                      disabled={safeAdminPage <= 1}
                    />
                  </PaginationItem>

                  {buildPageRange(safeAdminPage, totalAdminPages).map((p, i) =>
                    p === "ellipsis" ? (
                      <PaginationItem key={`e${i}`}>
                        <span className="text-muted-foreground flex size-9 items-center justify-center">
                          …
                        </span>
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          isActive={p === safeAdminPage}
                          onClick={() => goToAdminPage(p)}
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
            )}
          </div>
        </div>

        {/* Right Column: Detailed Response Dashboard (5 columns on desktop) */}
        <div className="h-full lg:col-span-5">
          {selectedItem ? (
            <Card className="border-border bg-card rounded-2xl border">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-(--card-spacing)">
                <div className="space-y-1">
                  <span className="text-muted-foreground block text-[11px] font-medium">
                    جزئیات درخواست
                  </span>
                  <h3 className="text-foreground text-base font-semibold">
                    بررسی درخواست برگزیده
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedItem(null)}
                  aria-label="بستن"
                >
                  <X />
                </Button>
              </div>

              {/* Category & Region */}
              <div className="text-muted-foreground flex items-center gap-2 px-(--card-spacing) text-xs font-medium">
                <Badge
                  variant="outline"
                  className={TYPE_BADGE_CLASS[selectedItem.type]}
                >
                  {TYPE_LABELS[selectedItem.type]}
                </Badge>
                <Badge variant="outline">{selectedItem.category}</Badge>
                <span className="mr-auto text-[10px]">
                  {toPersianDigits(selectedItem.region)}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-3 px-(--card-spacing)">
                <CardTitle className="text-foreground text-base font-semibold">
                  {selectedItem.title}
                </CardTitle>
                <div className="border-border bg-muted/50 text-foreground/80 rounded-xl border p-3.5 text-xs leading-relaxed whitespace-pre-line">
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
              <div className="border-border bg-muted/40 mx-(--card-spacing) rounded-xl border p-3.5">
                <div className="flex items-center gap-2 pb-2">
                  <User className="text-muted-foreground size-4" />
                  <span className="text-foreground text-xs font-medium">
                    اطلاعات تماس شهروند
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">
                      نام:
                    </span>
                    <span className="text-foreground text-xs font-medium">
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
                <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  <MapPin className="text-muted-foreground size-3.5" />
                  موقعیت جغرافیایی
                </span>
                <div className="border-border bg-background h-[180px] overflow-hidden rounded-2xl border">
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
                    <X />
                    <AlertTitle>خطا در بروزرسانی</AlertTitle>
                    <AlertDescription>{saveError}</AlertDescription>
                  </Alert>
                )}

                {saveSuccess && (
                  <div className="border-type-idea/20 bg-type-idea/10 text-type-idea flex items-center gap-2 rounded-lg border p-2.5 text-xs">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>بروزرسانی با موفقیت اعمال شد!</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground text-xs font-medium">
                    تغییر وضعیت درخواست
                  </label>
                  <Select
                    dir="rtl"
                    value={statusVal}
                    onValueChange={(v) => setStatusVal(v as RequestStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" align="end">
                      <SelectGroup>
                        <SelectLabel>تغییر وضعیت</SelectLabel>
                        <SelectItem value="submitted">
                          جدید (صف انتظار)
                        </SelectItem>
                        <SelectItem value="under_review">
                          تحت بررسی فنی
                        </SelectItem>
                        <SelectItem value="in_progress">
                          در دست اقدام
                        </SelectItem>
                        <SelectItem value="resolved">برطرف شده</SelectItem>
                        <SelectItem value="archived">بایگانی</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-muted-foreground text-xs font-medium">
                    پاسخ رسمی شهرداری
                  </label>
                  <Textarea
                    rows={3}
                    required
                    placeholder="پاسخ رسمی که به اطلاع شهروند و عموم خواهد رسید..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "در حال انتشار..." : "ثبت و انتشار پاسخ"}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="border-border bg-card flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border text-center">
              <CardContent className="p-6">
                <MessageSquare className="text-muted-foreground/50 mx-auto mb-4 size-10" />
                <h3 className="text-foreground mb-1 text-sm font-medium">
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
