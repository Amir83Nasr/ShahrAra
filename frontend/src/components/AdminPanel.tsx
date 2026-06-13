/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RequestItem, RequestStatus, RequestType } from '../types';
import MapComponent from './MapComponent';
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
} from 'lucide-react';
import { toPersianDigits } from '../utils/numberUtils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

interface AdminPanelProps {
  requests: RequestItem[];
  onUpdateStatus: (
    id: string,
    status: RequestStatus,
    adminResponse: string,
  ) => Promise<void>;
  onRefresh: () => void;
  theme?: 'light' | 'dark';
}

const CATEGORIES = [
  'آسفالت و معابر',
  'زیباسازی و فضای سبز',
  'روشنایی و برق شهری',
  'مدیریت پسماند و بازیافت',
  'ترافیک و حمل و نقل',
  'مناسب‌سازی و خدمات اجتماعی',
  'سایر',
];

export default function AdminPanel({
  requests,
  onUpdateStatus,
  onRefresh,
  theme = 'light',
}: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<RequestType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | 'all'>(
    'all',
  );

  const [selectedItem, setSelectedItem] = useState<RequestItem | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [statusVal, setStatusVal] = useState<RequestStatus>('submitted');

  const [submitting, setSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync selected item inputs when selected item changes
  useEffect(() => {
    if (selectedItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAdminResponse(selectedItem.adminResponse || '');

      setStatusVal(selectedItem.status);
    }
  }, [selectedItem]);

  // Filter list
  const filteredItems = requests.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userPhone.includes(searchTerm);

    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' || item.status === selectedStatus;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    setSaveSuccess(false);

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
      alert('خطا در بروزرسانی وضعیت.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColors: Record<
    RequestStatus,
    { bg: string; text: string; label: string }
  > = {
    submitted: {
      bg: 'bg-status-under-review/20 border-status-under-review/30 text-status-under-review',
      text: 'text-status-under-review',
      label: 'ثبت شده معلق',
    },
    under_review: {
      bg: 'bg-status-in-progress/20 border-status-in-progress/30 text-status-in-progress',
      text: 'text-status-in-progress',
      label: 'در حال بررسی فنی',
    },
    in_progress: {
      bg: 'bg-status-in-progress/20 border-status-in-progress/30 text-status-in-progress',
      text: 'text-status-in-progress',
      label: 'در حال اجرای فنی',
    },
    resolved: {
      bg: 'bg-status-resolved/20 border-status-resolved/30 text-status-resolved',
      text: 'text-status-resolved',
      label: 'برطرف شده و نهایی',
    },
    archived: {
      bg: 'bg-muted border-border text-muted-foreground',
      text: 'text-muted-foreground',
      label: 'بایگانی‌شده',
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="shahr_ara_admin_panel">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold tracking-wider text-primary">
              پنل مدیریت شهری
            </span>
            <h2 className="text-foreground mt-0.5 text-2xl font-black">
              پنل پاسخگویی و مدیریت شهرداری شهرآرا
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              شما وارد حساب کاربری مدیر سامانه شده‌اید. پاسخ به شهروندان و
              تغییرات زیر نظر سیستم یکپارچه مستند می‌شود.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="gap-1.5"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          بروزرسانی لیست کارهای مردمی
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Left Column: List with Filters (7 columns on large desktop) */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Active Filters / Search */}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-lg">
            {/* Search row */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-3 right-3.5 h-4 w-4" />
              <Input
                type="text"
                placeholder="جستجوی درخواست‌ها (عنوان، توضیحات، نام شهروند ارائه‌دهنده...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background pr-10"
              />
            </div>

            {/* Quick Filters Group */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* Type selector */}
              <div className="flex flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold">
                  <Filter className="text-primary h-3 w-3" />
                  نوع مشارکت
                </span>
                <Select
                  value={selectedType}
                  onValueChange={(v) =>
                    setSelectedType(v as 'all' | 'problem' | 'idea')
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      همه دسته‌ها (مشکل و ایده)
                    </SelectItem>
                    <SelectItem value="problem">
                      فقط گزارش مشکلات شهری
                    </SelectItem>
                    <SelectItem value="idea">فقط ایده‌های نوآورانه</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category selector */}
              <div className="flex flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold">
                  <Layers className="text-primary h-3 w-3" />
                  موضوع خدمت
                </span>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه موضوعات خدمتی</SelectItem>
                    {CATEGORIES.map((c, i) => (
                      <SelectItem key={i} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status selector */}
              <div className="flex flex-col gap-1.5 text-right">
                <span className="text-muted-foreground flex items-center gap-1 text-[10px] font-bold">
                  <CheckCircle className="text-primary h-3 w-3" />
                  وضعیت فرآیند
                </span>
                <Select
                  value={selectedStatus}
                  onValueChange={(v) => setSelectedStatus(v as RequestStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="submitted">مورد ارسالی جدید</SelectItem>
                    <SelectItem value="under_review">
                      در حال بررسی تخصصی
                    </SelectItem>
                    <SelectItem value="in_progress">
                      اکیپ‌های مشغول به کار
                    </SelectItem>
                    <SelectItem value="resolved">برطرف شده و نهایی</SelectItem>
                    <SelectItem value="archived">بایگانی شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="max-h-[500px] space-y-3 overflow-y-auto p-0.5">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const dateString = new Date(item.createdAt).toLocaleDateString(
                  'fa-IR',
                );
                const isProblem = item.type === 'problem';

                return (
                  <Card
                    key={item.id}
                    size="sm"
                    className={cn(
                      'cursor-pointer transition-all',
                      isSelected
                        ? 'border-primary ring-2 ring-primary/40 shadow-md'
                        : 'border-border bg-card hover:border-primary/50',
                    )}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="flex flex-col gap-2.5 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isProblem ? 'destructive' : 'default'}
                            className={cn(
                              isProblem
                                ? ''
                                : 'bg-type-idea/10 text-type-idea hover:bg-type-idea/20',
                            )}
                          >
                            {isProblem ? 'گزارش مشکل' : 'ایده خلاق'}
                          </Badge>
                        </div>
                        <Badge className={statusColors[item.status]?.bg}>
                          {statusColors[item.status]?.label}
                        </Badge>
                      </div>

                      <CardTitle className="text-sm font-bold text-foreground">
                        {item.title}
                      </CardTitle>

                      <CardDescription className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                        {item.description}
                      </CardDescription>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {item.userName} - {toPersianDigits(item.region)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {dateString}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
                <Filter className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-xs font-semibold">
                  هیچ موردی منطبق با فیلترهای بالا یافت نشد.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Response Dashboard (5 columns on desktop) */}
        <div className="h-full lg:col-span-5">
          {selectedItem ? (
            <Card className="rounded-xl border border-border bg-card shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-(--card-spacing)">
                <div className="space-y-1">
                  <span className="block font-mono text-[10px] font-bold tracking-wider text-primary">
                    جزئیات درخواست
                  </span>
                  <h3 className="text-base font-extrabold text-foreground">
                    بررسی درخواست برگزیده
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSelectedItem(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Category & Region */}
              <div className="flex items-center gap-2 px-(--card-spacing) text-xs font-bold text-muted-foreground">
                <Badge
                  variant={selectedItem.type === 'problem' ? 'destructive' : 'default'}
                  className={cn(
                    selectedItem.type !== 'problem' &&
                      'bg-type-idea/10 text-type-idea',
                  )}
                >
                  {selectedItem.type === 'problem' ? 'گزارش مشکل' : 'ایده شهری'}
                </Badge>
                <Badge variant="outline">{selectedItem.category}</Badge>
                <span className="mr-auto text-[10px]">
                  {toPersianDigits(selectedItem.region)}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-3 px-(--card-spacing)">
                <CardTitle className="text-base font-black text-foreground">
                  {selectedItem.title}
                </CardTitle>
                <div className="rounded-lg border border-border bg-muted/30 p-3.5 text-xs leading-relaxed whitespace-pre-line text-foreground/80">
                  {selectedItem.description}
                </div>
              </div>

              {/* Status */}
              <div className="px-(--card-spacing)">
                <Badge className={cn('px-3 py-1 text-[10px]', statusColors[selectedItem.status]?.bg)}>
                  {statusColors[selectedItem.status]?.label}
                </Badge>
              </div>

              {/* Citizen Info */}
              <div className="mx-(--card-spacing) rounded-lg border border-border bg-muted/20 p-3.5">
                <div className="flex items-center gap-2 pb-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    اطلاعات تماس شهروند
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="block text-[10px] text-muted-foreground">نام:</span>
                    <span className="text-xs font-bold text-foreground">{selectedItem.userName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-muted-foreground">شماره همراه:</span>
                    <span className="font-mono text-xs text-foreground" dir="rtl">
                      {toPersianDigits(selectedItem.userPhone)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="space-y-2 px-(--card-spacing)">
                <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  موقعیت جغرافیایی
                </span>
                <div className="h-[180px] overflow-hidden rounded-lg border border-border bg-background">
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
                {saveSuccess && (
                  <div className="flex items-center gap-2 rounded-lg border border-type-idea/20 bg-type-idea/10 p-2.5 text-xs text-type-idea">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>بروزرسانی با موفقیت اعمال شد!</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">
                    تغییر وضعیت درخواست
                  </label>
                  <Select
                    value={statusVal}
                    onValueChange={(v) => setStatusVal(v as RequestStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">جدید (صف انتظار)</SelectItem>
                      <SelectItem value="under_review">تحت بررسی فنی</SelectItem>
                      <SelectItem value="in_progress">در دست اقدام</SelectItem>
                      <SelectItem value="resolved">برطرف شده</SelectItem>
                      <SelectItem value="archived">بایگانی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">
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

                <Button type="submit" variant="default" className="w-full" disabled={submitting}>
                  {submitting ? 'در حال انتشار...' : 'ثبت و انتشار پاسخ'}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-border bg-card text-center">
              <CardContent className="p-6">
                <MessageSquare className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
                <h3 className="mb-1 text-sm font-bold text-foreground">
                  پنجره اقدام اداری
                </h3>
                <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
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
