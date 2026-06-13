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
    lat: 34.641,
    lng: 50.88,
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
      const response = await fetch('/api/v1/requests', {
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
        <div className="border-border bg-card flex min-h-[400px] flex-col items-center justify-center rounded-2xl border p-8 transition-colors md:p-12">
          <div className="text-primary border-primary/20 bg-primary/10 mb-6 flex h-16 w-16 items-center justify-center rounded-full border">
            <MapPin className="h-8 w-8" />
          </div>
          <h2 className="text-foreground mb-3 text-2xl font-extrabold">
            ثبت گزارش مشکل یا ایده شهری
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-md text-sm leading-relaxed font-medium">
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
        <div className="form-helper form-section order-last flex flex-col gap-6 lg:order-first lg:col-span-4">
          <div className="border-border bg-card rounded-xl border p-5 transition-colors">
            <h3 className="text-primary border-border mb-3.5 flex items-center gap-2 border-b pb-2.5 text-sm font-extrabold">
              <Lightbulb className="text-primary h-4 w-4" />
              تفاوت گزارش مشکل و ایده چیست؟
            </h3>

            <div className="space-y-4">
              <div className="hover:border-primary/20 border-primary/10 bg-primary/5 rounded-lg border p-3.5 transition-all">
                <span className="text-destructive flex items-center gap-1.5 text-xs font-medium">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  گزارش مشکلات شهری
                </span>
                <p className="lines-relaxed text-muted-foreground mt-1 text-[11.5px] leading-relaxed font-normal">
                  مسائلی که نیاز به تعمیر فوری شهرداری دارند؛ مانند نارسایی
                  آسفالت، خاموشی چراغ خیابان‌ها، تجمیع زباله، خرابی سطل‌ها و سد
                  معبر.
                </p>
              </div>

              <div className="hover:border-primary/20 border-primary/10 bg-primary/5 rounded-lg border p-3.5 transition-all">
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Lightbulb className="h-3.5 w-3.5" />
                  ارسال ایده‌های نوآورانه
                </span>
                <p className="lines-relaxed text-muted-foreground mt-1 text-[11.5px] leading-relaxed font-normal">
                  پیشنهادها و طرح‌های خلاقانه‌ای که هوشمندسازی و زیبایی بصری
                  شهرآرا را ارتقا می‌دهد؛ مانند دیوار سبز، سطل‌های پلاستیکی
                  هوشمند، بهبود مبلمان شهری و مناسب‌سازی عبور توان‌یابان.
                </p>
              </div>
            </div>
          </div>

          <div className="border-border bg-muted rounded-xl border p-5 transition-all">
            <span className="text-muted-foreground mb-2 block font-mono text-xs tracking-wider uppercase">
              مرحله ۲: انتخاب موقعیت
            </span>
            <h4 className="text-foreground text-xs font-semibold">
              چگونه لوکیشن دقیق را انتخاب کنیم؟
            </h4>
            <p className="text-muted-foreground mt-2.5 text-[11px] leading-relaxed font-normal">
              با استفاده از نقشه روبرو، دکمه نشانگر را به سمت محل دقیق عارضه یا
              اجرای ایده جابجا کنید. پس از رها کردن پین، منطقه شهرداری مربوطه به
              صورت کاملاً خودکار مشخص خواهد شد.
            </p>
          </div>
        </div>

        {/* Form Container Column */}
        <div className="form-main form-section border-border bg-card relative overflow-hidden rounded-2xl border p-4 transition-all sm:p-6 md:p-8 lg:col-span-8">
          <div className="bg-primary/5 absolute top-0 right-0 h-32 w-32 rounded-full blur-3xl" />

          <div className="form-main-section border-border mb-6 border-b pb-5">
            <span className="text-primary font-mono text-[10px] font-semibold tracking-wide uppercase sm:text-xs">
              سامانه مشارکت شهری
            </span>
            <h2 className="text-foreground mt-1 text-lg font-bold sm:text-2xl">
              ثبت پیگیری و مشارکت جدید
            </h2>
            <p className="text-muted-foreground mt-1 flex flex-wrap gap-x-1 text-[11px] font-medium sm:text-xs">
              <span className="truncate">
                ثبت‌کننده:{' '}
                <span className="text-foreground font-semibold">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="block sm:inline">
                شماره تماس:{' '}
                <span
                  className="text-foreground font-mono font-semibold"
                  dir="rtl"
                >
                  {toPersianDigits(currentUser.phone)}
                </span>
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
            <div className="form-main-section flex flex-col gap-2">
              <label className="text-muted-foreground text-xs font-bold">
                نوع گزارش خود را مشخص کنید
              </label>
              <RadioGroup
                value={type}
                onValueChange={(v) => setType(v as RequestType)}
                className="mt-1 grid grid-cols-2 gap-3 sm:gap-4"
              >
                <label
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:gap-2.5 sm:px-4 sm:py-3 sm:text-sm',
                    type === 'problem'
                      ? 'border-destructive/50 bg-destructive/10 text-destructive ring-destructive/10 ring-1'
                      : 'border-border text-muted-foreground hover:border-muted-foreground',
                  )}
                >
                  <RadioGroupItem value="problem" className="sr-only" />
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>گزارش مشکل</span>
                </label>
                <label
                  className={cn(
                    'flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-all duration-200 sm:gap-2.5 sm:px-4 sm:py-3 sm:text-sm',
                    type === 'idea'
                      ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 ring-1 ring-emerald-500/10'
                      : 'border-border text-muted-foreground hover:border-muted-foreground',
                  )}
                >
                  <RadioGroupItem value="idea" className="sr-only" />
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <span>ارائه ایده شهری</span>
                </label>
              </RadioGroup>
            </div>

            {/* Category and title Row */}
            <div className="form-main-section grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                  <Tag className="text-primary h-3.5 w-3.5" />
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
                <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                  <MessageSquare className="text-primary h-3.5 w-3.5" />
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
            <div className="form-main-section flex flex-col gap-1.5">
              <label className="text-muted-foreground flex items-center gap-1 text-xs font-medium">
                <AlignRight className="text-primary h-3.5 w-3.5" />
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
            <div className="form-main-section flex flex-col gap-2">
              <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                <MapPin className="text-primary h-4 w-4" />
                موقعیت جغرافیایی روی نقشه{' '}
                <span className="text-destructive">*</span>
              </label>

              <div className="border-border bg-card relative h-[300px] w-full overflow-hidden rounded-xl border">
                <MapComponent
                  pickerMode={true}
                  selectedCoordinates={coords}
                  onCoordinatesChange={handleCoordsChange}
                  theme={theme}
                />
              </div>
            </div>

            {/* Action Submit */}

            <Button type="submit" disabled={loading || success} size="lg">
              <Send className="h-4 w-4 shrink-0" />
              <span>
                {loading
                  ? 'در حال ثبت درخواست...'
                  : 'ارسال نهایی گزارش به شهرداری'}
              </span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
