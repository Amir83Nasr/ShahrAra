'use client';

import * as React from 'react';
import {
  format,
  getDaysInMonth,
  getMonth,
  getYear,
  setDate,
  setMonth,
  setYear,
} from 'date-fns-jalali';
import { faIR } from 'date-fns-jalali/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { toPersianDigits } from '@/utils/numberUtils';

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

interface DatePickerProps {
  date: Date | string | undefined | null;
  onSelect: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function parseInput(d: Date | string | undefined | null): Date | undefined {
  if (!d) return undefined;
  if (d instanceof Date) return d;
  return new Date(d);
}

export function DatePicker({
  date,
  onSelect,
  placeholder = 'تاریخ را انتخاب کنید',
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const currentYear = getYear(new Date());

  // Internal selection state — resets each time the popover opens
  const parsed = parseInput(date);
  const [yr, setYr] = React.useState(parsed ? getYear(parsed) : currentYear);
  const [mo, setMo] = React.useState(parsed ? getMonth(parsed) : 0);

  // Reset to parent value on open
  React.useEffect(() => {
    if (open) {
      const p = parseInput(date);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setYr(p ? getYear(p) : currentYear);

      setMo(p ? getMonth(p) : 0);
    }
  }, [open, date, currentYear]);

  const daysInMonth = React.useMemo(
    () => getDaysInMonth(setMonth(setYear(new Date(), yr), mo)),
    [yr, mo],
  );

  const years = React.useMemo(
    () => Array.from({ length: 8 }, (_, i) => currentYear - 5 + i),
    [currentYear],
  );

  const handleDaySelect = (dayStr: string) => {
    const day = parseInt(dayStr, 10);
    let dt = setYear(new Date(), yr);
    dt = setMonth(dt, mo);
    dt = setDate(dt, Math.min(day, getDaysInMonth(dt)));
    onSelect(dt);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          dir="rtl"
          className={cn(
            'border-input hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-expanded:bg-accent h-9 w-full justify-between gap-1.5 rounded-md border bg-transparent px-2.5 text-right text-sm font-normal transition-[color,box-shadow] focus-visible:ring-3',
            !parsed && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">
            {parsed
              ? toPersianDigits(format(parsed, 'yyyy/MM/dd', { locale: faIR }))
              : placeholder}
          </span>
          <CalendarIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="end">
        <div className="flex flex-col gap-3" dir="rtl">
          {/* Year + Month row */}
          <div className="flex gap-2">
            <Select
              dir="rtl"
              value={String(yr)}
              onValueChange={(v) => setYr(parseInt(v, 10))}
            >
              <SelectTrigger className="h-9 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {toPersianDigits(y)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              dir="rtl"
              value={String(mo)}
              onValueChange={(v) => setMo(parseInt(v, 10))}
            >
              <SelectTrigger className="h-9 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {PERSIAN_MONTHS.map((m, i) => (
                  <SelectItem key={i} value={String(i)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Day select */}
          <Select dir="rtl" onValueChange={handleDaySelect}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="روز" />
            </SelectTrigger>
            <SelectContent position="popper">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {toPersianDigits(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  );
}
