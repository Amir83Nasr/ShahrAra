"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { RequestItem, User } from "../types";

// maplibre-gl touches `window` at import time; skip prerendering
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });
import {
  Heart,
  MapPin,
  AlertCircleIcon,
  Map,
  Search,
  ArrowUpDown,
  RefreshCcw,
} from "lucide-react";
import { toPersianDigits } from "../utils/numberUtils";
import { REGIONS } from "../utils/regionUtils";
import { CATEGORIES } from "../utils/categoryUtils";
import { filterRequests, sortRequests } from "../utils/requestFilters";
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASS,
  TYPE_LABELS,
  TYPE_BADGE_CLASS,
} from "../utils/requestBadges";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";

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

interface ReportsDirectoryProps {
  items: RequestItem[];
  currentUser: User | null;
  onLike: (id: string) => Promise<void>;
  onRefresh: () => void;
  theme?: "light" | "dark";
  initialCategory?: string;
  initialSearch?: string;
}

export default function ReportsDirectory({
  items,
  currentUser,
  onLike,
  onRefresh,
  theme = "light",
  initialCategory = "all",
  initialSearch = "",
}: ReportsDirectoryProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeType, setActiveType] = useState<"all" | "problem" | "idea">(
    "all",
  );
  const [showMap, setShowMap] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "most_liked" | "least_liked"
  >("newest");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedDetails, setSelectedDetails] = useState<RequestItem | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [prevFilters, setPrevFilters] = useState("");
  const PAGE_SIZE = 12;
  const [filterRegion, setFilterRegion] = useState<string>("all");

  const filtered = filterRequests(items, {
    searchTerm,
    searchFields: ["title", "description", "region"],
    category: activeCategory,
    type: activeType,
    region: filterRegion,
    startDate,
    endDate,
  });

  const sorted = sortRequests(filtered, sortBy);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = sorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
    document
      .getElementById("shahr_ara_directory")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Reset pagination on filter change (adjust state during render)
  const filterKey = [
    searchTerm,
    activeCategory,
    activeType,
    sortBy,
    startDate?.getTime(),
    endDate?.getTime(),
    filterRegion,
  ].join("|");
  if (filterKey !== prevFilters) {
    setPrevFilters(filterKey);
    setCurrentPage(1);
  }

  const handleLikeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setSelectedDetails((prev) =>
      prev && prev.id === id
        ? {
            ...prev,
            likedByCurrentUser: !prev.likedByCurrentUser,
            likes: prev.likedByCurrentUser
              ? Math.max(0, prev.likes - 1)
              : prev.likes + 1,
          }
        : prev,
    );
    onLike(id);
  };

  useEffect(() => {
    if (selectedDetails) {
      const updated = items.find((i) => i.id === selectedDetails.id);
      if (updated) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedDetails(updated);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <div
      className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6"
      id="shahr_ara_directory"
    >
      <div className="mb-5">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          گزارش‌ها و ایده‌ها
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          مطالبات شهروندان قم را جستجو، مرور و حمایت کنید.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card mb-4 flex flex-col gap-3 rounded-2xl border p-3">
        {/* Top row: search + map/refresh buttons */}
        <div className="flex w-full items-center gap-2">
          <div className="relative flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="جستجوی نیاز، ایده، محله..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-muted/60 focus-visible:bg-background h-11 rounded-full border-transparent pr-10"
            />
          </div>
          <Button
            variant={showMap ? "default" : "outline"}
            onClick={() => setShowMap(!showMap)}
            className="h-11 shrink-0 rounded-full px-3.5"
            aria-label={showMap ? "مخفی‌سازی نقشه" : "نمایش نقشه"}
          >
            <Map />
            <span className="hidden sm:inline">
              {showMap ? "مخفی‌سازی نقشه" : "نمایش نقشه"}
            </span>
          </Button>
          <Button
            variant="outline"
            onClick={onRefresh}
            className="h-11 shrink-0 rounded-full px-3.5"
            aria-label="بروزرسانی"
          >
            <RefreshCcw />
            <span className="hidden sm:inline">بروزرسانی</span>
          </Button>
        </div>

        {/* Bottom row: selects on start, date pickers on end */}
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              dir="rtl"
              value={sortBy}
              onValueChange={(v) =>
                setSortBy(
                  v as "newest" | "oldest" | "most_liked" | "least_liked",
                )
              }
            >
              <SelectTrigger className="w-32">
                <ArrowUpDown />
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>ترتیب بر اساس</SelectLabel>
                  <SelectItem value="newest">جدیدترین</SelectItem>
                  <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
                  <SelectItem value="most_liked">بیشترین حمایت</SelectItem>
                  <SelectItem value="least_liked">کمترین حمایت</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              dir="rtl"
              value={activeType}
              onValueChange={(v) =>
                setActiveType(v as "all" | "problem" | "idea")
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectGroup>
                  <SelectLabel>فیلتر نوع</SelectLabel>
                  <SelectItem value="all">همه کارها</SelectItem>
                  <SelectItem value="problem">خرابی‌ها</SelectItem>
                  <SelectItem value="idea">ایده‌ها</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select
              dir="rtl"
              value={filterRegion}
              onValueChange={setFilterRegion}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
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
          <div className="flex items-center gap-1.5">
            <DatePicker
              date={startDate}
              onSelect={setStartDate}
              placeholder="از تاریخ"
              className="w-36"
            />
            <span className="text-muted-foreground text-xs">تا</span>
            <DatePicker
              date={endDate}
              onSelect={setEndDate}
              placeholder="تا تاریخ"
              className="w-36"
            />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="-mx-4 mb-4 flex scrollbar-thin gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => setActiveCategory("all")}
          size="sm"
          className="shrink-0"
        >
          همه دسته‌ها
        </Button>
        {CATEGORIES.map((cat, idx) => (
          <Button
            key={idx}
            variant={activeCategory === cat ? "default" : "outline"}
            onClick={() => setActiveCategory(cat)}
            size="sm"
            className="shrink-0"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Display Directory Main Arena */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
        {/* Map — mobile: below filters (hidden by default); desktop: sidebar */}
        {showMap && (
          <div className="border-border bg-card sticky top-20 order-1 h-[500px] overflow-hidden rounded-2xl border max-lg:static lg:top-6 lg:order-2 lg:col-span-5">
            <MapComponent
              pickerMode={false}
              items={sorted}
              onSelectItem={(item) => setSelectedDetails(item)}
              theme={theme}
            />
          </div>
        )}
        <div
          className={`order-2 lg:order-1 ${
            showMap ? "lg:col-span-7" : "lg:col-span-12"
          }`}
        >
          <div>
            <div
              className={cn(
                "grid grid-cols-1 gap-3",
                showMap ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {sorted.length > 0 ? (
                pageItems.map((item) => {
                  const hasLikedStatus = currentUser
                    ? item.likedByCurrentUser
                    : false;

                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        "report-card bg-card cursor-pointer overflow-hidden rounded-2xl transition-colors duration-200",
                        "hover:bg-muted/40",
                        "border-border",
                      )}
                      onClick={() => setSelectedDetails(item)}
                    >
                      <CardContent className="flex flex-col gap-2.5 px-4">
                        {/* Badge / Header row */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-semibold",
                              TYPE_BADGE_CLASS[item.type],
                            )}
                          >
                            {TYPE_LABELS[item.type]}
                          </Badge>

                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-semibold",
                              STATUS_BADGE_CLASS[item.status],
                            )}
                          >
                            {STATUS_LABELS[item.status]}
                          </Badge>
                        </div>

                        {/* Content */}
                        <CardTitle className="text-foreground line-clamp-1 cursor-pointer text-[14px] font-medium">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground line-clamp-2 min-h-[2lh] text-[13px] leading-relaxed">
                          {item.description}
                        </CardDescription>

                        {/* Footer */}
                        <div className="text-muted-foreground mt-1 flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {toPersianDigits(item.region)}
                          </span>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={
                                  hasLikedStatus ? "destructive" : "ghost"
                                }
                                className="h-7 gap-1.5 rounded-full px-2"
                                onClick={(e) => handleLikeClick(e, item.id)}
                              >
                                <Heart
                                  className={cn(
                                    "size-3.5",
                                    hasLikedStatus && "fill-current",
                                  )}
                                />
                                <span className="font-medium">
                                  {toPersianDigits(item.likes)}
                                </span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {!currentUser
                                ? "برای ثبت لایک وارد شوید"
                                : hasLikedStatus
                                  ? "لغو لایک"
                                  : "ثبت لایک"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="border-border bg-card text-muted-foreground col-span-full rounded-2xl border p-10 text-center">
                  <AlertCircleIcon className="text-muted-foreground mx-auto mb-3 size-9" />
                  <p className="text-foreground text-sm font-medium">
                    هیچ گزارش یا ایده‌ای یافت نشد.
                  </p>
                  <p className="text-muted-foreground mt-1 text-[13px]">
                    اولین شهروندی باشید که گزارش جدیدی ارسال می‌کند!
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="col-span-full pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => goToPage(safePage - 1)}
                          disabled={safePage <= 1}
                        />
                      </PaginationItem>

                      {buildPageRange(safePage, totalPages).map((p, i) =>
                        p === "ellipsis" ? (
                          <PaginationItem key={`e${i}`}>
                            <span className="text-muted-foreground flex size-9 items-center justify-center">
                              …
                            </span>
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={p}>
                            <PaginationLink
                              isActive={p === safePage}
                              onClick={() => goToPage(p)}
                            >
                              {toPersianDigits(p)}
                            </PaginationLink>
                          </PaginationItem>
                        ),
                      )}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => goToPage(safePage + 1)}
                          disabled={safePage >= totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      <ResponsiveDialog
        open={!!selectedDetails}
        onOpenChange={(open) => !open && setSelectedDetails(null)}
      >
        <ResponsiveDialogContent className="max-sm:p-4 sm:max-w-xl">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-2">
              {selectedDetails && (
                <Badge
                  variant="outline"
                  className={TYPE_BADGE_CLASS[selectedDetails.type]}
                >
                  {TYPE_LABELS[selectedDetails.type]}
                </Badge>
              )}
              <Badge variant="outline" className="font-mono">
                {selectedDetails?.category}
              </Badge>
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          <div className="space-y-5">
            <div>
              <h3 className="text-foreground text-lg leading-snug font-semibold">
                {selectedDetails?.title}
              </h3>
              <span className="text-muted-foreground mt-1.5 block font-mono text-xs">
                منطقه: {toPersianDigits(selectedDetails?.region ?? "")} |
                ثبت‌کننده: {selectedDetails?.userName}
              </span>
            </div>

            <p className="bg-muted/60 text-foreground/80 rounded-2xl border p-4 text-sm leading-relaxed whitespace-pre-wrap">
              {selectedDetails?.description}
            </p>

            {selectedDetails?.adminResponse ? (
              <div className="bg-muted/60 relative rounded-2xl border p-4">
                <div className="bg-background text-muted-foreground absolute top-3 left-3 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium">
                  پاسخ رسمی
                </div>
                <span className="text-foreground mb-1 block text-xs font-medium">
                  پاسخ رسمی شهرداری منطقه:
                </span>
                <p className="text-foreground/75 text-xs leading-relaxed whitespace-pre-line">
                  {selectedDetails.adminResponse}
                </p>
              </div>
            ) : (
              <div className="bg-muted/60 text-muted-foreground rounded-2xl border p-3.5 text-center text-xs">
                این گزارش برای اعزام اکیپ آماده‌سازی در صف رسیدگی واحد روابط
                عمومی شهرداری منطقه است.
              </div>
            )}

            <div className="space-y-2">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <MapPin className="text-foreground size-4" />
                موقعیت فیزیکی روی نقشه شهر
              </span>
              <div className="h-[200px] overflow-hidden rounded-2xl border">
                <MapComponent
                  pickerMode={false}
                  items={selectedDetails ? [selectedDetails] : []}
                  theme={theme}
                />
              </div>
            </div>
          </div>

          <ResponsiveDialogFooter className="flex items-center justify-between sm:justify-between">
            <span className="text-muted-foreground font-mono text-[10px]">
              کد رهگیری: {toPersianDigits(selectedDetails?.id ?? "")}
            </span>

            <Button
              size="sm"
              variant={
                currentUser && selectedDetails?.likedByCurrentUser
                  ? "destructive"
                  : "outline"
              }
              onClick={(e) =>
                selectedDetails && handleLikeClick(e, selectedDetails.id)
              }
            >
              <Heart
                className={cn(
                  "size-4",
                  currentUser &&
                    selectedDetails?.likedByCurrentUser &&
                    "fill-current",
                )}
              />
              <span>
                {toPersianDigits(selectedDetails?.likes ?? 0)} لایک و تأیید
              </span>
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
