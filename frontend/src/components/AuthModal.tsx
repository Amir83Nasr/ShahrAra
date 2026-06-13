/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { User } from '../types';
import { toPersianDigits, toEnglishDigits } from '../utils/numberUtils';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({
  open,
  onClose,
  onLoginSuccess,
}: AuthModalProps) {
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
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          nationalId,
          firstName: isSignUp ? firstName.trim() : undefined,
          lastName: isSignUp ? lastName.trim() : undefined,
        }),
      });

      let result: Record<string, unknown>;
      try {
        result = await response.json();
      } catch {
        throw new Error(
          'خطا در برقراری ارتباط با سرور. لطفا از روشن بودن سرور اطمینان حاصل کنید.',
        );
      }

      if (!response.ok) {
        throw new Error(
          (result.detail as string) || 'خطایی در ورود/ثبت‌نام رخ داد.',
        );
      }

      setSuccess('ورود با موفقیت انجام شد!');
      setTimeout(() => {
        onLoginSuccess(result.user as User);
        onClose();
      }, 1000);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'خطا در برقراری ارتباط با سرور.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md gap-0 p-0" showCloseButton={false}>
        <DialogHeader className="bg-muted/30 flex flex-row items-center justify-between p-5">
          <DialogTitle className="text-foreground text-lg font-extrabold">
            {isSignUp
              ? 'ثبت‌نام شهروند جدید شهرآرا'
              : 'ورود شهروندان به شهرآرا'}
          </DialogTitle>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <XIcon />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 pt-6">
          {error && (
            <div className="border-destructive/20 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-lg border p-3 text-xs">
              <AlertCircle className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="border-status-resolved/20 bg-status-resolved/10 text-status-resolved flex items-center gap-2 rounded-lg border p-3 text-xs">
              <CheckCircle className="text-status-resolved h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-foreground text-xs font-extrabold">
                  نام <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثال: علی"
                  dir="rtl"
                  autoComplete="given-name"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-foreground text-xs font-extrabold">
                  نام خانوادگی <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="مثال: رضایی"
                  dir="rtl"
                  autoComplete="family-name"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-xs font-extrabold">
              شماره همراه <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              required
              maxLength={11}
              value={toPersianDigits(phone)}
              onChange={(e) => {
                const rawVal = toEnglishDigits(e.target.value);
                const numbersOnly = rawVal.replace(/\D/g, '');
                setPhone(numbersOnly);
                setNationalId('');
              }}
              placeholder={toPersianDigits('09123456789')}
              dir="rtl"
              autoComplete="tel"
              className={cn(
                !isPhoneDirty
                  ? ''
                  : isPhoneValid
                    ? 'border-status-resolved ring-status-resolved/10 focus-visible:border-status-resolved focus-visible:ring-status-resolved/20 ring-2'
                    : 'border-destructive ring-destructive/10 focus-visible:border-destructive focus-visible:ring-destructive/20 ring-2',
              )}
              aria-invalid={isPhoneDirty && !isPhoneValid ? true : undefined}
            />
            <div className="flex flex-col gap-0.5 text-right">
              {!isPhoneDirty ? (
                <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[10.5px] font-bold">
                  طول ۱۱ رقم با شروع از ۰۹ (مانند:{' '}
                  {toPersianDigits('09123456789')})
                </span>
              ) : isPhoneValid ? (
                <span className="border-status-resolved/10 bg-status-resolved/5 text-status-resolved flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10.5px] font-bold">
                  ✓ شماره همراه معتبر و صحیح است
                </span>
              ) : !startsWith09 ? (
                <span className="border-destructive/10 bg-destructive/5 text-destructive rounded-md border px-2.5 py-1 text-[10.5px] font-bold">
                  خطا: شماره همراه حتماً باید با ۰۹ آغاز شود
                </span>
              ) : (
                <span className="border-status-in-progress/10 bg-status-in-progress/5 text-status-in-progress rounded-md border px-2.5 py-1 text-[10.5px] font-bold">
                  در حال تکمیل... ({toPersianDigits(phone.length)} از ۱۱ رقم
                  وارد شده)
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-foreground text-xs font-extrabold">
              کد ملی <span className="text-destructive">*</span>
            </label>
            <Input
              type="text"
              required
              maxLength={10}
              value={toPersianDigits(nationalId)}
              onChange={(e) => {
                const rawVal = toEnglishDigits(e.target.value);
                const numbersOnly = rawVal.replace(/\D/g, '');
                setNationalId(numbersOnly);
              }}
              placeholder={toPersianDigits('037000000')}
              dir="rtl"
              autoComplete="off"
              className={cn(
                !isNationalIdDirty
                  ? ''
                  : isNationalIdValid
                    ? 'border-status-resolved ring-status-resolved/10 focus-visible:border-status-resolved focus-visible:ring-status-resolved/20 ring-2'
                    : 'border-destructive ring-destructive/10 focus-visible:border-destructive focus-visible:ring-destructive/20 ring-2',
              )}
              aria-invalid={
                isNationalIdDirty && !isNationalIdValid ? true : undefined
              }
            />
            <div className="flex flex-col gap-0.5 text-right">
              {!isNationalIdDirty ? (
                <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[10.5px] font-bold">
                  ۱۰ رقم عددی معتبر بدون خط تیره (مانند:{' '}
                  {toPersianDigits('037000000')})
                </span>
              ) : isNationalIdValid ? (
                <span className="border-status-resolved/10 bg-status-resolved/5 text-status-resolved flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10.5px] font-bold">
                  ✓ کد ملی معتبر و صحیح است
                </span>
              ) : (
                <span className="border-destructive/10 bg-destructive/5 text-destructive rounded-md border px-2.5 py-1 text-[10.5px] font-bold">
                  کد ملی ۱۰ رقمی ناقص است (در حال حاضر:{' '}
                  {toPersianDigits(nationalId.length)} رقم)
                </span>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading}>
            {loading
              ? 'در حال ورود به سامانه...'
              : isSignUp
                ? 'ثبت‌نام و ورود'
                : 'ورود مستقیم'}
          </Button>

          <div className="text-muted-foreground mt-1 text-center text-xs font-bold">
            {isSignUp ? (
              <p>
                قبلاً ثبت‌نام کرده‌اید؟{' '}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsSignUp(false)}
                  className="font-extrabold"
                >
                  ورود به حساب
                </Button>
              </p>
            ) : (
              <p>
                شهروند جدید هستید؟{' '}
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsSignUp(true)}
                  className="font-extrabold"
                >
                  ایجاد حساب جدید (ثبت‌نام)
                </Button>
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
