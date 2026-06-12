/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Converts English numbers in any string or number to Persian digits.
 */
export function toPersianDigits(
  val: string | number | null | undefined,
): string {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  return str.replace(/[0-9]/g, (char) => PERSIAN_DIGITS[parseInt(char, 10)]);
}

/**
 * Converts Persian and Arabic digits in a string back to English digits.
 */
export function toEnglishDigits(str: string | null | undefined): string {
  if (!str) {
    return '';
  }
  return str
    .replace(/[۰-۹]/g, (char) => {
      return String(PERSIAN_DIGITS.indexOf(char));
    })
    .replace(/[٠-٩]/g, (char) => {
      return String(ARABIC_DIGITS.indexOf(char));
    });
}
