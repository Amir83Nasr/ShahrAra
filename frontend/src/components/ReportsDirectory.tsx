/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RequestItem, RequestStatus, User } from '../types';
import MapComponent from './MapComponent';
import { Heart, MapPin, AlertCircleIcon, Map, Search, ArrowUpDown, RefreshCcw } from 'lucide-react';
import { toPersianDigits } from '../utils/numberUtils';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [sortBy, setSortBy] = useState<'newest' | 'most_liked'>('newest');
  const [selectedDetails, setSelectedDetails] = useState<RequestItem | null>(
    null,
  );

  const CATEGORIES = [
    'آسفالت و معابر',
    'زیباسازی و فضای سبز',
    'روشنایی و برق شهری',
    'مدیریت پسماند و بازیافت',
    'ترافیک و حمل و نقل',
    'مناسب‌سازی و خدمات اجتماعی',
    'سایر',
  ];

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === 'all' || item.category === activeCategory;
    const matchesType = activeType === 'all' || item.type === activeType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'most_liked' ? b.likes - a.likes : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

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
      if (updated) setSelectedDetails(updated);
    }
  }, [items]);

  const statusLabels: Record<RequestStatus, { label: string; color: string }> =
    {
      submitted: {
        label: 'جدید ثبت شده',
        color:
          'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800',
      },
      under_review: {
        label: 'تحت بررسی کارشناسی',
        color:
          'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800',
      },
      in_progress: {
        label: 'اکیپ شهرداری مشغول کار',
        color:
          'text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800',
      },
      resolved: {
        label: 'برطرف شده نهایی',
        color:
          'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800',
      },
      archived: {
        label: 'بایگانی‌شده',
        color: 'text-muted-foreground bg-muted border-border',
      },
    };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="shahr_ara_directory">
      {/* Header */}
      <div className="mb-8 border-r-2 border-primary pr-4 text-right">
        <h2 className="text-foreground text-2xl font-black">
          لیست نیازها، گزارش‌ها و ایده‌های ثبت شده شهروندان
        </h2>
        <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm">
          در این بخش می‌توانید تمامی گزارش‌های ارسال شده شهری به همراه وضعیت
          پیشرفت و پاسخ نهایی مسئولان مربوطه شهرداری را رصد کنید و بابت تسریع
          کار لایک دهید.
        </p>
      </div>

      {/* Filters */}
      <div className="border-border bg-card mb-8 flex flex-col items-center justify-between gap-4 rounded-xl border p-5 shadow-lg md:flex-row">
        <div className="relative w-full md:w-80">
          <Search className="text-muted-foreground absolute top-3 right-3 h-4.5 w-4.5" />
          <Input
            type="text"
            placeholder="جستجوی نیاز، ایده، محله..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-background pr-10"
          />
        </div>

          <div className="flex w-full flex-wrap items-center justify-start gap-3 md:w-auto">
          <Select
            value={sortBy}
            onValueChange={(v) => setSortBy(v as 'newest' | 'most_liked')}
          >
            <SelectTrigger size="sm" className="w-36">
              <ArrowUpDown className="ml-1.5 h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="newest">جدیدترین</SelectItem>
              <SelectItem value="most_liked">بیشترین لایک</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={activeType}
            onValueChange={(v) => setActiveType(v as 'all' | 'problem' | 'idea')}
          >
            <SelectTrigger size="sm" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="all">همه کارها</SelectItem>
              <SelectItem value="problem">خرابی‌ها</SelectItem>
              <SelectItem value="idea">ایده‌ها</SelectItem>
            </SelectContent>
          </Select>
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
            className="gap-1.5"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            <span>بروزرسانی</span>
          </Button>
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
        <div
          className={`${showMap ? 'lg:col-span-7' : 'lg:col-span-12'}`}
        >
          <div className="max-h-[600px] overflow-y-auto p-0.5">
          <div
            className={cn(
              'grid grid-cols-1 gap-5',
              showMap
                ? 'sm:grid-cols-2'
                : 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            )}
          >
            {sorted.length > 0 ? (
              sorted.map((item) => {
                const isProblem = item.type === 'problem';
                const hasLikedStatus = currentUser
                  ? item.likedByCurrentUser
                  : false;

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      'cursor-pointer overflow-hidden transition-all duration-300',
                      'hover:border-primary/30 hover:shadow-xl',
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
                              ? 'border border-red-200 bg-red-100 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300'
                              : 'border border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
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
                      <CardTitle className="text-foreground hover:text-primary line-clamp-1 cursor-pointer text-sm font-extrabold transition-colors">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground line-clamp-3 text-xs leading-relaxed">
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
                            currentUser ? 'ثبت لایک' : 'برای لایک ثبت‌نام کنید'
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
                <p className="text-foreground text-sm font-black">
                  هیچ گزارش یا ایده‌ای یافت نشد.
                </p>
                <p className="text-muted-foreground mt-1 text-xs font-bold">
                  اولین شهروندی باشید که گزارش جدیدی ارسال می‌کند!
                </p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* Map */}
        {showMap && (
          <div className="border-border bg-card sticky top-24 h-[500px] overflow-hidden rounded-xl border shadow-lg lg:col-span-5">
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
        <DialogContent>
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
              <h3 className="text-foreground text-lg leading-snug font-black">
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
              <div className="relative rounded-xl border border-teal-500/30 bg-gradient-to-br from-teal-950/20 to-emerald-950/20 p-4">
                <div className="absolute top-3 left-3 rounded border border-teal-500/20 bg-teal-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-teal-300 uppercase">
                  پاسخ رسمی
                </div>
                <span className="mb-1 block text-xs font-black text-teal-400">
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
                <MapPin className="h-4 w-4 text-primary" />
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
