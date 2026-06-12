/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RequestItem, RequestStatus, User } from '../types';
import MapComponent from './MapComponent';
import {
  FavouriteIcon,
  Location01Icon,
  AlertCircleIcon,
  MapsIcon,
  Search01Icon,
} from 'hugeicons-react';
import { toPersianDigits } from '../utils/numberUtils';

interface ReportsDirectoryProps {
  items: RequestItem[];
  currentUser: User | null;
  onLike: (id: string) => Promise<void>;
  onOpenAuth: () => void;
  theme?: 'light' | 'dark';
}

export default function ReportsDirectory({
  items,
  currentUser,
  onLike,
  onOpenAuth,
  theme = 'light',
}: ReportsDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeType, setActiveType] = useState<'all' | 'problem' | 'idea'>(
    'all',
  );
  const [showMap, setShowMap] = useState<boolean>(true); // Split view or list view
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

  // Filters logic
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

  const handleLikeClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    onLike(id);
    // If the selected item is open, update its likes locally
    if (selectedDetails && selectedDetails.id === id) {
      const alreadyLiked = selectedDetails.likedBy?.includes(currentUser.phone);
      const newLikedBy = alreadyLiked
        ? selectedDetails.likedBy?.filter((p) => p !== currentUser.phone) || []
        : [...(selectedDetails.likedBy || []), currentUser.phone];
      const newLikes = alreadyLiked
        ? Math.max(0, selectedDetails.likes - 1)
        : selectedDetails.likes + 1;
      setSelectedDetails({
        ...selectedDetails,
        likes: newLikes,
        likedBy: newLikedBy,
      });
    }
  };

  const statusLabels: Record<RequestStatus, { label: string; color: string }> =
    {
      submitted: {
        label: 'جدید ثبت شده',
        color: 'text-blue-400 bg-blue-950/40 border-blue-500/20',
      },
      under_review: {
        label: 'تحت بررسی کارشناسی',
        color: 'text-amber-400 bg-amber-950/40 border-amber-500/20',
      },
      in_progress: {
        label: 'اکیپ شهرداری مشغول کار',
        color: 'text-orange-400 bg-orange-950/40 border-orange-500/20',
      },
      resolved: {
        label: 'برطرف شده نهایی',
        color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20',
      },
      archived: {
        label: 'بایگانی‌شده',
        color: 'text-slate-400 bg-zinc-900 border-zinc-800',
      },
    };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8" id="shahr_ara_directory">
      {/* 1. Header description */}
      <div className="mb-8 text-right border-r-2 border-cyan-400 pr-4">
        <h2 className="text-2xl font-black text-white">
          لیست نیازها، گزارش‌ها و ایده‌های ثبت شده شهروندان
        </h2>
        <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
          در این بخش می‌توانید تمامی گزارش‌های ارسال شده شهری به همراه وضعیت
          پیشرفت و پاسخ نهایی مسئولان مربوطه شهرداری را رصد کنید و بابت تسریع
          کار لایک دهید.
        </p>
      </div>

      {/* 2. Directory control board (Theodorus Clarence design matching) */}
      <div className="bg-[#0f172a] border border-zinc-800 rounded-xl p-5 mb-8 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search01Icon className="absolute right-3 top-3 w-4.5 h-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="جستجوی نیاز، ایده، محله..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-10 py-2 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors font-sans"
          />
        </div>

        {/* Multi toggles */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Problem vs Idea selection */}
          <div className="flex bg-zinc-950 rounded-lg p-1 border border-zinc-800/80">
            <button
              onClick={() => setActiveType('all')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeType === 'all' ? 'bg-zinc-800 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
            >
              همه کارهای شهری
            </button>
            <button
              onClick={() => setActiveType('problem')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeType === 'problem' ? 'bg-red-950/40 text-red-400' : 'text-slate-400 hover:text-white'}`}
            >
              فقط خرابی‌ها
            </button>
            <button
              onClick={() => setActiveType('idea')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${activeType === 'idea' ? 'bg-emerald-9c0/40 text-emerald-400' : 'text-slate-400 hover:text-white'}`}
            >
              فقط ایده‌ها
            </button>
          </div>

          {/* Toggle Map vs Grid Split */}
          <button
            onClick={() => setShowMap(!showMap)}
            className={`px-4 py-2 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all duration-200 ${
              showMap
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                : 'bg-zinc-950 border-zinc-800 text-slate-400 hover:border-zinc-700'
            }`}
          >
            <MapsIcon className="w-3.5 h-3.5" />
            <span>
              {showMap
                ? 'غیرفعال‌سازی نمایش نقشه'
                : 'فعال‌سازی نمایش نقشه شهری'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Category horizontal rails bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 -mx-4 px-4 scrollbar-thin">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 text-xs font-bold rounded-full border shrink-0 transition-all ${
            activeCategory === 'all'
              ? 'bg-cyan-500 text-zinc-950 hover:bg-cyan-400 border-transparent'
              : 'bg-[#0f172a] border-zinc-888 text-slate-300 hover:border-zinc-700'
          }`}
        >
          همه دسته‌ها
        </button>
        {CATEGORIES.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-full border shrink-0 transition-all ${
              activeCategory === cat
                ? 'bg-cyan-500 text-zinc-950 hover:bg-cyan-400 border-transparent'
                : 'bg-[#0f172a] border-zinc-800 text-slate-300 hover:border-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. Display Directory Main Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Arena: Map and list split container */}
        <div
          className={`${showMap ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-5 h-full`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const datePersian = new Date(item.createdAt).toLocaleDateString(
                  'fa-IR',
                );
                const isProblem = item.type === 'problem';
                const hasLikedStatus = currentUser
                  ? item.likedBy?.includes(currentUser.phone)
                  : false;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedDetails(item)}
                    className="clarence-card-hover bg-[#0f172a] border border-zinc-800 rounded-xl p-4 cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[220px]"
                  >
                    <div>
                      {/* Badge / Header row */}
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${
                            isProblem
                              ? 'bg-red-950/20 border-red-500/20 text-red-400'
                              : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {isProblem ? 'گزارش مشکل' : 'ایده شهری'}
                        </span>

                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded border ${statusLabels[item.status]?.color}`}
                        >
                          {statusLabels[item.status]?.label}
                        </span>
                      </div>

                      {/* Content */}
                      <h3 className="text-sm font-extrabold text-white line-clamp-1 mb-2 hover:text-cyan-300 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>

                    {/* Footer buttons / states */}
                    <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 font-sans">
                        <Location01Icon className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
                        {toPersianDigits(item.region)}
                      </span>

                      {/* Vote/Like trigger */}
                      <button
                        onClick={(e) => handleLikeClick(e, item.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                          hasLikedStatus
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-550 dark:text-red-400 border border-red-200 dark:border-red-500/30 font-bold'
                            : 'bg-slate-55 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-500 dark:text-slate-400 hover:text-red-500'
                        }`}
                        title={
                          currentUser ? 'ثبت لایک' : 'برای لایک ثبت‌نام کنید'
                        }
                      >
                        <FavouriteIcon
                          className={`w-3.5 h-3.5 ${hasLikedStatus ? 'fill-current text-red-500' : ''}`}
                        />
                        <span className="font-bold">
                          {toPersianDigits(item.likes)} لایک
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-zinc-800 rounded-xl p-12 text-center text-slate-500 dark:text-slate-400 transition-all">
                <AlertCircleIcon className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-black text-slate-800 dark:text-white">
                  هیچ گزارش یا ایده‌ای در این دسته‌بندی یافت نشد.
                </p>
                <p className="text-xs text-slate-500 mt-1 font-bold">
                  اولین شهروندی باشید که گزارش جدیدی ارسال می‌کند!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Arena: Map overlay list (5 columns on large desktop) */}
        {showMap && (
          <div className="lg:col-span-5 h-[500px] sticky top-24 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-md dark:shadow-lg bg-white dark:bg-[#0f172a]">
            <MapComponent
              pickerMode={false}
              items={filtered}
              onSelectItem={(item) => setSelectedDetails(item)}
              theme={theme}
            />
          </div>
        )}
      </div>

      {/* 5. Custom Details Popup Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative animate-fade-in text-right">
            {/* Header top section */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0b0f19]">
              <div>
                <span
                  className={`px-2 py-0.5 text-[9px] font-black rounded-md border ${
                    selectedDetails.type === 'problem'
                      ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
                      : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {selectedDetails.type === 'problem'
                    ? 'گزارش مشکل'
                    : 'ایده شهری'}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-bold tracking-wider bg-slate-100 dark:bg-zinc-950 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-801 ms-2">
                  {selectedDetails.category}
                </span>
              </div>
              <button
                onClick={() => setSelectedDetails(null)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors font-bold text-xs cursor-pointer"
                id="close_details_btn"
              >
                بستن پنجره ×
              </button>
            </div>

            {/* Inner scroll container */}
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              <div>
                <h3 className="text-lg font-black text-slate-800 dark:text-white leading-snug">
                  {selectedDetails.title}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1.5 block font-bold">
                  منطقه: {toPersianDigits(selectedDetails.region)} | ثبت‌کننده:{' '}
                  {selectedDetails.userName}
                </span>
              </div>

              {/* Main description paragraph */}
              <p className="text-sm text-slate-705 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-zinc-950/60 p-4 border border-slate-105 dark:border-zinc-800/80 rounded-xl whitespace-pre-wrap font-semibold">
                {selectedDetails.description}
              </p>

              {/* Admin response message */}
              {selectedDetails.adminResponse ? (
                <div className="bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-indigo-950/20 dark:to-teal-950/20 border border-teal-200 dark:border-teal-500/30 rounded-xl p-4 relative">
                  <div
                    className="absolute top-3 left-3 bg-teal-500/10 text-teal-600 dark:text-teal-300 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase font-mono border border-teal-550/20"
                    dir="ltr"
                  >
                    OFFICIAL ACTION
                  </div>
                  <span className="text-xs font-black text-teal-600 dark:text-teal-400 block mb-1">
                    پاسخ رسمی شهرداری منطقه:
                  </span>
                  <p className="text-xs text-slate-705 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                    {selectedDetails.adminResponse}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-zinc-950/30 border border-slate-105 dark:border-zinc-800 rounded-xl p-3.5 text-center text-xs text-slate-500 dark:text-slate-500 font-bold">
                  این گزارش برای اعزام اکیپ آماده‌سازی در صف رسیدگی واحد روابط
                  عمومی شهرداری منطقه است.
                </div>
              )}

              {/* Map display */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Location01Icon className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                  موقعیت فیزیکی روی نقشه شهر
                </span>
                <div className="h-[200px] rounded-xl overflow-hidden border border-slate-205 dark:border-zinc-800">
                  <MapComponent
                    pickerMode={false}
                    items={[selectedDetails]}
                    theme={theme}
                  />
                </div>
              </div>
            </div>

            {/* Details Footer */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-[#0b0f19] border-t border-slate-100 dark:border-zinc-800 p-4">
              <span
                className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold"
                dir="ltr"
              >
                Report ID: {toPersianDigits(selectedDetails.id)}
              </span>

              <button
                onClick={(e) => handleLikeClick(e, selectedDetails.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentUser &&
                  selectedDetails.likedBy?.includes(currentUser.phone)
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-slate-600 dark:text-slate-300 hover:text-red-500'
                }`}
              >
                <FavouriteIcon
                  className={`w-3.5 h-3.5 ${currentUser && selectedDetails.likedBy?.includes(currentUser.phone) ? 'fill-current text-white' : ''}`}
                />
                <span>
                  {toPersianDigits(selectedDetails.likes)} لایک و تأیید شهروندی
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
