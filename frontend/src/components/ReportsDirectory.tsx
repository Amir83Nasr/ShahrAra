"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { RequestItem, User } from "../types";

// maplibre-gl touches `window` at import time; skip prerendering
const MapComponent = dynamic(() => import("./MapComponent"), { ssr: false });
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
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";

interface ReportsDirectoryProps {
  items: RequestItem[];
  currentUser: User | null;
  onLike: (id: string) => Promise<void>;
  onRefresh: () => void;
  theme?: "light" | "dark";
  initialCategory?: string;
}

export default function ReportsDirectory({
  items,
  currentUser,
  onLike,
  theme = "light",
  initialCategory = "all",
}: ReportsDirectoryProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory] = useState<string>(initialCategory);
  const [activeType, setActiveType] = useState<"all" | "problem" | "idea">(
    "all",
  );
  const [showMap, setShowMap] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "most_liked" | "least_liked"
  >("newest");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [selectedDetails, setSelectedDetails] = useState<RequestItem | null>(
    null,
  );
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
  }, [hasMore, sorted.length, visibleItems.length, showMap]);

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
      className="mx-auto max-w-7xl px-4 py-6 sm:py-8"
      id="shahr_ara_directory"
    >
      {/* Filters */}
      <div className="bg-card mb-4 flex flex-col gap-3.5 rounded-2xl border p-4 sm:gap-4 sm:p-5">
        {/* Top row: search + map/refresh buttons */}
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
            variant={showMap ? "default" : "outline"}
            onClick={() => setShowMap(!showMap)}
            className="h-11 w-11 shrink-0 px-0 sm:w-auto sm:px-4"
            aria-label={showMap ? "مخفی‌سازی نقشه" : "نمایش نقشه"}
          >
            <Map />
            <span className="hidden whitespace-nowrap sm:inline">
              {showMap ? "مخفی‌سازی نقشه" : "نمایش نقشه"}
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
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Map — mobile: below filters (hidden by default); desktop: sidebar */}
        {showMap && (
          <div className="border-border bg-card sticky top-20 order-1 h-[420px] overflow-hidden rounded-2xl border max-lg:static sm:h-[500px] lg:order-2 lg:col-span-5">
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
          <div
            ref={scrollContainerRef}
            className="max-h-[600px] overflow-y-auto p-0.5 max-lg:max-h-none max-lg:overflow-visible"
          >
            <div
              className={cn(
                "grid grid-cols-1 gap-5",
                showMap ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
              )}
            >
              {sorted.length > 0 ? (
                visibleItems.map((item) => {
                  const hasLikedStatus = currentUser
                    ? item.likedByCurrentUser
                    : false;

                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        "report-card cursor-pointer overflow-hidden transition-all duration-300",
                        "hover:shadow-sm",
                        "border-border bg-card",
                      )}
                      onClick={() => setSelectedDetails(item)}
                    >
                      <CardContent className="flex flex-col gap-2.5 px-5">
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
                        <CardTitle className="text-foreground line-clamp-1 cursor-pointer text-sm font-extrabold">
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

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant={
                                  hasLikedStatus ? "destructive" : "outline"
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
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="border-border bg-card text-muted-foreground col-span-full rounded-2xl border p-12 text-center">
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

          <div className="space-y-6">
            <div>
              <h3 className="text-foreground text-lg leading-snug font-extrabold">
                {selectedDetails?.title}
              </h3>
              <span className="text-muted-foreground mt-1.5 block font-mono text-xs font-bold">
                منطقه: {toPersianDigits(selectedDetails?.region ?? "")} |
                ثبت‌کننده: {selectedDetails?.userName}
              </span>
            </div>

            <p className="bg-muted text-foreground/70 rounded-2xl border p-4 text-sm leading-relaxed font-semibold whitespace-pre-wrap">
              {selectedDetails?.description}
            </p>

            {selectedDetails?.adminResponse ? (
              <div className="border-primary/30 from-primary/10 to-primary/5 relative rounded-2xl border bg-gradient-to-br p-4">
                <div className="border-primary/20 bg-primary/10 text-primary absolute top-3 left-3 rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase">
                  پاسخ رسمی
                </div>
                <span className="text-primary mb-1 block text-xs font-extrabold">
                  پاسخ رسمی شهرداری منطقه:
                </span>
                <p className="text-foreground/70 text-xs leading-relaxed font-medium whitespace-pre-line">
                  {selectedDetails.adminResponse}
                </p>
              </div>
            ) : (
              <div className="bg-muted text-muted-foreground/70 rounded-2xl border p-3.5 text-center text-xs font-bold">
                این گزارش برای اعزام اکیپ آماده‌سازی در صف رسیدگی واحد روابط
                عمومی شهرداری منطقه است.
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-foreground/70 flex items-center gap-1 text-xs font-bold">
                <MapPin className="text-primary h-4 w-4" />
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
            <span className="text-muted-foreground font-mono text-[10px] font-bold">
              کد رهگیری: {toPersianDigits(selectedDetails?.id ?? "")}
            </span>

            <Button
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
                  currentUser &&
                    selectedDetails?.likedByCurrentUser &&
                    "fill-current",
                )}
              />
              <span>
                {toPersianDigits(selectedDetails?.likes ?? 0)} لایک و تأیید
                شهروندی
              </span>
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
}
