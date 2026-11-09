"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequestItem, User } from "../types";
import { Heart, MapPin, AlertCircleIcon, Map, Search } from "lucide-react";
import { toPersianDigits } from "../utils/numberUtils";
import { REGIONS } from "../utils/regionUtils";
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
import { LoadErrorState, ReportCardsSkeleton } from "@/components/skeletons";
import ReportsFullscreenMap from "@/components/ReportsFullscreenMap";
import ReportPreviewDialog from "@/components/ReportPreviewDialog";

interface ReportsDirectoryProps {
  items: RequestItem[];
  currentUser: User | null;
  onLike: (id: string) => Promise<void>;
  onRefresh: () => void;
  theme?: "light" | "dark";
  initialCategory?: string;
  loading?: boolean;
  loadError?: string | null;
}

export default function ReportsDirectory({
  items,
  currentUser,
  onLike,
  onRefresh,
  theme = "light",
  initialCategory = "all",
  loading = false,
  loadError = null,
}: ReportsDirectoryProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory] = useState<string>(initialCategory);
  const [activeType, setActiveType] = useState<"all" | "problem" | "idea">(
    "all",
  );
  const [mapOpen, setMapOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "most_liked" | "least_liked"
  >("newest");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [previewItem, setPreviewItem] = useState<RequestItem | null>(null);
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [prevFilters, setPrevFilters] = useState("");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filtered = filterRequests(items, {
    searchTerm,
    searchFields: ["title", "description", "region"],
    category: activeCategory,
    type: activeType,
    region: filterRegion,
    startDate,
  });

  const sorted = sortRequests(filtered, sortBy);
  const visibleItems = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  // The fullscreen map applies its own region filter, so it receives every
  // report that matches the other filters instead of the region-filtered list.
  const mapItems = sortRequests(
    filterRequests(items, {
      searchTerm,
      searchFields: ["title", "description", "region"],
      category: activeCategory,
      type: activeType,
      startDate,
    }),
    sortBy,
  );

  // Skeleton only while we have nothing to show yet; refreshes keep the list
  // on screen instead of replacing it with placeholders.
  const isInitialLoading = loading && items.length === 0;

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || !hasMore) return;

    const check = () => {
      const isScrollable = el.scrollHeight > el.clientHeight + 1;
      if (isScrollable) {
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 240) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, sorted.length));
        }
      } else {
        const rect = el.getBoundingClientRect();
        if (rect.bottom <= window.innerHeight + 240) {
          setVisibleCount((c) => Math.min(c + PAGE_SIZE, sorted.length));
        }
      }
    };

    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("scroll", check, { passive: true });
    check();
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("scroll", check);
    };
  }, [hasMore, sorted.length, visibleItems.length]);

  // Reset lazy-load window on filter/sort change (adjust state during render)
  const filterKey = [
    searchTerm,
    activeCategory,
    activeType,
    sortBy,
    startDate?.getTime(),
    filterRegion,
  ].join("|");
  if (filterKey !== prevFilters) {
    setPrevFilters(filterKey);
    setVisibleCount(PAGE_SIZE);
  }

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el && el.scrollHeight > el.clientHeight + 1) {
      el.scrollTo({ top: 0 });
    }
  }, [filterKey]);

  const handleLikeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    void onLike(id);
  };

  return (
    // ارتفاع صفحه = یک ویوپورت منهای هدر (h-16 در دسکتاپ + ۱px حاشیه)
    <div
      className="mx-auto flex max-w-7xl flex-col px-4 py-6 sm:py-8 lg:h-[calc(100dvh-4.0625rem)]"
      id="shahr_ara_directory"
    >
      {/* Filters */}
      <div className="bg-card mb-4 flex flex-col gap-3.5 rounded-2xl border p-4 sm:gap-4 sm:p-5">
        {/* Top row: search + fullscreen map button */}
        <div className="flex w-full items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 right-3.5 size-4 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="جستجوی نیاز، ایده، محله..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 rounded-full pr-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setMapOpen(true)}
            className="h-11 w-11 shrink-0 px-0 sm:w-auto sm:px-4"
            aria-label="نمایش نقشه"
            title="نمایش نقشه"
          >
            <Map />
            <span className="hidden whitespace-nowrap sm:inline">
              نمایش نقشه
            </span>
          </Button>
        </div>

        {/* Bottom row: selects on start, date pickers on end */}
        <div className="flex w-full flex-col items-stretch justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="grid grid-cols-3 items-center gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <Select
              dir="rtl"
              value={sortBy}
              onValueChange={(v) =>
                setSortBy(
                  v as "newest" | "oldest" | "most_liked" | "least_liked",
                )
              }
            >
              <SelectTrigger className="w-full sm:w-40">
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
              <SelectTrigger className="w-full sm:w-32">
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
              <SelectTrigger className="w-full sm:w-32">
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
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <DatePicker
              date={startDate}
              onSelect={setStartDate}
              placeholder="از تاریخ"
              className="w-full sm:w-40"
            />
          </div>
        </div>
      </div>

      {/* Display Directory Main Arena */}
      <div className="grid grid-cols-1 items-start gap-6 lg:min-h-0 lg:flex-1 lg:grid-rows-1 lg:items-stretch lg:gap-8">
        <div className="lg:h-full lg:min-h-0">
          <div
            ref={scrollContainerRef}
            className="no-scrollbar p-0.5 lg:h-full lg:min-h-0 lg:overflow-y-auto"
          >
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {isInitialLoading ? (
                <ReportCardsSkeleton count={6} />
              ) : loadError && items.length === 0 ? (
                <LoadErrorState message={loadError} onRetry={onRefresh} />
              ) : sorted.length > 0 ? (
                visibleItems.map((item) => {
                  const hasLikedStatus = currentUser
                    ? item.likedByCurrentUser
                    : false;

                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        "report-card relative cursor-pointer overflow-hidden transition-all duration-300",
                        "hover:shadow-sm",
                        "border-border bg-card",
                      )}
                    >
                      <Link
                        href={`/reports/${encodeURIComponent(item.id)}`}
                        aria-label={`مشاهده گزارش ${item.title}`}
                        className="focus-visible:ring-ring absolute inset-0 z-0 rounded-[inherit] focus-visible:ring-2 focus-visible:outline-none"
                      />
                      <CardContent className="pointer-events-none relative flex flex-col gap-2.5 px-4 sm:px-5">
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
                        <CardTitle className="text-foreground line-clamp-1 text-sm font-extrabold">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-muted-foreground line-clamp-2 min-h-[2lh] text-xs leading-relaxed">
                          {item.description}
                        </CardDescription>

                        {/* Footer */}
                        <div className="text-muted-foreground flex items-center justify-between text-[10px]">
                          <span className="flex items-center gap-1 font-sans">
                            <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                            {toPersianDigits(item.region)}
                          </span>

                          <div className="pointer-events-auto">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant={
                                    hasLikedStatus
                                      ? "destructive-soft"
                                      : "outline"
                                  }
                                  onClick={(e) => handleLikeClick(e, item.id)}
                                >
                                  <Heart
                                    className={cn(
                                      hasLikedStatus && "fill-current",
                                    )}
                                  />
                                  <span className="font-bold">
                                    {toPersianDigits(item.likes)} لایک
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
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="border-border bg-card text-muted-foreground col-span-full rounded-2xl border p-12 text-center lg:self-start">
                  <AlertCircleIcon className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                  <p className="text-foreground text-sm font-extrabold">
                    هیچ گزارش یا ایده‌ای یافت نشد.
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs font-bold">
                    اولین شهروندی باشید که گزارش جدیدی ارسال می‌کند!
                  </p>
                </div>
              )}

              {hasMore && (
                <div
                  className="text-muted-foreground col-span-full py-4 text-center text-xs"
                  aria-live="polite"
                >
                  در حال بارگذاری موارد بیشتر…
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen map — picking a marker opens a short preview first */}
      <ReportsFullscreenMap
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        items={mapItems}
        onSelectItem={setPreviewItem}
        theme={theme}
        region={filterRegion}
        onRegionChange={setFilterRegion}
        escapeDisabled={!!previewItem}
      />

      {/* Map preview — summary only, with a link to the report's own page */}
      <ReportPreviewDialog
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
}
