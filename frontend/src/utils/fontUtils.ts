/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// فونت‌های قابل انتخاب در کل برنامه. مقدار هر گزینه با data-font روی
// <html> ست می‌شود و در globals.css به متغیرهای --app-font-* نگاشت می‌شود.
export const FONT_OPTIONS = [
  {
    value: "default",
    label: "پلاک",
    description: "فونت یکپارچه پروژه",
  },
  {
    value: "system",
    label: "سیستمی",
    description: "تاهوما یا فونت دستگاه",
  },
] as const;

export type FontOption = (typeof FONT_OPTIONS)[number]["value"];

export const DEFAULT_FONT: FontOption = "default";
export const FONT_STORAGE_KEY = "shahr_ara_font";

// مقادیر فونت‌های حذف‌شده که در حافظه کاربران باقی مانده‌اند.
export const LEGACY_FONT_VALUES = ["pelak", "morabba", "didar"] as const;

export function isFontOption(value: unknown): value is FontOption {
  return FONT_OPTIONS.some((option) => option.value === value);
}

export function normalizeFontOption(value: unknown): FontOption | null {
  if (isFontOption(value)) return value;
  if (
    typeof value === "string" &&
    LEGACY_FONT_VALUES.includes(value as (typeof LEGACY_FONT_VALUES)[number])
  ) {
    return DEFAULT_FONT;
  }
  return null;
}
