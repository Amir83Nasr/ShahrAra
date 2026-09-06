/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** Escapes HTML special characters so untrusted text is safe to interpolate into markup strings. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
