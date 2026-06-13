import React, { useState } from 'react';
import { User, RequestType } from '../types';
import MapComponent from './MapComponent';
import {
  AlertTriangle,
  Lightbulb,
  MapPin,
  Send,
  MessageSquare,
  Tag,
  AlignRight,
  CheckCircle,
  AlertCircleIcon,
} from 'lucide-react';
import { toPersianDigits } from '../utils/numberUtils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 34.6410,
    lng: 50.8800,
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
          region: region || 'منطقه ۲ (مرکز قم)',
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
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'خطا در برقراری ارتباط با سرور.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-md transition-colors md:p-12">
          <div className="text-primary mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 shadow-sm">
            <MapPin className="h-8 w-8" />
          </div>
          <h2 className="mb-3 text-2xl font-black text-foreground">
            ثبت گزارش مشکل یا ایده شهری
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed font-medium text-muted-foreground">
            برای مشارکت در زیباتر کردن شهرمان و گزارش مسائل معابر، فضای سبز،
            روشنایی یا دیگر خدمات شهری، ابتدا باید وارد حساب کاربری خود شوید تا
            درخواستتان مستقیماً به دست مسئولان مربوطه برسد.
          </p>
          <Button onClick={onOpenAuth} size="lg">
            ورود / ثبت‌نام شهروندان
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Helper Instructions Column */}
        <div className="order-last flex flex-col gap-6 lg:order-first lg:col-span-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors">
            <h3 className="text-primary mb-3.5 flex items-center gap-2 border-b border-border pb-2.5 text-sm font-black">
              <Lightbulb className="h-4 w-4 text-primary" />
              تفاوت گزارش مشکل و ایده چیست؟
            </h3>

            <div className="space-y-4">
              <div className="hover:border-primary/20 rounded-lg border border-primary/10 bg-primary/5 p-3.5 transition-all">
                <span className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  گزارش مشکلات شهری
                </span>
                <p className="lines-relaxed mt-1 text-[11.5px] leading-relaxed font-normal text-muted-foreground">
                  مسائلی که نیاز به تعمیر فوری شهرداری دارند؛ مانند نارسایی
                  آسفالت، خاموشی چراغ خیابان‌ها، تجمیع زباله، خرابی سطل‌ها و سد
                  معبر.
                </p>
              </div>

              <div className="hover:border-primary/20 rounded-lg border border-primary/10 bg-primary/5 p-3.5 transition-all">
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Lightbulb className="h-3.5 w-3.5" />
                  ارسال ایده‌های نوآورانه
                </span>
                <p className="lines-relaxed mt-1 text-[11.5px] leading-relaxed font-normal text-muted-foreground">
                  پیشنهادها و طرح‌های خلاقانه‌ای که هوشمندسازی و زیبایی بصری
                  شهرآرا را ارتقا می‌دهد؛ مانند دیوار سبز، سطل‌های پلاستیکی
                  هوشمند، بهبود مبلمان شهری و مناسب‌سازی عبور توان‌یابان.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted p-5 transition-all">
            <span
              className="mb-2 block font-mono text-xs tracking-wider text-muted-foreground uppercase"
            >
              مرحله ۲: انتخاب موقعیت
            </span>
            <h4 className="text-xs font-semibold text-foreground">
              چگونه لوکیشن دقیق را انتخاب کنیم؟
            </h4>
            <p className="mt-2.5 text-[11px] leading-relaxed font-normal text-muted-foreground">
              با استفاده از نقشه روبرو، دکمه نشانگر را به سمت محل دقیق عارضه یا
              اجرای ایده جابجا کنید. پس از رها کردن پین، منطقه شهرداری مربوطه به
              صورت کاملاً خودکار مشخص خواهد شد.
            </p>
          </div>
        </div>

        {/* Form Container Column */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-md transition-all md:p-8 lg:col-span-8">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-primary/5 blur-3xl" />

          <div className="mb-6 border-b border-border pb-5">
            <span
              className="text-primary font-mono text-xs font-semibold tracking-wide uppercase"
            >
              سامانه مشارکت شهری
            </span>
            <h2 className="mt-1 text-2xl font-bold text-foreground">
              ثبت پیگیری و مشارکت جدید
            </h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              ثبت‌کننده:{' '}
              <span className="font-semibold text-foreground">
                {currentUser.firstName} {currentUser.lastName}
              </span>{' '}
              | شماره تماس:{' '}
              <span
                className="font-mono font-semibold text-foreground"
                dir="rtl"
              >
                {toPersianDigits(currentUser.phone)}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-950/20 p-3 text-xs text-red-300">
                <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/20 p-3.5 text-sm text-emerald-300">
                <CheckCircle className="h-5 w-5 shrink-0 text-emerald-400" />
                <span>
                  درخواست شما با موفقیت ثبت گردید و در اسرع وقت رسیدگی خواهد شد!
                </span>
              </div>
            )}

            {/* Request Type Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground">
                نوع گزارش خود را مشخص کنید
              </label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as RequestType)}
                className="mt-1 grid grid-cols-2 gap-4"
              >
                <label
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200',
                    type === 'problem'
                      ? 'border-destructive/50 bg-destructive/10 text-destructive shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                      : 'border-border text-muted-foreground hover:border-muted-foreground',
                  )}
                >
                  <RadioGroupItem value="problem" className="sr-only" />
                  <AlertTriangle className="h-4 w-4" />
                  <span>گزارش مشکل به شهرداری</span>
                </label>
                <label
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-semibold transition-all duration-200',
                    type === 'idea'
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                      : 'border-border text-muted-foreground hover:border-muted-foreground',
                  )}
                >
                  <RadioGroupItem value="idea" className="sr-only" />
                  <Lightbulb className="h-4 w-4" />
                  <span>ارائه ایده زیبا پویای شهری</span>
                </label>
              </RadioGroup>
            </div>

            {/* Category and title Row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                  موضوع درخواست <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  placeholder="مثال: روکش نامناسب آسفالت کوچه پنجم"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                  دسته‌بندی مربوطه <span className="text-destructive">*</span>
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c, i) => (
                      <SelectItem key={i} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description Area */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <AlignRight className="h-3.5 w-3.5 text-primary" />
                توضیحات تکمیلی <span className="text-destructive">*</span>
              </label>
              <Textarea
                required
                rows={4}
                placeholder="لطفاً جزئیات دقیق مسئله یا ابعاد و پتانسیل‌های ایده ارسالی خود را با شهرداری در میان بگذارید..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Interactive Picker Map */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                موقعیت جغرافیایی روی نقشه{' '}
                <span className="text-destructive">*</span>
              </label>

              <div className="relative h-[300px] w-full overflow-hidden rounded-xl border border-border bg-card">
                <MapComponent
                  pickerMode={true}
                  selectedCoordinates={coords}
                  onCoordinatesChange={handleCoordsChange}
                  theme={theme}
                />
              </div>

              <div className="flex items-center justify-between rounded border border-border bg-muted/50 px-1 py-1 font-mono text-xs text-muted-foreground">
                <span>
                  محدوده شهرداری شناسایی شده:{' '}
                  <strong className="font-sans text-primary">
                    {toPersianDigits(region || 'منطقه ۲ (مرکز قم)')}
                  </strong>
                </span>
                <span dir="rtl" className="font-sans text-[11px]">
                  {toPersianDigits(coords.lat.toFixed(5))} ,{' '}
                  {toPersianDigits(coords.lng.toFixed(5))}
                </span>
              </div>
            </div>

            {/* Action Submit */}
            <div className="mt-4 flex justify-end border-t border-border pt-5">
              <Button type="submit" disabled={loading || success} size="lg">
                <Send className="h-4 w-4 shrink-0" />
                <span>
                  {loading
                    ? 'در حال ثبت درخواست...'
                    : 'ارسال نهایی گزارش به شهرداری'}
                </span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
