"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { RequestItem, User } from "../types";

// leaflet touches `window` at import time; skip prerendering
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
}

export default function ReportsDirectory({
  items,
  currentUser,
  onLike,
  onRefresh,
  theme = "light",
  initialCategory = "all",
}: ReportsDirectoryProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
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
    <div className="mx-auto max-w-7xl px-4 py-8" id="shahr_ara_directory">
      {/* Filters */}
      <div className="bg-card mb-4 flex flex-col gap-4 rounded-xl border p-5">
        {/* Top row: search + map/refresh buttons */}
        <div className="flex w-full items-center gap-3">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-3 right-3 h-4.5 w-4.5" />
            <Input
              type="text"
              placeholder="جستجوی نیاز، ایده، محله..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-background pr-10"
            />
          </div>
          <Button
            variant={showMap ? "default" : "outline"}
            onClick={() => setShowMap(!showMap)}
            className="whitespace-nowrap"
          >
            <Map />
            <span>{showMap ? "مخفی‌سازی نقشه" : "نمایش نقشه"}</span>
          </Button>
          <Button
            variant="outline"
            onClick={onRefresh}
            className="whitespace-nowrap"
          >
            <RefreshCcw />
            <span>بروزرسانی</span>
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
      <div className="-mx-4 mb-4 flex scrollbar-thin gap-2 overflow-x-auto px-4 pb-4">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          onClick={() => setActiveCategory("all")}
          className="shrink-0 rounded-full"
        >
          همه دسته‌ها
        </Button>
        {CATEGORIES.map((cat, idx) => (
          <Button
            key={idx}
            variant={activeCategory === cat ? "default" : "outline"}
            onClick={() => setActiveCategory(cat)}
            className="shrink-0 rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Display Directory Main Arena */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Map — mobile: below filters (hidden by default); desktop: sidebar */}
        {showMap && (
          <div className="border-border bg-card sticky top-24 order-1 h-[500px] overflow-hidden rounded-xl border max-lg:static lg:order-2 lg:col-span-5">
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
          <div className="max-h-[600px] overflow-y-auto p-0.5 max-lg:max-h-none max-lg:overflow-visible">
            <div
              className={cn(
                "grid grid-cols-1 gap-5",
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
                              {currentUser
                                ? "ثبت لایک"
                                : "برای لایک ثبت‌نام کنید"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="border-border bg-card text-muted-foreground col-span-full rounded-xl border p-12 text-center">
                  <AlertCircleIcon className="text-muted-foreground mx-auto mb-3 h-10 w-10" />
                  <p className="text-foreground text-sm font-extrabold">
                    هیچ گزارش یا ایده‌ای یافت نشد.
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs font-bold">
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

            <p className="bg-muted text-foreground/70 rounded-xl border p-4 text-sm leading-relaxed font-semibold whitespace-pre-wrap">
              {selectedDetails?.description}
            </p>

            {selectedDetails?.adminResponse ? (
              <div className="border-primary/30 from-primary/10 to-primary/5 relative rounded-xl border bg-gradient-to-br p-4">
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
              <div className="bg-muted text-muted-foreground/70 rounded-xl border p-3.5 text-center text-xs font-bold">
                این گزارش برای اعزام اکیپ آماده‌سازی در صف رسیدگی واحد روابط
                عمومی شهرداری منطقه است.
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-foreground/70 flex items-center gap-1 text-xs font-bold">
                <MapPin className="text-primary h-4 w-4" />
                موقعیت فیزیکی روی نقشه شهر
              </span>
              <div className="h-[200px] overflow-hidden rounded-xl border">
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
