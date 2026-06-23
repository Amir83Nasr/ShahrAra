import { format as jalaliFormat, parseISO } from 'date-fns-jalali';

/**
 * Format a date to Persian (Jalali) date string.
 * Uses date-fns-jalali under the hood.
 *
 * @param date - Date object or ISO string
 * @param formatStr - date-fns format string (default: 'yyyy/MM/dd' → ۱۴۰۴/۰۴/۰۲)
 * @returns Formatted Persian date string
 */
export function formatPersian(
  date: Date | string | undefined | null,
  formatStr = 'yyyy/MM/dd',
): string {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  try {
    return jalaliFormat(d, formatStr);
  } catch {
    return '';
  }
}

/**
 * Parse a Gregorian date string to a Date object.
 */
export function parseDate(
  date: Date | string | undefined | null,
): Date | undefined {
  if (!date) return undefined;
  if (date instanceof Date) return date;
  try {
    return parseISO(date);
  } catch {
    return undefined;
  }
}
