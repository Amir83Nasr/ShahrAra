"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  MessageSquare,
} from "lucide-react";
import { useApp } from "../providers";
import { ModeToggle } from "@/components/mode-toggle";
import { BrandMark } from "@/components/BrandMark";
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

type HintState = "idle" | "pending" | "valid" | "invalid";

/**
 * راهنمای زیر هر ورودی: در حال تکمیل با رنگ خنثی، فقط خطای واقعی قرمز
 * و مقدار صحیح سبز نمایش داده می‌شود (بدون قالب‌بندی شلوغ قبلی).
 */
function ValidationHint({
  state,
  children,
}: {
  state: HintState;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "flex items-start gap-1.5 text-xs leading-5 transition-colors",
        state === "valid" && "text-status-resolved font-medium",
        state === "invalid" && "text-destructive font-medium",
        state === "pending" && "text-muted-foreground",
        state === "idle" && "text-muted-foreground/80",
      )}
    >
      {state === "valid" ? (
        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
      ) : state === "invalid" ? (
        <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
      ) : (
        <span
          aria-hidden
          className="mt-2 size-1 shrink-0 rounded-full bg-current opacity-40"
        />
      )}
      <span className="text-balance">{children}</span>
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { currentUser, authReady, loginSuccess, theme, setTheme } = useApp();

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
  // فقط بعد از تلاش برای «ادامه» راهنمای شماره را نشان می‌دهیم.
  const [phoneSubmitAttempted, setPhoneSubmitAttempted] = useState(false);

  // شمارش معکوس اعتبار کد یک‌بارمصرف (ثانیه)
  const [remaining, setRemaining] = useState(0);
  const expiryRef = useRef<number | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  // حالت فشرده (کیبورد باز): لوگو حذف و فاصله‌ها کمتر می‌شود تا فرم در فضای
  // باقی‌مانده جا شود.
  const [compact, setCompact] = useState(false);

  // روی موبایل ارتفاع صفحه را به ارتفاع واقعی ناحیهٔ دید (visual viewport) گره
  // می‌زنیم؛ با باز شدن کیبورد، محتوا در همان فضای قابل‌دیدن وسط می‌ماند و
  // فضای خالی بزرگ پایین صفحه ایجاد نمی‌شود.
  useEffect(() => {
    const el = pageRef.current;
    const vv = window.visualViewport;
    if (!el || !vv) return;

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const sync = () => {
      // در حالت زوم، ارتفاع visual viewport کوچک‌تر می‌شود و نباید اعمال شود.
      if (!mobileQuery.matches || vv.scale > 1.01) {
        el.style.removeProperty("--login-vh");
        setCompact(false);
        return;
      }
      el.style.setProperty("--login-vh", `${Math.round(vv.height)}px`);
      // اگر مرورگر پس از باز شدن کیبورد صفحه را جابه‌جا کرده باشد، به بالا
      // برمی‌گردیم تا فضای خالی زیر فرم دیده نشود.
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      // تفاوت محسوس با ارتفاع کامل پنجره یعنی کیبورد باز است.
      setCompact(vv.height < window.innerHeight - 150);
    };

    sync();
    vv.addEventListener("resize", sync);
    mobileQuery.addEventListener("change", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      mobileQuery.removeEventListener("change", sync);
      el.style.removeProperty("--login-vh");
    };
  }, []);

  // تایمر شمارش معکوس
  useEffect(() => {
    if (step !== "otp" || expiryRef.current === null) return;
    const timer = setInterval(() => {
      const left = Math.max(
        0,
        Math.ceil((expiryRef.current! - Date.now()) / 1000),
      );
      setRemaining(left);
      if (left <= 0) clearInterval(timer);
    }, 500);
    return () => clearInterval(timer);
  }, [step]);

  // Already logged in → home
  useEffect(() => {
    if (authReady && currentUser) {
      router.replace("/");
    }
  }, [authReady, currentUser, router]);

  const isPhoneValid = /^09\d{9}$/.test(phone);
  // پیشوند اشتباه را فقط بعد از کامل‌شدن «۰۹» خطا می‌دانیم، نه وسط تایپ.
  const phoneHasWrongPrefix = phone.length >= 2 && !phone.startsWith("09");

  const phoneErrorMessage = !phone
    ? "لطفا شماره همراه خود را وارد کنید."
    : phoneHasWrongPrefix
      ? `شماره همراه باید با ${toPersianDigits("09")} شروع شود.`
      : `شماره همراه باید ${toPersianDigits("11")} رقم باشد.`;

  const isNationalIdDirty = nationalId.length > 0;
  const isNationalIdValid = /^\d{10}$/.test(nationalId);
  const nationalIdState: HintState = !isNationalIdDirty
    ? "idle"
    : isNationalIdValid
      ? "valid"
      : "pending";
  const nationalIdRemaining = Math.max(0, 10 - nationalId.length);

  const fieldToneClass = (state: HintState) =>
    state === "valid"
      ? "border-status-resolved ring-status-resolved/10 focus-visible:border-status-resolved focus-visible:ring-status-resolved/20 ring-2"
      : state === "invalid"
        ? "border-destructive ring-destructive/10 focus-visible:border-destructive focus-visible:ring-destructive/20 ring-2"
        : "";

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
      const info = result as OtpInfo;
      setOtpInfo(info);
      // راه‌اندازی تایمر
      expiryRef.current = Date.now() + info.expiresInSeconds * 1000;
      setRemaining(info.expiresInSeconds);
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

    if (!isPhoneValid) {
      // بدون پیام لحظه‌ای؛ فقط پس از زدن «ادامه» راهنمای اصلاح را نشان بده.
      setPhoneSubmitAttempted(true);
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

      loginSuccess(extractUser(result));
      router.replace("/");
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

    if (code.length !== 6) {
      setError("کد تأیید باید دقیقاً " + toPersianDigits("6") + " رقم باشد.");
      return;
    }

    if (remaining <= 0) {
      setError("کد تأیید منقضی شده است. لطفا کد جدید درخواست کنید.");
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

      loginSuccess(extractUser(result));
      router.replace("/");
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
    setPhoneSubmitAttempted(false);
  };

  // راهنمای شماره فقط بعد از زدن «ادامه» نمایش داده می‌شود؛ هنگام تایپ
  // هیچ متن لحظه‌ای نشان نمی‌دهیم تا کاربر شماره را با آرامش وارد کند.
  const phoneHint =
    phoneSubmitAttempted && !isPhoneValid ? (
      <ValidationHint state="invalid">{phoneErrorMessage}</ValidationHint>
    ) : null;
  const phoneState: HintState = phoneHint ? "invalid" : "idle";

  const nationalIdHint = (
    <ValidationHint state={nationalIdState}>
      {nationalIdState === "valid"
        ? "کد ملی معتبر است"
        : nationalIdState === "pending"
          ? `${toPersianDigits(nationalIdRemaining)} رقم دیگر وارد کنید`
          : `${toPersianDigits("10")} رقم عددی بدون خط تیره`}
    </ValidationHint>
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
    <div
      ref={pageRef}
      className="grid h-[calc(var(--login-vh,100svh)-env(safe-area-inset-top))] md:h-auto md:min-h-svh md:grid-cols-2"
    >
      {/* ── فرم ──────────────────────────────────────────── */}
      <div className="relative flex min-h-0 flex-col px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-10">
        <div className="absolute end-4 top-4 z-10">
          <ModeToggle theme={theme} onThemeChange={setTheme} />
        </div>

        <div className="flex min-h-0 flex-1 overflow-y-auto">
          <div className="m-auto w-full max-w-xs py-4 md:py-6">
            <FieldGroup className={cn("gap-5 md:gap-6", compact && "gap-4")}>
              <div className="flex flex-col items-center gap-1 text-center">
                {!compact && <BrandMark className="mb-3 size-12 text-xl" />}
                <h1
                  className={cn(
                    "text-2xl font-extrabold",
                    compact && "text-xl",
                  )}
                >
                  {step === "otp" && isNewUser
                    ? "تکمیل ثبت‌نام"
                    : "ورود به شهرآرا"}
                </h1>
                <p className="text-muted-foreground text-sm text-balance">
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

              {/* ── مرحله ۱: شماره همراه ────────────────────── */}
              {step === "phone" && (
                <form onSubmit={handlePhoneSubmit}>
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="phone">شماره همراه</FieldLabel>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        enterKeyHint="next"
                        maxLength={11}
                        value={toPersianDigits(phone)}
                        onChange={(e) => {
                          const rawVal = toEnglishDigits(e.target.value);
                          const numbersOnly = rawVal.replace(/\D/g, "");
                          setPhone(numbersOnly.slice(0, 11));
                          // با شروع دوبارهٔ تایپ، راهنما پنهان می‌شود.
                          setPhoneSubmitAttempted(false);
                        }}
                        dir="rtl"
                        autoComplete="tel"
                        className={cn(fieldToneClass(phoneState))}
                        aria-invalid={
                          phoneState === "invalid" ? true : undefined
                        }
                      />
                      <FieldDescription>{phoneHint}</FieldDescription>
                    </Field>
                    <Field>
                      <Button
                        type="submit"
                        className="h-12 w-full"
                        disabled={loading}
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
                      <FieldLabel htmlFor="password">رمز عبور</FieldLabel>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        dir="ltr"
                        autoComplete="current-password"
                      />
                    </Field>
                    <Field>
                      <Button
                        type="submit"
                        className="h-12 w-full"
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
                        className="h-12 w-full"
                        onClick={() => requestOtp()}
                        disabled={loading}
                      >
                        <MessageSquare />
                        ورود با کد پیامکی
                      </Button>
                      <FieldDescription className="pt-2 text-center">
                        <Button
                          type="button"
                          variant="link"
                          onClick={backToPhone}
                        >
                          تغییر شماره
                        </Button>
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

                    {/* ── بخش مستقل کد تأیید ───────────────────── */}
                    <section className="bg-muted/30 mb-2 rounded-2xl border p-4">
                      <Field className="items-center">
                        <FieldLabel htmlFor="otp-code">کد تأیید</FieldLabel>
                        {/* dir=ltr: ترتیب خانه‌ها و فیلد مخفی باید یکسان باشد وگرنه کد برعکس ذخیره می‌شود */}
                        <div dir="ltr" className="flex w-full justify-center">
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
                                  className="h-12 w-11 text-lg"
                                  renderChar={(ch) => toPersianDigits(ch)}
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </Field>
                      <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-bold">
                            اعتبار کد:
                          </span>
                          <span className="font-mono font-bold tabular-nums">
                            {toPersianDigits(remaining)} ثانیه
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="link"
                          onClick={() => requestOtp()}
                          disabled={loading || remaining > 0}
                        >
                          ارسال مجدد کد
                        </Button>
                      </div>
                    </section>

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
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            maxLength={10}
                            value={toPersianDigits(nationalId)}
                            onChange={(e) => {
                              const rawVal = toEnglishDigits(e.target.value);
                              const numbersOnly = rawVal.replace(/\D/g, "");
                              setNationalId(numbersOnly.slice(0, 10));
                            }}
                            placeholder={toPersianDigits("0370000000")}
                            dir="rtl"
                            autoComplete="off"
                            className={cn(fieldToneClass(nationalIdState))}
                          />
                          <FieldDescription>{nationalIdHint}</FieldDescription>
                        </Field>
                      </>
                    )}

                    <Field>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={
                          loading || code.length !== 6 || remaining <= 0
                        }
                      >
                        {loading
                          ? "در حال بررسی کد..."
                          : isNewUser
                            ? "تأیید و تکمیل ثبت‌نام"
                            : "ورود"}
                      </Button>
                      <FieldDescription className="pt-2 text-center">
                        <Button
                          type="button"
                          variant="link"
                          onClick={backToPhone}
                        >
                          تغییر شماره
                        </Button>
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </form>
              )}
            </FieldGroup>
          </div>
        </div>
      </div>

      {/* ── تصویر ────────────────────────────────────────── */}
      <div className="relative hidden p-2 md:order-first md:block xl:p-4">
        <div className="bg-muted relative h-full w-full overflow-hidden rounded-3xl">
          <Image
            src="/assets/login-3in4.jpg"
            alt="ماکت شهر و تیم شهرسازی"
            fill
            sizes="50vw"
            priority
            className="object-cover dark:opacity-80"
          />
        </div>
      </div>
    </div>
  );
}
