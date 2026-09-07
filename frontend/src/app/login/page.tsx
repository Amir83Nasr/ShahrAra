"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  KeyRound,
  MessageSquare,
} from "lucide-react";
import { useApp } from "../providers";
import { User } from "../../types";
import { toPersianDigits, toEnglishDigits } from "@/utils/numberUtils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Step = "phone" | "password" | "otp";

interface PhoneCheck {
  exists: boolean;
  hasPassword: boolean;
}

interface OtpInfo {
  devCode?: string | null;
  expiresInSeconds: number;
}

const FETCH_ERROR =
  "خطا در برقراری ارتباط با سرور. لطفا از روشن بودن سرور اطمینان حاصل کنید.";

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, authReady, loginSuccess } = useApp();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [check, setCheck] = useState<PhoneCheck | null>(null);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpInfo, setOtpInfo] = useState<OtpInfo | null>(null);

  // ثبت‌نام — فقط برای شماره‌های جدید
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nationalId, setNationalId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Already logged in → home
  useEffect(() => {
    if (authReady && currentUser) {
      router.replace("/");
    }
  }, [authReady, currentUser, router]);

  const isPhoneDirty = phone.length > 0;
  const isPhoneValid = /^09\d{9}$/.test(phone);
  const startsWith09 = phone.startsWith("09");

  const isNationalIdDirty = nationalId.length > 0;
  const isNationalIdValid = /^\d{10}$/.test(nationalId);
  const isNewUser = check !== null && !check.exists;

  const extractUser = (result: Record<string, unknown>): User => {
    const user = result.user as User;
    const tokenObj = result.token as Record<string, unknown> | undefined;
    const tokenStr =
      typeof tokenObj === "string"
        ? tokenObj
        : (tokenObj?.accessToken as string | undefined);
    if (tokenStr) user.token = tokenStr;
    return user;
  };

  const throwApiError = (
    res: Response,
    result: Record<string, unknown>,
  ): never => {
    // FastAPI 422 validation errors vs application errors with Persian detail
    if (res.status === 422 && Array.isArray(result.detail)) {
      throw new Error("اطلاعات وارد شده نامعتبر است. فیلدها را بررسی کنید.");
    }
    throw new Error(
      (result.detail as string) ||
        ((result.error as { message?: string })?.message ?? "") ||
        "خطایی در ورود رخ داد.",
    );
  };

  const requestOtp = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const result = await res.json().catch(() => {
        throw new Error(FETCH_ERROR);
      });
      if (!res.ok) throwApiError(res, result);
      setOtpInfo(result as OtpInfo);
      setCode("");
      setStep("otp");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "خطا در برقراری ارتباط با سرور.",
      );
    } finally {
      setLoading(false);
    }
  };

  // مرحله ۱: بررسی شماره
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isPhoneValid) {
      setError(
        "شماره موبایل وارد شده نامعتبر است. نمونه صحیح: " +
          toPersianDigits("09123456789"),
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const result = await res.json().catch(() => {
        throw new Error(FETCH_ERROR);
      });
      if (!res.ok) throwApiError(res, result);

      const phoneCheck = result as PhoneCheck;
      setCheck(phoneCheck);
      setNationalId("");

      if (phoneCheck.exists && phoneCheck.hasPassword) {
        setStep("password");
      } else {
        await requestOtp();
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "خطا در برقراری ارتباط با سرور.",
      );
    } finally {
      setLoading(false);
    }
  };

  // مرحله ۲الف: ورود با رمز
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/login/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const result = await res.json().catch(() => {
        throw new Error(FETCH_ERROR);
      });
      if (!res.ok) throwApiError(res, result);

      setSuccess("ورود با موفقیت انجام شد!");
      setTimeout(() => {
        loginSuccess(extractUser(result));
        router.replace("/");
      }, 800);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "خطا در برقراری ارتباط با سرور.",
      );
    } finally {
      setLoading(false);
    }
  };

  // مرحله ۲ب: تأیید کد یک‌بارمصرف
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (code.length !== 6) {
      setError("کد تأیید باید دقیقاً " + toPersianDigits("6") + " رقم باشد.");
      return;
    }

    if (isNewUser) {
      if (!firstName.trim() || !lastName.trim()) {
        setError("لطفا نام و نام خانوادگی خود را کامل وارد کنید.");
        return;
      }
      if (!isNationalIdValid) {
        setError(
          "کد ملی باید دقیقاً " + toPersianDigits("10") + " رقم عددی باشد.",
        );
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          code,
          firstName: isNewUser ? firstName.trim() : undefined,
          lastName: isNewUser ? lastName.trim() : undefined,
          nationalId: isNewUser ? nationalId : undefined,
        }),
      });
      const result = await res.json().catch(() => {
        throw new Error(FETCH_ERROR);
      });
      if (!res.ok) throwApiError(res, result);

      setSuccess("ورود با موفقیت انجام شد!");
      setTimeout(() => {
        loginSuccess(extractUser(result));
        router.replace("/");
      }, 800);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "خطا در برقراری ارتباط با سرور.",
      );
    } finally {
      setLoading(false);
    }
  };

  const backToPhone = () => {
    setStep("phone");
    setCheck(null);
    setPassword("");
    setCode("");
    setOtpInfo(null);
    setError(null);
    setSuccess(null);
  };

  const phoneHint = !isPhoneDirty ? null : isPhoneValid ? (
    <span className="border-status-resolved/10 bg-status-resolved/5 text-status-resolved flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10.5px] font-bold">
      ✓ شماره همراه معتبر و صحیح است
    </span>
  ) : !startsWith09 ? (
    <span className="border-destructive/10 bg-destructive/5 text-destructive rounded-md border px-2.5 py-1 text-[10.5px] font-bold">
      خطا: شماره همراه حتماً باید با ۰۹ آغاز شود
    </span>
  ) : (
    <span className="border-status-in-progress/10 bg-status-in-progress/5 text-status-in-progress rounded-md border px-2.5 py-1 text-[10.5px] font-bold">
      در حال تکمیل... ({toPersianDigits(phone.length)} از ۱۱ رقم وارد شده)
    </span>
  );

  const nationalIdHint = !isNationalIdDirty ? (
    <span className="bg-muted text-muted-foreground rounded-md px-2.5 py-1 text-[10.5px] font-bold">
      ۱۰ رقم عددی معتبر بدون خط تیره (مانند: {toPersianDigits("037000000")})
    </span>
  ) : isNationalIdValid ? (
    <span className="border-status-resolved/10 bg-status-resolved/5 text-status-resolved flex items-center gap-1 rounded-md border px-2.5 py-1 text-[10.5px] font-bold">
      ✓ کد ملی معتبر و صحیح است
    </span>
  ) : (
    <span className="border-destructive/10 bg-destructive/5 text-destructive rounded-md border px-2.5 py-1 text-[10.5px] font-bold">
      کد ملی ۱۰ رقمی ناقص است (در حال حاضر:{" "}
      {toPersianDigits(nationalId.length)} رقم)
    </span>
  );

  const stepDescription =
    step === "phone"
      ? "برای ورود، شماره همراه خود را وارد کنید."
      : step === "password"
        ? "رمز عبور حساب خود را وارد کنید یا با کد پیامکی وارد شوید."
        : isNewUser
          ? "برای تکمیل ثبت‌نام، اطلاعات خود را وارد و کد پیامک‌شده را تأیید کنید."
          : `کد تأیید ارسال‌شده به ${toPersianDigits(phone)} را وارد کنید.`;

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* ── فرم ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Button asChild variant="outline" size="sm">
            <Link href="/">
              <ArrowRight className="h-4 w-4" />
              بازگشت به صفحه اصلی
            </Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <FieldGroup className="gap-6">
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-extrabold">
                  {step === "otp" && isNewUser
                    ? "تکمیل ثبت‌نام"
                    : "ورود به شهرآرا"}
                </h1>
                <p className="text-sm text-balance text-muted-foreground">
                  {stepDescription}
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="text-xs">
                  <AlertCircle />
                  <AlertTitle>خطا</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-status-resolved/20 bg-status-resolved/10 text-status-resolved text-xs">
                  <CheckCircle />
                  <AlertTitle>موفق</AlertTitle>
                  <AlertDescription className="text-status-resolved/90">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* ── مرحله ۱: شماره همراه ────────────────────── */}
              {step === "phone" && (
                <form onSubmit={handlePhoneSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="phone">
                        شماره همراه <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        id="phone"
                        type="text"
                        required
                        maxLength={11}
                        value={toPersianDigits(phone)}
                        onChange={(e) => {
                          const rawVal = toEnglishDigits(e.target.value);
                          const numbersOnly = rawVal.replace(/\D/g, "");
                          setPhone(numbersOnly);
                        }}
                        dir="rtl"
                        autoComplete="tel"
                        className={cn(
                          !isPhoneDirty
                            ? ""
                            : isPhoneValid
                              ? "border-status-resolved ring-status-resolved/10 focus-visible:border-status-resolved focus-visible:ring-status-resolved/20 ring-2"
                              : "border-destructive ring-destructive/10 focus-visible:border-destructive focus-visible:ring-destructive/20 ring-2",
                        )}
                        aria-invalid={
                          isPhoneDirty && !isPhoneValid ? true : undefined
                        }
                      />
                      <FieldDescription>{phoneHint}</FieldDescription>
                    </Field>
                    <Field>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || !isPhoneValid}
                      >
                        {loading ? "در حال بررسی..." : "ادامه"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>
              )}

              {/* ── مرحله ۲الف: رمز عبور ────────────────────── */}
              {step === "password" && (
                <form onSubmit={handlePasswordSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="password">
                        رمز عبور <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        dir="ltr"
                        autoComplete="current-password"
                        className="bg-background"
                      />
                    </Field>
                    <Field>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? "در حال ورود به سامانه..." : "ورود"}
                      </Button>
                    </Field>
                    <FieldSeparator>یا</FieldSeparator>
                    <Field>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => requestOtp()}
                        disabled={loading}
                      >
                        <MessageSquare />
                        ورود با کد پیامکی
                      </Button>
                      <FieldDescription className="text-center">
                        <button
                          type="button"
                          onClick={backToPhone}
                          className="underline underline-offset-4"
                        >
                          تغییر شماره
                        </button>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </form>
              )}

              {/* ── مرحله ۲ب: کد یک‌بارمصرف ─────────────────── */}
              {step === "otp" && (
                <form onSubmit={handleOtpSubmit}>
                  <FieldGroup>
                    {otpInfo?.devCode && (
                      <Alert className="border-status-resolved/20 bg-status-resolved/10 text-status-resolved text-xs">
                        <KeyRound />
                        <AlertTitle>کد توسعه (حالت تست)</AlertTitle>
                        <AlertDescription className="text-status-resolved/90">
                          کد تأیید شما:{" "}
                          <span
                            className="font-mono text-base font-extrabold"
                            dir="ltr"
                          >
                            {toPersianDigits(otpInfo.devCode)}
                          </span>
                        </AlertDescription>
                      </Alert>
                    )}

                    {isNewUser && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <Field>
                            <FieldLabel htmlFor="firstName">
                              نام <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                              id="firstName"
                              type="text"
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder="مثال: علی"
                              dir="rtl"
                              autoComplete="given-name"
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="lastName">
                              نام خانوادگی{" "}
                              <span className="text-destructive">*</span>
                            </FieldLabel>
                            <Input
                              id="lastName"
                              type="text"
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder="مثال: رضایی"
                              dir="rtl"
                              autoComplete="family-name"
                            />
                          </Field>
                        </div>

                        <Field>
                          <FieldLabel htmlFor="nationalId">
                            کد ملی <span className="text-destructive">*</span>
                          </FieldLabel>
                          <Input
                            id="nationalId"
                            type="text"
                            required
                            maxLength={10}
                            value={toPersianDigits(nationalId)}
                            onChange={(e) => {
                              const rawVal = toEnglishDigits(e.target.value);
                              const numbersOnly = rawVal.replace(/\D/g, "");
                              setNationalId(numbersOnly);
                            }}
                            placeholder={toPersianDigits("037000000")}
                            dir="rtl"
                            autoComplete="off"
                            className={cn(
                              !isNationalIdDirty
                                ? ""
                                : isNationalIdValid
                                  ? "border-status-resolved ring-status-resolved/10 focus-visible:border-status-resolved focus-visible:ring-status-resolved/20 ring-2"
                                  : "border-destructive ring-destructive/10 focus-visible:border-destructive focus-visible:ring-destructive/20 ring-2",
                            )}
                            aria-invalid={
                              isNationalIdDirty && !isNationalIdValid
                                ? true
                                : undefined
                            }
                          />
                          <FieldDescription>{nationalIdHint}</FieldDescription>
                        </Field>
                      </>
                    )}

                    <Field className="items-center">
                      <FieldLabel htmlFor="otp-code">
                        کد تأیید <span className="text-destructive">*</span>
                      </FieldLabel>
                      {/* dir=ltr: ترتیب خانه‌ها و فیلد مخفی باید یکسان باشد وگرنه کد برعکس ذخیره می‌شود */}
                      <div dir="ltr">
                        <InputOTP
                          maxLength={6}
                          value={toPersianDigits(code)}
                          onChange={(v) =>
                            setCode(toEnglishDigits(v).replace(/\D/g, ""))
                          }
                        >
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <InputOTPSlot
                                key={i}
                                index={i}
                                className="h-11 w-10 text-lg"
                                renderChar={(ch) => toPersianDigits(ch)}
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <FieldDescription>
                        <span className="flex items-center gap-2 font-bold">
                          <span className="text-muted-foreground">
                            اعتبار کد:{" "}
                            {toPersianDigits(
                              Math.ceil(
                                (otpInfo?.expiresInSeconds ?? 300) / 60,
                              ),
                            )}{" "}
                            دقیقه
                          </span>
                          <button
                            type="button"
                            onClick={() => requestOtp()}
                            disabled={loading}
                            className="font-extrabold underline underline-offset-4 disabled:opacity-50"
                          >
                            ارسال مجدد کد
                          </button>
                        </span>
                      </FieldDescription>
                    </Field>

                    <Field>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loading || code.length !== 6}
                      >
                        {loading
                          ? "در حال بررسی کد..."
                          : isNewUser
                            ? "تأیید و تکمیل ثبت‌نام"
                            : "ورود"}
                      </Button>
                    </Field>
                    <FieldDescription className="text-center">
                      <button
                        type="button"
                        onClick={backToPhone}
                        className="underline underline-offset-4"
                      >
                        تغییر شماره
                      </button>
                    </FieldDescription>
                  </FieldGroup>
                </form>
              )}
            </FieldGroup>
          </div>
        </div>
      </div>

      {/* ── تصویر ────────────────────────────────────────── */}
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/assets/login.jpg"
          alt="نمای شهری"
          fill
          priority
          className="object-cover dark:opacity-80"
        />
      </div>
    </div>
  );
}
