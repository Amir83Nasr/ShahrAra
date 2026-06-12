/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cancel01Icon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
} from 'hugeicons-react';
import { User } from '../types';
import { toPersianDigits, toEnglishDigits } from '../utils/numberUtils';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [phone, setPhone] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isPhoneDirty = phone.length > 0;
  const isPhoneValid = /^09\d{9}$/.test(phone);
  const startsWith09 = phone.startsWith('09');

  const isNationalIdDirty = nationalId.length > 0;
  const isNationalIdValid = /^\d{10}$/.test(nationalId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!/^09\d{9}$/.test(phone)) {
      setError(
        'شماره موبایل وارد شده نامعتبر است. نمونه صحیح: ' +
          toPersianDigits('09123456789'),
      );
      return;
    }

    if (!/^\d{10}$/.test(nationalId)) {
      setError(
        'کد ملی باید دقیقاً ' + toPersianDigits('10') + ' رقم عددی باشد.',
      );
      return;
    }

    if (isSignUp && (!firstName.trim() || !lastName.trim())) {
      setError('لطفا نام و نام خانوادگی خود را کامل وارد کنید.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          nationalId,
          firstName: isSignUp ? firstName.trim() : undefined,
          lastName: isSignUp ? lastName.trim() : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'خطایی در ورود/ثبت‌نام رخ داد.');
      }

      setSuccess('ورود با موفقیت انجام شد!');
      setTimeout(() => {
        onLoginSuccess(result.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'خطا در برقراری ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative animate-fade-in text-right transition-colors"
        id="auth_modal_container"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-[#0b0f19]">
          <h3 className="text-lg font-black text-slate-800 dark:text-cyan-200">
            {isSignUp
              ? 'ثبت‌نام شهروند جدید شهرآرا'
              : 'ورود شهروندان به شهرآرا'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Cancel01Icon className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Secret Hint Box */}
        <div className="mx-5 mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex gap-2 items-start">
            <InformationCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold pb-0.5 text-amber-900 dark:text-amber-300">
                راهنمای بررسی پنل مدیریت شهرداری (ادمین):
              </p>
              <p className="mt-1 font-bold text-[11px] leading-relaxed">
                برای ورود به عنوان مسئول شهری، از شماره همراه{' '}
                <span className="font-mono bg-amber-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-400 font-bold">
                  {toPersianDigits('09120000000')}
                </span>{' '}
                و کد ملی{' '}
                <span className="font-mono bg-amber-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded text-amber-800 dark:text-amber-400 font-bold">
                  {toPersianDigits('1234567890')}
                </span>{' '}
                استفاده فرمایید.
              </p>
            </div>
          </div>
        </div>

        {/* Content / Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/20 border border-red-500/20 text-xs text-red-300">
              <AlertCircleIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300">
              <CheckmarkCircle01Icon className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Double Name Fields if Sign Up */}
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                  نام <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثال: علی"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-cyan-500 font-sans transition-colors font-bold"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                  نام خانوادگی <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="مثال: رضایی"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-white focus:outline-none focus:border-cyan-500 font-sans transition-colors font-bold"
                />
              </div>
            </div>
          )}

          {/* Phone Field */}
          <div className="flex flex-col gap-1.5 align-right">
            <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              شماره همراه <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={11}
              value={toPersianDigits(phone)}
              onChange={(e) => {
                const rawVal = toEnglishDigits(e.target.value);
                const numbersOnly = rawVal.replace(/\D/g, '');
                setPhone(numbersOnly);
              }}
              placeholder={toPersianDigits('09123456789')}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border rounded-lg text-slate-800 dark:text-white focus:outline-none font-sans text-right transition-colors font-bold ${
                !isPhoneDirty
                  ? 'border-slate-200 dark:border-zinc-800 focus:border-cyan-500'
                  : isPhoneValid
                    ? 'border-emerald-500 focus:border-emerald-500 ring-2 ring-emerald-500/10'
                    : 'border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/10'
              }`}
              dir="rtl"
            />
            <div className="mt-1 text-right flex flex-col gap-0.5">
              {!isPhoneDirty ? (
                <span className="text-[10.5px] text-slate-400 font-bold dark:text-slate-500 bg-slate-50 dark:bg-zinc-950/20 px-2.5 py-1 rounded-md">
                  طول ۱۱ رقم با شروع از ۰۹ (مانند:{' '}
                  {toPersianDigits('09123456789')})
                </span>
              ) : isPhoneValid ? (
                <span className="text-[10.5px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-500/10 px-2.5 py-1 rounded-md">
                  ✓ شماره همراه معتبر و صحیح است
                </span>
              ) : !startsWith09 ? (
                <span className="text-[10.5px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/15 border border-rose-500/10 px-2.5 py-1 rounded-md">
                  خطا: شماره همراه حتماً باید با ۰۹ آغاز شود
                </span>
              ) : (
                <span className="text-[10.5px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/10 border border-amber-500/10 px-2.5 py-1 rounded-md">
                  در حال تکمیل... ({toPersianDigits(phone.length)} از ۱۱ رقم
                  وارد شده)
                </span>
              )}
            </div>
          </div>

          {/* National ID Field */}
          <div className="flex flex-col gap-1.5 font-sans">
            <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              کد ملی <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={toPersianDigits(nationalId)}
              onChange={(e) => {
                const rawVal = toEnglishDigits(e.target.value);
                const numbersOnly = rawVal.replace(/\D/g, '');
                setNationalId(numbersOnly);
              }}
              placeholder={toPersianDigits('0012345678')}
              className={`w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-zinc-950 border rounded-lg text-slate-800 dark:text-white focus:outline-none font-sans text-right transition-colors font-bold ${
                !isNationalIdDirty
                  ? 'border-slate-200 dark:border-zinc-800 focus:border-cyan-500'
                  : isNationalIdValid
                    ? 'border-emerald-500 focus:border-emerald-500 ring-2 ring-emerald-500/10'
                    : 'border-rose-500 focus:border-rose-500 ring-2 ring-rose-500/10'
              }`}
              dir="rtl"
            />
            <div className="mt-1 text-right flex flex-col gap-0.5">
              {!isNationalIdDirty ? (
                <span className="text-[10.5px] text-slate-400 font-bold dark:text-slate-500 bg-slate-50 dark:bg-zinc-950/20 px-2.5 py-1 rounded-md">
                  ۱۰ رقم عددی معتبر بدون خط تیره (مانند:{' '}
                  {toPersianDigits('0012345678')})
                </span>
              ) : isNationalIdValid ? (
                <span className="text-[10.5px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-500/10 px-2.5 py-1 rounded-md">
                  ✓ کد ملی معتبر و صحیح است
                </span>
              ) : (
                <span className="text-[10.5px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/15 border border-rose-500/10 px-2.5 py-1 rounded-md">
                  کد ملی ۱۰ رقمی ناقص است (در حال حاضر:{' '}
                  {toPersianDigits(nationalId.length)} رقم)
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-400 text-zinc-950 font-black rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.2)] cursor-pointer"
          >
            {loading
              ? 'در حال ورود به سامانه...'
              : isSignUp
                ? 'ثبت‌نام و ورود'
                : 'ورود مستقیم'}
          </button>

          {/* Toggle */}
          <div className="text-center mt-3 text-xs text-slate-500 dark:text-slate-400 font-bold">
            {isSignUp ? (
              <p>
                قبلاً ثبت‌نام کرده‌اید؟{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-cyan-600 dark:text-cyan-400 font-black hover:underline cursor-pointer"
                >
                  ورود به حساب
                </button>
              </p>
            ) : (
              <p>
                شهروند جدید هستید؟{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-cyan-600 dark:text-cyan-400 font-black hover:underline cursor-pointer"
                >
                  ایجاد حساب جدید (ثبت‌نام)
                </button>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
