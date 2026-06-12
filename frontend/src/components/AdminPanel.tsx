/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RequestItem, RequestStatus, RequestType } from '../types';
import MapComponent from './MapComponent';
import {
  Shield01Icon,
  Search01Icon,
  FilterIcon,
  Comment01Icon,
  Calendar01Icon,
  Location01Icon,
  UserIcon,
  CheckmarkCircle01Icon,
  ArrowLeft01Icon,
  Refresh01Icon,
  Layers01Icon,
} from 'hugeicons-react';
import { toPersianDigits } from '../utils/numberUtils';

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
      bg: 'bg-blue-950/40 border-blue-500/30 text-blue-400',
      text: 'text-blue-400',
      label: 'ثبت شده معلق',
    },
    under_review: {
      bg: 'bg-amber-950/40 border-amber-500/30 text-amber-300',
      text: 'text-amber-300',
      label: 'در حال بررسی فنی',
    },
    in_progress: {
      bg: 'bg-orange-950/40 border-orange-500/30 text-orange-400',
      text: 'text-orange-400',
      label: 'در حال اجرای فنی',
    },
    resolved: {
      bg: 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400',
      text: 'text-emerald-400',
      label: 'برطرف شده و نهایی',
    },
    archived: {
      bg: 'bg-zinc-800 border-zinc-700 text-slate-400',
      text: 'text-slate-400',
      label: 'بایگانی‌شده',
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="shahr_ara_admin_panel">
      {/* 1. Header Admin banner */}
      <div className="bg-[#0f172a] border border-zinc-800 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 dark-dotted-grid relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 blur-3xl rounded-full" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-center text-amber-400">
            <Shield01Icon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-amber-400 font-mono tracking-wider">
              ADMINISTRATION BOARD
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5">
              پنل پاسخگویی و مدیریت شهرداری شهرآرا
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              شما وارد حساب کاربری مدیر سامانه شده‌اید. پاسخ به شهروندان و
              تغییرات زیر نظر سیستم یکپارچه مستند می‌شود.
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
        >
          <Refresh01Icon className="w-3.5 h-3.5" />
          بروزرسانی لیست کارهای مردمی
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: List with Filters (7 columns on large desktop) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Active Filters / Search */}
          <div className="bg-[#0f172a] border border-zinc-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
            {/* Search row */}
            <div className="relative">
              <Search01Icon className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="جستجوی درخواست‌ها (عنوان، توضیحات، نام شهروند ارائه‌دهنده...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-10 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors font-sans"
              />
            </div>

            {/* Quick Filters Group */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Type selector */}
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1">
                  <FilterIcon className="w-3 h-3 text-cyan-400" />
                  نوع مشارکت
                </span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium font-sans"
                >
                  <option value="all">همه دسته‌ها (مشکل و ایده)</option>
                  <option value="problem">فقط گزارش مشکلات شهری</option>
                  <option value="idea">فقط ایده‌های نوآورانه</option>
                </select>
              </div>

              {/* Category selector */}
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1">
                  <Layers01Icon className="w-3 h-3 text-cyan-400" />
                  موضوع خدمت
                </span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium font-sans"
                >
                  <option value="all">همه موضوعات خدمتی</option>
                  {CATEGORIES.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status selector */}
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1">
                  <CheckmarkCircle01Icon className="w-3 h-3 text-cyan-400" />
                  وضعیت فرآیند
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="px-3 py-2 text-xs bg-zinc-950 border border-zinc-800 rounded-lg text-white font-medium font-sans"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="submitted">مورد ارسالی جدید</option>
                  <option value="under_review">در حال بررسی تخصصی</option>
                  <option value="in_progress">اکیپ‌های مشغول به کار</option>
                  <option value="resolved">برطرف شده و نهایی</option>
                  <option value="archived">بایگانی شده</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                const dateString = new Date(item.createdAt).toLocaleDateString(
                  'fa-IR',
                );
                const isProblem = item.type === 'problem';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-4 rounded-xl border text-right cursor-pointer transition-all duration-300 ${
                      isSelected
                        ? 'bg-zinc-900 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                        : 'bg-[#0f172a] border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded-md font-bold tracking-wide border ${
                            isProblem
                              ? 'bg-red-950/20 border-red-500/20 text-red-400'
                              : 'bg-emerald-900/20 border-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {isProblem ? 'گزارش مشکل' : 'ایده خلاق'}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono tracking-wider bg-zinc-950 px-2 py-0.5 rounded border border-zinc-805">
                          {item.category}
                        </span>
                      </div>

                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${statusColors[item.status]?.bg}`}
                      >
                        {statusColors[item.status]?.label}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white hover:text-cyan-300 cursor-pointer mb-2 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {item.description}
                    </p>

                    {/* Footer specifications */}
                    <div className="flex flex-wrap items-center justify-between border-t border-zinc-800/50 pt-2.5 text-[10px] text-slate-400 font-mono gap-2">
                      <span className="flex items-center gap-1 font-sans">
                        <UserIcon className="w-3.5 h-3.5 text-zinc-500" />
                        ثبت‌کننده: {item.userName} (
                        {toPersianDigits(item.region)})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar01Icon className="w-3.5 h-3.5 text-zinc-500" />
                        تاریخ ثبت: {dateString}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-[#0f172a] border border-zinc-800 rounded-xl p-10 text-center text-slate-400">
                <FilterIcon className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                <p className="text-xs font-semibold">
                  هیچ موردی منطبق با فیلترهای بالا یافت نشد.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Response Dashboard (5 columns on desktop) */}
        <div className="lg:col-span-5 h-full">
          {selectedItem ? (
            <div className="bg-[#0f172a] border border-zinc-800 rounded-xl p-6 shadow-xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 left-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />

              {/* Back button on mobile */}
              <div className="border-b border-zinc-800 pb-4 mb-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-cyan-400 font-mono tracking-wider block uppercase">
                    DETAILED ACTION CONTROLLER
                  </span>
                  <h3 className="text-md font-extrabold text-white">
                    بررسی درخواست برگزیده
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1.5 hover:bg-zinc-850 rounded text-slate-400 hover:text-white transition-colors"
                  title="بستن پنجره"
                >
                  <ArrowLeft01Icon className="w-4 h-4" />
                </button>
              </div>

              {/* Title & metadata */}
              <div className="space-y-2">
                <span className="text-[10px] text-cyan-400 font-bold block">
                  {selectedItem.category} |{' '}
                  {toPersianDigits(selectedItem.region)}
                </span>
                <h4 className="text-base font-black text-white leading-snug">
                  {selectedItem.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 whitespace-pre-line">
                  {selectedItem.description}
                </p>
              </div>

              {/* Citizen Personal Info */}
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                  <UserIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                  <strong className="text-slate-200">
                    اطلاعات تماس شهروند ثبت‌کننده
                  </strong>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block">
                      نام ثبت‌کننده:
                    </span>
                    <span className="text-slate-200 font-bold">
                      {selectedItem.userName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">
                      شماره همراه شهروند:
                    </span>
                    <span className="text-slate-200 font-mono" dir="rtl">
                      {toPersianDigits(selectedItem.userPhone)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Map Preview of Issue Location */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Location01Icon className="w-3.5 h-3.5 text-cyan-400" />
                  موقعیت جغرافیایی پیوست شده
                </label>
                <div className="h-[200px] w-full rounded-xl overflow-hidden border border-slate-205 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative">
                  <MapComponent
                    pickerMode={false}
                    items={[selectedItem]}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Modification Form */}
              <form
                onSubmit={handleUpdate}
                className="border-t border-zinc-800 pt-5 space-y-4"
              >
                {saveSuccess && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
                    <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>بروزرسانی وضعیت با موفقیت روی سرور اعمال گردید!</span>
                  </div>
                )}

                {/* Status selector */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-xs font-bold text-slate-300">
                    ارتقای وضعیت اجرایی درخواست
                  </label>
                  <select
                    value={statusVal}
                    onChange={(e) =>
                      setStatusVal(e.target.value as RequestStatus)
                    }
                    className="w-full px-4 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 font-sans"
                  >
                    <option value="submitted">گزارش معلق (به صف جدید)</option>
                    <option value="under_review">
                      تحت بررسی فنی و تایید اعتبار
                    </option>
                    <option value="in_progress">
                      اعزام اکیپ عملیاتی (در دست اقدام)
                    </option>
                    <option value="resolved">
                      برطرف شده و پایان پروژه معبر
                    </option>
                    <option value="archived">
                      بایگانی شده (خارج از توان/غیر مرتبط)
                    </option>
                  </select>
                </div>

                {/* Text Response */}
                <div className="flex flex-col gap-1.5 text-right">
                  <label className="text-xs font-bold text-slate-300">
                    پاسخ رسمی مسئول شهرداری به شهروند
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="نامه یا پاسخ رسمی که به اطلاع ثبت‌کننده و عموم بازدیدکنندگان خواهد رسید..."
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    className="w-full px-4 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] text-xs font-sans"
                >
                  {submitting
                    ? 'در حال انتشار پاسخ...'
                    : 'تایید و ثبت نهایی پاسخ مدیریت'}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-[#0f172a] border border-zinc-800 rounded-xl p-10 text-center text-slate-400 h-full min-h-[400px] flex flex-col items-center justify-center dark-dotted-grid">
              <Comment01Icon className="w-12 h-12 text-slate-700 mb-4 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-300">
                پنجره اقدام اداری
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
                جهت مشاهده اطلاعات تماس شهروند، محل روی نقشه و پاسخ‌دهی رسمی با
                تغییر وضعیت، یکی از موارد سمت راست را برگزینید.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
