/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, RequestType } from '../types';
import MapComponent from './MapComponent';
import {
  Alert01Icon,
  Idea01Icon,
  Location01Icon,
  SentIcon,
  Comment01Icon,
  Tag01Icon,
  AlignRightIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
} from 'hugeicons-react';
import { toPersianDigits } from '../utils/numberUtils';

interface RequestFormProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onSubmitSuccess: () => void;
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

export default function RequestForm({
  currentUser,
  onOpenAuth,
  onSubmitSuccess,
  theme = 'light',
}: RequestFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<RequestType>('problem');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [region, setRegion] = useState('');

  // Tehran center default coords
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 35.7219,
    lng: 51.4055,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCoordsChange = (
    newCoords: { lat: number; lng: number },
    computedRegion: string,
  ) => {
    setCoords(newCoords);
    setRegion(computedRegion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError(null);
    setSuccess(false);

    if (!title.trim() || !description.trim()) {
      setError('لطفا تمامی فیلدهای الزامی را پر کنید.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type,
          category,
          coordinates: coords,
          region: region || 'منطقه مرکزی',
          userPhone: currentUser.phone,
          userName: `${currentUser.firstName} ${currentUser.lastName}`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'خطا در ثبت درخواست شهری.');
      }

      setSuccess(true);
      setTitle('');
      setDescription('');

      setTimeout(() => {
        onSubmitSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Guard for anonymous users
  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 md:p-12 shadow-md dark:shadow-xl flex flex-col items-center justify-center min-h-[400px] transition-colors">
          <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6 shadow-sm">
            <Location01Icon className="w-8 h-8 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">
            ثبت گزارش مشکل یا ایده شهری
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed font-bold">
            برای مشارکت در زیباتر کردن شهرمان و گزارش مسائل معابر، فضای سبز،
            روشنایی یا دیگر خدمات شهری، ابتدا باید وارد حساب کاربری خود شوید تا
            درخواستتان مستقیماً به دست مسئولان مربوطه برسد.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-6 py-3 font-bold rounded-lg bg-cyan-500 text-zinc-950 hover:bg-cyan-400 transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.25)] hover:shadow-[0_0_20px_rgba(20,184,166,0.45)]"
          >
            ورود / ثبت‌نام شهروندان
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Helper Instructions Column (inspired by theodorusclarence.com clean margin boxes) */}
        <div className="lg:col-span-4 flex flex-col gap-6 order-last lg:order-first">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm dark:shadow-lg transition-colors">
            <h3 className="text-sm font-black text-cyan-600 dark:text-cyan-300 border-b border-slate-100 dark:border-zinc-800 pb-2.5 mb-3.5 flex items-center gap-2">
              <Idea01Icon className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
              تفاوت گزارش مشکل و ایده چیست؟
            </h3>

            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/10 border border-red-500/10 hover:border-red-550/20 transition-all">
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-500 dark:text-red-400">
                  <Alert01Icon className="w-3.5 h-3.5" />
                  گزارش مشکلات شهری
                </span>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-1 lines-relaxed leading-relaxed font-bold">
                  مسائلی که نیاز به تعمیر فوری شهرداری دارند؛ مانند نارسایی
                  آسفالت، خاموشی چراغ خیابان‌ها، تجمیع زباله، خرابی سطل‌ها و سد
                  معبر.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-500/10 hover:border-emerald-555/20 transition-all">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Idea01Icon className="w-3.5 h-3.5" />
                  ارسال ایده‌های نوآورانه
                </span>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-1 lines-relaxed leading-relaxed font-bold">
                  پیشنهادها و طرح‌های خلاقانه‌ای که هوشمندسازی و زیبایی بصری
                  شهرآرا را ارتقا می‌دهد؛ مانند دیوار سبز، سطل‌های پلاستیکی
                  هوشمند، بهبود مبلمان شهری و مناسب‌سازی عبور توان‌یابان.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 border border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-950/40 rounded-xl transition-all">
            <span
              className="text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2 font-mono"
              dir="ltr"
            >
              Step 2: Coordinate Pin
            </span>
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-200">
              چگونه لوکیشن دقیق را انتخاب کنیم؟
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-bold">
              با استفاده از نقشه روبرو، دکمه نشانگر را به سمت محل دقیق عارضه یا
              اجرای ایده جابجا کنید. پس از رها کردن پین، منطقه شهرداری مربوطه به
              صورت کاملاً خودکار مشخص خواهد شد.
            </p>
          </div>
        </div>

        {/* Form Container Column */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-md dark:shadow-xl relative overflow-hidden transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full" />

          <div className="border-b border-slate-100 dark:border-zinc-800 pb-5 mb-6">
            <span
              className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wide font-mono"
              dir="ltr"
            >
              CITY FORM ENGINE
            </span>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
              ثبت پیگیری و مشارکت جدید
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold">
              ثبت‌کننده:{' '}
              <span className="text-slate-800 dark:text-slate-200 font-extrabold">
                {currentUser.firstName} {currentUser.lastName}
              </span>{' '}
              | شماره تماس:{' '}
              <span
                className="text-slate-700 dark:text-slate-200 font-mono font-bold"
                dir="rtl"
              >
                {toPersianDigits(currentUser.phone)}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/20 border border-red-500/20 text-xs text-red-300">
                <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-sm text-emerald-300">
                <CheckmarkCircle01Icon className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  درخواست شما با موفقیت ثبت گردید و در اسرع وقت رسیدگی خواهد شد!
                </span>
              </div>
            )}

            {/* Request Type Selector (Theodorus Clarence Offset Style) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300">
                نوع گزارش خود را مشخص کنید
              </label>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <button
                  type="button"
                  onClick={() => setType('problem')}
                  className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2.5 font-bold text-sm transition-all duration-200 ${
                    type === 'problem'
                      ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                      : 'bg-zinc-950/60 border-zinc-800 text-slate-400 hover:text-slate-300 hover:border-zinc-700'
                  }`}
                >
                  <Alert01Icon className="w-4 h-4" />
                  <span>گزارش مشکل به شهرداری</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('idea')}
                  className={`py-3 px-4 rounded-xl border flex items-center justify-center gap-2.5 font-bold text-sm transition-all duration-200 ${
                    type === 'idea'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'bg-zinc-950/60 border-zinc-800 text-slate-400 hover:text-slate-300 hover:border-zinc-700'
                  }`}
                >
                  <Idea01Icon className="w-4 h-4" />
                  <span>ارائه ایده زیبا پویای شهری</span>
                </button>
              </div>
            </div>

            {/* Category and title Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5 animate-fade-in">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Tag01Icon className="w-3.5 h-3.5 text-cyan-400" />
                  موضوع درخواست <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: روکش نامناسب آسفالت کوچه پنجم"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors font-sans"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Comment01Icon className="w-3.5 h-3.5 text-cyan-400" />
                  دسته‌بندی مربوطه <span className="text-red-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors font-sans"
                >
                  {CATEGORIES.map((c, i) => (
                    <option key={i} value={c} className="bg-[#0f172a]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description Area */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <AlignRightIcon className="w-3.5 h-3.5 text-cyan-400" />
                توضیحات تکمیلی <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="لطفاً جزئیات دقیق مسئله یا ابعاد و پتانسیل‌های ایده ارسالی خود را با شهرداری در میان بگذارید..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none leading-relaxed font-sans"
              />
            </div>

            {/* Interactive Picker Map */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Location01Icon className="w-4 h-4 text-cyan-400 animate-pulse" />
                موقعیت جغرافیایی روی نقشه{' '}
                <span className="text-red-400">*</span>
              </label>

              <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative">
                <MapComponent
                  pickerMode={true}
                  selectedCoordinates={coords}
                  onCoordinatesChange={handleCoordsChange}
                  theme={theme}
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 font-mono py-1 px-1 bg-zinc-950/30 rounded border border-zinc-800/40">
                <span>
                  محدوده شهرداری شناسایی شده:{' '}
                  <strong className="text-cyan-300 font-sans">
                    {toPersianDigits(region || 'منطقه ۳ (پارس)')}
                  </strong>
                </span>
                <span dir="rtl" className="font-sans text-[11px]">
                  {toPersianDigits(coords.lat.toFixed(5))} ,{' '}
                  {toPersianDigits(coords.lng.toFixed(5))}
                </span>
              </div>
            </div>

            {/* Action Submit */}
            <div className="border-t border-zinc-800 pt-5 mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading || success}
                className="flex items-center gap-2 px-6 py-3 font-extrabold rounded-lg bg-cyan-500 text-zinc-950 hover:bg-cyan-400 transition-all duration-300 disabled:opacity-50 font-sans"
              >
                <SentIcon className="w-4 h-4 shrink-0" />
                <span>
                  {loading
                    ? 'در حال ثبت درخواست...'
                    : 'ارسال نهایی گزارش به شهرداری'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
