/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RequestItem, RequestStatus, User } from '../types';
import MapComponent from './MapComponent';
import {
  Heart,
  MapPin,
  AlertCircleIcon,
  Map,
  Search,
  ArrowUpDown,
  RefreshCcw,
} from 'lucide-react';
import { toPersianDigits } from '../utils/numberUtils';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ReportsDirectoryProps {
  items: RequestItem[];
  currentUser: User | null;
  onLike: (id: string) => Promise<void>;
  onOpenAuth: () => void;
  onRefresh: () => void;
  theme?: 'light' | 'dark';
}

export default function ReportsDirectory({
  items,
  currentUser,
  onLike,
  onOpenAuth,
  onRefresh,
  theme = 'light',
}: ReportsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeType, setActiveType] = useState<'all' | 'problem' | 'idea'>(
    'all',
  );
  const [showMap, setShowMap] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<
    'newest' | 'oldest' | 'most_liked' | 'least_liked'
  >('newest');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedDetails, setSelectedDetails] = useState<RequestItem | null>(
    null,
  );
  const [visibleCount, setVisibleCount] = useState(12);
  const [filterRegion, setFilterRegion] = useState<string>('all');

  const CATEGORIES = [
    'آسفالت و معابر',
    'زیباسازی و فضای سبز',
    'روشنایی و برق شهری',
    'مدیریت پسماند و بازیافت',
    'ترافیک و حمل و نقل',
    'مناسب‌سازی و خدمات اجتماعی',
    'سایر',
  ];

  const REGIONS = Array.from(
    { length: 8 },
    (_, i) => `منطقه ${toPersianDigits(i + 1)}`,
  );

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    const matchesType = activeType === 'all' || item.type === activeType;

    const matchesRegion =
      filterRegion === 'all' || item.region.startsWith(filterRegion);

    // Date range filter
    let matchesDate = true;
    const itemDate = new Date(item.createdAt).getTime();
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      matchesDate = matchesDate && itemDate >= start.getTime();
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && itemDate <= end.getTime();
    }

    return (
      matchesSearch &&
      matchesCategory &&
      matchesType &&
      matchesRegion &&
      matchesDate
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'most_liked':
        return b.likes - a.likes;
      case 'least_liked':
        return a.likes - b.likes;
      default: // newest
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + 8, sorted.length));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisibleCount(12);
  }, [
    searchTerm,
    activeCategory,
    activeType,
    sortBy,
    startDate,
    endDate,
    filterRegion,
  ]);

  const handleLikeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth();
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

  const statusLabels: Record<RequestStatus, { label: string; color: string }> =
    {
      submitted: {
        label: 'جدید ثبت شده',
        color:
          'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-border',
      },
      under_review: {
        label: 'تحت بررسی کارشناسی',
        color:
          'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-border',
      },
      in_progress: {
        label: 'اکیپ شهرداری مشغول کار',
        color:
          'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 border border-border',
      },
      resolved: {
        label: 'برطرف شده نهایی',
        color:
          'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-border',
      },
      archived: {
        label: 'بایگانی‌شده',
        color: 'text-muted-foreground bg-muted border-border',
      },
    };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="shahr_ara_directory">
      {/* Filters */}
      <div className="bg-card mb-8 flex flex-col gap-4 rounded-xl border p-5">
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
            variant={showMap ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowMap(!showMap)}
            className="gap-1.5 rounded-lg whitespace-nowrap"
          >
            <Map className="h-3.5 w-3.5" />
            <span>{showMap ? 'مخفی‌سازی نقشه' : 'نمایش نقشه'}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="gap-1.5 rounded-lg whitespace-nowrap"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
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
                  v as 'newest' | 'oldest' | 'most_liked' | 'least_liked',
                )
              }
            >
              <SelectTrigger size="sm" className="w-32">
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
                setActiveType(v as 'all' | 'problem' | 'idea')
              }
            >
              <SelectTrigger size="sm" className="w-32">
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
              <SelectTrigger size="sm" className="w-32">
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
              className="h-8 w-36 text-xs"
            />
            <span className="text-muted-foreground text-xs">تا</span>
            <DatePicker
              date={endDate}
              onSelect={setEndDate}
              placeholder="تا تاریخ"
              className="h-8 w-36 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="-mx-4 mb-8 flex scrollbar-thin gap-2 overflow-x-auto px-4 pb-4">
        <Button
          variant={activeCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveCategory('all')}
          className="shrink-0 rounded-full"
        >
          همه دسته‌ها
        </Button>
        {CATEGORIES.map((cat, idx) => (
          <Button
            key={idx}
            variant={activeCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(cat)}
            className="shrink-0 rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Display Directory Main Arena */}
      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className={`${showMap ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          <div className="max-h-[600px] overflow-y-auto p-0.5 max-lg:max-h-none max-lg:overflow-visible">
            <div
              className={cn(
                'grid grid-cols-1 gap-5',
                showMap
                  ? 'sm:grid-cols-2'
                  : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
              )}
            >
              {sorted.length > 0 ? (
                sorted.slice(0, visibleCount).map((item) => {
                  const isProblem = item.type === 'problem';
                  const hasLikedStatus = currentUser
                    ? item.likedByCurrentUser
                    : false;

                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        'report-card cursor-pointer overflow-hidden transition-all duration-300',
                        'hover:shadow-sm',
                        'border-border bg-card',
                      )}
                      onClick={() => setSelectedDetails(item)}
                    >
                      <CardContent className="flex flex-col gap-2.5 px-5">
                        {/* Badge / Header row */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <Badge
                            variant={isProblem ? 'destructive' : 'default'}
                            className={cn(
                              'font-semibold',
                              isProblem
                                ? 'border-border border bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                                : 'border-border border bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
                            )}
                          >
                            {isProblem ? 'گزارش مشکل' : 'ایده شهری'}
                          </Badge>

                          <Badge
                            className={cn(
                              'text-xs font-semibold',
                              statusLabels[item.status]?.color,
                            )}
                          >
                            {statusLabels[item.status]?.label}
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

                          <Button
                            variant={hasLikedStatus ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={(e) => handleLikeClick(e, item.id)}
                            className="gap-1"
                            title={
                              currentUser
                                ? 'ثبت لایک'
                                : 'برای لایک ثبت‌نام کنید'
                            }
                          >
                            <Heart
                              className={cn(
                                'h-3.5 w-3.5',
                                hasLikedStatus && 'fill-current',
                              )}
                            />
                            <span className="font-bold">
                              {toPersianDigits(item.likes)} لایک
                            </span>
                          </Button>
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

              {/* Load More button */}
              {sorted.length > 0 && sorted.length > visibleCount && (
                <div className="col-span-full flex justify-center pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    className="gap-2 font-bold"
                  >
                    بارگذاری بیشتر (
                    {toPersianDigits(sorted.length - visibleCount)} مورد)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map */}
        {showMap && (
          <div className="border-border bg-card sticky top-24 h-[500px] overflow-hidden rounded-xl border lg:col-span-5">
            <MapComponent
              pickerMode={false}
              items={sorted}
              onSelectItem={(item) => setSelectedDetails(item)}
              theme={theme}
            />
          </div>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog
        open={!!selectedDetails}
        onOpenChange={(open) => !open && setSelectedDetails(null)}
      >
        <DialogContent className="max-sm:p-4 sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge
                variant={
                  selectedDetails?.type === 'problem'
                    ? 'destructive'
                    : 'default'
                }
                className={cn(
                  selectedDetails?.type !== 'problem'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : '',
                )}
              >
                {selectedDetails?.type === 'problem'
                  ? 'گزارش مشکل'
                  : 'ایده شهری'}
              </Badge>
              <Badge variant="outline" className="font-mono">
                {selectedDetails?.category}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <h3 className="text-foreground text-lg leading-snug font-extrabold">
                {selectedDetails?.title}
              </h3>
              <span className="text-muted-foreground mt-1.5 block font-mono text-xs font-bold">
                منطقه: {toPersianDigits(selectedDetails?.region ?? '')} |
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

          <Separator />

          <DialogFooter className="flex items-center justify-between sm:justify-between">
            <span className="text-muted-foreground font-mono text-[10px] font-bold">
              کد رهگیری: {toPersianDigits(selectedDetails?.id ?? '')}
            </span>

            <Button
              variant={
                currentUser && selectedDetails?.likedByCurrentUser
                  ? 'destructive'
                  : 'outline'
              }
              size="sm"
              onClick={(e) =>
                selectedDetails && handleLikeClick(e, selectedDetails.id)
              }
            >
              <Heart
                className={cn(
                  'h-3.5 w-3.5',
                  currentUser &&
                    selectedDetails?.likedByCurrentUser &&
                    'fill-current',
                )}
              />
              <span>
                {toPersianDigits(selectedDetails?.likes ?? 0)} لایک و تأیید
                شهروندی
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
